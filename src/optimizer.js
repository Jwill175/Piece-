export function optimize(ast) {
  function fold(node) {
    switch (node.kind) {
      case "Program":
        node.statements = node.statements.map(fold);
        return node;

      case "Print":
        node.argument = fold(node.argument);
        return node;

      case "Trace":
        node.argument = fold(node.argument);
        return node;

      case "BinaryExpr":
        node.left = fold(node.left);
        node.right = fold(node.right);

        if (
          node.left.kind === "Number" &&
          node.right.kind === "Number"
        ) {
          return {
            kind: "Number",
            value: node.left.value + node.right.value,
          };
        }

        return node;

      default:
        return node;
    }
  }

  return fold(ast);
}
