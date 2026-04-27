import { describe, it, expect } from "vitest";
import { parse } from "../src/parser.js";
import { analyze } from "../src/analyzer.js";
import { generate } from "../src/generator.js";

// Helper: parse → analyze → generate
function compile(code) {
  const ast = parse(code);
  analyze(ast, code);
  return generate(ast);
}

describe("Generator – Variable Declarations", () => {
  it("generates let for int declaration", () => {
    expect(compile("int x = 5")).toContain("let x = 5");
  });

  it("generates let for float declaration", () => {
    expect(compile("float x = 3.14")).toContain("let x = 3.14");
  });

  it("generates let for str declaration", () => {
    expect(compile('str name = "Alice"')).toContain('let name = "Alice"');
  });

  it("generates let for dynamic declaration", () => {
    expect(compile("let x = 5")).toContain("let x = 5");
  });

  it("generated declaration ends with semicolon", () => {
    expect(compile("int x = 5")).toMatch(/let x = 5;/);
  });
});

describe("Generator – Assignment", () => {
  it("generates assignment without let", () => {
    const out = compile("int x = 5\nx = 10");
    expect(out).toContain("x = 10");
    // Assignment should NOT re-declare with let
    const lines = out.split("\n");
    const assignLine = lines.find(l => l.trim() === "x = 10;");
    expect(assignLine).toBeDefined();
  });

  it("generated assignment ends with semicolon", () => {
    expect(compile("int x = 5\nx = 10")).toMatch(/x = 10;/);
  });
});

describe("Generator – Print", () => {
  it("generates console.log for print", () => {
    expect(compile("print 42")).toContain("console.log(42)");
  });

  it("generates console.log for string print", () => {
    expect(compile('print "hello"')).toContain('console.log("hello")');
  });

  it("generates console.log for variable print", () => {
    expect(compile("int x = 5\nprint x")).toContain("console.log(x)");
  });

  it("generates console.log for expression print", () => {
    expect(compile("print 2 + 3")).toContain("console.log(2 + 3)");
  });

  it("print output ends with semicolon", () => {
    expect(compile("print 42")).toMatch(/console\.log\(42\);/);
  });
});

describe("Generator – Binary Expressions", () => {
  it("generates + operator", () => {
    expect(compile("int x = 5\nint y = 3\nprint x + y")).toContain("x + y");
  });

  it("generates < operator", () => {
    expect(compile("int x = 5\nint y = 10\nprint x < y")).toContain("x < y");
  });

  it("generates > operator", () => {
    expect(compile("int x = 5\nint y = 10\nprint x > y")).toContain("x > y");
  });

  it("generates == operator", () => {
    expect(compile("int x = 5\nint y = 5\nprint x == y")).toContain("x == y");
  });

  it("generates != operator", () => {
    expect(compile("int x = 5\nint y = 3\nprint x != y")).toContain("x != y");
  });

  it("generates <= operator", () => {
    expect(compile("int x = 5\nint y = 5\nprint x <= y")).toContain("x <= y");
  });

  it("generates >= operator", () => {
    expect(compile("int x = 5\nint y = 5\nprint x >= y")).toContain("x >= y");
  });

  it("generates string concatenation with +", () => {
    expect(compile('str a = "hello"\nstr b = " world"\nprint a + b')).toContain('a + b');
  });
});

describe("Generator – Functions", () => {
  it("generates function keyword", () => {
    const code = `func add(int x, int y) -> int {\n  return x + y\n}`;
    expect(compile(code)).toContain("function add");
  });

  it("generates function parameters", () => {
    const code = `func add(int x, int y) -> int {\n  return x + y\n}`;
    expect(compile(code)).toContain("(x, y)");
  });

  it("generates return statement", () => {
    const code = `func add(int x, int y) -> int {\n  return x + y\n}`;
    expect(compile(code)).toContain("return x + y");
  });

  it("generates function call", () => {
    const code = `func add(int x, int y) -> int {\n  return x + y\n}\nprint add(5, 3)`;
    expect(compile(code)).toContain("add(5, 3)");
  });

  it("generates function call inside console.log", () => {
    const code = `func add(int x, int y) -> int {\n  return x + y\n}\nprint add(5, 3)`;
    expect(compile(code)).toContain("console.log(add(5, 3))");
  });

  it("generates function with single parameter", () => {
    const code = `func double(int x) -> int {\n  return x + x\n}`;
    expect(compile(code)).toContain("function double(x)");
  });

  it("generated function body is indented", () => {
    const code = `func add(int x, int y) -> int {\n  return x + y\n}`;
    const out = compile(code);
    expect(out).toMatch(/\n {2}return/);
  });

  it("generates closing brace for function", () => {
    const code = `func add(int x, int y) -> int {\n  return x + y\n}`;
    expect(compile(code)).toContain("}");
  });
});



describe("Generator – Full Programs", () => {
  it("generates multi-statement program correctly", () => {
    const code = "int x = 5\nint y = 10\nprint x + y";
    const out = compile(code);
    expect(out).toContain("let x = 5;");
    expect(out).toContain("let y = 10;");
    expect(out).toContain("console.log(x + y);");
  });

  it("multiple statements are separated by newlines", () => {
    const code = "int x = 5\nint y = 10";
    const out = compile(code);
    expect(out.split("\n").length).toBeGreaterThanOrEqual(2);
  });

  it("generates readable JS for a full program", () => {
    const code = `func add(int x, int y) -> int {\n  return x + y\n}\nint a = 3\nint b = 4\nprint add(a, b)`;
    const out = compile(code);
    expect(out).toContain("function add(x, y)");
    expect(out).toContain("let a = 3;");
    expect(out).toContain("let b = 4;");
    expect(out).toContain("console.log(add(a, b));");
  });
});