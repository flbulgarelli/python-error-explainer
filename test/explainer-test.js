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

  describe("missingElementToRemove", () => {
    it("can explain missing element", () => {
      const explanation = explain("ValueError: list.remove(x): x not in list")
      assert.equal(explanation.kind, "missingElementToRemove")
    })
  })

  describe("indexOutOfRange", () => {
    it("can explain index out of range", () => {
      const explanation = explain("IndexError: list index out of range")
      assert.equal(explanation.kind, "indexOutOfRange")
    })

    describe("indexOutOfRange", () => {
      it("can explain index out of range with extra newlines", () => {
        const explanation = explain("\nIndexError: list index out of range\n")
        assert.equal(explanation.kind, "indexOutOfRange")
      })
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

    assert.equal(translation.header, "Se est?? referenciando a <code>foo</code>, pero <code>foo</code> no existe");
    assert.equal(translation.details, `Esto se puede deber a que <code>foo</code>:
<ul>
  <li>no fue definida (si es una funci??n o procedimiento) o inicializada (si es una variable) (??puede que te hayas olvidado de hacerlo?);</li>
  <li>fue definida o inicializada con un nombre diferente (??puede que tengas un error de tipeo?);</li>
  <li>fue definida o inicializada correctamente, pero cometiste un error de tipeo al referenciarla.</li>
</ul>`)
  })

  it("can translate simple arguments errors", () => {
    const translation = explain("TypeError: bar() takes 4 positional arguments but 2 were given").translate("es");

    assert.equal(translation.header, "Se est?? intentando invocar a <code>bar</code> con <code>2</code> argumento(s), pero fue definida con <code>4</code> par??metro(s)");
    assert.equal(translation.details, `Para que se pueda invocar adecuadamente una funci??n o procedimiento, la cantidad de par??metros con la que se define debe coincidir con la cantidad de argumentos con la que la invoca. Por eso, revis?? que:
<ul>
  <li><code>bar</code> realmente tenga que tener <code>4</code> par??metros (??quiz??s deber??as definirla con <code>2</code> par??metros?);</li>
  <li>todas las veces que uses <code>bar</code> sea invocada con la cantidad de argumentos correctos (??quiz??s deber??as invocarla con <code>4</code> par??metros?);</li>
</ul>`)
  })

  it("can translate simple type operation errors", () => {
    const translation = explain("TypeError: unsupported operand type(s) for +: 'int' and 'str'").translate("es");

    assert.equal(translation.header, "Se est?? intentando ejecutar la operaci??n <code>+</code> entre un <code>int</code> y un <code>str</code>, pero esto no es posible");
    assert.equal(translation.details, `Revis?? que:
<ul>
  <li>la operaci??n que est??s intentando ejecutar <code>+</code> sea correcta;</li>
  <li>que los valores que est??s operando sean del tipo correcto;</li>
  <li>que est??s operando los valores correctos (por ejemplo, que no est??s confundiendo una variable por otra);</li>
  <li>que no sean necesarias conversiones de tipos.</li>
</ul>`)
  })

  it("can translate simple type conversion errors", () => {
    const translation = explain("ValueError: invalid literal for int() with base 10: 'hello'").translate("es");

    assert.equal(translation.header, "Se est?? intentando convertir el string <code>hello</code> en entero, pero esto no es posible");
    assert.equal(translation.details, `Revis?? que est??s tratando de convertir el valor correcto`)
  })

  it("can translate simple assertion errors", () => {
    const translation = explain("AssertionError: 4 != 8").translate("es");

    assert.equal(translation.header, "Al realizar una comparaci??n, se esperaba obtener el valor <code>8</code>, pero se obtuvo el valor <code>4</code>");
    assert.equal(translation.details, `Revis?? tus c??lculos y algoritmos y asegurate de que devuelvan los valores correctos`)
  })

  it("can translate simple boolean typo errors", () => {
    const translation = explain("NameError: name 'false' is not defined").translate("es");

    assert.equal(translation.header, "Se est?? referenciando al valor <code>false</code>, pero no existe. ??Quisiste tal vez decir <code>False</code>?");
    assert.equal(translation.details, `Record?? que los valores booleanos se escriben <code>True</code> y <code>False</code>`)
  })

  it("can translate missing element to remove error", () => {
    const translation = explain("ValueError: list.remove(x): x not in list").translate("es");

    assert.equal(translation.header, "Intentaste remover un elemento de una lista, pero la lista no lo conten??a");
    assert.equal(translation.details, `Record?? que para poder remover un elemento mediante <code>list.remove</code>, el elemento tiene que estar en la lista antes. Fijate si:
<ul>
  <li>est??s eliminando el elemento correcto y no otro por error;</li>
  <li>el elemento no fue eliminado anteriormente;</li>
  <li>la lista contiene efectivamente que dese??s eliminar.</li>
</ul>`)
  })

  it("can translate index out of range errors", () => {
    const translation = explain("IndexError: list index out of range").translate("es");

    assert.equal(translation.header, "Intentaste acceder a una posici??n m??s all?? de los l??mites de la lista ");
    assert.equal(translation.details, `Record?? que s??lo pod??s acceder a posiciones de una lista que est??n dentro de su tama??o. Ten?? en cuenta que:
<ul>
  <li>si est??s usando un ??ndice positivo, ??ste debe estar entre 0 (primer elemento) y len(lista) -1, es decir, el tama??o de la lista menos uno  (??ltimo elemento);</li>
  <li>si est??s usando un ??ndice negativo, ??ste debe estar entre -1 (??ltimo elemento) y -len(lista), es decir, el opuesto del tama??o de la lista (primer elemento).</li>
</ul>

Por ejemplo, las siguientes expresiones fallan todas con <code>IndexError</code>:

<code><pre>
[][2] # lista vac??a; cualquier indice fallar??

["hola", "mundo"][2] # intento de acceder al tercer elemento de una lista de dos elementos
["hola", "mundo"][3] # intento de acceder al cuarto elemento de una lista de dos elementos

["chau"][-2] # intento de acceder al ante??ltimo elemento de una lista de un elemento
["chau"][-2] # intento de acceder al antepen??ltimo elemento de una lista de un elemento
</pre></code>`)
  })
})
