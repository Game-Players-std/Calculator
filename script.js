document.addEventListener('DOMContentLoaded', () => {

    const tabBtns = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            // Add active to current
            btn.classList.add('active');
            const target = btn.dataset.target;
            document.getElementById(target).classList.add('active');
        });
    });

    // --- CALCULATOR ---
    const displayCurrent = document.getElementById('calc-display');
    const displayHistory = document.getElementById('calc-history');
    let currentInput = '0';
    let history = '';
    let shouldResetScreen = false;

    const calcBtns = document.querySelectorAll('.btn');

    calcBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.dataset.value;
            const action = btn.dataset.action;

            if (val !== undefined) handleNumber(val);
            if (action !== undefined) handleAction(action);
        });
    });

    function handleNumber(num) {
        if (currentInput === '0' || shouldResetScreen) {
            currentInput = num;
            shouldResetScreen = false;
        } else {
            currentInput += num;
        }
        updateDisplay();
    }

    function handleAction(action) {
        switch(action) {
            case 'clear':
                currentInput = '0';
                history = '';
                break;
            case 'delete':
                if (currentInput.length > 1) {
                    currentInput = currentInput.slice(0, -1);
                } else {
                    currentInput = '0';
                }
                break;
            case 'equal':
                calculate();
                break;
            // Scientific FUCTIONS
            case 'sin':
            case 'cos':
            case 'tan':
            case 'log':
            case 'ln':
            case 'sqrt':
            case 'pow':
                handleMathFunc(action);
                break;
            case 'pi':
                currentInput = Math.PI.toFixed(8);
                shouldResetScreen = true;
                break;

            // Operators
            default:
                if (['+', '-', '*', '/', '%'].includes(action)) {
                    
                    const lastChar = currentInput.slice(-1);
                    if (['+', '-', '*', '/', '%'].includes(lastChar)) {
                        currentInput = currentInput.slice(0, -1) + action;
                    } else {
                        currentInput += action;
                    }
                    shouldResetScreen = false;
                }
                break;
        }
        updateDisplay();
    }

    function handleMathFunc(func) {
        let val = parseFloat(currentInput);
        if (isNaN(val)) return;

        let res = 0;
        switch(func) {
            case 'sin': res = Math.sin(val); break; 
            case 'cos': res = Math.cos(val); break;
            case 'tan': res = Math.tan(val); break;
            case 'log': res = Math.log10(val); break;
            case 'ln':  res = Math.log(val); break;
            case 'sqrt': res = Math.sqrt(val); break;
            case 'pow': 
                currentInput += '**';
                return; 
        }
        
        currentInput = parseFloat(res.toFixed(8)).toString();
        shouldResetScreen = true;
    }

    function calculate() {
        try {
            
            let expression = currentInput.replace('^', '**'); 
            
            
            if (!/^[0-9+\-*/%.() ]+$/.test(expression)) {
                /* */
            } 

            const result = eval(expression);
            
            history = currentInput + ' =';
            currentInput = parseFloat(result.toFixed(8)).toString();
            shouldResetScreen = true;
        } catch (e) {
            currentInput = 'Error';
            shouldResetScreen = true;
        }
    }

    function updateDisplay() {
        displayCurrent.textContent = currentInput;
        displayHistory.textContent = history;
    }

    // --- CONVERTER---
    const convTabs = document.querySelectorAll('.conv-tab');
    const unitFrom = document.getElementById('unit-from');
    const unitTo = document.getElementById('unit-to');
    const inputField = document.getElementById('conv-input');
    const outputField = document.getElementById('conv-output');
    const iconSwap = document.querySelector('.icon-swap');

    let currentCategory = 'length';

    const units = {
        length: ['Meter', 'Kilometer', 'Centimeter', 'Millimeter', 'Inch', 'Foot', 'Yard', 'Mile'],
        mass: ['Kilogram', 'Gram', 'Milligram', 'Pound'],
        temperature: ['Celsius', 'Fahrenheit', 'Kelvin'],
        time: ['Second', 'Minute', 'Hour', 'Day']
    };


    populateSelects(currentCategory);

    convTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            convTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.type;
            populateSelects(currentCategory);
            convert();
        });
    });

    function populateSelects(category) {
        unitFrom.innerHTML = '';
        unitTo.innerHTML = '';
        units[category].forEach(u => {
            unitFrom.add(new Option(u, u));
            unitTo.add(new Option(u, u));
        });
      
        unitTo.selectedIndex = 1; 
    }

    inputField.addEventListener('input', convert);
    unitFrom.addEventListener('change', convert);
    unitTo.addEventListener('change', convert);
    
    iconSwap.addEventListener('click', () => {
        const temp = unitFrom.value;
        unitFrom.value = unitTo.value;
        unitTo.value = temp;
        convert();
    });

    function convert() {
        const val = parseFloat(inputField.value);
        if (isNaN(val)) {
            outputField.value = '';
            return;
        }

        const from = unitFrom.value;
        const to = unitTo.value;
        let result = 0;

        if (currentCategory === 'temperature') {
            result = convertTemp(val, from, to);
        } else {
            
            const factorFrom = getFactor(currentCategory, from);
            const factorTo = getFactor(currentCategory, to);
           
            result = (val * factorFrom) / factorTo;
        }

        outputField.value = parseFloat(result.toFixed(6));
    }




    /*THE MAIN FUNCTIONS*/
    function convertTemp(val, from, to) {
        if (from === to) return val;
        let celsius = val;

        // To Celsius
        if (from === 'Fahrenheit') celsius = (val - 32) * 5/9;
        if (from === 'Kelvin') celsius = val - 273.15;

        // From Celsius
        if (to === 'Fahrenheit') return (celsius * 9/5) + 32;
        if (to === 'Kelvin') return celsius + 273.15;
        
        return celsius;
    }

    function getFactor(category, unit) {
        
        const lengthFactors = {
            'Meter': 1, 'Kilometer': 1000, 'Centimeter': 0.01, 'Millimeter': 0.001,
            'Inch': 0.0254, 'Foot': 0.3048, 'Yard': 0.9144, 'Mile': 1609.34
        };
        // Mass Base: Kilogram
        const massFactors = {
            'Kilogram': 1, 'Gram': 0.001, 'Milligram': 0.000001, 
            'Pound': 0.453592, 'Ounce': 0.0283495
        };
        // Time Base: Second
        const timeFactors = {
            'Second': 1, 'Minute': 60, 'Hour': 3600, 'Day': 86400
        };

        if (category === 'length') return lengthFactors[unit];
        if (category === 'mass') return massFactors[unit];
        if (category === 'time') return timeFactors[unit];
        return 1;
    }
});
