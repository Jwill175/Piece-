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
});