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
});