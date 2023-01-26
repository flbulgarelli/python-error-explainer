import { explain } from "../src/index.js";
import assert from "assert";

describe("can explain", () => {

  describe("unknown", () => {
    it("reject unknown messages", () => {
      assert.equal(null, explain("IndexError: pop from empty list"));
    })
  })

  describe("name", () => {
    it("can explain simple name errors", () => {
      const explanation = explain("NameError: name 'bar' is not defined")
      assert.equal(explanation.kind, "name")
      assert.equal(explanation.missingReference, "bar")
    })

    it("can explain simple name errors, other missing reference", () => {
      const explanation = explain("NameError: name 'foo' is not defined")
      assert.equal(explanation.kind, "name")
      assert.equal(explanation.missingReference, "foo")
    })
  })

  describe("booleanTypo", () => {
    it("can explain false typo", () => {
      const explanation = explain("NameError: name 'false' is not defined");
      assert.equal(explanation.kind, "booleanTypo");
      assert.equal(explanation.rightValue, "False");
      assert.equal(explanation.wrongValue, "false");
    })
    it("can explain true typo", () => {
      const explanation = explain("NameError: name 'true' is not defined");
      assert.equal(explanation.kind, "booleanTypo");
      assert.equal(explanation.rightValue, "True");
      assert.equal(explanation.wrongValue, "true");
    })
  })

  describe("assertionError", () => {
    it("can explain simple assertion errors", () => {
      const explanation = explain("AssertionError: 13 != 14")
      assert.equal(explanation.actual, "13")
      assert.equal(explanation.expected, "14")
    })

    it("can explain simple assertion errors, with other values", () => {
      const explanation = explain("AssertionError: 2 != 1")
      assert.equal(explanation.actual, "2")
      assert.equal(explanation.expected, "1")
    })

    it("can explain simple assertion errors, with values of different types", () => {
      const explanation = explain("AssertionError: 'hello' != 1")
      assert.equal(explanation.actual, "'hello'")
      assert.equal(explanation.expected, "1")
    })

    it("can explain simple assertion errors, with assertFalse", () => {
      const explanation = explain("AssertionError: True is not false")
      assert.equal(explanation.actual, "True")
      assert.equal(explanation.expected, "False")
    })

    it("can explain simple assertion errors, with assertTrue", () => {
      const explanation = explain("AssertionError: False is not true")
      assert.equal(explanation.actual, "False")
      assert.equal(explanation.expected, "True")
    })
  })

  describe("int", () => {
    it("can explain simple int conversion errors", () => {
      const explanation = explain("ValueError: invalid literal for int() with base 10: 'hello'")
      assert.equal(explanation.kind, "intConversion")
      assert.equal(explanation.value, "hello")
    })
  })

  describe("unsupportedType", () => {
    it("can explain simple unsupported type errors", () => {
      const explanation = explain("TypeError: unsupported operand type(s) for +: 'int' and 'str'")
      assert.equal(explanation.kind, "unsupportedType")
      assert.equal(explanation.operator, "+")
      assert.equal(explanation.leftType, "int")
      assert.equal(explanation.rightType, "str")
    })

    it("can explain simple unsupported type errors", () => {
      const explanation = explain("TypeError: unsupported operand type(s) for /: 'str' and 'str'")
      assert.equal(explanation.kind, "unsupportedType")
      assert.equal(explanation.operator, "/")
      assert.equal(explanation.leftType, "str")
      assert.equal(explanation.rightType, "str")
    })

    it("can explain simple unsupported type errors", () => {
      const explanation = explain("TypeError: unsupported operand type(s) for +=: 'int' and 'str'")
      assert.equal(explanation.kind, "unsupportedType")
      assert.equal(explanation.operator, "+=")
      assert.equal(explanation.leftType, "int")
      assert.equal(explanation.rightType, "str")
    })
  })

  describe("arguments", () => {
    it("can explain simple arguments errors", () => {
      const explanation = explain("TypeError: foo() takes 2 positional arguments but 3 were given")
      assert.equal(explanation.kind, "arguments")
      assert.equal(explanation.reference, "foo")
      assert.equal(explanation.expectedArgumentsCount, 3)
      assert.equal(explanation.actualParametersCount, 2)
    })

    it("can explain simple arguments errors with other name", () => {
      const explanation = explain("TypeError: bar() takes 4 positional arguments but 2 were given")
      assert.equal(explanation.kind, "arguments")
      assert.equal(explanation.reference, "bar")
      assert.equal(explanation.expectedArgumentsCount, 2)
      assert.equal(explanation.actualParametersCount, 4)
    })
  })
})

describe("can translate", () => {
  it("can translate simple name errors", () => {
    const translation = explain("NameError: name 'foo' is not defined").translate("es");

    assert.equal(translation.header, "Se está referenciando a `foo`, pero `foo` no existe");
    assert.equal(translation.details, `Esto se puede deber a que \`foo\`:

  * no fue definida (si es una función o procedimiento) o inicializada (si es una variable) (¿puede que te hayas olvidado de hacerlo?);
  * fue definida o inicializada con un nombre diferente (¿puede que tengas un error de tipeo?);
  * fue definida o inicializada correctamente, pero cometiste un error de tipeo al referenciarla.`)
  })

  it("can translate simple arguments errors", () => {
    const translation = explain("TypeError: bar() takes 4 positional arguments but 2 were given").translate("es");

    assert.equal(translation.header, "Se está intentando invocar a `bar` con `2` argumento(s), pero fue definida con `4` parámetro(s)");
    assert.equal(translation.details, `Para que se pueda invocar adecuadamente una función o procedimiento, la cantidad de parámetros con la que se define debe coincidir con la cantidad de argumentos con la que la invoca. Por eso, revisá que:

  * \`bar\` realmente tenga que tener \`4\` parámetros (¿quizás deberías definirla con \`2\` parámetros?);
  * todas las veces que uses \`bar\` sea invocada con la cantidad de argumentos correctos (¿quizás deberías invocarla con \`4\` parámetros?);`)
  })

  it("can translate simple type operation errors", () => {
    const translation = explain("TypeError: unsupported operand type(s) for +: 'int' and 'str'").translate("es");

    assert.equal(translation.header, "Se está intentando ejecutar la operación `+` entre un `int` y un `str`, pero esto no es posible");
    assert.equal(translation.details, `Revisá que:
  * la operación que estás intentando ejecutar \`+\` sea correcta;
  * que los valores que estés operando sean del tipo correcto;
  * que estés operando los valores correctos (por ejemplo, que no estés confundiendo una variable por otra);
  * que no sean necesarias conversiones de tipos.`)
  })

  it("can translate simple type conversion errors", () => {
    const translation = explain("ValueError: invalid literal for int() with base 10: 'hello'").translate("es");

    assert.equal(translation.header, "Se está intentando convertir el string `hello` en entero, pero esto no es posible");
    assert.equal(translation.details, `Revisá que estés tratando de convertir el valor correcto`)
  })

  it("can translate simple assertion errors", () => {
    const translation = explain("AssertionError: 4 != 8").translate("es");

    assert.equal(translation.header, "Al realizar una comparación, se esperaba obtener el valor `8`, pero se obtuvo el valor `4`");
    assert.equal(translation.details, `Revisá tus cálculos y algoritmos y asegurate de que devuelvan los valores correctos`)
  })

  it("can translate simple boolean typo errors", () => {
    const translation = explain("NameError: name 'false' is not defined").translate("es");

    assert.equal(translation.header, "Se está referenciando al valor `false`, pero no existe. ¿Quisiste tal vez decir `False`?");
    assert.equal(translation.details, `Recordá que los valores booleanos se escriben \`True\` y \`False\``)
  })
})
