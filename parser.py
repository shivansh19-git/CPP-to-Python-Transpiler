from dataclasses import dataclass

# -----------------------------
# AST NODE DEFINITIONS
# -----------------------------

@dataclass
class Program:
    statements: list

@dataclass
class FunctionDef:
    return_type: str
    name: str
    parameters: list
    body: list

@dataclass
class FunctionCall:
    name: str
    arguments: list

@dataclass
class CoutStatement:
    values: list

@dataclass
class CinStatement:
    variables: list

@dataclass
class VarDeclaration:
    var_type: str
    name: str
    value: object

@dataclass
class Assignment:
    name: str
    value: object

@dataclass
class IfStatement:
    condition: object
    body: list
    else_body: object = None

@dataclass
class ForLoop:
    init: object
    condition: object
    update: object
    body: list

@dataclass
class WhileLoop:
    condition: object
    body: list

@dataclass
class ReturnStatement:
    value: object

@dataclass
class BinaryOp:
    left: object
    operator: str
    right: object

@dataclass
class String:
    value: str

@dataclass
class Number:
    value: str

@dataclass
class Identifier:
    name: str


# -----------------------------
# PARSER CLASS
# -----------------------------

class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0

    # -----------------------------
    # Utility Methods
    # -----------------------------

    def current_token(self):
        if self.pos < len(self.tokens):
            return self.tokens[self.pos]
        return None

    def eat(self, token_type):
        token = self.current_token()
        if token and token.type == token_type:
            self.pos += 1
            return token
        raise Exception(f"Unexpected token {token}, expected {token_type}")

    # -----------------------------
    # Entry Point
    # -----------------------------

    def parse(self):
        statements = []
        while self.current_token() is not None:
            stmt =self.statement()
            if stmt is None:
                continue
            statements.append(stmt)
        return Program(statements)

    # -----------------------------
    # Statements
    # -----------------------------

    def statement(self):
        token = self.current_token()
        if token.type == "INCLUDE":
            return self.include_statement()
        if token.type == "KEYWORD":
            if token.value in {"int", "float", "double", "char"}:
                if self.tokens[self.pos + 2].value == "(":
                    return self.function_definition()
                else:
                    return self.variable_declaration()
            elif token.value == "using":
                return self.using_statement()
            elif token.value == "if":
                return self.if_statement()
            elif token.value == "for":
                return self.for_loop()
            elif token.value == "while":
                return self.while_loop()
            elif token.value == "return":
                return self.return_statement()
            else:
                raise Exception(f"Unsupported keyword {token.value}")


        elif token.type == "IDENTIFIER":
            if token.value == "cout":
                return self.cout_statement()
            elif token.value == "cin":
                return self.cin_statement()
            elif self.pos + 1 < len(self.tokens) and \
                self.tokens[self.pos + 1].value == "(":

                name = self.eat("IDENTIFIER").value
                call = self.function_call(name)
                self.eat("DELIMITER")  # eat ';'
                return call
            else:
                return self.assignment()

        else:
            raise Exception(f"Invalid statement starting with {token}")

    # ---------------------------------------
    # BLOCK STRUCTURES (ONE INSIDE OTHER)
    # ---------------------------------------

    def block(self):
        statements = []

        # Expect {
        self.eat("DELIMITER")  # should be '{'

        while self.current_token() is not None and \
                not (self.current_token().type == "DELIMITER" and self.current_token().value == "}"):

            stmt = self.statement()
            if stmt is not None:
                statements.append(stmt)

        # Expect '}'
        self.eat("DELIMITER")  # should be '}'

        return statements

    # -----------------------------
    # USING NAMESPACE
    # -----------------------------

    def using_statement(self):
        self.eat("KEYWORD")  # using
        self.eat("KEYWORD")  # namespace
        self.eat("IDENTIFIER")  # std
        self.eat("DELIMITER")  # ;
        return None  # ignore in AST

    # -----------------------------
    # FUNCTION DEFINITION
    # -----------------------------

    def function_definition(self):
        return_type = self.eat("KEYWORD").value
        name = self.eat("IDENTIFIER").value

        self.eat("DELIMITER")  # (

        parameters = []

        while self.current_token().value != ")":
            param_type = self.eat("KEYWORD").value
            param_name = self.eat("IDENTIFIER").value
            parameters.append((param_type, param_name))

            if self.current_token().value == ",":
                self.eat("DELIMITER")

        self.eat("DELIMITER")  # )

        body = self.block()

        return FunctionDef(return_type, name, parameters, body)

    # -----------------------------
    # FUNCTION CALL
    # -----------------------------

    def function_call(self, name):
        self.eat("DELIMITER")  # eat '('

        args = []

        if self.current_token().value != ")":
            while True:
                args.append(self.comparison())

                if self.current_token().value == ",":
                    self.eat("DELIMITER")  # eat ','
                else:
                    break

        self.eat("DELIMITER")  # eat ')'

        return FunctionCall(name, args)

    # -----------------------------
    # COUT
    # -----------------------------

    def cout_statement(self):
        self.eat("IDENTIFIER")  # eat cout

        values = []

        while self.current_token() and self.current_token().type == "SHIFT_OP":
            self.eat("SHIFT_OP")  # eat <<
            values.append(self.comparison())

        self.eat("DELIMITER")  # ;

        return CoutStatement(values)

    # -----------------------------
    # CIN
    # -----------------------------

    def cin_statement(self):
        self.eat("IDENTIFIER")  # eat cin

        variables = []

        while self.current_token() and self.current_token().type == "SHIFT_OP":
            self.eat("SHIFT_OP")  # eat >>
            variables.append(self.eat("IDENTIFIER").value)

        self.eat("DELIMITER")  # ;

        return CinStatement(variables)

    # -----------------------------
    # Variable Declaration
    # Example: int x = 5;
    # -----------------------------

    def variable_declaration(self,expect_semicolon=True):
        var_type = self.eat("KEYWORD").value
        name = self.eat("IDENTIFIER").value

        value = None
        if self.current_token().value == "=":
            self.eat("OPERATOR")
            value = self.comparison()

        if expect_semicolon:
            self.eat("DELIMITER")  # ;

        return VarDeclaration(var_type, name, value)

    # -----------------------------
    # INCLUDE STATEMENT
    # -----------------------------

    def include_statement(self):
        self.eat("INCLUDE")
        return None

    # -----------------------------
    # Assignment
    # Example: x = 10;
    # -----------------------------

    def assignment(self,expect_semicolon=True):
        name = self.eat("IDENTIFIER").value
        self.eat("OPERATOR")  # =
        value = self.comparison()

        if expect_semicolon:
            self.eat("DELIMITER")  # ;
        return Assignment(name, value)

    # -----------------------------
    # If Statement
    # -----------------------------

    def if_statement(self):
        self.eat("KEYWORD")  # if
        self.eat("DELIMITER")  # (

        condition = self.comparison()

        self.eat("DELIMITER")  # )

        body = self.block()

        else_body = None

        # checking for else
        if self.current_token() and \
            self.current_token().type == "KEYWORD" and \
            self.current_token().value == "else":

            self.eat("KEYWORD")
            # checking if that else was for 'else if' or only for 'else'
            if self.current_token().type == "KEYWORD" and \
            self.current_token().value == "if":
                else_body = [self.if_statement()]

            else:
                else_body = self.block()

        return IfStatement(condition, body,else_body)

    # -----------------------------
    # for Loop
    # -----------------------------

    def for_loop(self):
        self.eat("KEYWORD")  # for
        self.eat("DELIMITER")  # (

        # Initialization
        if self.current_token().type == "KEYWORD":
            init = self.variable_declaration(expect_semicolon=False)
        elif self.current_token().type == "IDENTIFIER":
            init = self.assignment(expect_semicolon=False)
        else:
            init = None

        self.eat("DELIMITER")  # eat ;

        # Condition
        if self.current_token().type != "DELIMITER":
            condition = self.comparison()
        else:
            condition = None

        self.eat("DELIMITER")  # ;

        # Update
        if self.current_token().type == "IDENTIFIER":
            update = self.assignment(expect_semicolon=False)
        else:
            update = self.comparison()

        self.eat("DELIMITER")  # )

        body = self.block()

        return ForLoop(init, condition, update, body)

    # -----------------------------
    # While Loop
    # -----------------------------

    def while_loop(self):
        self.eat("KEYWORD")  # while
        self.eat("DELIMITER")  # (

        condition = self.comparison()

        self.eat("DELIMITER")  # )

        body = self.block()

        return WhileLoop(condition, body)

    # -----------------------------
    # Return Statement
    # -----------------------------

    def return_statement(self):
        self.eat("KEYWORD")  # return
        value = self.comparison()
        self.eat("DELIMITER")  # ;
        return ReturnStatement(value)

    # -----------------------------
    # Expressions
    # comparison()   ← NEW (handles < > <= >=)
    #   expression()   ← handles + -
    #       term()         ← handles * /
    #           factor()       ← base values (your current term body)
    # -----------------------------

    def comparison(self):
        left = self.expression()

        while (
                self.current_token()
                and self.current_token().type == "OPERATOR"
                and self.current_token().value in ("<", ">", "<=", ">=")
        ):
            operator = self.eat("OPERATOR").value
            right = self.expression()
            left = BinaryOp(left, operator, right)

        return left

    def expression(self):
        left = self.term()

        while (
                self.current_token()
                and self.current_token().type == "OPERATOR"
                and self.current_token().value in ("+", "-")
        ):
            operator = self.eat("OPERATOR").value
            right = self.term()
            left = BinaryOp(left, operator, right)

        return left

    def term(self):
        left = self.factor()

        while (
                self.current_token()
                and self.current_token().type == "OPERATOR"
                and self.current_token().value in ("*", "/")
        ):
            operator = self.eat("OPERATOR").value
            right = self.factor()
            left = BinaryOp(left, operator, right)

        return left

    def factor(self):
        token = self.current_token()

        if token.type == "NUMBER":
            return Number(self.eat("NUMBER").value)

        elif token.type == "FLOAT":
            return Number(self.eat("FLOAT").value)

        elif token.type == "STRING":
            return String(self.eat("STRING").value)


        elif token.type == "IDENTIFIER":
            name = self.eat("IDENTIFIER").value
            # If next token is '(' → function call
            if self.current_token() and self.current_token().value == "(":
                return self.function_call(name)
            return Identifier(name)

        elif token.value == "(":
            self.eat("DELIMITER")
            expr = self.comparison()
            self.eat("DELIMITER")
            return expr

        else:
            raise Exception(f"Unexpected expression token {token}")