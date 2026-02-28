import sys
from lexer import Lexer
from parser import (
    Parser,
    Program,
    FunctionDef,
    FunctionCall,
    CoutStatement,
    CinStatement,
    UnaryOp,
    VarDeclaration,
    Assignment,
    IfStatement,
    ForLoop,
    WhileLoop,
    ReturnStatement,
    BinaryOp,
    String,
    Number,
    Identifier,
)


# ---------------------------------
# CODE GENERATOR
# ---------------------------------

class CodeGenerator:
    def __init__(self):
        self.indent_level = 0

    def indent(self):
        return "    " * self.indent_level

    def generate(self, node):
        return self.generate_stmt(node)

    # ---------------------------------
    # STATEMENT GENERATOR
    # ---------------------------------

    def generate_stmt(self, node):
        if isinstance(node, Program):
            return "\n".join(self.generate_stmt(stmt) for stmt in node.statements if stmt)

        elif isinstance(node, FunctionDef):
            params = ", ".join(name for _, name in node.parameters)
            result = f"{self.indent()}def {node.name}({params}):\n"
            self.indent_level += 1
            if not node.body:
                result += f"{self.indent()}pass\n"
            else:
                for stmt in node.body:
                    result += self.generate_stmt(stmt)
            self.indent_level -= 1
            return result

        elif isinstance(node, VarDeclaration):
            if node.value:
                value = self.generate_expr(node.value)
            else:
                value = "None"
            return f"{self.indent()}{node.name} = {value}\n"

        elif isinstance(node, Assignment):
            value = self.generate_expr(node.value)
            return f"{self.indent()}{node.name} = {value}\n"

        elif isinstance(node, CoutStatement):
            values = ", ".join(self.generate_expr(v) for v in node.values)
            return f"{self.indent()}print({values})\n"

        elif isinstance(node, CinStatement):
            result = ""
            for var in node.variables:
                result += f"{self.indent()}{var} = input()\n"
            return result

        elif isinstance(node, UnaryOp):
            operand = self.generate_expr(node.operand)
            if node.operator == "++":
                return f"{self.indent()}{operand} += 1\n"
            else:
                return f"{self.indent()}{operand} -= 1\n"

        elif isinstance(node, IfStatement):
            result = f"{self.indent()}if {self.generate_expr(node.condition)}:\n"
            self.indent_level += 1
            for stmt in node.body:
                result += self.generate_stmt(stmt)
            self.indent_level -= 1
            current = node

            # Handle chained else-if
            while (
                    current.else_body
                    and len(current.else_body) == 1
                    and isinstance(current.else_body[0], IfStatement)
            ):
                next_if = current.else_body[0]
                result += f"{self.indent()}elif {self.generate_expr(next_if.condition)}:\n"
                self.indent_level += 1
                for stmt in next_if.body:
                    result += self.generate_stmt(stmt)
                self.indent_level -= 1
                current = next_if

            # Final else
            if current.else_body and not (
                    len(current.else_body) == 1
                    and isinstance(current.else_body[0], IfStatement)
            ):
                result += f"{self.indent()}else:\n"
                self.indent_level += 1
                for stmt in current.else_body:
                    result += self.generate_stmt(stmt)
                self.indent_level -= 1
            return result


        elif isinstance(node, WhileLoop):
            result = f"{self.indent()}while {self.generate_expr(node.condition)}:\n"
            self.indent_level += 1
            for stmt in node.body:
                result += self.generate_stmt(stmt)
            self.indent_level -= 1
            return result

        elif isinstance(node, ForLoop):
            if isinstance(node.init, (VarDeclaration, Assignment)) and isinstance(node.condition, BinaryOp):
                var = node.init.name
                start = self.generate_expr(node.init.value)
                end = self.generate_expr(node.condition.right)
                result = f"{self.indent()}for {var} in range({start}, {end}):\n"
            else:
                return f"{self.indent()}# Unsupported for-loop\n"
            self.indent_level += 1
            for stmt in node.body:
                result += self.generate_stmt(stmt)
            self.indent_level -= 1
            return result

        elif isinstance(node, ReturnStatement):
            value = self.generate_expr(node.value)
            return f"{self.indent()}return {value}\n"


        elif isinstance(node, FunctionCall):
            call = self.generate_expr(node)
            return f"{self.indent()}{call}\n"

        return ""

    # ---------------------------------
    # EXPRESSION GENERATOR
    # ---------------------------------

    def generate_expr(self, node):

        if isinstance(node, BinaryOp):
            left = self.generate_expr(node.left)
            right = self.generate_expr(node.right)
            return f"({left} {node.operator} {right})"

        elif isinstance(node, FunctionCall):
            args = ", ".join(self.generate_expr(a) for a in node.arguments)
            return f"{node.name}({args})"

        elif isinstance(node, UnaryOp):
            operand = self.generate_expr(node.operand)

            if node.operator == "++":
                return f"{operand} + 1"
            else:
                return f"{operand} - 1"

        elif isinstance(node, Number):
            return node.value

        elif isinstance(node, String):
            return node.value

        elif isinstance(node, Identifier):
            return node.name

        return ""


# ---------------------------------
# DRIVER
# ---------------------------------

def main():
    if len(sys.argv) != 3:
        print("Usage: python main.py <input.cpp>")
        return

    input_filename = sys.argv[1]

    # Read C++ code
    with open(input_filename, "r") as file:
        code = file.read()

    # Lexical Analysis
    lexer = Lexer(code)
    tokens = lexer.tokenize()

    # Parsing
    parser = Parser(tokens)
    ast = parser.parse()

    # Code Generation
    generator = CodeGenerator()
    python_code = generator.generate(ast)

    # Write to output file
    output_filename = sys.argv[2]
    with open(output_filename, "w") as file:
        file.write(python_code)

    print(" Transpilation completed successfully!")
    print("Generated file: output.py")


if __name__ == "__main__":
    main()