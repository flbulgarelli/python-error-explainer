const Locales = {
  "es": {
    "name": {
      "header": "Se está referenciando a <code>{missingReference}</code>, pero <code>{missingReference}</code> no existe",
      "details": `Esto se puede deber a que <code>{missingReference}</code>:
<ul>
  <li>no fue definida (si es una función o procedimiento) o inicializada (si es una variable) (¿puede que te hayas olvidado de hacerlo?);</li>
  <li>fue definida o inicializada con un nombre diferente (¿puede que tengas un error de tipeo?);</li>
  <li>fue definida o inicializada correctamente, pero cometiste un error de tipeo al referenciarla.</li>
</ul>`
    },
    "unsupportedType": {
      "header": "Se está intentando ejecutar la operación <code>{operator}</code> entre un <code>{leftType}</code> y un <code>{rightType}</code>, pero esto no es posible",
      "details": `Revisá que:
<ul>
  <li>la operación que estás intentando ejecutar <code>{operator}</code> sea correcta;</li>
  <li>que los valores que estés operando sean del tipo correcto;</li>
  <li>que estés operando los valores correctos (por ejemplo, que no estés confundiendo una variable por otra);</li>
  <li>que no sean necesarias conversiones de tipos.</li>
</ul>`
    },
    "arguments": {
      "header": "Se está intentando invocar a <code>{reference}</code> con <code>{expectedArgumentsCount}</code> argumento(s), pero fue definida con <code>{actualParametersCount}</code> parámetro(s)",
      "details": `Para que se pueda invocar adecuadamente una función o procedimiento, la cantidad de parámetros con la que se define debe coincidir con la cantidad de argumentos con la que la invoca. Por eso, revisá que:
<ul>
  <li><code>{reference}</code> realmente tenga que tener <code>{actualParametersCount}</code> parámetros (¿quizás deberías definirla con <code>{expectedArgumentsCount}</code> parámetros?);</li>
  <li>todas las veces que uses <code>{reference}</code> sea invocada con la cantidad de argumentos correctos (¿quizás deberías invocarla con <code>{actualParametersCount}</code> parámetros?);</li>
</ul>`
    },
    "intConversion": {
      "header": "Se está intentando convertir el string <code>{value}</code> en entero, pero esto no es posible",
      "details": `Revisá que estés tratando de convertir el valor correcto`
    },
    "assertionError": {
      "header": "Al realizar una comparación, se esperaba obtener el valor <code>{expected}</code>, pero se obtuvo el valor <code>{actual}</code>",
      "details": `Revisá tus cálculos y algoritmos y asegurate de que devuelvan los valores correctos`
    },
    "booleanTypo": {
      "header": "Se está referenciando al valor <code>{wrongValue}</code>, pero no existe. ¿Quisiste tal vez decir <code>{rightValue}</code>?",
      "details": `Recordá que los valores booleanos se escriben <code>True</code> y <code>False</code>`,
    },
    "missingElementToRemove": {
      "header": "Intentaste remover un elemento de una lista, pero la lista no lo contenía",
      "details": `Recordá que para poder remover un elemento mediante <code>list.remove</code>, el elemento tiene que estar en la lista antes. Fijate si:
<ul>
  <li>estás eliminando el elemento correcto y no otro por error;</li>
  <li>el elemento no fue eliminado anteriormente;</li>
  <li>la lista contiene efectivamente que deseás eliminar.</li>
</ul>`
    },
    "indexOutOfRange": {
      "header": "Intentaste acceder a una posición más allá de los límites de la lista ",
      "details": `Recordá que sólo podés acceder a posiciones de una lista que estén dentro de su tamaño. Tené en cuenta que:
<ul>
  <li>si estás usando un índice positivo, éste debe estar entre 0 (primer elemento) y len(lista) -1, es decir, el tamaño de la lista menos uno  (último elemento);</li>
  <li>si estás usando un índice negativo, éste debe estar entre -1 (último elemento) y -len(lista), es decir, el opuesto del tamaño de la lista (primer elemento).</li>
</ul>

Por ejemplo, las siguientes expresiones fallan todas con <code>IndexError</code>:

<code><pre>
[][2] # lista vacía; cualquier indice fallará

["hola", "mundo"][2] # intento de acceder al tercer elemento de una lista de dos elementos
["hola", "mundo"][3] # intento de acceder al cuarto elemento de una lista de dos elementos

["chau"][-2] # intento de acceder al anteúltimo elemento de una lista de un elemento
["chau"][-2] # intento de acceder al antepenúltimo elemento de una lista de un elemento
</pre></code>`
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

  get replacements() {
    return [];
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
    const groups = regexp.exec(this._message);
    if (groups !== null) {
      return groups.slice(1);
    } else {
      return null;
    }
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

class BooleanTypoErrorExplanation extends ErrorExplanation {
  constructor(message) {
    super(message);

    this.wrongValue = this._parse(/NameError: name '(false|true)' is not defined/)[0];
  }

  get kind() {
    return "booleanTypo";
  }

  get replacements() {
    return ['rightValue', 'wrongValue'];
  }

  get rightValue() {
    return this.wrongValue[0].toUpperCase() + this.wrongValue.slice(1).toLowerCase();
  }
}

class ArgumentsErrorExplanation extends ErrorExplanation {
  constructor(message) {
    super(message);

    const groups = this._parse(/TypeError: (.*)\(\) takes (.*) positional arguments but (.*) were given/)

    this.reference = groups[0];
    this.actualParametersCount = Number(groups[1]);
    this.expectedArgumentsCount = Number(groups[2]);
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


class AssertionErrorExplanation extends ErrorExplanation {
  constructor(message) {
    super(message);

    const groups = this._parse(/AssertionError: (.*) is not (true|false)/);
    if (groups) {
      this.actual = groups[0];
      this.expected = groups[1] === 'true' ? 'True' : 'False';
    } else {
      [this.actual, this.expected] = this._parse(/AssertionError: (.*) != (.*)/);
    }
  }

  get kind() {
    return "assertionError"
  }

  get replacements() {
    return ['expected', 'actual']
  }
}

class UnsupportedTypeErrorExplanation extends ErrorExplanation {
  constructor(message) {
    super(message);

    [this.operator, this.leftType, this.rightType] = this._parse(/TypeError: unsupported operand type\(s\) for (.{1,2}): '(.*)' and '(.*)'/);
  }

  get replacements() {
    return ['operator', 'leftType', 'rightType']
  }

  get kind() {
    return "unsupportedType"
  }
}

class MissingElementToRemoveErrorExplanation extends ErrorExplanation {
  constructor(message) {
    super(message)
  }

  get kind() {
    return 'missingElementToRemove'
  }
}

class IndexOutOfRangeErrorExplanation extends ErrorExplanation {
  constructor(message) {
    super(message)
  }

  get kind() {
    return 'indexOutOfRange'
  }
}

/**
 *
 * @param {string} message
 * @returns {ErrorExplanation}
 */
function explain(message) {
  const m = message.trim();
  if (m === 'ValueError: list.remove(x): x not in list') {
    return new MissingElementToRemoveErrorExplanation(m)
  } else if (m === 'IndexError: list index out of range') {
    return new IndexOutOfRangeErrorExplanation(m);
  } else if (m.match(/NameError: name '(false|true)'/)) {
    return new BooleanTypoErrorExplanation(m);
  } else if (m.indexOf("NameError:") === 0) {
    return new NameErrorExplanation(m);
  } else if (m.indexOf("AssertionError:") === 0) {
    return new AssertionErrorExplanation(m);
  } else if (m.indexOf("ValueError: invalid literal") === 0) {
    return new IntConversionErrorExplanation(m);
  } else if (m.indexOf("TypeError: unsupported operand type") === 0) {
    return new UnsupportedTypeErrorExplanation(m);
  } else if (m.indexOf("TypeError: ") === 0)  {
    return new ArgumentsErrorExplanation(m);
  } else {
    return null;
  }
}

export {
  explain
}