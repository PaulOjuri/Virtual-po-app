import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Mail, Plus, Search, Filter, Star, Send, Archive, Trash2, Edit, Eye, Clock, User, Tag, MessageSquare, TrendingUp, FileText, Zap, AlertCircle, CheckCircle, X, Calendar } from 'lucide-react';
import { EmailService, Email } from './services/emailService';

const EmailIntelligence: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'inbox' | 'compose' | 'templates' | 'analytics' | 'automation'>('inbox');
  const [emails, setEmails] = useState<Email[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read' | 'replied' | 'archived'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [filterSentiment, setFilterSentiment] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');

  // Modal states
  const [showManualEmailModal, setShowManualEmailModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingEmail, setEditingEmail] = useState<Email | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Manual email form state
  const [emailForm, setEmailForm] = useState({
    from_address: '',
    from_name: '',
    to_address: '',
    subject: '',
    content: '',
    priority: 'medium' as Email['priority'],
    tags: [] as string[],
    sentiment: 'neutral' as Email['sentiment'],
    status: 'unread' as Email['status']
  });

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject_template: '',
    content_template: '',
    category: '',
    tags: [] as string[]
  });

  useEffect(() => {
    if (user) {
      loadEmails();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [emails, searchQuery, filterStatus, filterPriority, filterSentiment]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      const emailsData = await EmailService.getAllEmails();
      setEmails(emailsData);
    } catch (err) {
      console.error('Error loading emails:', err);
      setError('Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = emails;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(email => 
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.from_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.from_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(email => email.status === filterStatus);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(email => email.priority === filterPriority);
    }

    // Sentiment filter
    if (filterSentiment !== 'all') {
      filtered = filtered.filter(email => email.sentiment === filterSentiment);
    }

    setFilteredEmails(filtered);
  };

  const handleCreateManualEmail = async () => {
    if (!emailForm.from_address.trim() || !emailForm.subject.trim()) {
      setError('Please fill in required fields (From Address and Subject)');
      return;
    }

    try {
      setError(null);
      const newEmail: Omit<Email, 'id' | 'created_at' | 'updated_at'> = {
        ...emailForm,
        preview: emailForm.content.substring(0, 300),
        timestamp: new Date().toISOString(),
        sentiment_score: emailForm.sentiment === 'positive' ? 0.8 : emailForm.sentiment === 'negative' ? -0.6 : 0.1,
        starred: false,
        attachments: [],
        tags: emailForm.tags.filter(tag => tag.trim())
      };

      const createdEmail = await EmailService.createEmail(newEmail);
      setEmails(prev => [createdEmail, ...prev]);
      resetEmailForm();
      setShowManualEmailModal(false);
      console.log('Manual email created successfully');
    } catch (err) {
      console.error('Error creating email:', err);
      setError(err instanceof Error ? err.message : 'Failed to create email');
    }
  };

  const handleUpdateEmailStatus = async (email: Email, newStatus: Email['status']) => {
    try {
      setError(null);
      const updatedEmail = await EmailService.updateEmail(email.id!, { status: newStatus });
      setEmails(prev => prev.map(e => e.id === email.id ? updatedEmail : e));
    } catch (err) {
      console.error('Error updating email status:', err);
      setError('Failed to update email status');
    }
  };

  const handleToggleStarred = async (email: Email) => {
    try {
      setError(null);
      const updatedEmail = await EmailService.updateEmail(email.id!, { starred: !email.starred });
      setEmails(prev => prev.map(e => e.id === email.id ? updatedEmail : e));
    } catch (err) {
      console.error('Error toggling star:', err);
      setError('Failed to update email');
    }
  };

  const handleDeleteEmail = async (email: Email) => {
    if (!window.confirm(`Are you sure you want to delete this email: "${email.subject}"?`)) {
      return;
    }

    try {
      setError(null);
      await EmailService.deleteEmail(email.id!);
      setEmails(prev => prev.filter(e => e.id !== email.id));
      console.log('Email deleted successfully');
    } catch (err) {
      console.error('Error deleting email:', err);
      setError('Failed to delete email');
    }
  };

  const resetEmailForm = () => {
    setEmailForm({
      from_address: '',
      from_name: '',
      to_address: '',
      subject: '',
      content: '',
      priority: 'medium',
      tags: [],
      sentiment: 'neutral',
      status: 'unread'
    });
    setEditingEmail(null);
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      subject_template: '',
      content_template: '',
      category: '',
      tags: []
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😟';
      case 'neutral': return '😐';
      default: return '😐';
    }
  };

  // Analytics calculations
  const analytics = {
    total: emails.length,
    unread: emails.filter(e => e.status === 'unread').length,
    highPriority: emails.filter(e => e.priority === 'high').length,
    positivesentiment: emails.filter(e => e.sentiment === 'positive').length,
    negativesentiment: emails.filter(e => e.sentiment === 'negative').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading emails...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Email Intelligence</h2>
          <p className="text-slate-600 mt-1">AI-powered email management and insights</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowManualEmailModal(true)}
            className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Email</span>
          </button>
          <button
            onClick={() => setActiveView('compose')}
            className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
          >
            <Send size={20} />
            <span>Compose</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-red-500" size={20} />
              <p className="text-red-800">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="flex gap-4 w-full">
        <button 
          onClick={() => {
            setActiveView('inbox');
            setFilterStatus('all');
            document.getElementById('email-list')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 flex-1"
        >
          <div className="flex flex-col items-center justify-center text-center w-full">
            <Mail className="text-emerald-600 mb-1" size={18} />
            <p className="text-sm text-gray-600 leading-tight">Total</p>
            <p className="text-base font-bold text-gray-900">{analytics.total}</p>
          </div>
        </button>
        <button 
          onClick={() => {
            setActiveView('inbox');
            setFilterStatus('unread');
            document.getElementById('email-list')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 flex-1"
        >
          <div className="flex flex-col items-center justify-center text-center w-full">
            <MessageSquare className="text-emerald-600 mb-1" size={18} />
            <p className="text-sm text-gray-600 leading-tight">Unread</p>
            <p className="text-base font-bold text-emerald-600">{analytics.unread}</p>
          </div>
        </button>
        <button 
          onClick={() => {
            setActiveView('inbox');
            setFilterPriority('high');
            document.getElementById('email-list')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 flex-1"
        >
          <div className="flex flex-col items-center justify-center text-center w-full">
            <AlertCircle className="text-red-600 mb-1" size={18} />
            <p className="text-sm text-gray-600 leading-tight">High</p>
            <p className="text-base font-bold text-red-600">{analytics.highPriority}</p>
          </div>
        </button>
        <button 
          onClick={() => {
            setActiveView('inbox');
            setFilterSentiment('positive');
            document.getElementById('email-list')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 flex-1"
        >
          <div className="flex flex-col items-center justify-center text-center w-full">
            <TrendingUp className="text-green-600 mb-1" size={18} />
            <p className="text-sm text-gray-600 leading-tight">Positive</p>
            <p className="text-base font-bold text-green-600">{analytics.positivesentiment}</p>
          </div>
        </button>
        <button 
          onClick={() => {
            setActiveView('inbox');
            setFilterSentiment('negative');
            document.getElementById('email-list')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 flex-1"
        >
          <div className="flex flex-col items-center justify-center text-center w-full">
            <TrendingUp className="text-orange-600 rotate-180 mb-1" size={18} />
            <p className="text-sm text-gray-600 leading-tight">Negative</p>
            <p className="text-base font-bold text-orange-600">{analytics.negativesentiment}</p>
          </div>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'inbox', label: 'Inbox', icon: Mail },
            { id: 'compose', label: 'Compose', icon: Send },
            { id: 'templates', label: 'Templates', icon: FileText },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'automation', label: 'Automation', icon: Zap }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 ${
                  activeView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.id === 'inbox' && analytics.unread > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {analytics.unread}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-slate-200">
        {activeView === 'inbox' && (
          <div className="p-6">
            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <Search size={16} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search emails..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                >
                  <Filter size={16} />
                  <span>Filters</span>
                </button>
              </div>

              {showFilters && (
                <div className="flex flex-wrap items-center gap-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>

                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as any)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>

                  <select
                    value={filterSentiment}
                    onChange={(e) => setFilterSentiment(e.target.value as any)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Sentiment</option>
                    <option value="positive">Positive</option>
                    <option value="neutral">Neutral</option>
                    <option value="negative">Negative</option>
                  </select>

                  <button
                    onClick={loadEmails}
                    className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>

            {/* Emails List */}
            <div id="email-list" className="space-y-3">
              {filteredEmails.map(email => (
                <div key={email.id} className="border border-gray-200 rounded-lg overflow-hidden hover:bg-gray-50 transition-colors">
                  {/* Email Header */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {email.from_name ? email.from_name.charAt(0).toUpperCase() : email.from_address.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{email.subject}</h3>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Clock size={14} />
                            <span>{new Date(email.timestamp).toLocaleDateString()} {new Date(email.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(email.status)}`}>
                          {email.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(email.priority)}`}>
                          {email.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(email.sentiment)}`}>
                          {getSentimentIcon(email.sentiment)} {email.sentiment}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Email Details */}
                  <div className="px-4 py-3">
                    {/* From/To Section */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 w-12 flex-shrink-0">From:</span>
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">
                            {email.from_name || email.from_address}
                          </span>
                          {email.from_name && (
                            <span className="text-gray-500 ml-2">&lt;{email.from_address}&gt;</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 w-12 flex-shrink-0">To:</span>
                        <div className="flex-1">
                          <span className="text-gray-900">{email.to_address}</span>
                        </div>
                      </div>
                      
                      {/* Placeholder for CC - ready for future implementation */}
                      {/* <div className="flex items-start">
                        <span className="font-medium text-gray-700 w-12 flex-shrink-0">CC:</span>
                        <div className="flex-1">
                          <span className="text-gray-900">cc_address_placeholder</span>
                        </div>
                      </div> */}
                    </div>

                    {/* Message Content */}
                    <div className="mb-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        {email.preview && (
                          <p className="text-gray-700 text-sm leading-relaxed">{email.preview}</p>
                        )}
                        {email.content && !email.preview && (
                          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{email.content}</p>
                        )}
                        {!email.preview && !email.content && (
                          <p className="text-gray-500 text-sm italic">No message content available</p>
                        )}
                      </div>
                    </div>

                    {/* Tags Section */}
                    {email.tags && email.tags.length > 0 && (
                      <div className="mb-4">
                        <span className="font-medium text-gray-700 text-sm">Tags:</span>
                        <div className="flex items-center space-x-1 mt-1">
                          {email.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleStarred(email)}
                          className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                        >
                          <Star size={16} fill={email.starred ? 'currentColor' : 'none'} />
                          <span>{email.starred ? 'Starred' : 'Star'}</span>
                        </button>
                        
                        <button
                          onClick={() => handleDeleteEmail(email)}
                          className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                          title="Delete email"
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </div>
                      
                      <select
                        value={email.status}
                        onChange={(e) => handleUpdateEmailStatus(email, e.target.value as Email['status'])}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              {filteredEmails.length === 0 && (
                <div className="text-center py-12">
                  <Mail className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
                  <p className="text-gray-600 mb-4">
                    {emails.length === 0 
                      ? "Start by adding your first email manually or connecting your email account"
                      : "Try adjusting your search criteria or filters"}
                  </p>
                  {emails.length === 0 && (
                    <button
  onClick={(e) => {
    console.log('🟢 Add Email button clicked!');
    console.log('🟢 Current showManualEmailModal:', showManualEmailModal);
    console.log('🟢 Event object:', e);
    setShowManualEmailModal(true);
    console.log('🟢 Called setShowManualEmailModal(true)');
  }}
  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
>
  <Plus size={20} />
  <span>Add Email</span>
</button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {(activeView === 'compose' || activeView === 'templates' || activeView === 'analytics' || activeView === 'automation') && (
          <div className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Feature Coming Soon</h3>
            <p className="text-gray-600">This section will be enhanced in the next development phase.</p>
          </div>
        )}
      </div>

      {/* Manual Email Modal */}
      {showManualEmailModal && (
        <div 
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" 
    style={{zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0}}
  >
<div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{zIndex: 10000}}>            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingEmail ? 'Edit Email' : 'Add Email Manually'}
                </h2>
                <button
                  onClick={() => {
                    setShowManualEmailModal(false);
                    resetEmailForm();
                  }}
                  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Email Address *
                  </label>
                  <input
                    type="email"
                    value={emailForm.from_address}
                    onChange={(e) => setEmailForm({...emailForm, from_address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="sender@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Name
                  </label>
                  <input
                    type="text"
                    value={emailForm.from_name}
                    onChange={(e) => setEmailForm({...emailForm, from_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sender Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Email Address
                </label>
                <input
                  type="email"
                  value={emailForm.to_address}
                  onChange={(e) => setEmailForm({...emailForm, to_address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="recipient@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Email subject"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Content
                </label>
                <textarea
                  value={emailForm.content}
                  onChange={(e) => setEmailForm({...emailForm, content: e.target.value})}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter the email content here..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={emailForm.priority}
                    onChange={(e) => setEmailForm({...emailForm, priority: e.target.value as Email['priority']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sentiment
                  </label>
                  <select
                    value={emailForm.sentiment}
                    onChange={(e) => setEmailForm({...emailForm, sentiment: e.target.value as Email['sentiment']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="positive">😊 Positive</option>
                    <option value="neutral">😐 Neutral</option>
                    <option value="negative">😟 Negative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={emailForm.status}
                    onChange={(e) => setEmailForm({...emailForm, status: e.target.value as Email['status']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={emailForm.tags.join(', ')}
                  onChange={(e) => setEmailForm({
                    ...emailForm, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="urgent, client, feedback, etc."
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowManualEmailModal(false);
                  resetEmailForm();
                }}
                className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateManualEmail}
                disabled={!emailForm.from_address.trim() || !emailForm.subject.trim()}
                className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingEmail ? 'Update Email' : 'Add Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailIntelligence;