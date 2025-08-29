import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [directories, setDirectories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewPath, setPreviewPath] = useState('');
  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => {
    fetchDocuments();
    fetchDirectories();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/api/documents/list/customer-docs');
      setDocuments(response.data.files || []);
    } catch (error) {
      console.error('Document fetch failed:', error);
      setDocuments(['statement_2024_01.pdf', 'tax_document_2023.pdf', 'loan_agreement.pdf']);
    }
    setLoading(false);
  };

  const fetchDirectories = async () => {
    try {
      const response = await axios.get('/api/documents/list/folders');
      setDirectories(response.data.files || []);
    } catch (error) {
      setDirectories(['statements', 'tax-docs', 'loans', 'contracts']);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const response = await axios.get(`/api/documents/download/${filename}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Document downloaded successfully');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handlePreview = async () => {
    if (!previewPath.trim()) {
      toast.error('Please enter a file path');
      return;
    }

    try {
      const response = await axios.get(`/api/documents/preview/${previewPath}`);
      setSelectedFile({
        name: previewPath,
        content: response.data.content
      });
      toast.success('File loaded successfully');
    } catch (error) {
      toast.error('Preview failed');
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('document', uploadFile);
    formData.append('category', 'customer-upload');

    try {
      const response = await axios.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('File uploaded successfully');
      setUploadFile(null);
      fetchDocuments();
    } catch (error) {
      toast.error('Upload failed');
    }
  };

  const checkFileExists = async (path) => {
    try {
      const response = await axios.get(`/api/documents/exists/${path}`);
      toast.info(`File ${response.data.exists ? 'exists' : 'does not exist'}`);
    } catch (error) {
      toast.error('File check failed');
    }
  };

  const getFileStats = async (path) => {
    try {
      const response = await axios.get(`/api/documents/stats/${path}`);
      const stats = response.data;
      toast.success(`File size: ${stats.size} bytes, Modified: ${new Date(stats.modified).toLocaleDateString()}`);
    } catch (error) {
      toast.error('Stats retrieval failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
        <button
          onClick={() => document.getElementById('file-upload').click()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Document Library</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map((doc, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{doc}</h4>
                        <p className="text-sm text-gray-500">PDF Document</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          📥
                        </button>
                        <button
                          onClick={() => checkFileExists(doc)}
                          className="text-green-600 hover:text-green-800"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => getFileStats(doc)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          ℹ️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">File Preview</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter file path..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={previewPath}
                onChange={(e) => setPreviewPath(e.target.value)}
              />
              <button
                onClick={handlePreview}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Preview File
              </button>
            </div>
            
            {selectedFile && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">{selectedFile.name}</h4>
                <div className="text-sm text-gray-700 max-h-40 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{selectedFile.content}</pre>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="hidden"
            />
            
            {uploadFile && (
              <div className="mb-4">
                <p className="text-sm text-gray-700">Selected: {uploadFile.name}</p>
                <button
                  onClick={handleUpload}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Upload File
                </button>
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">Click to select a file or drag and drop</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;