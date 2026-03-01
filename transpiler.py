from lexer import Lexer
from parser import Parser
from main import CodeGenerator

def transpile_code(source_code: str) -> str:
    lexer = Lexer(source_code)
    tokens = lexer.tokenize()

    parser = Parser(tokens)
    ast = parser.parse()

    generator = CodeGenerator()
    output_code = generator.generate(ast)

    return output_code