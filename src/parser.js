import ohm from "ohm-js";
import fs from "fs";

const grammar = ohm.grammar(
  fs.readFileSync("src/piece+.ohm", "utf-8")
);

const semantics = grammar.createSemantics().addOperation("ast", {
  Program(statements) {
    return {
      kind: "Program",
      statements: statements.children.map(s => s.ast()),
    };
  },

  PrintStmt(_print, expr) {
    return {
      kind: "Print",
      argument: expr.ast(),
    };
  },

  VarDecl(...children) {
    if (children[0].sourceString === "let") {
      return {
        kind: "VarDecl",
        name: children[1].sourceString,
        type: "any",
        initializer: children[3].ast(),
      };
    } else {
      return {
        kind: "VarDecl",
        name: children[1].sourceString,
        type: children[0].sourceString,
        initializer: children[3].ast(),
      };
    }
  },

  Assignment(id, _eq, expr) {
    return {
      kind: "Assignment",
      name: id.sourceString,
      value: expr.ast(),
    };
  },

  AddExpr_plus(left, _plus, right) {
    return {
      kind: "BinaryExpr",
      op: "+",
      left: left.ast(),
      right: right.ast(),
    };
  },

  MulExpr(expr) {
    return expr.ast();
  },

  number(_) {
    return {
      kind: "Number",
      value: Number(this.sourceString),
    };
  },

  ident(_) {
    return {
      kind: "Identifier",
      name: this.sourceString,
    };
  },

  String(_open, chars, _close) {
    return {
      kind: "String",
      value: chars.sourceString,
    };
  },
});

export function parse(source) {
  const match = grammar.match(source);
  if (match.failed()) throw new Error(match.message);
  return semantics(match).ast();
}
