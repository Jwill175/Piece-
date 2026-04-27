import { describe, it, expect } from "vitest";
import { parse } from "../src/parser.js";

describe("Parser", () => {
  it("parses variable declaration", () => {
    const ast = parse("int x = 5");

    expect(ast.statements[0]).toMatchObject({
      kind: "VarDecl",
      name: "x",
      type: "int",
    });
  });

  it("parses print statement", () => {
    const ast = parse('print "hello"');

    expect(ast.statements[0].kind).toBe("Print");
  });

  it("parses addition", () => {
    const ast = parse("print 2 + 3");

    expect(ast.statements[0].argument.kind).toBe("BinaryExpr");
  });

  it("parses less than comparison", () => {
    const ast = parse("print 5 < 10");

    expect(ast.statements[0].argument).toMatchObject({
      kind: "BinaryExpr",
      op: "<",
    });
  });

  it("parses greater than comparison", () => {
    const ast = parse("print 10 > 5");

    expect(ast.statements[0].argument).toMatchObject({
      kind: "BinaryExpr",
      op: ">",
    });
  });

  it("parses equality comparison", () => {
    const ast = parse("print x == 5");

    expect(ast.statements[0].argument).toMatchObject({
      kind: "BinaryExpr",
      op: "==",
    });
  });

  it("parses not equal comparison", () => {
    const ast = parse("print x != 5");

    expect(ast.statements[0].argument).toMatchObject({
      kind: "BinaryExpr",
      op: "!=",
    });
  });

  it("parses less than or equal comparison", () => {
    const ast = parse("print x <= 10");

    expect(ast.statements[0].argument).toMatchObject({
      kind: "BinaryExpr",
      op: "<=",
    });
  });

  it("parses greater than or equal comparison", () => {
    const ast = parse("print x >= 10");

    expect(ast.statements[0].argument).toMatchObject({
      kind: "BinaryExpr",
      op: ">=",
    });
  });

  it("throws on bad syntax", () => {
    expect(() => parse("int x =")).toThrow();
  });
});