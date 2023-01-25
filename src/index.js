const Locales = {
  "es": {
    "name": {
      "header": "Se está referenciando a `{missingReference}`, pero `{missingReference}` no existe",
      "details": `Esto se puede deber a que \`{missingReference}\`:

  * no fue definida (si es una función o procedimiento) o inicializada (si es una variable) (¿puede que te hayas olvidado de hacerlo?);
  * fue definida o inicializada con un nombre diferente (¿puede que tengas un error de tipeo?);
  * fue definida o inicializada correctamente, pero cometiste un error de tipeo al referenciarla.`
    },
    "unsupportedType": {
      "header": "Se está intentando ejecutar la operación `{operator}` entre un `{leftType}` y un `{rightType}`, pero esto no es posible",
      "details": `Revisá que:
  * la operación que estás intentando ejecutar \`{operator}\` sea correcta;
  * que los valores que estés operando sean del tipo correcto;
  * que estés operando los valores correctos (por ejemplo, que no estés confundiendo una variable por otra);
  * que no sean necesarias conversiones de tipos.`
    },
    "arguments": {
      "header": "Se está intentando invocar a `{reference}` con `{expectedArgumentsCount}` argumento(s), pero fue definida con `{actualParametersCount}` parámetro(s)",
      "details": `Para que se pueda invocar adecuadamente una función o procedimiento, la cantidad de parámetros con la que se define debe coincidir con la cantidad de argumentos con la que la invoca. Por eso, revisá que:

  * \`{reference}\` realmente tenga que tener \`{actualParametersCount}\` parámetros (¿quizás deberías definirla con \`{expectedArgumentsCount}\` parámetros?);
  * todas las veces que uses \`{reference}\` sea invocada con la cantidad de argumentos correctos (¿quizás deberías invocarla con \`{actualParametersCount}\` parámetros?);`
    },
    "intConversion": {
      "header": "Se está intentando convertir el string `{value}` en entero, pero esto no es posible",
      "details": `Revisá que estés tratando de convertir el valor correcto`
    }
  }
}

class ErrorExplanation {
  /**
   *
   * @param {string} message
   */
  constructor(message) {
    this._message = message;
  }

  translate(localeCode) {
    const locale = Locales[localeCode];
    if (!locale) {
      throw new Error(`Illegal locale ${localeCode}`)
    }
    const messages = locale[this.kind];
    if (!messages) {
      throw new Error(`Illegal error kind ${this.kind}`);
    }

    const translation = Object.assign({}, messages);
    this.replacements.forEach(key => {
      const regexp = new RegExp(`{${key}}`, 'g')
      translation.header = translation.header.replace(regexp, this[key]);
      translation.details = translation.details.replace(regexp, this[key]);
    });
    return translation;
  }

  _parse(regexp) {
    return regexp.exec(this._message).slice(1)
  }
}

class NameErrorExplanation extends ErrorExplanation {
  constructor(message) {
    super(message);
  }

  get kind() {
    return "name"
  }

  get replacements() {
    return ['missingReference']
  }

  get missingReference() {
    return this._parse(/NameError: name '(.*)' is not defined/)[0];
  }
}

class ArgumentsErrorExplanation extends ErrorExplanation {
  constructor(message) {
    super(message);

    const results = this._parse(/TypeError: (.*)\(\) takes (.*) positional arguments but (.*) were given/)

    this.reference = results[0];
    this.actualParametersCount = Number(results[1]);
    this.expectedArgumentsCount = Number(results[2]);
  }

  get replacements() {
    return ['reference', 'actualParametersCount', 'expectedArgumentsCount']
  }

  get kind() {
    return "arguments"
  }
}

class IntConversionErrorExplanation extends ErrorExplanation {
  constructor(message) {
    super(message);
  }

  get kind() {
    return "intConversion"
  }

  get replacements() {
    return ['value']
  }

  get value() {
    return this._parse(/ValueError: invalid literal for int\(\) with base 10: '(.*)'/)[0];
  }
}



class UnsupportedTypeErrorExplanation extends ErrorExplanation {
  constructor(message) {
    super(message);

    [this.operator, this.leftType, this.rightType] = this._parse(/TypeError: unsupported operand type\(s\) for (.): '(.*)' and '(.*)'/);
  }

  get replacements() {
    return ['operator', 'leftType', 'rightType']
  }

  get kind() {
    return "unsupportedType"
  }
}


function explain(message) {
  if (message.indexOf("NameError:") === 0) {
    return new NameErrorExplanation(message);
  } else if (message.indexOf("ValueError: invalid literal") === 0) {
    return new IntConversionErrorExplanation(message);
  } else if (message.indexOf("TypeError: unsupported operand type") === 0) {
    return new UnsupportedTypeErrorExplanation(message);
  } else if (message.indexOf("TypeError: ") === 0)  {
    return new ArgumentsErrorExplanation(message);
  } else {
    return null;
  }
}

export {
  explain
}