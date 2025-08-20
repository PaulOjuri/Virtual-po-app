import React, { useState } from 'react';
import { FileText, Upload, BarChart3, Brain, Filter } from 'lucide-react';

interface Document {
  id: number;
  title: string;
  type: 'PDF' | 'Text' | 'Doc';
  size: string;
  uploadedDate: string;
  status: 'Processed' | 'Pending' | 'Error';
}

const KnowledgeBase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Processed' | 'Pending' | 'Error'>('All');
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      title: 'Xtra App User Manual',
      type: 'PDF',
      size: '2.5 MB',
      uploadedDate: '2025-08-15',
      status: 'Processed',
    },
    {
      id: 2,
      title: 'Stakeholder Requirements',
      type: 'Doc',
      size: '1.2 MB',
      uploadedDate: '2025-08-18',
      status: 'Pending',
    },
    {
      id: 3,
      title: 'Market Analysis Notes',
      type: 'Text',
      size: '0.5 MB',
      uploadedDate: '2025-08-20',
      status: 'Processed',
    },
  ]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newDoc: Document = {
        id: documents.length + 1,
        title: files[0].name,
        type: files[0].name.endsWith('.pdf') ? 'PDF' : files[0].name.endsWith('.doc') || files[0].name.endsWith('.docx') ? 'Doc' : 'Text',
        size: `${(files[0].size / 1024 / 1024).toFixed(1)} MB`,
        uploadedDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
      };
      setDocuments([...documents, newDoc]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentMetrics = () => {
    const totalDocuments = documents.length;
    const processedDocuments = documents.filter(d => d.status === 'Processed').length;
    const pendingDocuments = documents.filter(d => d.status === 'Pending').length;
    const pdfDocuments = documents.filter(d => d.type === 'PDF').length;

    return {
      totalDocuments,
      processedDocuments,
      pendingDocuments,
      pdfDocuments,
      recommendations: [
        'Upload recent stakeholder feedback for AI training',
        'Review processed documents for accuracy',
        'Add technical specifications for Xtra App',
      ],
    };
  };

  const metrics = getDocumentMetrics();

  const filteredDocuments = documents.filter(doc => {
    return filterStatus === 'All' || doc.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Knowledge Base</h2>
          <p className="text-slate-600 mt-1">Upload documentation to train the AI</p>
        </div>
        <div className="flex space-x-3">
          <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 cursor-pointer">
            <Upload size={20} />
            <span>Upload Document</span>
            <input
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* AI Training Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-blue-900">AI Training Insights</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {metrics.recommendations.map((recommendation, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="text-blue-500" size={16} />
                <span className="font-medium text-gray-900">Training Suggestion</span>
              </div>
              <p className="text-sm text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Document Overview', icon: FileText },
            { id: 'analytics', label: 'Document Analytics', icon: BarChart3 },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 items-center">
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-600" />
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
          >
            <option value="All">All Statuses</option>
            <option value="Processed">Processed</option>
            <option value="Pending">Pending</option>
            <option value="Error">Error</option>
          </select>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Document List</h3>
          <div className="space-y-4">
            {filteredDocuments.map(doc => (
              <div
                key={doc.id}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{doc.title}</h4>
                    <p className="text-sm text-gray-600">Type: {doc.type}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Size: {doc.size}</span>
                  <span>•</span>
                  <span>Uploaded: {doc.uploadedDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalDocuments}</p>
              </div>
              <FileText className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processed Documents</p>
                <p className="text-2xl font-bold text-green-600">{metrics.processedDocuments}</p>
              </div>
              <FileText className="text-green-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Documents</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.pendingDocuments}</p>
              </div>
              <FileText className="text-yellow-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">PDF Documents</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.pdfDocuments}</p>
              </div>
              <FileText className="text-blue-600" size={32} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
