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
          let result;
          switch (node.op) {
            case "+":
              result = node.left.value + node.right.value;
              break;
            case "<":
              result = node.left.value < node.right.value ? 1 : 0;
              break;
            case ">":
              result = node.left.value > node.right.value ? 1 : 0;
              break;
            case "<=":
              result = node.left.value <= node.right.value ? 1 : 0;
              break;
            case ">=":
              result = node.left.value >= node.right.value ? 1 : 0;
              break;
            case "==":
              result = node.left.value === node.right.value ? 1 : 0;
              break;
            case "!=":
              result = node.left.value !== node.right.value ? 1 : 0;
              break;
            default:
              return node;
          }
          return {
            kind: "Number",
            value: result,
          };
        }

        return node;

      default:
        return node;
    }
  }

  return fold(ast);
}
