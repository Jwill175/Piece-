export function generate(ast) {
  function gen(node) {
    switch (node.kind) {
      case "Program":
        return node.statements.map(gen).join("\n");

      case "Print":
        return `console.log(${gen(node.argument)});`;

      case "VarDecl":
        return `let ${node.name} = ${gen(node.initializer)};`;

      case "Assignment":
        return `${node.name} = ${gen(node.value)};`;

      case "BinaryExpr":
        return `${gen(node.left)} + ${gen(node.right)}`;

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
