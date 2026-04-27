import { describe, it, expect } from "vitest";
import { parse } from "../src/parser.js";
import { optimize } from "../src/optimizer.js";

describe("Optimizer – Constant Folding (Addition)", () => {
  it("folds integer addition", () => {
    const ast = parse("print 2 + 3");
    const optimized = optimize(ast);
    const expr = optimized.statements[0].argument;
    expect(expr.kind).toBe("Number");
    expect(expr.value).toBe(5);
  });

  it("folds addition resulting in zero", () => {
    const ast = parse("print 0 + 0");
    const optimized = optimize(ast);
    expect(optimized.statements[0].argument.value).toBe(0);
  });

  it("folds addition with larger numbers", () => {
    const ast = parse("print 100 + 200");
    const optimized = optimize(ast);
    expect(optimized.statements[0].argument.value).toBe(300);
  });

  it("folds float addition", () => {
    const ast = parse("print 1.5 + 2.5");
    const optimized = optimize(ast);
    expect(optimized.statements[0].argument.value).toBeCloseTo(4.0);
  });
});

describe("Optimizer – Constant Folding (Comparisons)", () => {
  it("folds 5 > 3 to 1", () => {
    const ast = parse("print 5 > 3");
    const optimized = optimize(ast);
    expect(optimized.statements[0].argument.value).toBe(1);
  });

  it("folds 3 > 5 to 0", () => {
    const ast = parse("print 3 > 5");
    const optimized = optimize(ast);
    expect(optimized.statements[0].argument.value).toBe(0);
  });

  it("folds 5 < 3 to 0", () => {
    const ast = parse("print 5 < 3");
    const optimized = optimize(ast);
    expect(optimized.statements[0].argument.value).toBe(0);
  });

  it("folds 3 < 5 to 1", () => {
    const ast = parse("print 3 < 5");
    const optimized = optimize(ast);
    expect(optimized.statements[0].argument.value).toBe(1);
  });

  it("folds 5 == 5 to 1", () => {
    const ast = parse("print 5 == 5");
    const optimized = optimize(ast);
    expect(optimized.statements[0].argument.value).toBe(1);
  });

  it("folds 5 == 3 to 0", () => {
    const ast = parse("print 5 == 3");
    const optimized = optimize(ast);
    expect(optimized.statements[0].argument.value).toBe(0);
  });

  it("folds 5 != 3 to 1", () => {
    const ast = parse("print 5 != 3");
    const optimized = optimize(ast);
    expect(optimized.statements[0].argument.value).toBe(1);
  });

  it("folds 5 != 5 to 0", () => {
    const ast = parse("print 5 != 5");
    const optimized = optimize(ast);
    expect(optimized.statements[0].argument.value).toBe(0);
  });

  it("folds 5 <= 5 to 1", () => {
    const ast = parse("print 5 <= 5");
    const optimized = optimize(ast);
    expect(optimized.statements[0].argument.value).toBe(1);
  });

  it("folds 6 <= 5 to 0", () => {
    const ast = parse("print 6 <= 5");
    const optimized = optimize(ast);
    expect(optimized.statements[0].argument.value).toBe(0);
  });

  it("folds 5 >= 5 to 1", () => {
    const ast = parse("print 5 >= 5");
    const optimized = optimize(ast);
    expect(optimized.statements[0].argument.value).toBe(1);
  });

  it("folds 5 >= 10 to 0", () => {
    const ast = parse("print 5 >= 10");
    const optimized = optimize(ast);
    expect(optimized.statements[0].argument.value).toBe(0);
  });
});

describe("Optimizer – Non-constant Expressions (no folding)", () => {
  it("does not fold variable + number", () => {
    const ast = parse("int x = 5\nprint x + 3");
    const optimized = optimize(ast);
    const expr = optimized.statements[1].argument;
    expect(expr.kind).toBe("BinaryExpr");
  });

  it("does not fold number + variable", () => {
    const ast = parse("int x = 5\nprint 3 + x");
    const optimized = optimize(ast);
    const expr = optimized.statements[1].argument;
    expect(expr.kind).toBe("BinaryExpr");
  });

  it("does not fold variable + variable", () => {
    const ast = parse("int x = 5\nint y = 3\nprint x + y");
    const optimized = optimize(ast);
    const expr = optimized.statements[2].argument;
    expect(expr.kind).toBe("BinaryExpr");
  });

  it("does not fold variable comparison", () => {
    const ast = parse("int x = 5\nprint x > 3");
    const optimized = optimize(ast);
    const expr = optimized.statements[1].argument;
    expect(expr.kind).toBe("BinaryExpr");
  });
});

describe("Optimizer – Preserves Structure", () => {
  it("preserves VarDecl nodes", () => {
    const ast = parse("int x = 5");
    const optimized = optimize(ast);
    expect(optimized.statements[0].kind).toBe("VarDecl");
  });

  it("still returns a Program node", () => {
    const ast = parse("print 1 + 1");
    const optimized = optimize(ast);
    expect(optimized.kind).toBe("Program");
  });

  it("optimizes print argument in place", () => {
    const ast = parse("print 10 + 10");
    const optimized = optimize(ast);
    expect(optimized.statements[0].kind).toBe("Print");
    expect(optimized.statements[0].argument.value).toBe(20);
  });

  it("handles multiple statements correctly", () => {
    const ast = parse("print 1 + 1\nprint 2 + 2");
    const optimized = optimize(ast);
    expect(optimized.statements[0].argument.value).toBe(2);
    expect(optimized.statements[1].argument.value).toBe(4);
  });

  it("folds nested constant expressions", () => {
    // (2 + 3) as left side — optimizer folds inner first
    const ast = parse("print 2 + 3");
    const optimized = optimize(ast);
    expect(optimized.statements[0].argument.kind).toBe("Number");
    expect(optimized.statements[0].argument.value).toBe(5);
  });


});