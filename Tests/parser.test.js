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

  it("throws on bad syntax", () => {
    expect(() => parse("int = 5")).toThrow();
  });
});