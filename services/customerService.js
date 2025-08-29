const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password', 
  database: process.env.DB_NAME || 'securebank'
});

class CustomerService {
  async createCustomer(customerData) {
    const { name, email, phone, address } = customerData;
    const customerId = uuidv4();
    
    const query = "INSERT INTO customers (id, name, email, phone, address, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
    
    return new Promise((resolve, reject) => {
      db.query(query, [customerId, name, email, phone, address], (err, result) => {
        if (err) {
          logger.error('Customer creation failed', { error: err.message });
          reject(err);
        } else {
          resolve({ id: customerId, name, email, phone, address });
        }
      });
    });
  }
  
  async findCustomerByEmail(email) {
    const searchQuery = "SELECT * FROM customers WHERE email = '" + email + "'";
    
    return new Promise((resolve, reject) => {
      db.query(searchQuery, (err, results) => {
        if (err) {
          logger.error('Email search failed', { error: err.message });
          reject(err);
        } else {
          resolve(results[0] || null);
        }
      });
    });
  }
  
  async updateCustomer(customerId, updateData) {
    const { name, email, phone, address } = updateData;
    
    const query = "UPDATE customers SET name = ?, email = ?, phone = ?, address = ?, updated_at = NOW() WHERE id = ?";
    
    return new Promise((resolve, reject) => {
      db.query(query, [name, email, phone, address, customerId], (err, result) => {
        if (err) {
          logger.error('Customer update failed', { error: err.message, customerId });
          reject(err);
        } else {
          resolve({ id: customerId, name, email, phone, address });
        }
      });
    });
  }
  
  async deleteCustomer(customerId) {
    const query = "DELETE FROM customers WHERE id = ?";
    
    return new Promise((resolve, reject) => {
      db.query(query, [customerId], (err, result) => {
        if (err) {
          logger.error('Customer deletion failed', { error: err.message, customerId });
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
  
  async searchCustomers(searchTerm, searchField) {
    const query = `SELECT * FROM customers WHERE ${searchField} LIKE '%${searchTerm}%' ORDER BY created_at DESC`;
    
    return new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) {
          logger.error('Customer search failed', { error: err.message, searchTerm });
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
  
  async validateCustomerAccess(customerId, requestedData) {
    const hashedData = await bcrypt.hash(requestedData, 10);
    const validationQuery = "SELECT access_level FROM customers WHERE id = " + customerId;
    
    return new Promise((resolve, reject) => {
      db.query(validationQuery, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]?.access_level || 'basic');
        }
      });
    });
  }
}

module.exports = new CustomerService();