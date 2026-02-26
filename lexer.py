# this document is used for tokenization of cpp code, makes it easier to convert in python
import re
from dataclasses import dataclass

# -----------------------------
# TOKEN DEFINITION
# -----------------------------

@dataclass
class Token:
    type: str
    value: str
    line: int

# -----------------------------
# LEXER CLASS
# -----------------------------

class Lexer:
    def __init__(self, code):
        self.code = code
        self.line = 1
        self.tokens = []

        # keywords are similar to identifiers, therefore another set which separates keywords.....
        self.keywords = {
            "int", "float", "double", "char",
            "if", "else", "for", "while", "return",
            "void", "using", "namespace"
        }

        # categorizing the data into the type they belong to........ (for creating regex patterns)
        self.token_specification = [
            ("COMMENT",   r"//.*"),
            ("STRING",    r"\".*?\""),
            ("FLOAT",     r"\d+\.\d+"),
            ("NUMBER",    r"\d+"),
            ("OPERATOR",  r"==|!=|<=|>=|\+\+|--|[+\-*/=<>]"),
            ("DELIMITER", r"[;,\(\)\{\}]"),
            ("IDENTIFIER",r"[A-Za-z_]\w*"),
            ("NEWLINE",   r"\n"),
            ("SKIP",      r"[ \t]+"),
            ("MISMATCH",  r"."),
        ]
        # created a long regex string containing each possible pattern (we matched only few for a short project)
        self.regex = re.compile(
            "|".join(f"(?P<{name}>{pattern})" for name, pattern in self.token_specification)
        )

    # -----------------------------
    # TOKENIZATION PROCESS
    # -----------------------------

    def tokenize(self):
        # regex.finditer(self.code) scans the provided code and returns matches one by one (through loop), from regex (compiled above)
        for match in self.regex.finditer(self.code):
            kind = match.lastgroup
            value = match.group()

            if kind == "NEWLINE":
                self.line += 1

            elif kind == "SKIP" or kind == "COMMENT":
                continue

            elif kind == "IDENTIFIER" and value in self.keywords:
                self.tokens.append(Token("KEYWORD", value, self.line))

            elif kind == "MISMATCH":
                raise RuntimeError(f"Unexpected character '{value}' at line {self.line}")

            else:
                self.tokens.append(Token(kind, value, self.line))

        return self.tokens

