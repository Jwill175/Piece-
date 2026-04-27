import { describe, it, expect } from "vitest";
import { parse } from "../src/parser.js";
import { analyze } from "../src/analyzer.js";
import { SemanticError } from "../src/errors.js";

describe("Analyzer – Variable Declarations", () => {
  it("accepts a valid int declaration", () => {
    const ast = parse("int x = 5");
    expect(() => analyze(ast)).not.toThrow();
  });

  it("accepts a valid float declaration", () => {
    const ast = parse("float x = 3.14");
    expect(() => analyze(ast)).not.toThrow();
  });

  it("accepts a valid str declaration", () => {
    const ast = parse('str name = "Alice"');
    expect(() => analyze(ast)).not.toThrow();
  });

  it("accepts a dynamic (let) declaration with int", () => {
    const ast = parse("let x = 5");
    expect(() => analyze(ast)).not.toThrow();
  });

  it("accepts a dynamic (let) declaration with string", () => {
    const ast = parse('let name = "hello"');
    expect(() => analyze(ast)).not.toThrow();
  });

  it("throws on duplicate variable declaration", () => {
    const ast = parse("int x = 5\nint x = 10");
    expect(() => analyze(ast)).toThrow(SemanticError);
  });

  it("duplicate declaration error message mentions variable name", () => {
    const ast = parse("int x = 5\nint x = 10");
    expect(() => analyze(ast)).toThrow(/x/);
  });

  it("throws type error when int declared with string value", () => {
    const ast = parse('int x = "hello"');
    expect(() => analyze(ast)).toThrow(SemanticError);
  });

  it("throws type error when str declared with int value", () => {
    const ast = parse("str x = 5");
    expect(() => analyze(ast)).toThrow(SemanticError);
  });

  it("throws type error when float declared with string value", () => {
    const ast = parse('float x = "hello"');
    expect(() => analyze(ast)).toThrow(SemanticError);
  });

  it("type error message mentions expected type", () => {
    const ast = parse('int x = "hello"');
    expect(() => analyze(ast)).toThrow(/int/);
  });
});

describe("Analyzer – Assignment", () => {
  it("accepts valid reassignment", () => {
    const ast = parse("int x = 5\nx = 10");
    expect(() => analyze(ast)).not.toThrow();
  });

  it("throws on assignment to undeclared variable", () => {
    const ast = parse("x = 10");
    expect(() => analyze(ast)).toThrow(SemanticError);
  });

  it("throws on type mismatch in reassignment", () => {
    const ast = parse('int x = 5\nx = "hello"');
    expect(() => analyze(ast)).toThrow(SemanticError);
  });

  it("type mismatch reassignment error message is helpful", () => {
    const code = 'int x = 5\nx = "hello"';
    const ast = parse(code);
    expect(() => analyze(ast, code)).toThrow(/int/);
  });

  it("allows reassignment with same type on dynamic variable", () => {
    const ast = parse("let x = 5\nx = 99");
    expect(() => analyze(ast)).not.toThrow();
  });
});

describe("Analyzer – Binary Expressions", () => {
  it("accepts int + int", () => {
    const ast = parse("int x = 5\nint y = 3\nprint x + y");
    expect(() => analyze(ast)).not.toThrow();
  });

  it("accepts float + float", () => {
    const ast = parse("float x = 1.5\nfloat y = 2.5\nprint x + y");
    expect(() => analyze(ast)).not.toThrow();
  });

  it("accepts str + str concatenation", () => {
    const ast = parse('str a = "hello"\nstr b = " world"\nprint a + b');
    expect(() => analyze(ast)).not.toThrow();
  });

  it("throws on int + str type mismatch", () => {
    const ast = parse('int x = 5\nstr y = "hi"\nprint x + y');
    expect(() => analyze(ast)).toThrow(SemanticError);
  });

  it("accepts int < int comparison", () => {
    const ast = parse("int x = 5\nint y = 10\nprint x < y");
    expect(() => analyze(ast)).not.toThrow();
  });

  it("accepts int > int comparison", () => {
    const ast = parse("int x = 5\nint y = 10\nprint x > y");
    expect(() => analyze(ast)).not.toThrow();
  });

  it("accepts int == int comparison", () => {
    const ast = parse("int x = 5\nint y = 5\nprint x == y");
    expect(() => analyze(ast)).not.toThrow();
  });

  it("accepts int != int comparison", () => {
    const ast = parse("int x = 5\nint y = 10\nprint x != y");
    expect(() => analyze(ast)).not.toThrow();
  });

  it("accepts int <= int comparison", () => {
    const ast = parse("int x = 5\nint y = 5\nprint x <= y");
    expect(() => analyze(ast)).not.toThrow();
  });

  it("accepts int >= int comparison", () => {
    const ast = parse("int x = 5\nint y = 5\nprint x >= y");
    expect(() => analyze(ast)).not.toThrow();
  });

  it("throws on type mismatch in comparison", () => {
    const ast = parse('int x = 5\nstr y = "hi"\nprint x == y');
    expect(() => analyze(ast)).toThrow(SemanticError);
  });

  it("throws on string comparison with < operator", () => {
    const ast = parse('str a = "a"\nstr b = "b"\nprint a < b');
    expect(() => analyze(ast)).toThrow(SemanticError);
  });

  it("throws on string comparison with > operator", () => {
    const ast = parse('str a = "a"\nstr b = "b"\nprint a > b');
    expect(() => analyze(ast)).toThrow(SemanticError);
  });
});

describe("Analyzer – Undeclared Variables", () => {
  it("throws on undeclared variable in print", () => {
    const ast = parse("print y");
    expect(() => analyze(ast)).toThrow(SemanticError);
  });

  it("undeclared variable error message mentions variable name", () => {
    const ast = parse("print y");
    expect(() => analyze(ast)).toThrow(/y/);
  });

  it("throws on undeclared variable in expression", () => {
    const ast = parse("int x = 5\nprint x + z");
    expect(() => analyze(ast)).toThrow(SemanticError);
  });

  it("throws on undeclared variable used in assignment RHS", () => {
    const ast = parse("int x = 5\nx = z");
    expect(() => analyze(ast)).toThrow(SemanticError);
  });
});

describe("Analyzer – Functions", () => {
  it("accepts a valid function declaration and call", () => {
    const code = `func add(int x, int y) -> int {\n  return x + y\n}\nprint add(5, 3)`;
    const ast = parse(code);
    expect(() => analyze(ast, code)).not.toThrow();
  });

  it("throws on call to undeclared function", () => {
    const code = 'print greet("hello")';
    const ast = parse(code);
    expect(() => analyze(ast, code)).toThrow(SemanticError);
  });

  it("undeclared function error message mentions function name", () => {
    const code = 'print greet("hello")';
    const ast = parse(code);
    expect(() => analyze(ast, code)).toThrow(/greet/);
  });

  it("throws when wrong number of arguments passed", () => {
    const code = `func add(int x, int y) -> int {\n  return x + y\n}\nprint add(5)`;
    const ast = parse(code);
    expect(() => analyze(ast, code)).toThrow(SemanticError);
  });

  it("wrong argument count error is descriptive", () => {
    const code = `func add(int x, int y) -> int {\n  return x + y\n}\nprint add(5)`;
    const ast = parse(code);
    expect(() => analyze(ast, code)).toThrow(/add/);
  });

  it("throws on argument type mismatch", () => {
    const code = `func add(int x, int y) -> int {\n  return x + y\n}\nprint add(5, "hello")`;
    const ast = parse(code);
    expect(() => analyze(ast, code)).toThrow(SemanticError);
  });

  it("argument type mismatch error mentions argument number", () => {
    const code = `func add(int x, int y) -> int {\n  return x + y\n}\nprint add(5, "hello")`;
    const ast = parse(code);
    expect(() => analyze(ast, code)).toThrow(/Argument/);
  });

  it("throws when function return type doesn't match declared type", () => {
    const code = `func bad(int x) -> int {\n  return "hello"\n}`;
    const ast = parse(code);
    expect(() => analyze(ast, code)).toThrow(SemanticError);
  });

  it("throws when function has no return statement", () => {
    const code = `func noReturn(int x) -> int {\n  int y = 5\n}`;
    const ast = parse(code);
    expect(() => analyze(ast, code)).toThrow(SemanticError);
  });

  it("no-return error mentions function name", () => {
    const code = `func noReturn(int x) -> int {\n  int y = 5\n}`;
    const ast = parse(code);
    expect(() => analyze(ast, code)).toThrow(/noReturn/);
  });

  it("function params are scoped correctly and don't leak", () => {
    const code = `func add(int x, int y) -> int {\n  return x + y\n}\nprint x`;
    const ast = parse(code);
    expect(() => analyze(ast, code)).toThrow(SemanticError);
  });

  it("function can access global variables", () => {
    const code = `int globalVal = 10\nfunc getGlobal(int x) -> int {\n  return x + globalVal\n}\nprint getGlobal(5)`;
    const ast = parse(code);
    expect(() => analyze(ast, code)).not.toThrow();
  });
});

describe("Analyzer – Print and Trace", () => {
  it("accepts print of a declared variable", () => {
    const ast = parse("int x = 5\nprint x");
    expect(() => analyze(ast)).not.toThrow();
  });

  it("accepts print of a literal number", () => {
    const ast = parse("print 42");
    expect(() => analyze(ast)).not.toThrow();
  });

  it("accepts print of a string literal", () => {
    const ast = parse('print "hello"');
    expect(() => analyze(ast)).not.toThrow();
  });


});