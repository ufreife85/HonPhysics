// COMPLETE AND FINAL CODE FOR SigFigCalculator.jsx

import React, { useState, useMemo } from 'react';

// Helper to count decimal places
const getDecimalPlaces = (numStr) => {
    if (!numStr.includes('.')) return 0;
    return numStr.split('.')[1].length;
};

// Function to count significant figures
const countSigFigs = (numStr) => {
    if (numStr.includes('e')) { // Handle scientific notation
        const mantissa = numStr.split('e')[0];
        return countSigFigs(mantissa);
    }
    if (!numStr.includes('.')) { // Integer
        if (numStr.endsWith('0')) {
            let count = numStr.length;
            while (numStr[count - 1] === '0') {
                count--;
            }
            return count === 0 ? 1 : count;
        }
        return numStr.length;
    }
    // Decimal
    let processed = numStr.replace('-', '');
    if (processed.startsWith('0.')) {
        processed = processed.substring(2);
        let leadingZeros = 0;
        while (processed[leadingZeros] === '0') {
            leadingZeros++;
        }
        return processed.length - leadingZeros;
    }
    return processed.replace('.', '').length;
};

// Function to perform calculation and apply sig fig rules
const calculateWithSigFigs = (expression) => {
    // 1. Tokenize the expression into numbers and operators
    const tokens = expression.split(/([*\/+\-])/).map(p => p.trim()).filter(p => p);

    if (tokens.length === 0) return { result: '', rule: '' };
    if (tokens.length % 2 === 0) return { result: 'Error', rule: 'Invalid expression format.' };

    // --- First Pass: Multiplication and Division ---
    const pass1 = [];
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token === '*' || token === '/') {
            const num1Str = pass1.pop();
            const num2Str = tokens[++i];

            if (!num1Str || !num2Str) return { result: 'Error', rule: 'Missing number in operation.'};

            const num1 = parseFloat(num1Str);
            const num2 = parseFloat(num2Str);

            if (isNaN(num1) || isNaN(num2)) return { result: 'Error', rule: 'Invalid number in expression.' };

            const rawResult = token === '*' ? num1 * num2 : num1 / num2;
            
            const sigFigs1 = countSigFigs(num1Str);
            const sigFigs2 = countSigFigs(num2Str);
            const leastSigFigs = Math.min(sigFigs1, sigFigs2);
            
            const resultStr = rawResult.toPrecision(leastSigFigs);
            pass1.push(resultStr);
        } else {
            pass1.push(token);
        }
    }

    // --- Second Pass: Addition and Subtraction ---
    if (pass1.length === 1) {
         return { result: parseFloat(pass1[0]).toString(), rule: 'Final result rules applied.' };
    }
    
    let resultStr = pass1[0];
    for (let i = 1; i < pass1.length; i += 2) {
        const op = pass1[i];
        const num2Str = pass1[i+1];
        
        if (!op || !num2Str) return { result: 'Error', rule: 'Incomplete expression.'};

        const num1 = parseFloat(resultStr);
        const num2 = parseFloat(num2Str);

        if (isNaN(num1) || isNaN(num2)) return { result: 'Error', rule: 'Invalid number in expression.' };
        
        const rawResult = op === '+' ? num1 + num2 : num1 - num2;
        
        const decimals1 = getDecimalPlaces(resultStr);
        const decimals2 = getDecimalPlaces(num2Str);
        const leastDecimals = Math.min(decimals1, decimals2);
        
        resultStr = rawResult.toFixed(leastDecimals);
    }

    return { result: parseFloat(resultStr).toString(), rule: 'Order of operations and sig fig rules applied.' };
};


// The React component that provides the UI and state
export default function SigFigCalculator() {
    const [mode, setMode] = useState('count'); // Start in calculator mode
    const [inputValue, setInputValue] = useState('0.0520');
    const [calcValue, setCalcValue] = useState('12.3 * 5.0 + 2.1');

    const countResult = useMemo(() => {
        if (!inputValue) return null;
        try {
            return countSigFigs(inputValue);
        } catch (e) {
            return "Invalid";
        }
    }, [inputValue]);

    const calcResult = useMemo(() => {
        if (!calcValue.trim()) return { result: '', rule: '' };
        try {
            return calculateWithSigFigs(calcValue);
        } catch (e) {
            return { result: 'Error', rule: 'Calculation failed.' };
        }
    }, [calcValue]);

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-6">
            <h2 className="text-xl font-semibold">Significant Figure Calculator & Trainer</h2>
            <div className="mt-2 flex gap-2 border-b border-zinc-700 pb-2">
                <button onClick={() => setMode('count')} className={`px-4 py-2 rounded-lg ${mode === 'count' ? 'bg-indigo-600' : 'bg-zinc-800'}`}>Count Sig Figs</button>
                <button onClick={() => setMode('calculate')} className={`px-4 py-2 rounded-lg ${mode === 'calculate' ? 'bg-indigo-600' : 'bg-zinc-800'}`}>Calculator</button>
            </div>

            {mode === 'count' && (
                <div className="mt-4">
                    <p className="text-zinc-400 mb-2">Enter a number to count its significant figures.</p>
                    <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 text-lg font-mono" />
                    <div className="mt-3 p-4 bg-zinc-900 rounded-xl text-center">
                        <p className="text-zinc-300">Significant Figures:</p>
                        <p className="text-4xl font-bold text-emerald-400">{countResult}</p>
                    </div>
                </div>
            )}

            {mode === 'calculate' && (
                <div className="mt-4">
                    <p className="text-zinc-400 mb-2">Enter a calculation (e.g., 10.5 / 2.0 + 3.14). Use *, /, +, -</p>
                    <input type="text" value={calcValue} onChange={e => setCalcValue(e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 text-lg font-mono" />
                    <div className="mt-3 p-4 bg-zinc-900 rounded-xl">
                        <p className="text-zinc-300 text-center">Result with Correct Sig Figs:</p>
                        <p className="text-4xl font-bold text-emerald-400 text-center">{calcResult.result}</p>
                        <p className="text-center text-amber-400 text-sm mt-2">{calcResult.rule}</p>
                    </div>
                </div>
            )}
        </div>
    );
}