import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/MockProviders';
import { Upload, FolderPlus, Search, Filter, File, FileText, Image, Video, Archive, Trash2, Edit, Eye, Download, Star, Clock, User, Tag, Plus, Folder, FolderOpen, ChevronRight, ChevronDown, Settings, AlertCircle, Loader } from 'lucide-react';
import { KnowledgeBaseService, KBFolder, KBDocument } from './services/knowledgeBaseService';

const DocumentKnowledgeBase: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'documents' | 'folders' | 'search' | 'recent' | 'starred'>('documents');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newFolderModalOpen, setNewFolderModalOpen] = useState(false);
  const [folderSettingsModalOpen, setFolderSettingsModalOpen] = useState(false);
  const [selectedFolderForSettings, setSelectedFolderForSettings] = useState<KBFolder | null>(null);
  const [uploadTargetFolder, setUploadTargetFolder] = useState<string | null>(null);
  const [showNewFolderInUpload, setShowNewFolderInUpload] = useState(false);
  const [newFolderNameInUpload, setNewFolderNameInUpload] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [folders, setFolders] = useState<KBFolder[]>([]);
  const [documents, setDocuments] = useState<KBDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [newFolderForm, setNewFolderForm] = useState({
    name: '',
    description: '',
    folder_type: 'general' as KBFolder['folder_type'],
    parent_id: undefined as string | undefined
  });

  const [folderSettingsForm, setFolderSettingsForm] = useState({
    name: '',
    description: '',
    folder_type: 'general' as KBFolder['folder_type'],
    color: '#6b7280'
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeView === 'documents' || activeView === 'folders') {
      loadDocuments();
    } else if (activeView === 'search' && searchQuery) {
      performSearch();
    } else if (activeView === 'recent') {
      loadRecentDocuments();
    } else if (activeView === 'starred') {
      loadStarredDocuments();
    }
  }, [activeView, selectedFolder, searchQuery]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('Loading initial data...');
      
      const [foldersData, documentsData] = await Promise.all([
        KnowledgeBaseService.getAllFolders(),
        KnowledgeBaseService.getAllDocuments()
      ]);
      
      setFolders(foldersData);
      setDocuments(documentsData);
      console.log('Initial data loaded:', { folders: foldersData.length, documents: documentsData.length });
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      console.log('Loading documents for folder:', selectedFolder);
      const docs = selectedFolder 
        ? await KnowledgeBaseService.getAllDocuments(selectedFolder)
        : await KnowledgeBaseService.getAllDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents');
    }
  };

  const loadRecentDocuments = async () => {
    try {
      console.log('Loading recent documents...');
      const docs = await KnowledgeBaseService.getRecentDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Error loading recent documents:', err);
      setError('Failed to load recent documents');
    }
  };

  const loadStarredDocuments = async () => {
    try {
      console.log('Loading starred documents...');
      const docs = await KnowledgeBaseService.getStarredDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Error loading starred documents:', err);
      setError('Failed to load starred documents');
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      console.log('Searching for:', searchQuery);
      const results = await KnowledgeBaseService.searchDocuments(searchQuery);
      setDocuments(results);
    } catch (err) {
      console.error('Error searching documents:', err);
      setError('Failed to search documents');
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      console.log('Uploading files:', files.length);

      // Handle new folder creation if needed
      let targetFolder = uploadTargetFolder;
      if (showNewFolderInUpload && newFolderNameInUpload.trim()) {
        const newFolder = await KnowledgeBaseService.createFolder({
          name: newFolderNameInUpload.trim(),
          description: `Folder created during upload`
        });
        targetFolder = newFolder.id;
        await loadFolders(); // Refresh folders list
      }

      const uploadPromises = Array.from(files).map(file => 
        KnowledgeBaseService.uploadFile(file, targetFolder || undefined)
      );

      await Promise.all(uploadPromises);
      console.log('All files uploaded successfully');
      
      // Refresh documents list
      await loadDocuments();
      setUploadModalOpen(false);
      // Reset upload modal state
      setUploadTargetFolder(null);
      setShowNewFolderInUpload(false);
      setNewFolderNameInUpload('');
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    try {
      console.log('Creating folder:', newFolderForm);
      await KnowledgeBaseService.createFolder(newFolderForm);
      
      // Refresh folders list
      const foldersData = await KnowledgeBaseService.getAllFolders();
      setFolders(foldersData);
      
      // Reset form and close modal
      setNewFolderForm({
        name: '',
        description: '',
        folder_type: 'general',
        parent_id: undefined
      });
      setNewFolderModalOpen(false);
    } catch (err) {
      console.error('Error creating folder:', err);
      setError('Failed to create folder');
    }
  };

  const handleUpdateFolder = async () => {
    if (!selectedFolderForSettings) return;

    try {
      console.log('Updating folder:', selectedFolderForSettings.id, folderSettingsForm);
      await KnowledgeBaseService.updateFolder(selectedFolderForSettings.id, folderSettingsForm);
      
      // Refresh folders list
      const foldersData = await KnowledgeBaseService.getAllFolders();
      setFolders(foldersData);
      
      setFolderSettingsModalOpen(false);
      setSelectedFolderForSettings(null);
    } catch (err) {
      console.error('Error updating folder:', err);
      setError('Failed to update folder');
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    // Use window.confirm to avoid ESLint error
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      console.log('Deleting document:', docId);
      await KnowledgeBaseService.deleteDocument(docId);
      
      // Refresh documents list
      await loadDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document');
    }
  };

  const handleToggleStar = async (docId: string, currentlyStarred: boolean) => {
    try {
      console.log('Toggling star for document:', docId);
      await KnowledgeBaseService.toggleDocumentStar(docId, !currentlyStarred);
      
      // Refresh documents list
      await loadDocuments();
    } catch (err) {
      console.error('Error toggling star:', err);
      setError('Failed to update document');
    }
  };

  const resetTemplateForm = () => {
    setNewFolderForm({
      name: '',
      description: '',
      folder_type: 'general',
      parent_id: undefined
    });
  };

  const getFileIcon = (fileName: string) => {
    if (!fileName) {
      return <File className="w-5 h-5 text-gray-500" />;
    }
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconClass = "w-5 h-5";
    
    switch (extension) {
      case 'pdf':
        return <FileText className={`${iconClass} text-red-500`} />;
      case 'doc':
      case 'docx':
        return <FileText className={`${iconClass} text-blue-500`} />;
      case 'xls':
      case 'xlsx':
        return <FileText className={`${iconClass} text-green-500`} />;
      case 'ppt':
      case 'pptx':
        return <FileText className={`${iconClass} text-orange-500`} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className={`${iconClass} text-purple-500`} />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className={`${iconClass} text-indigo-500`} />;
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive className={`${iconClass} text-gray-500`} />;
      default:
        return <File className={`${iconClass} text-gray-500`} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading knowledge base...</span>
        </div>
      </div>
    );
  }

  // Debug: Log current modal states for testing
  console.log('Modal states:', { uploadModalOpen, newFolderModalOpen });
  
  // Temporarily force modals visible for testing
  // const testUploadModalOpen = true;
  // const testNewFolderModalOpen = true;

  return (
    <div className="bg-white min-h-screen">
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="mt-1 text-gray-600">
              Organize and manage your documents and resources
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setNewFolderModalOpen(true);
              }}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <FolderPlus className="w-5 h-5 mr-2" />
              New Folder
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setUploadModalOpen(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Files
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) {
                  setActiveView('search');
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* View Tabs */}
        <div className="mt-4 flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: 'documents', label: 'All Documents', icon: FileText },
            { id: 'folders', label: 'Folders', icon: Folder },
            { id: 'recent', label: 'Recent', icon: Clock },
            { id: 'starred', label: 'Starred', icon: Star }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveView(tab.id as any);
                if (tab.id !== 'search') {
                  setSearchQuery('');
                }
              }}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Folders Section */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Folder className="w-5 h-5 mr-2" />
              Quick Folder Access
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedFolder(null);
                  setActiveView('documents');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  !selectedFolder && activeView === 'documents' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Folder className="w-4 h-4" />
                <span>All Documents</span>
              </button>
              {folders.slice(0, 6).map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => {
                    setSelectedFolder(folder.id);
                    setActiveView('documents');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                    selectedFolder === folder.id 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FolderOpen className="w-4 h-4" />
                  <span className="truncate max-w-32">{folder.name}</span>
                </button>
              ))}
              {folders.length > 6 && (
                <button
                  onClick={() => setActiveView('folders')}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  +{folders.length - 6} more
                </button>
              )}
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-800">{error}</span>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              )}

          {activeView === 'folders' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Folders</h2>
                <span className="text-sm text-gray-500">{folders.length} folders</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => {
                      setSelectedFolder(folder.id);
                      setActiveView('documents');
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: folder.color + '20' }}
                      >
                        <Folder 
                          className="w-6 h-6" 
                          style={{ color: folder.color || '#6b7280' }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">
                        {documents.filter(doc => doc.folder_id === folder.id).length} files
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600">
                      {folder.name}
                    </h3>
                    {folder.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {folder.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeView === 'documents' || activeView === 'search' || activeView === 'recent' || activeView === 'starred') && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  {activeView === 'search' ? `Search Results for "${searchQuery}"` :
                   activeView === 'recent' ? 'Recent Documents' :
                   activeView === 'starred' ? 'Starred Documents' :
                   selectedFolder ? folders.find(f => f.id === selectedFolder)?.name || 'Documents' : 'All Documents'}
                </h2>
                <span className="text-sm text-gray-500">{documents.length} documents</span>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                  <p className="text-gray-600 mb-6">
                    {activeView === 'search' ? 'No documents match your search criteria.' :
                     selectedFolder ? 'This folder is empty.' : 'Upload your first document to get started.'}
                  </p>
                  {activeView !== 'search' && (
                    <button
                      onClick={() => setUploadModalOpen(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Documents
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {getFileIcon(doc.name || 'unknown')}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {doc.name}
                            </h3>
                            <div className="mt-1 text-sm text-gray-500 space-x-4">
                              <span>{doc.name}</span>
                              <span>{formatFileSize(doc.file_size || 0)}</span>
                              <span>Modified {formatDate(doc.updated_at || '')}</span>
                              {doc.folder_id && (
                                <span className="inline-flex items-center">
                                  <Folder className="w-3 h-3 mr-1" />
                                  {folders.find(f => f.id === doc.folder_id)?.name}
                                </span>
                              )}
                            </div>
                            {doc.description && (
                              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                {doc.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleToggleStar(doc.id!, doc.starred || false)}
                            className={`p-1 rounded ${doc.starred ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            <Star className={`w-4 h-4 ${doc.starred ? 'fill-current' : ''}`} />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc.id!)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Right Column - AI Insights Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200 h-fit sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-600" />
              Knowledge AI Insights
            </h3>

            {/* Document Statistics */}
            <div className="space-y-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Total Documents</span>
                  <span className="text-xl font-bold text-purple-600">{documents.length}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Across {folders.length} folders
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Recent Uploads</span>
                  <span className="text-xl font-bold text-blue-600">
                    {documents.filter(doc => {
                      const uploadDate = new Date(doc.created_at);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return uploadDate > weekAgo;
                    }).length}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  This week
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">AI Recommendations</h4>
              
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-800">Organization Tip</span>
                </div>
                <p className="text-xs text-green-700">
                  Create department-specific folders to improve document findability by 40%
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-blue-800">Search Enhancement</span>
                </div>
                <p className="text-xs text-blue-700">
                  Add tags to your documents to improve search accuracy by 60%
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-yellow-800">Storage Optimization</span>
                </div>
                <p className="text-xs text-yellow-700">
                  Archive documents older than 1 year to optimize storage performance
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-purple-800">Collaboration Boost</span>
                </div>
                <p className="text-xs text-purple-700">
                  Share frequently accessed documents with team members for better collaboration
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t border-purple-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg border border-purple-200 text-sm text-gray-700 hover:bg-purple-50 transition-colors flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2 text-purple-600" />
                  Upload Documents
                </button>
                <button
                  onClick={() => setNewFolderModalOpen(true)}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg border border-purple-200 text-sm text-gray-700 hover:bg-purple-50 transition-colors flex items-center"
                >
                  <FolderPlus className="w-4 h-4 mr-2 text-purple-600" />
                  Create New Folder
                </button>
                <button
                  onClick={() => setActiveView('recent')}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg border border-purple-200 text-sm text-gray-700 hover:bg-purple-50 transition-colors flex items-center"
                >
                  <Clock className="w-4 h-4 mr-2 text-purple-600" />
                  View Recent Files
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4" 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Documents</h3>
              
              {/* Folder Selection */}
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Save to folder</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="folderOption"
                        checked={!uploadTargetFolder && !showNewFolderInUpload}
                        onChange={() => {
                          setUploadTargetFolder(null);
                          setShowNewFolderInUpload(false);
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Root folder (no specific folder)</span>
                    </label>
                    
                    {folders.map((folder) => (
                      <label key={folder.id} className="flex items-center">
                        <input
                          type="radio"
                          name="folderOption"
                          checked={uploadTargetFolder === folder.id}
                          onChange={() => {
                            setUploadTargetFolder(folder.id);
                            setShowNewFolderInUpload(false);
                          }}
                          className="mr-2"
                        />
                        <FolderOpen className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-sm text-gray-700">{folder.name}</span>
                      </label>
                    ))}
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="folderOption"
                        checked={showNewFolderInUpload}
                        onChange={() => {
                          setShowNewFolderInUpload(true);
                          setUploadTargetFolder(null);
                        }}
                        className="mr-2"
                      />
                      <FolderPlus className="w-4 h-4 mr-2 text-green-600" />
                      <span className="text-sm text-gray-700">Create new folder</span>
                    </label>
                    
                    {showNewFolderInUpload && (
                      <div className="ml-6 mt-2">
                        <input
                          type="text"
                          placeholder="Enter folder name"
                          value={newFolderNameInUpload}
                          onChange={(e) => setNewFolderNameInUpload(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Drop files here or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setUploadModalOpen(false);
                    setUploadTargetFolder(null);
                    setShowNewFolderInUpload(false);
                    setNewFolderNameInUpload('');
                  }}
                  disabled={uploading}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {newFolderModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Folder</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Folder Name
                  </label>
                  <input
                    type="text"
                    value={newFolderForm.name}
                    onChange={(e) => setNewFolderForm({...newFolderForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter folder name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newFolderForm.description}
                    onChange={(e) => setNewFolderForm({...newFolderForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter folder description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Folder Type
                  </label>
                  <select
                    value={newFolderForm.folder_type}
                    onChange={(e) => setNewFolderForm({...newFolderForm, folder_type: e.target.value as KBFolder['folder_type']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="project">Project</option>
                    <option value="department">Department</option>
                    <option value="client">Client</option>
                    <option value="archive">Archive</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setNewFolderModalOpen(false);
                    resetTemplateForm();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderForm.name.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Folder Settings Modal */}
      {folderSettingsModalOpen && selectedFolderForSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full my-8">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Folder Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Folder Name
                  </label>
                  <input
                    type="text"
                    value={folderSettingsForm.name}
                    onChange={(e) => setFolderSettingsForm({...folderSettingsForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={folderSettingsForm.description}
                    onChange={(e) => setFolderSettingsForm({...folderSettingsForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Folder Type
                  </label>
                  <select
                    value={folderSettingsForm.folder_type}
                    onChange={(e) => setFolderSettingsForm({...folderSettingsForm, folder_type: e.target.value as KBFolder['folder_type']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="project">Project</option>
                    <option value="department">Department</option>
                    <option value="client">Client</option>
                    <option value="archive">Archive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={folderSettingsForm.color}
                      onChange={(e) => setFolderSettingsForm({...folderSettingsForm, color: e.target.value})}
                      className="w-12 h-8 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={folderSettingsForm.color}
                      onChange={(e) => setFolderSettingsForm({...folderSettingsForm, color: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="#6b7280"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setFolderSettingsModalOpen(false);
                    setSelectedFolderForSettings(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateFolder}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentKnowledgeBase;