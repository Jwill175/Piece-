export function generate(ast) {
  function getIdentifiers(node) {
    const ids = new Set();
    function walk(n) {
      if (n.kind === "Identifier") ids.add(n.name);
      else if (n.kind === "BinaryExpr") {
        walk(n.left);
        walk(n.right);
      }
    }
    walk(node);
    return Array.from(ids);
  }

  function exprToString(node) {
    switch (node.kind) {
      case "BinaryExpr":
        return `${exprToString(node.left)} ${node.op} ${exprToString(node.right)}`;
      case "Identifier":
        return node.name;
      case "Number":
        return node.value;
      case "String":
        return `"${node.value}"`;
    }
  }

  function gen(node, variables = {}) {
    switch (node.kind) {
      case "Program":
        return node.statements.map(s => gen(s, variables)).join("\n");

      case "FunctionDecl": {
        const params = node.params.map(p => p.name).join(", ");
        const bodyStatements = node.body.map(stmt => gen(stmt, variables));
        const body = bodyStatements.map(s => "  " + s).join("\n");
        return `function ${node.name}(${params}) {\n${body}\n}`;
      }

      case "ReturnStmt":
        return `return ${gen(node.value, variables)};`;

      case "Print":
        return `console.log(${gen(node.argument, variables)});`;

      case "Trace": {
        const ids = getIdentifiers(node.argument);
        const lines = [];

        // Print variable assignments
        for (const id of ids) {
          if (variables[id] !== undefined) {
            lines.push(`console.log("${id} = " + ${id});`);
          }
        }

        // Print expression with substitutions
        lines.push(`console.log("${exprToString(node.argument)}");`);

        // Calculate and print result
        lines.push(`console.log(${gen(node.argument, variables)});`);

        return lines.join("\n");
      }

      case "VarDecl":
        variables[node.name] = true;
        return `let ${node.name} = ${gen(node.initializer, variables)};`;

      case "Assignment":
        return `${node.name} = ${gen(node.value, variables)};`;

      case "BinaryExpr":
        return `${gen(node.left, variables)} ${node.op} ${gen(node.right, variables)}`;

      case "CallExpr":
        const args = node.arguments.map(arg => gen(arg, variables)).join(", ");
        return `${node.name}(${args})`;

      case "Identifier":
        return node.name;

      case "Number":
        return node.value;

      case "String":
        return `"${node.value}"`;
    }
  }

  return gen(ast);
}
