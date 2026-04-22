# Piece+

## A Beginner-Friendly Bridge Between Python and C

Piece+ is a programming language designed to help new developers take their first steps into coding while gradually introducing the deeper concepts found in lower-level languages. Inspired by the simplicity of Python and the structure of C, Piece+ allows learners to write clean, readable code while building an understanding of types, memory concepts, and program structure. The goal is to make the transition from beginner-friendly scripting to more complex systems programming feel natural and intuitive.

---

## Language Features

* Simple and readable syntax (Python-inspired)
* Optional static typing (`int`, `float`, `str`)
* Arithmetic expressions (`+`)
* Variable declarations and assignments
* Print statements
* Automatic whitespace handling
* Gradual learning curve from dynamic to static typing
* Compiles to JavaScript

---

## Static, Safety, and Security Checks

The Piece+ compiler performs several compile-time checks to ensure correctness and help beginners learn safely:

* **Type Checking**
  Ensures variables match their declared types (e.g., `int`, `float`, `str`)

* **Undeclared Variable Detection**
  Prevents use of variables before declaration

* **Duplicate Declaration Detection**
  Disallows redefining variables in the same scope

* **Assignment Validation**
  Ensures assigned values match the variable’s type

* **Expression Type Safety**
  Prevents invalid operations between incompatible types

These checks help catch errors early, similar to statically typed languages like C, while still allowing flexibility like Python.

---

## Example Programs

### Example 1: Basic Variables

**Piece+**

```txt
int x = 5
int y = 10
print x + y
```

**JavaScript Output**

```js
let x = 5;
let y = 10;
console.log(x + y);
```

---

### Example 2: Strings

**Piece+**

```txt
str name = "Alex"
print name
```

**JavaScript Output**

```js
let name = "Alex";
console.log(name);
```

---

### Example 3: Dynamic Typing

**Piece+**

```txt
let x = 5
x = 10
print x
```

**JavaScript Output**

```js
let x = 5;
x = 10;
console.log(x);
```

---

### Example 4: Type Error (Compile-Time)

**Piece+**

```txt
int x = 5
x = "hello"
```

**Result**

```
Type error: expected int, got str
```

---

### Example 5: Undeclared Variable Error

**Piece+**

```txt
print y
```

**Result**

```
Variable y not declared
```

---

## Design Philosophy

Piece+ is built around the idea of **progressive learning**:

* Start simple (like Python)
* Introduce structure (like C)
* Enforce correctness (through static analysis)

By combining ease-of-use with strong compile-time guarantees, Piece+ helps learners build confidence while preparing them for more advanced programming languages.

---

## How to Run

```bash
npm install
node src/compiler.js example.piece
```

---

## Project Structure

```plaintext
src/
  piece+.ohm
  parser.js
  analyzer.js
  optimizer.js
  generator.js
  compiler.js

test/
  *.test.js
```

---

## Authors

* Jabri Williams
* (Add teammates if applicable)
