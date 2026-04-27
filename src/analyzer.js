import { SemanticError } from "./errors.js";

function analyze(ast, source = "") {
  // Pass 1: Register all functions
  const functionTable = new Map();

  for (const statement of ast.statements) {
    if (statement.kind === "FunctionDecl") {
      functionTable.set(statement.name, {
        params: statement.params,
        returnType: statement.returnType,
      });
    }
  }

  // Pass 2: Analyze function bodies and statements
  const globalEnv = new Map();

  function check(node, env = globalEnv) {
    switch (node.kind) {
      case "Program":
        node.statements.forEach(stmt => check(stmt, env));
        break;

      case "FunctionDecl":
        analyzeFunctionBody(node, env);
        break;

      case "VarDecl":
        if (env.has(node.name)) {
          const err = new SemanticError(
            `Variable '${node.name}' already declared`,
            node.location
          );
          err.source = source;
          throw err;
        }

        const valueType = check(node.initializer, env);

        if (node.type !== "any" && node.type !== valueType) {
          const err = new SemanticError(
            `Type error: expected ${node.type}, got ${valueType}`,
            node.location
          );
          err.source = source;
          throw err;
        }

        env.set(node.name, node.type === "any" ? valueType : node.type);
        return node.type;

      case "Assignment":
        if (!env.has(node.name)) {
          const err = new SemanticError(
            `Variable '${node.name}' not declared`,
            node.location
          );
          err.source = source;
          throw err;
        }

        const assignedType = check(node.value, env);
        const expectedType = env.get(node.name);

        if (expectedType !== "any" && expectedType !== assignedType) {
          const err = new SemanticError(
            `Type error: expected ${expectedType}, got ${assignedType}`,
            node.location
          );
          err.source = source;
          throw err;
        }

        return assignedType;

      case "ReturnStmt":
        return check(node.value, env);

      case "Print":
        return check(node.argument, env);

      case "Trace":
        return check(node.argument, env);

      case "BinaryExpr":
        const left = check(node.left, env);
        const right = check(node.right, env);

        // Comparison operators
        if (["<", ">", "<=", ">=", "==", "!="].includes(node.op)) {
          if (left !== right) {
            const err = new SemanticError(
              "Type mismatch in comparison",
              node.location || node.left.location
            );
            err.source = source;
            throw err;
          }
          if (left === "str") {
            const err = new SemanticError(
              `Cannot compare strings with ${node.op}`,
              node.location || node.left.location
            );
            err.source = source;
            throw err;
          }
          return "int";
        }

        // Addition operator (supports int, float, and str concatenation)
        if (node.op === "+") {
          if (left !== right) {
            const err = new SemanticError(
              "Type mismatch in binary expression",
              node.location || node.left.location
            );
            err.source = source;
            throw err;
          }
          return left;
        }

        // Other operators
        if (left !== right) {
          const err = new SemanticError(
            "Type mismatch in binary expression",
            node.location || node.left.location
          );
          err.source = source;
          throw err;
        }

        return left;

      case "CallExpr":
        if (!functionTable.has(node.name)) {
          const err = new SemanticError(
            `Function '${node.name}' is not defined`,
            node.location
          );
          err.source = source;
          throw err;
        }

        const func = functionTable.get(node.name);

        if (node.arguments.length !== func.params.length) {
          const err = new SemanticError(
            `Function '${node.name}' expects ${func.params.length} arguments, got ${node.arguments.length}`,
            node.location
          );
          err.source = source;
          throw err;
        }

        // Type-check arguments
        for (let i = 0; i < node.arguments.length; i++) {
          const argType = check(node.arguments[i], env);
          const paramType = func.params[i].type;

          if (argType !== paramType) {
            const err = new SemanticError(
              `Argument ${i + 1} of '${node.name}': expected ${paramType}, got ${argType}`,
              node.arguments[i].location
            );
            err.source = source;
            throw err;
          }
        }

        return func.returnType;

      case "Identifier":
        if (!env.has(node.name)) {
          const err = new SemanticError(
            `Variable '${node.name}' not declared`,
            node.location
          );
          err.source = source;
          throw err;
        }
        return env.get(node.name);

      case "Number":
        return Number.isInteger(node.value) ? "int" : "float";

      case "String":
        return "str";
    }
  }

  function analyzeFunctionBody(funcDecl, globalEnv) {
    const funcEnv = new Map(globalEnv);

    for (const param of funcDecl.params) {
      funcEnv.set(param.name, param.type);
    }

    let hasReturn = false;
    let returnType = null;

    for (const stmt of funcDecl.body) {
      if (stmt.kind === "ReturnStmt") {
        const stmtReturnType = check(stmt, funcEnv);

        if (stmtReturnType !== funcDecl.returnType) {
          const err = new SemanticError(
            `Function '${funcDecl.name}': expected return type ${funcDecl.returnType}, got ${stmtReturnType}`,
            stmt.location || funcDecl.location
          );
          err.source = source;
          throw err;
        }

        hasReturn = true;
        returnType = stmtReturnType;
      } else {
        check(stmt, funcEnv);
      }
    }

    if (!hasReturn) {
      const err = new SemanticError(
        `Function '${funcDecl.name}' must return a value of type ${funcDecl.returnType}`,
        funcDecl.location
      );
      err.source = source;
      throw err;
    }
  }

  check(ast);
  return ast;
}

export { analyze };
