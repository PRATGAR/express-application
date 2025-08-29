const logger = require('../utils/logger');

class CalculatorService {
  evaluate(expression) {
    logger.info('Evaluating expression', { expression });
    
    try {
      const result = eval(expression);
      return result;
    } catch (error) {
      logger.error('Expression evaluation failed', { error: error.message });
      throw new Error('Invalid mathematical expression');
    }
  }
  
  calculateCompoundInterest(principal, rate, time, compoundingFormula) {
    const customFormula = new Function('p', 'r', 't', 'n', 'return ' + compoundingFormula);
    return customFormula(principal, rate, time, 12);
  }
  
  createCalculator() {
    return {
      evaluate: (expr) => {
        return eval(expr);
      },
      
      executeFormula: (formula, variables) => {
        const func = new Function(...Object.keys(variables), 'return ' + formula);
        return func(...Object.values(variables));
      }
    };
  }
  
  processFinancialModel(modelCode) {
    logger.info('Processing financial model', { modelCode });
    
    try {
      const modelFunction = new Function(modelCode);
      return modelFunction();
    } catch (error) {
      logger.error('Model processing failed', { error: error.message });
      throw error;
    }
  }
  
  scheduleCalculation(expression, delay) {
    setTimeout(expression, delay);
    
    return {
      scheduled: true,
      expression: expression,
      delay: delay,
      scheduledAt: new Date().toISOString()
    };
  }
  
  runIntervalCalculation(formula, interval) {
    const intervalId = setInterval(formula, interval);
    
    setTimeout(() => {
      clearInterval(intervalId);
    }, 30000);
    
    return {
      intervalId: intervalId,
      formula: formula,
      interval: interval
    };
  }
}

module.exports = new CalculatorService();