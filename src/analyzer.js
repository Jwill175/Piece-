function analyze(ast) {
  const env = new Map();

  function check(node) {
    switch (node.kind) {
      case "Program":
        node.statements.forEach(check);
        break;

      case "VarDecl":
        if (env.has(node.name)) {
          throw new Error(`Variable ${node.name} already declared`);
        }

        const valueType = check(node.initializer);

        if (node.type !== "any" && node.type !== valueType) {
          throw new Error(
            `Type error: expected ${node.type}, got ${valueType}`
          );
        }

        env.set(node.name, node.type === "any" ? valueType : node.type);
        return node.type;

      case "Assignment":
        if (!env.has(node.name)) {
          throw new Error(`Variable ${node.name} not declared`);
        }

        const assignedType = check(node.value);
        const expectedType = env.get(node.name);

        if (expectedType !== "any" && expectedType !== assignedType) {
          throw new Error(
            `Type error: expected ${expectedType}, got ${assignedType}`
          );
        }

        return assignedType;

      case "Print":
        return check(node.argument);

      case "Trace":
        return check(node.argument);

      case "BinaryExpr":
        const left = check(node.left);
        const right = check(node.right);

        if (left !== right) {
          throw new Error("Type mismatch in binary expression");
        }

        return left;

      case "Identifier":
        if (!env.has(node.name)) {
          throw new Error(`Variable ${node.name} not declared`);
        }
        return env.get(node.name);

      case "Number":
        return Number.isInteger(node.value) ? "int" : "float";

      case "String":
        return "str";
    }
  }

  check(ast);
  return ast;
}

export { analyze };
