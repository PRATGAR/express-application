import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Calculator = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  const [interestForm, setInterestForm] = useState({
    principal: '',
    rate: '',
    time: '',
    formula: 'p * (r/100) * t'
  });
  const [scheduledCode, setScheduledCode] = useState('');
  const [delay, setDelay] = useState('1000');

  const handleEvaluate = async () => {
    if (!expression.trim()) {
      toast.error('Please enter an expression');
      return;
    }

    try {
      const response = await axios.get(`/api/calculator/eval/${encodeURIComponent(expression)}`);
      const calculationResult = response.data.result;
      
      setResult(calculationResult.toString());
      setHistory([...history, { expression, result: calculationResult }]);
      toast.success('Expression evaluated successfully');
    } catch (error) {
      toast.error('Calculation failed');
      setResult('Error');
    }
  };

  const handleInterestCalculation = async () => {
    try {
      const response = await axios.post('/api/calculator/interest', interestForm);
      const interest = response.data.interest;
      
      setResult(`Interest: $${interest.toLocaleString()}`);
      toast.success('Interest calculated successfully');
    } catch (error) {
      toast.error('Interest calculation failed');
    }
  };

  const handleScheduledExecution = async () => {
    if (!scheduledCode.trim()) {
      toast.error('Please enter code to schedule');
      return;
    }

    try {
      const response = await axios.get(
        `/api/calculator/timeout/${encodeURIComponent(scheduledCode)}/${delay}`
      );
      toast.success('Code scheduled for execution');
    } catch (error) {
      toast.error('Scheduling failed');
    }
  };

  const handleFormulaCalculation = async (formulaType, params) => {
    try {
      const response = await axios.get(
        `/api/calculator/formula/${formulaType}/${encodeURIComponent(params)}`
      );
      setResult(response.data.result.toString());
      toast.success('Formula calculated successfully');
    } catch (error) {
      toast.error('Formula calculation failed');
    }
  };

  const clearCalculator = () => {
    setExpression('');
    setResult('');
  };

  const clearHistory = () => {
    setHistory([]);
    toast.success('History cleared');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Financial Calculator</h1>
        <button
          onClick={clearHistory}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Clear History
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Expression Calculator</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter mathematical expression..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEvaluate()}
              />
              
              <div className="flex space-x-2">
                <button
                  onClick={handleEvaluate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Calculate
                </button>
                <button
                  onClick={clearCalculator}
                  className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                >
                  Clear
                </button>
              </div>
              
              {result && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">Result:</p>
                  <p className="text-xl font-bold text-gray-900 font-mono">{result}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Interest Calculator</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Principal ($)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={interestForm.principal}
                  onChange={(e) => setInterestForm({...interestForm, principal: e.target.value})}
                />
                <input
                  type="number"
                  placeholder="Rate (%)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={interestForm.rate}
                  onChange={(e) => setInterestForm({...interestForm, rate: e.target.value})}
                />
              </div>
              
              <input
                type="number"
                placeholder="Time (years)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={interestForm.time}
                onChange={(e) => setInterestForm({...interestForm, time: e.target.value})}
              />
              
              <input
                type="text"
                placeholder="Custom formula (e.g., p * (r/100) * t)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono"
                value={interestForm.formula}
                onChange={(e) => setInterestForm({...interestForm, formula: e.target.value})}
              />
              
              <button
                onClick={handleInterestCalculation}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Calculate Interest
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Scheduled Calculation</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter code to schedule..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono"
                value={scheduledCode}
                onChange={(e) => setScheduledCode(e.target.value)}
              />
              <input
                type="number"
                placeholder="Delay (ms)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={delay}
                onChange={(e) => setDelay(e.target.value)}
              />
              <button
                onClick={handleScheduledExecution}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Schedule Execution
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Formulas</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleFormulaCalculation('sqrt', '16')}
                className="w-full text-left px-3 py-2 border border-gray-200 rounded hover:bg-gray-50"
              >
                Square Root (√16)
              </button>
              <button
                onClick={() => handleFormulaCalculation('pow', '2,3')}
                className="w-full text-left px-3 py-2 border border-gray-200 rounded hover:bg-gray-50"
              >
                Power (2³)
              </button>
              <button
                onClick={() => handleFormulaCalculation('log', '10')}
                className="w-full text-left px-3 py-2 border border-gray-200 rounded hover:bg-gray-50"
              >
                Logarithm (log 10)
              </button>
              <button
                onClick={() => handleFormulaCalculation('sin', 'Math.PI/2')}
                className="w-full text-left px-3 py-2 border border-gray-200 rounded hover:bg-gray-50"
              >
                Sine (sin π/2)
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Calculation History</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No calculations yet</p>
              ) : (
                history.slice(-10).reverse().map((calc, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border">
                    <p className="font-mono text-sm text-gray-700">{calc.expression}</p>
                    <p className="font-bold text-blue-600">= {calc.result}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;