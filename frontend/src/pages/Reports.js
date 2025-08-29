import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Reports = () => {
  const [reportType, setReportType] = useState('');
  const [customCommand, setCustomCommand] = useState('');
  const [parameters, setParameters] = useState('');
  const [systemAction, setSystemAction] = useState('');
  const [reportResult, setReportResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!reportType.trim()) {
      toast.error('Please enter a report type');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`/api/reports/generate/${reportType}?userId=12345`);
      setReportResult(response.data.content);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Report generation failed');
      setReportResult('Error generating report');
    }
    setLoading(false);
  };

  const handleCustomReport = async () => {
    if (!customCommand.trim()) {
      toast.error('Please enter a command');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/reports/custom', {
        command: customCommand,
        parameters: parameters.split(' ').filter(p => p.trim())
      });
      setReportResult(response.data.output);
      toast.success('Custom report executed');
    } catch (error) {
      toast.error('Custom report failed');
      setReportResult('Error executing custom command');
    }
    setLoading(false);
  };

  const handleSystemAction = async () => {
    if (!systemAction.trim()) {
      toast.error('Please enter a system action');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`/api/reports/system/${systemAction}`);
      setReportResult(response.data.result);
      toast.success('System action completed');
    } catch (error) {
      toast.error('System action failed');
      setReportResult('Error executing system action');
    }
    setLoading(false);
  };

  const handleExportReport = async (format, command) => {
    try {
      const response = await axios.get(`/api/reports/export/${format}/${encodeURIComponent(command)}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Report Generator</h1>
        <div className="text-sm text-gray-500">
          Generate financial and system reports
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Standard Reports</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter report type (e.g., monthly, quarterly, annual)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              />
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Command</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter custom command"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono"
                value={customCommand}
                onChange={(e) => setCustomCommand(e.target.value)}
              />
              <input
                type="text"
                placeholder="Parameters (space-separated)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={parameters}
                onChange={(e) => setParameters(e.target.value)}
              />
              <button
                onClick={handleCustomReport}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Executing...' : 'Execute Custom Report'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Actions</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="System action (start, stop, restart, status)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={systemAction}
                onChange={(e) => setSystemAction(e.target.value)}
              />
              <button
                onClick={handleSystemAction}
                disabled={loading}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Executing...' : 'Execute System Action'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Export Options</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleExportReport('csv', 'transaction-summary')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Export CSV
              </button>
              <button
                onClick={() => handleExportReport('pdf', 'financial-overview')}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Export PDF
              </button>
              <button
                onClick={() => handleExportReport('xml', 'compliance-report')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Export XML
              </button>
              <button
                onClick={() => handleExportReport('json', 'api-data-export')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Report Output</h3>
          <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm overflow-auto max-h-96">
            {reportResult || 'No report generated yet...'}
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>💡 Tip: Use standard report types like 'monthly', 'quarterly', or 'annual'</p>
            <p>⚠️  Custom commands have elevated system privileges</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;