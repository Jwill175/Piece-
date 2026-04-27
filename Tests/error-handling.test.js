import { describe, it, expect } from "vitest";
import { parse } from "../src/parser.js";
import { analyze } from "../src/analyzer.js";
import { ParseError, SemanticError } from "../src/errors.js";

describe("Error Handling", () => {
  it("parse error includes location", () => {
    try {
      parse("int x =");
      expect.fail("Should throw ParseError");
    } catch (e) {
      expect(e).toBeInstanceOf(ParseError);
      expect(e.lineNum).toBeGreaterThan(0);
      expect(e.colNum).toBeGreaterThan(0);
    }
  });

  it("undeclared variable error shows location", () => {
    try {
      const ast = parse("print y");
      analyze(ast, "print y");
      expect.fail("Should throw SemanticError");
    } catch (e) {
      expect(e).toBeInstanceOf(SemanticError);
      expect(e.location).toBeDefined();
      expect(e.location.lineNum).toBe(1);
      expect(e.location.colNum).toBeGreaterThan(0);
    }
  });

  it("duplicate variable error shows location", () => {
    try {
      const ast = parse("int x = 5\nint x = 10");
      analyze(ast, "int x = 5\nint x = 10");
      expect.fail("Should throw SemanticError");
    } catch (e) {
      expect(e).toBeInstanceOf(SemanticError);
      expect(e.location).toBeDefined();
      expect(e.location.lineNum).toBe(2);
    }
  });

  it("type mismatch error shows location", () => {
    try {
      const code = "int x = 5\nx = \"hello\"";
      const ast = parse(code);
      analyze(ast, code);
      expect.fail("Should throw SemanticError");
    } catch (e) {
      expect(e).toBeInstanceOf(SemanticError);
      expect(e.location).toBeDefined();
      expect(e.type).toBe("SemanticError");
    }
  });

  it("function call argument type error shows location", () => {
    try {
      const code = `func add(int x, int y) -> int {
  return x + y
}
print add(5, "hello")`;
      const ast = parse(code);
      analyze(ast, code);
      expect.fail("Should throw SemanticError");
    } catch (e) {
      expect(e).toBeInstanceOf(SemanticError);
      expect(e.message).toContain("Argument");
      expect(e.type).toBe("SemanticError");
    }
  });

  it("undeclared function error shows location", () => {
    try {
      const code = "print greet(\"hello\")";
      const ast = parse(code);
      analyze(ast, code);
      expect.fail("Should throw SemanticError");
    } catch (e) {
      expect(e).toBeInstanceOf(SemanticError);
      expect(e.message).toContain("greet");
      expect(e.location).toBeDefined();
    }
  });

  it("valid program doesn't throw errors", () => {
    const code = `func add(int x, int y) -> int {
  return x + y
}
print add(5, 3)`;
    const ast = parse(code);
    expect(() => analyze(ast, code)).not.toThrow();
  });
});
