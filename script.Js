(function() {
    const display = document.getElementById('display');
    const buttons = document.querySelectorAll('.buttons button');
    let currentInput = '';
    let lastInput = '';
    
    function updateDisplay() {
        display.textContent = currentInput || '0';
    }
    
    function isOperator(char) {
        return ['+', '-', '*', '/', '%'].includes(char);
    }
    
    function appendToInput(value) {
        // Prevent multiple consecutive operators
        if (isOperator(value)) {
            if (currentInput === '' && value !== '-') {
                // Can't start with operator except minus
                return;
            }
            if (isOperator(lastInput)) {
                // Replace the previous operator with new one
                currentInput = currentInput.slice(0, -1) + value;
                lastInput = value;
                return;
            }
        }
        if(value === '.') {
            // disallow multiple dots in current number part
            const parts = currentInput.split(/[\+\-\*\/\%]/);
            const lastNumber = parts[parts.length - 1];
            if (lastNumber.includes('.')) {
                return;
            }
            if (lastNumber === '') {
                // if dot is first in number, prepend 0
                currentInput += '0';
            }
        }
        currentInput += value;
        lastInput = value;
    }
    
    function clearInput() {
        currentInput = '';
        lastInput = '';
        updateDisplay();
    }
    
    function backspaceInput() {
        if (currentInput.length > 0) {
            currentInput = currentInput.slice(0, -1);
            lastInput = currentInput.slice(-1);
            updateDisplay();
        }
    }
    
    function calculate() {
        if (currentInput === '') return;
        try {
            // use Function constructor instead of eval for slight security improvement
            // replace division and multiplication signs for eval compatibility
            let expression = currentInput.replace(/÷/g, '/').replace(/×/g, '*');
            // Evaluate safely - only allow characters 0-9, operators and decimal point
            if (/^[0-9\+\-\*\/\%\.\s]+$/.test(expression)) {
                let result = Function('"use strict";return (' + expression + ')')();
                if (result === Infinity || result === -Infinity || isNaN(result)) {
                    throw new Error('Math error');
                }
                result = +result.toFixed(10); // limit decimals to 10 digits, trim trailing zeros
                currentInput = result.toString();
                lastInput = '';
                updateDisplay();
            }
        } catch {
            display.textContent = "Error";
            currentInput = '';
            lastInput = '';
        }
    }
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.getAttribute('data-value');
            const id = button.id;

            if(id === 'clear') {
                clearInput();
                return;
            }
            if(id === 'backspace') {
                backspaceInput();
                return;
            }
            if(id === 'equals') {
                calculate();
                return;
            }
            if (value) {
                appendToInput(value);
                updateDisplay();
            }
        });
    });

    // Keyboard support
    window.addEventListener('keydown', (e) => {
        if ((e.key >= '0' && e.key <= '9') || ['+', '-', '*', '/', '%', '.'].includes(e.key)) {
            e.preventDefault();
            appendToInput(e.key);
            updateDisplay();
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            calculate();
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            backspaceInput();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            clearInput();
        }
    });
})();
