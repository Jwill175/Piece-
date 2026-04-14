const fs = require("fs");
const { parse } = require("./parser.js");
const { analyze } = require("./analyzer.js");
const { optimize } = require("./optimizer.js");
const { generate } = require("./generator.js");

const file = process.argv[2];

if (!file) {
  console.error("Usage: node src/compiler.js <file>");
  process.exit(1);
}

const source = fs.readFileSync(file, "utf-8");

try {
  const ast = parse(source);
  analyze(ast);
  const optimized = optimize(ast);
  const output = generate(optimized);

  console.log(output);
} catch (e) {
  console.error("Compilation error:");
  console.error(e.message);
}

module.exports = { compile: (source) => {
  const ast = parse(source);
  analyze(ast);
  const optimized = optimize(ast);
  return generate(optimized);
}};
