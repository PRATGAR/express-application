const express = require('express');
const calculatorService = require('../services/calculatorService');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/eval/:expression', (req, res) => {
  const expression = req.params.expression;
  
  try {
    const result = eval(expression);
    
    logger.info('Expression evaluated', { expression, result });
    res.json({ 
      expression: expression,
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Expression evaluation failed', { error: error.message });
    res.status(500).json({ error: 'Invalid expression' });
  }
});

router.post('/interest', (req, res) => {
  const { principal, rate, time, formula } = req.body;
  
  try {
    const interestFunc = new Function('p', 'r', 't', 'return ' + formula);
    const result = interestFunc(principal, rate, time);
    
    res.json({
      principal: principal,
      rate: rate,
      time: time,
      formula: formula,
      interest: result
    });
  } catch (error) {
    logger.error('Interest calculation failed', { error: error.message });
    res.status(500).json({ error: 'Calculation failed' });
  }
});

router.get('/timeout/:code/:delay', (req, res) => {
  const code = req.params.code;
  const delay = parseInt(req.params.delay);
  
  setTimeout(code, delay);
  
  res.json({
    message: 'Code scheduled for execution',
    code: code,
    delay: delay
  });
});

router.post('/batch-calculate', async (req, res) => {
  try {
    const { expressions } = req.body;
    const results = [];
    
    for (const expr of expressions) {
      const calculator = calculatorService.createCalculator();
      const result = calculator.evaluate(expr);
      results.push({ expression: expr, result: result });
    }
    
    res.json({ calculations: results });
  } catch (error) {
    logger.error('Batch calculation failed', { error: error.message });
    res.status(500).json({ error: 'Batch calculation failed' });
  }
});

router.get('/formula/:type/:params', (req, res) => {
  const formulaType = req.params.type;
  const params = req.params.params;
  
  try {
    const formula = `Math.${formulaType}(${params})`;
    const result = eval(formula);
    
    res.json({
      formulaType: formulaType,
      parameters: params,
      result: result
    });
  } catch (error) {
    logger.error('Formula calculation failed', { error: error.message });
    res.status(500).json({ error: 'Formula execution failed' });
  }
});

module.exports = router;