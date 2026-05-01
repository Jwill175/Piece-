import * as ohm from "ohm-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ParseError } from "./errors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const grammarPath = path.join(__dirname, "Piece+.ohm");
const grammar = ohm.grammar(
  fs.readFileSync(grammarPath, "utf-8")
);

// Helper to extract location from a node
function getLocation(node) {
  const loc = node.source.getLineAndColumn();
  return {
    lineNum: loc.lineNum,
    colNum: loc.colNum,
    startIdx: node.source.startIdx,
    endIdx: node.source.endIdx,
  };
}

const semantics = grammar.createSemantics().addOperation("ast", {
  Program(items) {
    return {
      kind: "Program",
      statements: items.children.map(s => s.ast()),
    };
  },

  _iter(...children) {
    return children.map(child => child.ast());
  },

  FunctionDecl(_func, name, _open, params, _close, _arrow, returnType, _brace, body, _closeBrace) {
    let paramList = [];
    if (params.children && params.children.length > 0) {
      const paramResult = params.children[0].ast();
      paramList = Array.isArray(paramResult) ? paramResult : [paramResult];
    }

    return {
      kind: "FunctionDecl",
      name: name.sourceString,
      params: paramList,
      returnType: returnType.sourceString,
      body: body.children.map(s => s.ast()),
    };
  },

  ParamList(first, _comma, rest) {
    const params = [first.ast()];
    if (rest.children) {
      rest.children.forEach(item => {
        params.push(item.ast());
      });
    }
    return params;
  },

  Param(type, ident) {
    return {
      type: type.sourceString,
      name: ident.sourceString,
    };
  },

  ArgList(first, _comma, rest) {
    const args = [first.ast()];
    if (rest.children) {
      rest.children.forEach(item => {
        args.push(item.ast());
      });
    }
    return args;
  },

  PrintStmt(_print, expr) {
    return {
      kind: "Print",
      argument: expr.ast(),
    };
  },

  ReturnStmt(_return, expr) {
    return {
      kind: "ReturnStmt",
      value: expr.ast(),
    };
  },

  TraceStmt(_trace, expr) {
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
      location: getLocation(id),
    };
  },

  VarDecl_typed(type, id, _eq, expr) {
    return {
      kind: "VarDecl",
      name: id.sourceString,
      type: type.sourceString,
      initializer: expr.ast(),
      location: getLocation(id),
    };
  },

  Assignment(id, _eq, expr) {
    return {
      kind: "Assignment",
      name: id.sourceString,
      value: expr.ast(),
      location: getLocation(id),
    };
  },

  CompExpr_comparison(left, op, right) {
    return {
      kind: "BinaryExpr",
      op: op.sourceString,
      left: left.ast(),
      right: right.ast(),
    };
  },

  CompExpr(expr) {
    return expr.ast();
  },

  AddExpr_plus(left, _plus, right) {
    return {
      kind: "BinaryExpr",
      op: "+",
      left: left.ast(),
      right: right.ast(),
    };
  },

  AddExpr(expr) {
    return expr.ast();
  },

  MulExpr(expr) {
    return expr.ast();
  },

  CallExpr(name, _open, args, _close) {
    let argList = [];
    if (args.children && args.children.length > 0) {
      const argResult = args.children[0].ast();
      argList = Array.isArray(argResult) ? argResult : [argResult];
    }

    return {
      kind: "CallExpr",
      name: name.sourceString,
      arguments: argList,
      location: getLocation(name),
    };
  },

  ArgList(first, _comma, rest) {
    const args = [first.ast()];
    rest.children.forEach(item => {
      args.push(item.ast());
    });
    return args;
  },


  Primary(expr) {
    return expr.ast();
  },

  CompOp(op) {
    return op.sourceString;
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
      location: getLocation(letter),
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
  if (match.failed()) {
    const interval = match.getInterval();
    const loc = interval.getLineAndColumn();
    const lineContent = source.split('\n')[loc.lineNum - 1] || '';

    throw new ParseError(
      match.message,
      loc.lineNum,
      loc.colNum,
      lineContent
    );
  }
  return semantics(match).ast();
}

export { parse };
