# CPP-to-Python-Transpiler
Developed a rule based C++ to Python transpiler that performs lexical analysis and syntax transformation to convert a subset of C++ programs into executable Python code.
<br>
We use **<sup>[1](#1) </sup>Regular Expressions (Regex)** to tokenize syntaxes, and convert by compling Regex's tokens.
<br>
We created and stored these Regex based tokens into the **<sup>[2](#2) </sup>Lexer**. 
<br>
We then used **<sup>[3](#3) </sup>Parser**, which converts the tokens (obtained from `lexer`),into structure.

---

<details>

<summary>
    <strong style="font-size: 1.5em;" id="1">
        Regex : 
    </strong>
</summary>

### Definition ➝
Regex is a sequence of characters that defines a search pattern used to match, find, or manipulate text.<br>

### Working ➝

- Step 1 : Pattern Creation

        Pattern is created like

            (?P<IDENTIFIER>[a-zA-Z_]\w*) or 
            (?P<NUMBER>\d+) etc..
- Step 2 : Engine Processing

        Pattern is compiled by Regex and then the engine scans the text left to right and tries to match the pattern.
- Step 3 : Matching

        If the pattern matches part of the string → match found
        We access these matched members through self.regex.finditer():
            match.lastgroup
            match.group()
</details>

---


<details>

<summary>
    <strong style="font-size: 1.5em;" id="2">
        Lexer : 
    </strong>
</summary>

### Definition ➝
A lexer converts raw source code into a sequence of tokens. It breaks the input program into meaningful pieces called tokens.

### Token ➝

This contains :

- Type (keyword, identifier, operator, etc.)
- Value
- Line number (if error occurs)

`Token(type="IDENTIFIER", value="x")`

### Working ➝

- Step 1 : Character Scanning (Left to Right) from input

        The lexer reads character-by-character.
- Step 2 : Pattern Matching (Using Regex)

        The lexer matches the longest possible valid pattern (this is called maximal munch rule).
- Step 3 : Emit Token

        After matching, it creates a token and moves forward.
        These tokens are then stored together to be used later.
</details>

---
  
<details>

<summary>
    <strong style="font-size: 1.5em;" id="3">
        Parser : 
    </strong>
</summary>

### Definition ➝
A parser is the phase of a compiler/transpiler that takes tokens from the lexer and checks whether they follow the grammar of the language, building a structured representation (usually an AST).<br>
_***AST** (Abstract Syntax Tree)_

### Flow ➝

**_Characters → (Lexer) → Tokens → (Parser) → AST_**

### Working ➝

- Step 1 : Parser receives token stream

        tokens = [
            ('KEYWORD', 'int'),
            ('IDENTIFIER', 'x'),.......
        ]

- Step 2 : Parser Reads Tokens Sequentially

        Traverses through a pointer -
                                      self.current_token()
        And consumes tokens through - 
                                      self.eat("IDENTIFIER")  


- Step 3 : Grammar based Decision-Making

        Parser functions mirror grammar rules, which we provide, according to how it should be.
</details>

---
  
