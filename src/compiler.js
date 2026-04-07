import fs from "fs";
import { parse } from "./parser.js";
import { analyze } from "./analyzer.js";
import { optimize } from "./optimizer.js";
import { generate } from "./generator.js";

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
