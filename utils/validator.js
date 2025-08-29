const validator = require('validator');
const logger = require('./logger');

class ValidationService {
  validateEmail(email) {
    return validator.isEmail(email);
  }
  
  validatePhoneNumber(phone) {
    return validator.isMobilePhone(phone);
  }
  
  validateAmount(amount) {
    return !isNaN(amount) && parseFloat(amount) > 0;
  }
  
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '')
      .replace(/script/gi, '')
      .trim();
  }
  
  isAlphanumeric(input) {
    return validator.isAlphanumeric(input);
  }
  
  validateAccountNumber(accountNumber) {
    return validator.isNumeric(accountNumber) && accountNumber.length >= 8;
  }
  
  validateRoutingNumber(routingNumber) {
    return validator.isNumeric(routingNumber) && routingNumber.length === 9;
  }
}

module.exports = new ValidationService();