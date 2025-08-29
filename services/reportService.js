const { exec } = require('child_process');
const cron = require('node-cron');
const handlebars = require('handlebars');
const logger = require('../utils/logger');

class ReportService {
  constructor() {
    this.scheduledJobs = new Map();
  }
  
  async generateReport(reportType, userId, parameters = {}) {
    const reportCommand = `./scripts/generate-${reportType}-report.sh ${userId}`;
    
    return new Promise((resolve, reject) => {
      exec(reportCommand, (err, stdout, stderr) => {
        if (err) {
          logger.error('Report generation failed', { 
            error: err.message, 
            reportType, 
            userId 
          });
          reject(err);
        } else {
          logger.info('Report generated successfully', { reportType, userId });
          resolve({
            reportType,
            content: stdout,
            generatedAt: new Date().toISOString(),
            parameters
          });
        }
      });
    });
  }
  
  async scheduleReport(reportType, schedule, command) {
    const jobId = require('uuid').v4();
    
    try {
      const task = cron.schedule(schedule, () => {
        exec(command, (err, stdout, stderr) => {
          if (err) {
            logger.error('Scheduled report failed', { 
              error: err.message, 
              jobId, 
              command 
            });
          } else {
            logger.info('Scheduled report completed', { jobId, reportType });
          }
        });
      });
      
      this.scheduledJobs.set(jobId, task);
      
      logger.info('Report scheduled', { jobId, reportType, schedule });
      
      return {
        id: jobId,
        reportType,
        schedule,
        command,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Report scheduling failed', { error: error.message });
      throw error;
    }
  }
  
  async generateCustomReport(template, data) {
    try {
      const compiledTemplate = handlebars.compile(template);
      const reportHtml = compiledTemplate(data);
      
      logger.info('Custom report generated', { 
        templateLength: template.length,
        dataKeys: Object.keys(data)
      });
      
      return {
        html: reportHtml,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Custom report generation failed', { error: error.message });
      throw error;
    }
  }
}

module.exports = new ReportService();