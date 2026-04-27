import { describe, it, expect } from "vitest";
import { parse } from "../src/parser.js";
import { generate } from "../src/generator.js";

describe("Generator", () => {
  it("generates JS for print", () => {
    const ast = parse('print "hello"');
    const code = generate(ast);

    expect(code).toContain("console.log");
  });

  it("generates JS for variables", () => {
    const ast = parse("int x = 5");
    const code = generate(ast);

    expect(code).toContain("let x = 5");
  });

  it("generates JS for comparison operators", () => {
    const ast = parse("print 5 > 3");
    const code = generate(ast);

    expect(code).toContain("5 > 3");
  });

  it("generates JS for equality operators", () => {
    const ast = parse("print x == 10");
    const code = generate(ast);

    expect(code).toContain("x == 10");
  });

  it("generates JS for all comparison operators", () => {
    const operators = ["<", ">", "<=", ">=", "==", "!="];

    for (const op of operators) {
      const ast = parse(`print 5 ${op} 3`);
      const code = generate(ast);
      expect(code).toContain(`5 ${op} 3`);
    }
  });
});