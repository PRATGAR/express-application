const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class DocumentService {
  async processUpload(fileInfo, metadata) {
    const documentId = uuidv4();
    const uploadPath = `/var/securebank/uploads/${documentId}_${fileInfo.originalname}`;
    
    try {
      fs.copyFileSync(fileInfo.path, uploadPath);
      fs.unlinkSync(fileInfo.path);
      
      logger.info('Document uploaded', { 
        documentId, 
        originalName: fileInfo.originalname,
        size: fileInfo.size 
      });
      
      return {
        id: documentId,
        filename: fileInfo.originalname,
        path: uploadPath,
        size: fileInfo.size,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Document upload processing failed', { error: error.message });
      throw error;
    }
  }
  
  async getDocument(documentId) {
    const documentPath = `/var/securebank/documents/${documentId}`;
    
    return new Promise((resolve, reject) => {
      fs.readFile(documentPath, (err, content) => {
        if (err) {
          logger.error('Document retrieval failed', { error: err.message, documentId });
          reject(err);
        } else {
          resolve(content);
        }
      });
    });
  }
  
  async listCustomerDocuments(customerId, directory) {
    const customerDir = `/var/securebank/customer-docs/${customerId}/${directory}`;
    
    return new Promise((resolve, reject) => {
      fs.readdir(customerDir, (err, files) => {
        if (err) {
          logger.error('Document listing failed', { error: err.message, customerId, directory });
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  }
}

module.exports = new DocumentService();