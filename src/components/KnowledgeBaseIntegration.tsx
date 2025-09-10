import React, { useState, useEffect } from 'react';
import { 
  Search, Link, BookOpen, FileText, Tag, Star, Clock, 
  Plus, X, ChevronRight, ExternalLink, Copy, Share2,
  Filter, SortAsc, Eye, Edit, Archive, RefreshCw
} from 'lucide-react';

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  isBookmarked: boolean;
  relatedArticles: string[];
  linkedNotes: string[];
  linkedEvents: string[];
  searchScore?: number;
}

interface KnowledgeBaseIntegrationProps {
  noteId?: string;
  eventId?: string;
  onLinkArticle?: (articleId: string) => void;
  onUnlinkArticle?: (articleId: string) => void;
  linkedArticles?: string[];
  searchContext?: string; // Content to search against for suggestions
}

const KnowledgeBaseIntegration: React.FC<KnowledgeBaseIntegrationProps> = ({
  noteId,
  eventId,
  onLinkArticle,
  onUnlinkArticle,
  linkedArticles = [],
  searchContext = ''
}) => {
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [suggestedArticles, setSuggestedArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'title' | 'views'>('relevance');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());

  const categories = [
    'All',
    'Sprint Planning',
    'Product Management',
    'Scrum Events',
    'PI Planning',
    'Requirements',
    'Best Practices',
    'Templates',
    'Troubleshooting'
  ];

  useEffect(() => {
    loadArticles();
    if (searchContext) {
      loadSuggestedArticles();
    }
  }, [searchContext]);

  useEffect(() => {
    filterAndSortArticles();
  }, [searchTerm, selectedCategory, sortBy, articles]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      // In a real app, this would call the knowledge base service
      const mockArticles = getMockArticles();
      setArticles(mockArticles);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestedArticles = async () => {
    if (!searchContext) return;
    
    try {
      // In a real app, this would call an AI service to find relevant articles
      const suggested = getMockArticles()
        .filter(article => 
          searchContext.toLowerCase().includes(article.category.toLowerCase()) ||
          article.tags.some(tag => searchContext.toLowerCase().includes(tag.toLowerCase())) ||
          article.title.toLowerCase().includes(searchContext.split(' ').find(word => word.length > 4) || '')
        )
        .slice(0, 5);
      
      setSuggestedArticles(suggested);
    } catch (error) {
      console.error('Error loading suggested articles:', error);
    }
  };

  const filterAndSortArticles = () => {
    let filtered = articles;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article =>
        article.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'views':
          return b.viewCount - a.viewCount;
        case 'relevance':
        default:
          // If there's a search term, use search score
          if (searchTerm) {
            const aScore = calculateRelevanceScore(a, searchTerm);
            const bScore = calculateRelevanceScore(b, searchTerm);
            return bScore - aScore;
          }
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return filtered;
  };

  const calculateRelevanceScore = (article: KnowledgeBaseArticle, searchTerm: string): number => {
    let score = 0;
    const term = searchTerm.toLowerCase();
    
    // Title match (highest weight)
    if (article.title.toLowerCase().includes(term)) score += 10;
    
    // Summary match (medium weight)
    if (article.summary.toLowerCase().includes(term)) score += 5;
    
    // Tag match (medium weight)
    if (article.tags.some(tag => tag.toLowerCase().includes(term))) score += 5;
    
    // Category match (low weight)
    if (article.category.toLowerCase().includes(term)) score += 2;
    
    return score;
  };

  const handleLinkArticle = (articleId: string) => {
    if (onLinkArticle) {
      onLinkArticle(articleId);
    }
  };

  const handleUnlinkArticle = (articleId: string) => {
    if (onUnlinkArticle) {
      onUnlinkArticle(articleId);
    }
  };

  const toggleArticleExpansion = (articleId: string) => {
    const newExpanded = new Set(expandedArticles);
    if (newExpanded.has(articleId)) {
      newExpanded.delete(articleId);
    } else {
      newExpanded.add(articleId);
    }
    setExpandedArticles(newExpanded);
  };

  const copyArticleLink = (articleId: string) => {
    const url = `${window.location.origin}/knowledge-base/${articleId}`;
    navigator.clipboard.writeText(url);
    // You could show a toast notification here
  };

  const filteredArticles = filterAndSortArticles();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Knowledge Base</h3>
        </div>
        <button
          onClick={loadArticles}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Suggested Articles */}
      {showSuggestions && suggestedArticles.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-blue-900 flex items-center">
              <Star size={16} className="mr-2 text-blue-600" />
              Suggested Articles
            </h4>
            <button
              onClick={() => setShowSuggestions(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X size={16} />
            </button>
          </div>
          <div className="space-y-2">
            {suggestedArticles.map(article => (
              <div
                key={article.id}
                className="flex items-center justify-between p-2 bg-white rounded border border-blue-100"
              >
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-gray-900">{article.title}</h5>
                  <p className="text-xs text-gray-600">{article.category}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleArticleExpansion(article.id)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <Eye size={14} />
                  </button>
                  {!linkedArticles.includes(article.id) && (
                    <button
                      onClick={() => handleLinkArticle(article.id)}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      Link
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {categories.map(category => (
            <option key={category} value={category.toLowerCase()}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="relevance">Relevance</option>
          <option value="date">Date Modified</option>
          <option value="title">Title</option>
          <option value="views">Views</option>
        </select>
      </div>

      {/* Linked Articles */}
      {linkedArticles.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-900 mb-3 flex items-center">
            <Link size={16} className="mr-2 text-green-600" />
            Linked Articles ({linkedArticles.length})
          </h4>
          <div className="space-y-2">
            {linkedArticles.map(articleId => {
              const article = articles.find(a => a.id === articleId);
              if (!article) return null;
              
              return (
                <div
                  key={articleId}
                  className="flex items-center justify-between p-2 bg-white rounded border border-green-100"
                >
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900">{article.title}</h5>
                    <p className="text-xs text-gray-600">{article.category}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleArticleExpansion(article.id)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => copyArticleLink(article.id)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => handleUnlinkArticle(article.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Articles List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Loading articles...</span>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpen size={32} className="mx-auto mb-2 text-gray-300" />
            <p>No articles found</p>
            {searchTerm && (
              <p className="text-sm">Try adjusting your search or filters</p>
            )}
          </div>
        ) : (
          filteredArticles.map(article => (
            <div
              key={article.id}
              className={`border rounded-lg p-4 transition-colors ${
                linkedArticles.includes(article.id)
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{article.title}</h4>
                    {article.isBookmarked && (
                      <Star size={14} className="text-yellow-500 fill-current" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{article.summary}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Tag size={12} className="mr-1" />
                      {article.category}
                    </span>
                    <span className="flex items-center">
                      <Eye size={12} className="mr-1" />
                      {article.viewCount} views
                    </span>
                    <span className="flex items-center">
                      <Clock size={12} className="mr-1" />
                      {new Date(article.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {article.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Expanded Content */}
                  {expandedArticles.has(article.id) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="prose prose-sm max-w-none text-gray-700">
                        {article.content.substring(0, 500)}...
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <button className="text-blue-600 hover:text-blue-700 text-xs flex items-center">
                          <ExternalLink size={12} className="mr-1" />
                          View Full Article
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => toggleArticleExpansion(article.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      expandedArticles.has(article.id)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronRight 
                      size={16} 
                      className={`transition-transform ${
                        expandedArticles.has(article.id) ? 'rotate-90' : ''
                      }`} 
                    />
                  </button>
                  
                  {linkedArticles.includes(article.id) ? (
                    <button
                      onClick={() => handleUnlinkArticle(article.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
                    >
                      Unlink
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLinkArticle(article.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      Link
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Mock data for development
const getMockArticles = (): KnowledgeBaseArticle[] => [
  {
    id: 'kb-1',
    title: 'Sprint Planning Best Practices',
    content: 'Sprint Planning is a collaborative event where the team defines what can be delivered in the upcoming sprint and how that work will be achieved...',
    summary: 'Comprehensive guide to effective sprint planning, including preparation, facilitation, and common pitfalls to avoid.',
    category: 'Sprint Planning',
    tags: ['sprint', 'planning', 'scrum', 'agile', 'best-practices'],
    author: 'John Doe',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    viewCount: 245,
    isBookmarked: true,
    relatedArticles: ['kb-2', 'kb-3'],
    linkedNotes: ['note-1'],
    linkedEvents: ['event-1']
  },
  {
    id: 'kb-2',
    title: 'PI Planning Facilitation Guide',
    content: 'Program Increment (PI) Planning is a cadence-based, face-to-face event that serves as the heartbeat of the Agile Release Train (ART)...',
    summary: 'Step-by-step guide for facilitating successful PI Planning events, including preparation, agenda, and follow-up activities.',
    category: 'PI Planning',
    tags: ['pi-planning', 'safe', 'facilitation', 'art', 'program'],
    author: 'Jane Smith',
    createdAt: '2024-01-08T09:00:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    viewCount: 189,
    isBookmarked: false,
    relatedArticles: ['kb-1', 'kb-4'],
    linkedNotes: ['note-3'],
    linkedEvents: ['event-3']
  },
  {
    id: 'kb-3',
    title: 'User Story Writing Template',
    content: 'A well-written user story captures the "who", "what", and "why" of a requirement in a simple, concise way...',
    summary: 'Template and examples for writing effective user stories that drive valuable software development.',
    category: 'Requirements',
    tags: ['user-stories', 'requirements', 'templates', 'product-owner'],
    author: 'Bob Wilson',
    createdAt: '2024-01-05T11:30:00Z',
    updatedAt: '2024-01-14T10:15:00Z',
    viewCount: 312,
    isBookmarked: true,
    relatedArticles: ['kb-1', 'kb-5'],
    linkedNotes: [],
    linkedEvents: []
  },
  {
    id: 'kb-4',
    title: 'Scrum Ceremonies Quick Reference',
    content: 'Scrum defines several ceremonies (events) that provide structure to the development process...',
    summary: 'Quick reference guide for all Scrum ceremonies including purpose, participants, duration, and outcomes.',
    category: 'Scrum Events',
    tags: ['scrum', 'ceremonies', 'events', 'quick-reference'],
    author: 'Alice Johnson',
    createdAt: '2024-01-03T08:00:00Z',
    updatedAt: '2024-01-11T13:20:00Z',
    viewCount: 156,
    isBookmarked: false,
    relatedArticles: ['kb-1', 'kb-2'],
    linkedNotes: [],
    linkedEvents: ['event-2', 'event-4']
  },
  {
    id: 'kb-5',
    title: 'Definition of Done Checklist',
    content: 'The Definition of Done (DoD) is a shared understanding of what it means for work to be complete...',
    summary: 'Comprehensive checklist for creating and maintaining a robust Definition of Done that ensures quality.',
    category: 'Best Practices',
    tags: ['definition-of-done', 'quality', 'checklist', 'team'],
    author: 'Chris Lee',
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-09T15:30:00Z',
    viewCount: 98,
    isBookmarked: false,
    relatedArticles: ['kb-3', 'kb-4'],
    linkedNotes: ['note-1'],
    linkedEvents: []
  }
];

export default KnowledgeBaseIntegration;