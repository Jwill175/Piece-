// compiler.js

import { parse } from "./parser.js";
// (later)
// import { analyze } from "./analyzer.js";
// import { generate } from "./generator.js";

const source = readFile(...);

const ast = parse(source);   // ✅ AST created here

console.log(ast);            // debug

// later:
analyze(ast);
generate(ast);
