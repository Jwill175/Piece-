import { describe, it, expect } from "vitest";
import { parse } from "../src/parser.js";
import { analyze } from "../src/analyzer.js";

describe("Analyzer", () => {
  it("accepts valid program", () => {
    const ast = parse("int x = 5");
    expect(() => analyze(ast)).not.toThrow();
  });

  it("rejects undeclared variable", () => {
    const ast = parse("print x");
    expect(() => analyze(ast)).toThrow();
  });

  it("rejects type mismatch", () => {
    const ast = parse(`
      int x = 5
      x = "hello"
    `);

    expect(() => analyze(ast)).toThrow();
  });

  it("rejects duplicate declaration", () => {
    const ast = parse(`
      int x = 5
      int x = 10
    `);

    expect(() => analyze(ast)).toThrow();
  });
});