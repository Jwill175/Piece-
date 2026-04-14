import * as ohm from "ohm-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const grammarPath = path.join(__dirname, "Piece+.ohm");
const grammar = ohm.grammar(
  fs.readFileSync(grammarPath, "utf-8")
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

  TraceStmt(_trace, _print, expr) {
    return {
      kind: "Trace",
      argument: expr.ast(),
    };
  },

  VarDecl_dynamic(_let, id, _eq, expr) {
    return {
      kind: "VarDecl",
      name: id.sourceString,
      type: "any",
      initializer: expr.ast(),
    };
  },

  VarDecl_typed(type, id, _eq, expr) {
    return {
      kind: "VarDecl",
      name: id.sourceString,
      type: type.sourceString,
      initializer: expr.ast(),
    };
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

  number(_digits, _dot, _fraction) {
    return {
      kind: "Number",
      value: Number(this.sourceString),
    };
  },

  ident(letter, rest) {
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

function parse(source) {
  const match = grammar.match(source);
  if (match.failed()) throw new Error(match.message);
  return semantics(match).ast();
}

export { parse };
