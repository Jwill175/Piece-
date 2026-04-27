export class ParseError extends Error {
  constructor(message, lineNum, colNum, line) {
    super(message);
    this.name = 'ParseError';
    this.type = 'ParseError';
    this.lineNum = lineNum;
    this.colNum = colNum;
    this.line = line;
  }
}

export class SemanticError extends Error {
  constructor(message, location) {
    super(message);
    this.name = 'SemanticError';
    this.type = 'SemanticError';
    this.location = location;
  }
}

export function formatErrorLocation(message, source, lineNum, colNum) {
  const lines = source.split('\n');
  const contextLines = [];

  // Show lines before and after for context (up to 2 lines before/after)
  const startLine = Math.max(0, lineNum - 3);
  const endLine = Math.min(lines.length, lineNum + 1);

  for (let i = startLine; i < endLine; i++) {
    const prefix = i === lineNum - 1 ? '> ' : '  ';
    const lineNo = String(i + 1).padStart(3);
    contextLines.push(`${prefix}${lineNo} | ${lines[i] || ''}`);

    // Add error pointer on the actual error line
    if (i === lineNum - 1 && colNum > 0) {
      const pointerPos = colNum - 1 + 8; // Account for "  NNN | "
      contextLines.push(`   ${' '.repeat(pointerPos)}^`);
    }
  }

  return `${message} [Line ${lineNum}, Column ${colNum}]\n\n${contextLines.join('\n')}`;
}
