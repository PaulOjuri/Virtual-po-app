import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Minimize2, 
  Maximize2, 
  Brain, 
  Clock, 
  Sparkles,
  Bot,
  User,
  Search,
  FileText,
  Calendar,
  Users,
  Target,
  Mail,
  BookOpen,
  Copy,
  ExternalLink,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { aiChatService, ChatMessage, ChatSession, DataSource } from '../services/aiChatService';
import { WebScrapingService } from '../services/webScrapingService';
import { useAuth } from '../contexts/AuthContext';

interface AIChatProps {
  currentContext?: string;
  contextData?: any;
  position?: 'bottom-right' | 'bottom-left';
  minimized?: boolean;
  onMinimize?: (minimized: boolean) => void;
  initialContext?: {
    segment?: string;
    entityId?: string;
    entityType?: string;
  };
}

const AIChat: React.FC<AIChatProps> = ({ 
  currentContext = 'general', 
  contextData,
  position = 'bottom-right',
  minimized = true,
  onMinimize,
  initialContext
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(minimized);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [showSources, setShowSources] = useState<{[key: string]: boolean}>({});
  const [isWebSearching, setIsWebSearching] = useState(false);
  const [showWebSearchResults, setShowWebSearchResults] = useState(false);
  const [webSearchResults, setWebSearchResults] = useState<any[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      initializeChat();
    }
  }, [user, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      const userSessions = await aiChatService.getChatSessions(user!.id);
      setSessions(userSessions);
      
      if (userSessions.length > 0 && userSessions[0].messages) {
        setCurrentSession(userSessions[0]);
        setMessages(userSessions[0].messages || []);
      } else {
        const newSession = await aiChatService.createChatSession(user!.id);
        setCurrentSession(newSession);
        setSessions([newSession]);
        
        // Add welcome message
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          role: 'assistant',
          content: `Hello! I'm your AI assistant for the Virtual Product Owner platform. I have access to all your data including:

📝 **Notes & Documents** - Personal notes, knowledge base articles
📅 **Calendar & Meetings** - Scheduled events, meeting notes, action items  
🎯 **Priorities & Tasks** - Sprint items, backlog priorities
👥 **Stakeholders** - Contact information, communication history
📧 **Email Intelligence** - Important communications and trends
📊 **Market Intelligence** - Industry trends and competitive analysis

Ask me anything about your data! Try these examples:
• "What meetings do I have this week?"
• "Show me my high priority tasks"
• "Summarize recent stakeholder feedback"
• "Find notes about user authentication"

How can I help you today?`,
          timestamp: new Date().toISOString(),
          context: initialContext
        };
        
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (onMinimize) {
      onMinimize(!isOpen);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (onMinimize) {
      onMinimize(!isMinimized);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentSession || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
      context: initialContext
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Add user message to session
      await aiChatService.addMessageToSession(currentSession.id, userMessage);
      
      // Generate AI response
      const aiResponse = await aiChatService.generateResponse(
        inputMessage, 
        currentSession.id, 
        initialContext
      );
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const createNewSession = async () => {
    try {
      const newSession = await aiChatService.createChatSession(
        user!.id, 
        `Chat ${sessions.length + 1}`
      );
      setCurrentSession(newSession);
      setSessions(prev => [newSession, ...prev]);
      setMessages([]);
      setShowSessions(false);
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  const switchSession = (session: ChatSession) => {
    setCurrentSession(session);
    setMessages(session.messages || []);
    setShowSessions(false);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const toggleSources = (messageId: string) => {
    setShowSources(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const handleWebSearch = async () => {
    if (!inputMessage.trim() || isWebSearching) return;

    setIsWebSearching(true);
    try {
      const results = await WebScrapingService.searchWeb(inputMessage, { maxResults: 5 });
      setWebSearchResults(results);
      setShowWebSearchResults(true);
      
      // Add search results as a system message
      const searchMessage: ChatMessage = {
        id: `search_${Date.now()}`,
        role: 'assistant',
        content: `I found ${results.length} web results for "${inputMessage}":\n\n${results.map((result, i) => `${i + 1}. **${result.title}**\n   ${result.summary || result.content.substring(0, 150)}...\n   URL: ${result.url || 'N/A'}`).join('\n\n')}`,
        timestamp: new Date().toISOString(),
        sources: results.map(result => ({
          type: 'web_result',
          id: result.url || `web_${Date.now()}`,
          title: result.title || 'Web Result',
          relevanceScore: 0.8,
          snippet: result.summary || result.content.substring(0, 150),
          url: result.url
        }))
      };
      
      setMessages(prev => [...prev, searchMessage]);
    } catch (error) {
      console.error('Error performing web search:', error);
    } finally {
      setIsWebSearching(false);
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'note': return <FileText size={14} />;
      case 'meeting': return <Calendar size={14} />;
      case 'priority': return <Target size={14} />;
      case 'stakeholder': return <Users size={14} />;
      case 'email': return <Mail size={14} />;
      case 'knowledge_base': return <BookOpen size={14} />;
      case 'calendar': return <Calendar size={14} />;
      case 'web_result': return <ExternalLink size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const positionClasses = position === 'bottom-right' 
    ? 'bottom-4 right-4' 
    : 'bottom-4 left-4';

  if (!isOpen) {
    return (
      <div className={`fixed ${positionClasses} z-50`}>
        <button
          onClick={handleToggle}
          className="w-14 h-14 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center"
        >
          <Brain size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses} z-50`}>
      <div className="w-96 h-[500px] bg-white border border-gray-200 rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-green-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center">
              <Sparkles className="text-white" size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              <p className="text-xs text-gray-500">Knowledge Base Connected</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSessions(!showSessions)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Chat Sessions"
            >
              <MessageSquare size={16} />
            </button>
            
            <button
              onClick={createNewSession}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="New Chat"
            >
              <RefreshCw size={16} />
            </button>
            
            <button
              onClick={handleMinimize}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Minimize2 size={16} />
            </button>
            
            <button
              onClick={handleToggle}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Sessions Dropdown */}
        {showSessions && (
          <div className="border-b border-gray-200 bg-gray-50 max-h-32 overflow-y-auto">
            <div className="p-2 space-y-1">
              <button
                onClick={createNewSession}
                className="w-full text-left px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center space-x-2"
              >
                <MessageSquare size={14} />
                <span>New Chat</span>
              </button>
              
              {sessions.slice(0, 3).map((session) => (
                <button
                  key={session.id}
                  onClick={() => switchSession(session)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    currentSession?.id === session.id 
                      ? 'bg-emerald-100 text-emerald-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium truncate">{session.title}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {/* Message Avatar & Content */}
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {message.role === 'user' ? (
                      <User size={14} className="text-emerald-100" />
                    ) : (
                      <Bot size={14} className="text-emerald-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    {/* Message Text */}
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    
                    {/* Metadata & Actions */}
                    <div className={`flex items-center justify-between mt-2 text-xs ${
                      message.role === 'user' ? 'text-emerald-100' : 'text-gray-500'
                    }`}>
                      <span>{formatTimestamp(message.timestamp)}</span>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => copyMessage(message.content)}
                          className={`p-1 rounded hover:bg-black/10 transition-colors ${
                            message.role === 'user' ? 'text-emerald-100' : 'text-gray-400'
                          }`}
                          title="Copy"
                        >
                          <Copy size={10} />
                        </button>
                        
                        {message.sources && message.sources.length > 0 && (
                          <button
                            onClick={() => toggleSources(message.id)}
                            className={`p-1 rounded hover:bg-black/10 transition-colors flex items-center space-x-1 ${
                              message.role === 'user' ? 'text-emerald-100' : 'text-gray-400'
                            }`}
                            title="Sources"
                          >
                            <Search size={10} />
                            <span>{message.sources.length}</span>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Sources */}
                    {message.sources && showSources[message.id] && (
                      <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                        <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Sources
                        </div>
                        {message.sources.slice(0, 3).map((source, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-xs bg-white p-2 rounded border">
                            <div className="text-gray-500">
                              {getSourceIcon(source.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {source.title}
                              </div>
                              {source.snippet && (
                                <div className="text-gray-500 truncate text-xs">
                                  {source.snippet}
                                </div>
                              )}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {Math.round(source.relevanceScore * 10)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg p-3 bg-gray-100">
                <div className="flex items-center space-x-2">
                  <Bot size={14} className="text-emerald-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-3 py-2 border-t border-gray-100">
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => setInputMessage("What meetings do I have this week?")}
              className="flex-shrink-0 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              📅 Meetings
            </button>
            <button
              onClick={() => setInputMessage("Show me my high priority tasks")}
              className="flex-shrink-0 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              🎯 Priorities
            </button>
            <button
              onClick={() => setInputMessage("Summarize recent notes")}
              className="flex-shrink-0 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              📝 Notes
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-end space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              disabled={isLoading || isWebSearching}
            />
            
            <button
              onClick={handleWebSearch}
              disabled={!inputMessage.trim() || isWebSearching || isLoading}
              className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Search Web"
            >
              {isWebSearching ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || isWebSearching}
              className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;