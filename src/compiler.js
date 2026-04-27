import fs from "fs";
import { parse } from "./parser.js";
import { analyze } from "./analyzer.js";
import { optimize } from "./optimizer.js";
import { generate } from "./generator.js";
import { formatErrorLocation } from "./errors.js";

const file = process.argv[2];

if (!file) {
  console.error("Usage: node src/compiler.js <file>");
  process.exit(1);
}

const source = fs.readFileSync(file, "utf-8");

try {
  const ast = parse(source);
  analyze(ast, source);
  const optimized = optimize(ast);
  const output = generate(optimized);

  // Display formatted output
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📄 INPUT: ${file}`);
  console.log(`${'='.repeat(50)}\n`);
  console.log(source);

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📦 OUTPUT: JavaScript`);
  console.log(`${'='.repeat(50)}\n`);
  console.log(output);

  console.log(`\n${'='.repeat(50)}`);
  console.log(`▶️ EXECUTION OUTPUT`);
  console.log(`${'='.repeat(50)}\n`);

  // Execute the generated JavaScript
  try {
    eval(output);
  } catch (runtimeError) {
    console.error(`Runtime error: ${runtimeError.message}`);
  }

  console.log(`\n${'='.repeat(50)}\n`);
} catch (e) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`❌ ${e.type || "COMPILATION ERROR"}`);
  console.log(`${'='.repeat(50)}\n`);

  if (e.type === "ParseError") {
    const formatted = formatErrorLocation(
      `Parse Error: ${e.message}`,
      source,
      e.lineNum,
      e.colNum
    );
    console.error(formatted);
  } else if (e.type === "SemanticError") {
    if (e.location) {
      const formatted = formatErrorLocation(
        `Semantic Error: ${e.message}`,
        source,
        e.location.lineNum,
        e.location.colNum
      );
      console.error(formatted);
    } else {
      console.error(`Semantic Error: ${e.message}`);
    }
  } else {
    console.error(e.message);
  }

  console.log(`\n${'='.repeat(50)}\n`);
  process.exit(1);
}

export function compile(source) {
  const ast = parse(source);
  analyze(ast, source);
  const optimized = optimize(ast);
  return generate(optimized);
}

