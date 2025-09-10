import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Upload, FolderPlus, Search, Filter, File, FileText, Image, Video, Archive, Trash2, Edit, Eye, Download, Star, Clock, User, Tag, Plus, Folder, FolderOpen, ChevronRight, ChevronDown, BookOpen, Database, Settings, MessageSquare, AlertCircle, Loader } from 'lucide-react';
import { KnowledgeBaseService, KBFolder, KBDocument, KBChatMessage } from './services/knowledgeBaseService';
import { AIService, ChatMessage, ChatContext } from './services/aiService';

const KnowledgeBase: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'documents' | 'folders' | 'search' | 'recent' | 'starred' | 'chat'>('documents');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newFolderModalOpen, setNewFolderModalOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
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
    if (!chatQuery.trim() || isAITyping) return;

    const userQuery = chatQuery.trim();
    setChatQuery('');
    setIsAITyping(true);
    setError(null);

    // Generate conversation ID if first message
    const conversationId = currentConversationId || crypto.randomUUID();
    if (!currentConversationId) {
      setCurrentConversationId(conversationId);
    }

    // Add user message to UI immediately
    const userMessageForUI: KBChatMessage = {
      message_type: 'user',
      content: userQuery,
      created_at: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, userMessageForUI]);

    try {
      // Build enhanced context for knowledge base queries
      const kbContext: ChatContext = {
        currentView: 'knowledge-base',
        userQuery: userQuery,
        knowledgeBase: {
          documents: await KnowledgeBaseService.getAllDocuments(),
          folders: folders,
          recentSearches: [userQuery]
        }
      };

      // Generate comprehensive AI response using the new AIService
      const aiMessage = await AIService.generateResponse(userQuery, kbContext, conversationId);
      
      // Convert to KB chat message format
      const aiChatMessage: KBChatMessage = {
        message_type: 'assistant',
        content: aiMessage.content,
        related_documents: aiMessage.sources?.slice(0, 5).map(source => source.title) || undefined,
        created_at: new Date().toISOString()
      };

      // Save to knowledge base chat history
      try {
        await KnowledgeBaseService.createChatMessage(userMessageForUI);
        await KnowledgeBaseService.createChatMessage(aiChatMessage);
      } catch (saveError) {
        console.warn('Failed to save chat messages to KB service:', saveError);
      }

      // Add AI response to UI
      setChatMessages(prev => [...prev, aiChatMessage]);
      
    } catch (err) {
      console.error('Error in AI chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to get AI response. Please try again.');
      
      // Add error message to chat
      const errorMessage: KBChatMessage = {
        message_type: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try asking your question again or check your network connection.',
        created_at: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAITyping(false);
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
              className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
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
            className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
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
            className="w-full px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {uploading ? <Loader className="animate-spin" size={16} /> : <Upload size={16} />}
            <span>{uploading ? 'Uploading...' : 'Upload Documents'}</span>
          </button>
          <button
            onClick={() => setNewFolderModalOpen(true)}
            className="w-full px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
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
                  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="p-4 border-b border-gray-200">
          <nav className="space-y-2">
            {/* 1. All Documents (Main Category) */}
            <button
              onClick={() => handleViewChange('documents')}
              className={`w-full px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 ${
                activeView === 'documents' ? 'bg-green-200' : ''
              }`}
            >
              <FileText size={16} />
              <span>All Documents</span>
            </button>

            {/* 2. Folder View (Parent Category) */}
            <button
              onClick={() => handleViewChange('folders')}
              className={`w-full px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 ${
                activeView === 'folders' ? 'bg-green-200' : ''
              }`}
            >
              <Folder size={16} />
              <span>Folder View</span>
            </button>
            
            {/* 3. Recent (Parent Category) */}
            <button
              onClick={() => handleViewChange('recent')}
              className={`w-full px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 ${
                activeView === 'recent' ? 'bg-green-200' : ''
              }`}
            >
              <Clock size={16} />
              <span>Recent</span>
            </button>
            
            {/* 4. Starred (Parent Category) */}
            <button
              onClick={() => handleViewChange('starred')}
              className={`w-full px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 ${
                activeView === 'starred' ? 'bg-green-200' : ''
              }`}
            >
              <Star size={16} />
              <span>Starred</span>
            </button>

            {/* 5. Ask Knowledge Base (Standard Button) */}
            <button
              onClick={() => handleViewChange('chat')}
              className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <MessageSquare size={16} />
              <span>Ask Knowledge Base</span>
            </button>

            {/* 6. Search (Utility) */}
            <button
              onClick={() => handleViewChange('search')}
              className={`w-full px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 ${
                activeView === 'search' ? 'bg-green-200' : ''
              }`}
            >
              <Search size={16} />
              <span>Search</span>
            </button>
          </nav>
        </div>

        {/* Folder Tree */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Folders</h3>
            <button
              onClick={loadFolders}
              className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
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
              <p className="text-sm mb-4">No folders yet</p>
              <div className="flex justify-center">
                <button
                  onClick={() => setNewFolderModalOpen(true)}
                  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                >
                  Create your first folder
                </button>
              </div>
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
              className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
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
                      className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
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
                          className={`px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 ${doc.starred ? 'text-yellow-500' : ''}`}
                        >
                          <Star size={14} fill={doc.starred ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc)}
                          className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
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
                    className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
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
                    className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
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
                          className={`px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 ${doc.starred ? 'text-yellow-500' : ''}`}
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
                    {chatMessages.map((message, index) => (
                      <div key={message.id || index} className={`flex ${message.message_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          message.message_type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white border border-gray-200 shadow-sm'
                        }`}>
                          <div className="flex items-start space-x-2">
                            {message.message_type === 'assistant' && (
                              <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <MessageSquare size={12} className="text-white" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                              {message.related_documents && message.related_documents.length > 0 && (
                                <div className="mt-3 pt-2 border-t border-gray-100">
                                  <p className="text-xs text-gray-600 mb-2 font-medium">📄 Related documents:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {message.related_documents.map((doc, docIndex) => (
                                      <button
                                        key={docIndex} 
                                        onClick={() => {
                                          setSearchQuery(doc);
                                          handleSearch();
                                        }}
                                        className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                                        title={`Search for: ${doc}`}
                                      >
                                        {doc}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <p className="text-xs opacity-70 mt-2 flex items-center space-x-1">
                                <Clock size={10} />
                                <span>{message.created_at ? new Date(message.created_at).toLocaleTimeString() : 'Now'}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isAITyping && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
                          <div className="flex items-center space-x-2">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <MessageSquare size={12} className="text-white" />
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                            <span className="text-xs text-gray-500">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
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
                  disabled={!chatQuery.trim() || isAITyping}
                  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {isAITyping ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Thinking...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare size={16} />
                      <span>Ask</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick Questions */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">💡 Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'What documents do I have?',
                    'Show me recent uploads', 
                    'Find technical documentation',
                    'What wireframes are available?',
                    'Summarize my project documents',
                    'What are the key requirements?'
                  ].map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setChatQuery(question)}
                      disabled={isAITyping}
                      className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Capabilities Notice */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <MessageSquare size={10} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-1">Enhanced AI Assistant</p>
                    <p className="text-xs text-blue-700">
                      This AI assistant has access to your entire platform including notes, calendar, priorities, meetings, and stakeholder data. Ask complex questions about your projects!
                    </p>
                  </div>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Documents</h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
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
                className="flex-1 px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
              >
                Cancel
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Folder</h3>
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
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
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
                className="flex-1 px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderForm.name.trim()}
                className="flex-1 px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
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