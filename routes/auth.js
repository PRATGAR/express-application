const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const logger = require('../utils/logger');
const validator = require('../utils/validator');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'securebank'
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!validator.validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const query = "SELECT * FROM users WHERE email = ?";
    
    db.query(query, [email], async (err, results) => {
      if (err) {
        logger.error('Login query failed', { error: err.message });
        return res.status(500).json({ error: 'Authentication failed' });
      }
      
      const user = results[0];
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      logger.info('User logged in', { userId: user.id, email: user.email });
      
      res.json({
        token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    });
  } catch (error) {
    logger.error('Login failed', { error: error.message });
    res.status(500).json({ error: 'Authentication failed' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!validator.validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = require('uuid').v4();
    
    const query = "INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, 'customer', NOW())";
    
    db.query(query, [userId, name, email, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'Email already exists' });
        }
        logger.error('Registration failed', { error: err.message });
        return res.status(500).json({ error: 'Registration failed' });
      }
      
      logger.info('User registered', { userId, email });
      
      const token = jwt.sign(
        { userId: userId, email: email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.status(201).json({
        token: token,
        user: {
          id: userId,
          name: name,
          email: email,
          role: 'customer'
        }
      });
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/verify-token', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, userId: decoded.userId });
  } catch (error) {
    logger.warn('Invalid token verification', { error: error.message });
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;