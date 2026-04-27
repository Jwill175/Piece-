import fs from "fs";
import { parse } from "./parser.js";
import { analyze } from "./analyzer.js";
import { optimize } from "./optimizer.js";
import { generate } from "./generator.js";
import { formatErrorLocation } from "./errors.js";

const args = process.argv.slice(2);

// Check for a flag like --syntax, --parse, --analyze, --optimize, --generate
const flagIndex = args.findIndex(a => a.startsWith("--"));
const flag = flagIndex !== -1 ? args[flagIndex] : null;
const file = args.find(a => !a.startsWith("--"));

if (!file) {
  console.error("Usage: node src/compiler.js [--syntax|--parse|--analyze|--optimize|--generate] <file>");
  process.exit(1);
}

const source = fs.readFileSync(file, "utf-8");

try {
  if (flag === "--syntax") {
    // Just check if it parses without error
    parse(source);
    console.log(`✅ Syntax OK: ${file}`);
    process.exit(0);
  }

  const ast = parse(source);

  if (flag === "--parse") {
    console.log(JSON.stringify(ast, null, 2));
    process.exit(0);
  }

  analyze(ast, source);

  if (flag === "--analyze") {
    console.log(`✅ Analysis OK: ${file}`);
    console.log(JSON.stringify(ast, null, 2));
    process.exit(0);
  }

  const optimized = optimize(ast);

  if (flag === "--optimize") {
    console.log(`✅ Optimized AST: ${file}`);
    console.log(JSON.stringify(optimized, null, 2));
    process.exit(0);
  }

  const output = generate(optimized);

  if (flag === "--generate") {
    console.log(output);
    process.exit(0);
  }

  // Default: full pipeline with pretty output
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