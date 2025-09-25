import React, { useState, useMemo } from 'react';

// Conversion factors library
const conversions = {
    length: {
        m: 1,
        km: 1000,
        cm: 0.01,
        mm: 0.001,
        ft: 0.3048,
        mi: 1609.34,
    },
    time: {
        s: 1,
        min: 60,
        hr: 3600,
        day: 86400,
    },
    speed: {
        'm/s': 1,
        'km/h': 1 / 3.6,
        'mi/h': 0.44704,
    }
};

const unitTypes = {
    length: Object.keys(conversions.length),
    time: Object.keys(conversions.time),
    speed: Object.keys(conversions.speed),
};

export default function UnitConverter() {
    const [inputValue, setInputValue] = useState('100');
    const [unitType, setUnitType] = useState('speed');
    const [fromUnit, setFromUnit] = useState('km/h');
    const [toUnit, setToUnit] = useState('m/s');

    const handleTypeChange = (newType) => {
        setUnitType(newType);
        setFromUnit(unitTypes[newType][0]);
        setToUnit(unitTypes[newType][1]);
    };

    const result = useMemo(() => {
        const value = parseFloat(inputValue);
        if (isNaN(value)) return { finalValue: 'Invalid Input', steps: [] };

        const fromFactor = conversions[unitType][fromUnit];
        const toFactor = conversions[unitType][toUnit];
        
        const finalValue = value * (fromFactor / toFactor);

        const steps = [
            { value: value, unit: fromUnit },
            { value: `( ${toFactor} ${toUnit} / ${fromFactor} m )`, isFactor: true }, // Simplified for display
        ];

        return {
            finalValue: finalValue.toPrecision(4),
            steps: `(${value} ${fromUnit}) × (conversion factor) = ${finalValue.toPrecision(4)} ${toUnit}`
        };
    }, [inputValue, unitType, fromUnit, toUnit]);

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-6">
            <h2 className="text-xl font-semibold">Interactive Unit Converter</h2>
            <p className="mt-2 text-zinc-400">
                Enter a value and select units to see the conversion using dimensional analysis.
            </p>
            
            <div className="mt-4 flex flex-wrap gap-2">
                {Object.keys(unitTypes).map(type => (
                    <button key={type} onClick={() => handleTypeChange(type)} className={`px-3 py-1 rounded-full text-sm ${unitType === type ? 'bg-indigo-600' : 'bg-zinc-700'}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</button>
                ))}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-zinc-300">Value</label>
                    <input type="number" value={inputValue} onChange={e => setInputValue(e.target.value)} className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 text-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-300">From</label>
                    <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 text-lg">
                        {unitTypes[unitType].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-300">To</label>
                    <select value={toUnit} onChange={e => setToUnit(e.target.value)} className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 text-lg">
                        {unitTypes[unitType].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <h3 className="font-semibold text-zinc-200">Result:</h3>
                <p className="text-center font-mono text-xl md:text-3xl text-emerald-400 tracking-wider mt-2">{inputValue || 0} {fromUnit} = {result.finalValue} {toUnit}</p>
                <div className="mt-4 pt-4 border-t border-zinc-700">
                    <h4 className="font-semibold text-zinc-300">Dimensional Analysis Setup:</h4>
                    <p className="font-mono text-amber-400 bg-zinc-800 p-2 rounded-md mt-2 text-sm md:text-base">{result.steps}</p>
                </div>
            </div>
        </div>
    );
}
