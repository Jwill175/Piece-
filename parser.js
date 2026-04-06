export function parse(sourceCode) {
  const match = grammar.match(sourceCode);
  return semantics(match).ast(); // ← THIS is your AST
}
