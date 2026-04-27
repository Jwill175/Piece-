import { describe, it, expect } from "vitest";
import { parse } from "../src/parser.js";
import { optimize } from "../src/optimizer.js";

describe("Optimizer", () => {
  it("folds constant addition", () => {
    const ast = parse("print 2 + 3");
    const optimized = optimize(ast);

    const expr = optimized.statements[0].argument;

    expect(expr.kind).toBe("Number");
    expect(expr.value).toBe(5);
  });

  it("folds constant comparison operators", () => {
    const tests = [
      { input: "print 5 > 3", expected: 1 },
      { input: "print 5 < 3", expected: 0 },
      { input: "print 5 == 5", expected: 1 },
      { input: "print 5 != 5", expected: 0 },
      { input: "print 5 <= 5", expected: 1 },
      { input: "print 5 >= 10", expected: 0 },
    ];

    for (const { input, expected } of tests) {
      const ast = parse(input);
      const optimized = optimize(ast);
      const expr = optimized.statements[0].argument;

      expect(expr.kind).toBe("Number");
      expect(expr.value).toBe(expected);
    }
  });
});