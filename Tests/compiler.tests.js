import { describe, it, expect } from "vitest";
import { parse } from "../src/parser.js";
import { analyze } from "../src/analyzer.js";
import { optimize } from "../src/optimizer.js";
import { generate } from "../src/generator.js";

describe("Compiler Pipeline", () => {
  it("compiles full program", () => {
    const source = `
      int x = 5
      int y = 10
      print x + y
    `;

    const ast = parse(source);
    analyze(ast);
    const optimized = optimize(ast);
    const output = generate(optimized);

    expect(output).toContain("console.log");
  });
});