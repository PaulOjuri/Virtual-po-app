import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Upload, FolderPlus, Search, Filter, File, FileText, Image, Video, Archive, Trash2, Edit, Eye, Download, Star, Clock, User, Tag, Plus, Folder, FolderOpen, ChevronRight, ChevronDown, BookOpen, Database, Settings, MessageSquare, AlertCircle, Loader } from 'lucide-react';
import { KnowledgeBaseService, KBFolder, KBDocument, KBChatMessage } from './services/knowledgeBaseService';

const KnowledgeBase: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'documents' | 'folders' | 'search' | 'recent' | 'starred' | 'chat'>('documents');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newFolderModalOpen, setNewFolderModalOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [folders, setFolders] = useState<KBFolder[]>([]);
  const [documents, setDocuments] = useState<KBDocument[]>([]);
  const [chatMessages, setChatMessages] = useState<KBChatMessage[]>([]);
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

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user, selectedFolder]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        loadFolders(),
        loadDocuments(),
        activeView === 'chat' && loadChatMessages()
      ]);
      
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const foldersData = await KnowledgeBaseService.getAllFolders();
      setFolders(foldersData);
    } catch (err) {
      console.error('Error loading folders:', err);
      throw err;
    }
  };

  const loadDocuments = async () => {
    try {
      let documentsData: KBDocument[];
      
      if (activeView === 'recent') {
        documentsData = await KnowledgeBaseService.getRecentDocuments();
      } else if (activeView === 'starred') {
        documentsData = await KnowledgeBaseService.getStarredDocuments();
      } else if (searchQuery && activeView === 'search') {
        documentsData = await KnowledgeBaseService.searchDocuments(searchQuery);
      } else {
        documentsData = await KnowledgeBaseService.getAllDocuments(selectedFolder || undefined);
      }
      
      setDocuments(documentsData);
    } catch (err) {
      console.error('Error loading documents:', err);
      throw err;
    }
  };

  const loadChatMessages = async () => {
    try {
      const messages = await KnowledgeBaseService.getChatMessages();
      setChatMessages(messages);
    } catch (err) {
      console.error('Error loading chat messages:', err);
      // Don't throw here - chat is not critical
    }
  };

  // Folder operations
  const handleCreateFolder = async () => {
    if (!newFolderForm.name.trim()) {
      setError('Please enter a folder name');
      return;
    }

    try {
      setError(null);
      const newFolder = await KnowledgeBaseService.createFolder(newFolderForm);
      await loadFolders();
      setNewFolderModalOpen(false);
      setNewFolderForm({
        name: '',
        description: '',
        folder_type: 'general',
        parent_id: undefined
      });
      console.log('Folder created:', newFolder.id);
    } catch (err) {
      console.error('Error creating folder:', err);
      setError(err instanceof Error ? err.message : 'Failed to create folder');
    }
  };

  const handleDeleteFolder = async (folder: KBFolder) => {
    if (!window.confirm(`Are you sure you want to delete "${folder.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      setError(null);
      await KnowledgeBaseService.deleteFolder(folder.id!);
      await loadFolders();
      if (selectedFolder === folder.id) {
        setSelectedFolder(null);
      }
      console.log('Folder deleted:', folder.id);
    } catch (err) {
      console.error('Error deleting folder:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete folder');
    }
  };

  const toggleFolder = (folderId: string) => {
    setFolders(folders.map(folder => 
      folder.id === folderId 
        ? { ...folder, is_expanded: !folder.is_expanded }
        : folder
    ));
  };

  // Document operations
  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    
    try {
      const uploadPromises = Array.from(files).map(file => 
        KnowledgeBaseService.uploadFile(file, selectedFolder || undefined)
      );
      
      await Promise.all(uploadPromises);
      await loadDocuments();
      await loadFolders(); // Refresh to update document counts
      setUploadModalOpen(false);
      console.log(`Uploaded ${files.length} file(s)`);
      
    } catch (err) {
      console.error('Error uploading files:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleStar = async (document: KBDocument) => {
    try {
      setError(null);
      await KnowledgeBaseService.toggleDocumentStar(document.id!, !document.starred);
      await loadDocuments();
    } catch (err) {
      console.error('Error toggling star:', err);
      setError('Failed to update document');
    }
  };

  const handleDeleteDocument = async (document: KBDocument) => {
    if (!window.confirm(`Are you sure you want to delete "${document.name}"?`)) {
      return;
    }

    try {
      setError(null);
      await KnowledgeBaseService.deleteDocument(document.id!);
      await loadDocuments();
      await loadFolders(); // Refresh to update document counts
      console.log('Document deleted:', document.id);
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document');
    }
  };

  // Chat operations
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    const userMessage: KBChatMessage = {
      message_type: 'user',
      content: chatQuery.trim()
    };

    try {
      // Add user message
      const savedUserMessage = await KnowledgeBaseService.createChatMessage(userMessage);
      setChatMessages(prev => [...prev, savedUserMessage]);

      // Generate AI response
      const allDocuments = await KnowledgeBaseService.getAllDocuments();
      const aiResponse = await KnowledgeBaseService.generateAIResponse(chatQuery.trim(), allDocuments);
      
      // Find related documents
      const relatedDocs = allDocuments
        .filter(doc => 
          doc.name.toLowerCase().includes(chatQuery.toLowerCase()) ||
          doc.tags?.some(tag => tag.toLowerCase().includes(chatQuery.toLowerCase()))
        )
        .slice(0, 3)
        .map(doc => doc.name);

      const assistantMessage: KBChatMessage = {
        message_type: 'assistant',
        content: aiResponse,
        related_documents: relatedDocs.length > 0 ? relatedDocs : undefined
      };

      const savedAssistantMessage = await KnowledgeBaseService.createChatMessage(assistantMessage);
      setChatMessages(prev => [...prev, savedAssistantMessage]);
      
      setChatQuery('');
    } catch (err) {
      console.error('Error in chat:', err);
      setError('Failed to process chat message');
    }
  };

  // Search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setActiveView('search');
    try {
      setLoading(true);
      const results = await KnowledgeBaseService.searchDocuments(searchQuery);
      setDocuments(results);
    } catch (err) {
      console.error('Error searching:', err);
      setError('Failed to search documents');
    } finally {
      setLoading(false);
    }
  };

  // View change handler
  const handleViewChange = async (newView: typeof activeView) => {
    setActiveView(newView);
    if (newView === 'chat' && chatMessages.length === 0) {
      await loadChatMessages();
    }
  };

  // Helper functions
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <File className="text-red-500" size={20} />;
      case 'doc': return <FileText className="text-blue-500" size={20} />;
      case 'txt': return <FileText className="text-gray-500" size={20} />;
      case 'img': return <Image className="text-green-500" size={20} />;
      case 'video': return <Video className="text-purple-500" size={20} />;
      default: return <Archive className="text-gray-500" size={20} />;
    }
  };

  const getFolderIcon = (type: string, isExpanded: boolean = false) => {
    const folderIcon = isExpanded ? FolderOpen : Folder;
    switch (type) {
      case 'project': return React.createElement(folderIcon, { className: "text-indigo-600", size: 18 });
      case 'feature': return React.createElement(folderIcon, { className: "text-blue-600", size: 18 });
      case 'user-story': return React.createElement(folderIcon, { className: "text-yellow-600", size: 18 });
      default: return React.createElement(folderIcon, { className: "text-gray-600", size: 18 });
    }
  };

  const formatFileSize = (sizeInMB: number): string => {
    if (sizeInMB < 1) {
      return `${Math.round(sizeInMB * 1000)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const renderFolderTree = (folders: KBFolder[], level: number = 0) => {
    return folders.map(folder => (
      <div key={folder.id} className="space-y-1">
        <div
          className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer group ${
            selectedFolder === folder.id ? 'bg-blue-50 border border-blue-200' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => setSelectedFolder(folder.id!)}
        >
          {folder.children && folder.children.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.id!);
              }}
              className="p-1"
            >
              {folder.is_expanded ? (
                <ChevronDown size={14} className="text-gray-600" />
              ) : (
                <ChevronRight size={14} className="text-gray-600" />
              )}
            </button>
          )}
          <div className={`p-1 rounded ${folder.color || 'bg-gray-100'}`}>
            {getFolderIcon(folder.folder_type, folder.is_expanded)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{folder.name}</p>
            <p className="text-xs text-gray-500">{folder.document_count || 0} documents</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteFolder(folder);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700"
            title="Delete folder"
          >
            <Trash2 size={12} />
          </button>
        </div>
        {folder.is_expanded && folder.children && folder.children.length > 0 && (
          <div className="space-y-1">
            {renderFolderTree(folder.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  // Get filtered documents based on current view and search
  const filteredDocuments = documents.filter(doc => {
    if (searchQuery && activeView !== 'search') {
      return doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return true;
  });

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading knowledge base...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-slate-900">Knowledge Base</h2>
          <p className="text-slate-600 text-sm mt-1">Organized documentation & files</p>
        </div>

        {/* Actions */}
        <div className="p-4 space-y-2 border-b border-gray-200">
          <button
            onClick={() => setUploadModalOpen(true)}
            disabled={uploading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {uploading ? <Loader className="animate-spin" size={16} /> : <Upload size={16} />}
            <span>{uploading ? 'Uploading...' : 'Upload Documents'}</span>
          </button>
          <button
            onClick={() => setNewFolderModalOpen(true)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <FolderPlus size={16} />
            <span>New Folder</span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-xs text-red-600 hover:text-red-800 mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="p-4 border-b border-gray-200">
          <nav className="space-y-1">
            {[
              { id: 'documents', label: 'All Documents', icon: FileText },
              { id: 'folders', label: 'Folder View', icon: Folder },
              { id: 'chat', label: 'Ask Knowledge Base', icon: MessageSquare },
              { id: 'recent', label: 'Recent', icon: Clock },
              { id: 'starred', label: 'Starred', icon: Star },
              { id: 'search', label: 'Search', icon: Search }
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleViewChange(item.id as any)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeView === item.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Folder Tree */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Folders</h3>
            <button
              onClick={loadFolders}
              className="text-gray-400 hover:text-gray-600"
              title="Refresh folders"
            >
              <Settings size={14} />
            </button>
          </div>
          
          {folders.length > 0 ? (
            <div className="space-y-1">
              {renderFolderTree(folders)}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Folder className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              <p className="text-sm">No folders yet</p>
              <button
                onClick={() => setNewFolderModalOpen(true)}
                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
              >
                Create your first folder
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Search Header */}
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search documents, tags, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center space-x-2"
            >
              <Search size={16} />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeView === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {selectedFolder 
                    ? folders.find(f => f.id === selectedFolder)?.name || 'Documents'
                    : 'All Documents'
                  }
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{filteredDocuments.length} documents</span>
                  {selectedFolder && (
                    <button
                      onClick={() => setSelectedFolder(null)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              </div>

              {/* Document Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map(doc => (
                  <div key={doc.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        {getFileIcon(doc.file_type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(doc.file_size)} • v{doc.version}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleToggleStar(doc)}
                          className={`p-1 ${doc.starred ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                        >
                          <Star size={14} fill={doc.starred ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc)}
                          className="p-1 text-gray-400 hover:text-red-500"
                          title="Delete document"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {doc.description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{doc.description}</p>
                    )}

                    <div className="flex flex-wrap gap-1 mb-3">
                      {(doc.tags || []).slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {tag}
                        </span>
                      ))}
                      {(doc.tags || []).length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{(doc.tags || []).length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <User size={12} />
                        <span>{doc.uploaded_by}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{doc.last_modified ? new Date(doc.last_modified).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {doc.file_url && (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 flex items-center justify-center space-x-1"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </a>
                      )}
                      {doc.file_url && (
                        <a
                          href={doc.file_url}
                          download={doc.name}
                          className="px-3 py-2 text-xs border border-gray-200 text-gray-600 rounded hover:bg-gray-50"
                        >
                          <Download size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredDocuments.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery ? 'Try adjusting your search criteria' : 'Start by uploading some documents'}
                  </p>
                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Upload Documents
                  </button>
                </div>
              )}
            </div>
          )}

          {activeView === 'folders' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Folder Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {folders.map(folder => (
                  <div key={folder.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                       onClick={() => {setSelectedFolder(folder.id!); setActiveView('documents');}}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-3 rounded-lg ${folder.color || 'bg-gray-100'}`}>
                        {getFolderIcon(folder.folder_type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{folder.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{folder.folder_type}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Documents:</span>
                        <span className="font-medium">{folder.document_count || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subfolders:</span>
                        <span className="font-medium">{folder.children?.length || 0}</span>
                      </div>
                    </div>

                    {folder.description && (
                      <p className="text-sm text-gray-600 mt-3">{folder.description}</p>
                    )}
                  </div>
                ))}
              </div>

              {folders.length === 0 && (
                <div className="text-center py-12">
                  <Folder className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No folders created</h3>
                  <p className="text-gray-600 mb-4">Create folders to organize your documents</p>
                  <button
                    onClick={() => setNewFolderModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create First Folder
                  </button>
                </div>
              )}
            </div>
          )}

          {(activeView === 'recent' || activeView === 'starred') && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">
                {activeView === 'recent' ? 'Recent Documents' : 'Starred Documents'}
              </h3>
              
              {filteredDocuments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocuments.map(doc => (
                    <div key={doc.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          {getFileIcon(doc.file_type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(doc.file_size)} • v{doc.version}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleStar(doc)}
                          className={`p-1 ${doc.starred ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                        >
                          <Star size={14} fill={doc.starred ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      {doc.file_url && (
                        <div className="flex space-x-2 mt-3">
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 flex items-center justify-center space-x-1"
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  {activeView === 'recent' ? (
                    <>
                      <Clock className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No recent documents</h3>
                      <p className="text-gray-600">Documents you access will appear here</p>
                    </>
                  ) : (
                    <>
                      <Star className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No starred documents</h3>
                      <p className="text-gray-600">Star documents to find them easily later</p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {activeView === 'search' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Search Results</h3>
              
              {searchQuery ? (
                filteredDocuments.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-gray-600">Found {filteredDocuments.length} results for "{searchQuery}"</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredDocuments.map(doc => (
                        <div key={doc.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              {getFileIcon(doc.file_type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(doc.file_size)} • v{doc.version}
                                </p>
                              </div>
                            </div>
                          </div>

                          {doc.file_url && (
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-center"
                            >
                              View Document
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600">Try different keywords or check your spelling</p>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Search your knowledge base</h3>
                  <p className="text-gray-600">Enter keywords in the search box above to find documents</p>
                </div>
              )}
            </div>
          )}

          {activeView === 'chat' && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Ask Your Knowledge Base</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MessageSquare size={16} />
                  <span>AI-powered document consultation</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto min-h-96 max-h-96">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>Start a conversation by asking about your documents</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map(message => (
                      <div key={message.id} className={`flex ${message.message_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          message.message_type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white border border-gray-200'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          {message.related_documents && message.related_documents.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-600 mb-1">Related documents:</p>
                              <div className="flex flex-wrap gap-1">
                                {message.related_documents.map((doc, index) => (
                                  <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                    {doc}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-xs opacity-70 mt-1">
                            {message.created_at ? new Date(message.created_at).toLocaleTimeString() : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleChatSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  placeholder="Ask about your documents... (e.g., 'What are the payment requirements?')"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!chatQuery.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <MessageSquare size={16} />
                  <span>Ask</span>
                </button>
              </form>

              {/* Quick Questions */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'What documents do I have?',
                    'Show me recent uploads',
                    'Find technical documentation',
                    'What wireframes are available?'
                  ].map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setChatQuery(question)}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Upload Documents</h3>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50"
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Click to browse or drag files here</p>
              <p className="text-xs text-gray-500">PDF, DOC, TXT, Images up to 10MB each</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.mp4,.mov"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
            />

            {folders.length > 0 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload to folder:
                </label>
                <select 
                  value={selectedFolder || ''} 
                  onChange={(e) => setSelectedFolder(e.target.value || null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Root folder</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Choose Files
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {newFolderModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name *
                </label>
                <input
                  type="text"
                  value={newFolderForm.name}
                  onChange={(e) => setNewFolderForm({...newFolderForm, name: e.target.value})}
                  placeholder="Enter folder name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Type
                </label>
                <select 
                  value={newFolderForm.folder_type} 
                  onChange={(e) => setNewFolderForm({...newFolderForm, folder_type: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="project">Project</option>
                  <option value="feature">Feature</option>
                  <option value="user-story">User Story</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newFolderForm.description}
                  onChange={(e) => setNewFolderForm({...newFolderForm, description: e.target.value})}
                  placeholder="Brief description of this folder"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setNewFolderModalOpen(false);
                  setNewFolderForm({
                    name: '',
                    description: '',
                    folder_type: 'general',
                    parent_id: undefined
                  });
                }}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderForm.name.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;