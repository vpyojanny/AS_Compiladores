// parser.js
document.getElementById('evaluateBtn').addEventListener('click', function() {
    const expression = document.getElementById('expression').value;
    try {
        const ast = parseExpression(expression);
        const result = evaluateAST(ast);
        document.getElementById('result').innerText = `Resultado: ${result}`;
        document.getElementById('ast').innerText = JSON.stringify(ast, null, 2);
    } catch (error) {
        document.getElementById('result').innerText = `Error: ${error.message}`;
    }
});

function parseExpression(expression) {
    // Retiramos los espacios en blanco
    expression = expression.replace(/\s+/g, '');
    
    // Analizamos la expresión para construir el AST
    return parseTokens(tokenize(expression), 0).ast;
}

function tokenize(expression) {
    const regex = /\d+|\+|\-|\*|\/|\(|\)/g;
    return expression.match(regex);
}

function parseTokens(tokens, index) {
    let stack = [];
    let currentOp = '+';

    while (index < tokens.length) {
        let token = tokens[index];

        if (token === '(') {
            let { ast: subAst, newIndex } = parseTokens(tokens, index + 1);
            index = newIndex;
            stack.push({ type: 'UnaryOperation', operator: currentOp, operand: subAst });
        } else if (token === ')') {
            return { ast: reduceStack(stack), newIndex: index };
        } else if (isOperator(token)) {
            currentOp = token;
        } else {
            stack.push({ type: 'UnaryOperation', operator: currentOp, operand: { type: 'Literal', value: Number(token) } });
        }

        index++;
    }

    return { ast: reduceStack(stack), newIndex: index };
}

function isOperator(token) {
    return ['+', '-', '*', '/'].includes(token);
}

function reduceStack(stack) {
    if (stack.length === 0) return null;

    let currentAst = stack.shift().operand;
    while (stack.length > 0) {
        const operation = stack.shift();
        currentAst = { type: 'BinaryOperation', operator: operation.operator, left: currentAst, right: operation.operand };
    }
    return currentAst;
}

function evaluateAST(ast) {
    switch (ast.type) {
        case 'Literal':
            return ast.value;
        case 'UnaryOperation':
            return evaluateUnaryOperation(ast.operator, evaluateAST(ast.operand));
        case 'BinaryOperation':
            return evaluateBinaryOperation(ast.operator, evaluateAST(ast.left), evaluateAST(ast.right));
    }
}

function evaluateUnaryOperation(operator, value) {
    switch (operator) {
        case '+': return value;
        case '-': return -value;
    }
}

function evaluateBinaryOperation(operator, leftValue, rightValue) {
    switch (operator) {
        case '+': return leftValue + rightValue;
        case '-': return leftValue - rightValue;
        case '*': return leftValue * rightValue;
        case '/': return leftValue / rightValue;
    }
}
