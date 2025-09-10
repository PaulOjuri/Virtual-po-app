import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { TrendingUp, Users, Eye, Bell, BarChart3, Plus, Search, Filter, 
         Edit2, Trash2, Star, AlertTriangle, CheckCircle, X, Save, Brain,
         ExternalLink, Bookmark, BookmarkCheck, Target, Shield, Zap,
         TrendingDown, Activity, Globe, Building, FileText, Calendar, Download, Loader } from 'lucide-react';
import { MarketIntelligenceService, MarketTrend, CompetitiveIntelligence, MarketNews, 
         MarketResearchReport, MarketAlert, MarketIntelligenceAnalytics } from './services/marketIntelligenceService';
import { WebScrapingService } from './services/webScrapingService';

const MarketIntelligence: React.FC = () => {
  const { user } = useAuth();

  // Core state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [trends, setTrends] = useState<MarketTrend[]>([]);
  const [competitors, setCompetitors] = useState<CompetitiveIntelligence[]>([]);
  const [news, setNews] = useState<MarketNews[]>([]);
  const [reports, setReports] = useState<MarketResearchReport[]>([]);
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [analytics, setAnalytics] = useState<MarketIntelligenceAnalytics | null>(null);
  
  // View state
  const [activeView, setActiveView] = useState<'overview' | 'trends' | 'competitors' | 'news' | 'reports' | 'alerts' | 'analytics'>('overview');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showTrendForm, setShowTrendForm] = useState(false);
  const [showCompetitorForm, setShowCompetitorForm] = useState(false);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  
  // Edit state
  const [editingTrend, setEditingTrend] = useState<MarketTrend | null>(null);
  const [editingCompetitor, setEditingCompetitor] = useState<CompetitiveIntelligence | null>(null);
  const [editingNews, setEditingNews] = useState<MarketNews | null>(null);
  const [editingReport, setEditingReport] = useState<MarketResearchReport | null>(null);
  const [editingAlert, setEditingAlert] = useState<MarketAlert | null>(null);

  // Data scraping states
  const [dataInstructions, setDataInstructions] = useState('');
  const [scrapingQuery, setScrapingQuery] = useState('');
  const [isScrapingData, setIsScrapingData] = useState(false);
  const [scrapingResults, setScrapingResults] = useState<any[]>([]);
  const [showDataScraper, setShowDataScraper] = useState(false);

  // AI Insights state
  const [aiInsights, setAIInsights] = useState<{
    trendAnalysis: string;
    competitiveThreats: string;
    marketOpportunities: string;
    recommendations: string[];
  } | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // Form states
  const [trendForm, setTrendForm] = useState({
    trend_name: '',
    trend_category: 'technology' as MarketTrend['trend_category'],
    description: '',
    impact_level: 'medium' as MarketTrend['impact_level'],
    trend_direction: 'stable' as MarketTrend['trend_direction'],
    confidence_score: 0.5,
    relevance_to_product: 0.5,
    potential_impact_score: 0.5,
    opportunity_threat: 'neutral' as MarketTrend['opportunity_threat'],
    projected_timeline: '',
    tags: [] as string[]
  });

  const [competitorForm, setCompetitorForm] = useState({
    competitor_name: '',
    competitor_type: 'direct' as CompetitiveIntelligence['competitor_type'],
    market_position: 'unknown' as CompetitiveIntelligence['market_position'],
    website_url: '',
    key_products: [] as string[],
    strengths: [] as string[],
    weaknesses: [] as string[],
    threat_level_score: 0.5,
    monitoring_frequency: 'monthly' as CompetitiveIntelligence['monitoring_frequency']
  });

  const [newsForm, setNewsForm] = useState({
    headline: '',
    summary: '',
    source_name: '',
    source_url: '',
    news_category: 'market-analysis',
    relevance_score: 0.5,
    impact_assessment: 'neutral' as MarketNews['impact_assessment'],
    business_implications: ''
  });

  const [reportForm, setReportForm] = useState({
    report_title: '',
    research_firm: '',
    report_type: 'market-size',
    executive_summary: '',
    business_relevance_score: 0.5,
    access_type: 'public' as MarketResearchReport['access_type'],
    report_url: ''
  });

  const [alertForm, setAlertForm] = useState({
    alert_name: '',
    alert_type: 'keyword' as MarketAlert['alert_type'],
    keywords: [] as string[],
    alert_frequency: 'daily' as MarketAlert['alert_frequency'],
    priority_level: 'medium' as MarketAlert['priority_level']
  });

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [trendsData, competitorsData, newsData, reportsData, alertsData, analyticsData] = await Promise.all([
        MarketIntelligenceService.getAllMarketTrends(),
        MarketIntelligenceService.getAllCompetitors(),
        MarketIntelligenceService.getAllMarketNews(),
        MarketIntelligenceService.getAllMarketResearchReports(),
        MarketIntelligenceService.getAllMarketAlerts(),
        MarketIntelligenceService.getMarketIntelligenceAnalytics()
      ]);
      
      setTrends(trendsData);
      setCompetitors(competitorsData);
      setNews(newsData);
      setReports(reportsData);
      setAlerts(alertsData);
      setAnalytics(analyticsData);
      
      console.log('Loaded market intelligence data:', {
        trends: trendsData.length,
        competitors: competitorsData.length,
        news: newsData.length,
        reports: reportsData.length,
        alerts: alertsData.length
      });
    } catch (err) {
      console.error('Error loading market intelligence data:', err);
      setError('Failed to load market intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async () => {
    try {
      setLoadingAI(true);
      const insights = await MarketIntelligenceService.generateMarketInsights();
      setAIInsights(insights);
      setShowAIInsights(true);
    } catch (err) {
      console.error('Error generating AI insights:', err);
      setError('Failed to generate AI insights');
    } finally {
      setLoadingAI(false);
    }
  };

  // Data Scraping Operations
  const handleDataScraping = async () => {
    if (!scrapingQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    try {
      setIsScrapingData(true);
      setError(null);
      
      // Scrape market trends
      const trends = await WebScrapingService.scrapeMarketTrends(scrapingQuery, dataInstructions);
      
      // Scrape news articles
      const newsArticles = await WebScrapingService.scrapeNewsArticles(scrapingQuery, 10);
      
      // Combine results
      const combinedResults = {
        trends: trends,
        news: newsArticles,
        timestamp: new Date().toISOString(),
        query: scrapingQuery,
        instructions: dataInstructions
      };
      
      setScrapingResults([combinedResults]);
      
      console.log('Scraped data:', combinedResults);
    } catch (err) {
      console.error('Error scraping data:', err);
      setError('Failed to scrape market data. Please try again.');
    } finally {
      setIsScrapingData(false);
    }
  };

  const importScrapedData = async (dataType: 'trends' | 'news', items: any[]) => {
    try {
      if (dataType === 'trends') {
        for (const item of items) {
          const trendData: Omit<MarketTrend, 'id' | 'created_at' | 'updated_at'> = {
            trend_name: item.name,
            trend_category: item.category.toLowerCase() as MarketTrend['trend_category'],
            description: item.description,
            trend_direction: item.direction === 'up' ? 'growing' : item.direction === 'down' ? 'declining' : 'stable',
            confidence_score: item.relevance,
            relevance_to_product: item.relevance,
            potential_impact_score: item.relevance,
            opportunity_threat: item.direction === 'up' ? 'opportunity' : 'neutral',
            data_sources: [item.source],
            ai_generated: true
          };
          
          const newTrend = await MarketIntelligenceService.createMarketTrend(trendData);
          setTrends(prev => [newTrend, ...prev]);
        }
      } else if (dataType === 'news') {
        for (const item of items) {
          const newsData: Omit<MarketNews, 'id' | 'created_at' | 'updated_at'> = {
            headline: item.headline,
            summary: item.summary,
            source_name: item.source,
            source_url: item.url,
            published_date: item.publishedDate,
            news_category: item.category,
            relevance_score: 0.8,
            impact_assessment: 'positive',
            ai_generated: true
          };
          
          const newNews = await MarketIntelligenceService.createMarketNews(newsData);
          setNews(prev => [newNews, ...prev]);
        }
      }
      
      // Clear scraping results after import
      setScrapingResults([]);
      setShowDataScraper(false);
      
      // Reload analytics
      loadAllData();
      
    } catch (err) {
      console.error('Error importing scraped data:', err);
      setError('Failed to import scraped data');
    }
  };

  // CRUD Operations for Trends
  const createTrend = async () => {
    if (!trendForm.trend_name) {
      setError('Please enter a trend name');
      return;
    }

    try {
      setError(null);
      const newTrend = await MarketIntelligenceService.createMarketTrend(trendForm);
      setTrends(prev => [newTrend, ...prev]);
      resetTrendForm();
      setShowTrendForm(false);
      console.log('Created trend:', newTrend.id);
    } catch (err) {
      console.error('Error creating trend:', err);
      setError('Failed to create trend');
    }
  };

  const updateTrend = async (trend: MarketTrend) => {
    try {
      setError(null);
      const updatedTrend = await MarketIntelligenceService.updateMarketTrend(trend.id!, trendForm);
      setTrends(prev => prev.map(t => t.id === updatedTrend.id ? updatedTrend : t));
      resetTrendForm();
      setShowTrendForm(false);
      setEditingTrend(null);
    } catch (err) {
      console.error('Error updating trend:', err);
      setError('Failed to update trend');
    }
  };

  const deleteTrend = async (trend: MarketTrend) => {
    if (!window.confirm(`Delete trend "${trend.trend_name}"?`)) return;

    try {
      await MarketIntelligenceService.deleteMarketTrend(trend.id!);
      setTrends(prev => prev.filter(t => t.id !== trend.id));
    } catch (err) {
      console.error('Error deleting trend:', err);
      setError('Failed to delete trend');
    }
  };

  // CRUD Operations for Competitors
  const createCompetitor = async () => {
    if (!competitorForm.competitor_name) {
      setError('Please enter a competitor name');
      return;
    }

    try {
      setError(null);
      const newCompetitor = await MarketIntelligenceService.createCompetitor(competitorForm);
      setCompetitors(prev => [newCompetitor, ...prev]);
      resetCompetitorForm();
      setShowCompetitorForm(false);
    } catch (err) {
      console.error('Error creating competitor:', err);
      setError('Failed to create competitor');
    }
  };

  const updateCompetitor = async (competitor: CompetitiveIntelligence) => {
    try {
      setError(null);
      const updatedCompetitor = await MarketIntelligenceService.updateCompetitor(competitor.id!, competitorForm);
      setCompetitors(prev => prev.map(c => c.id === updatedCompetitor.id ? updatedCompetitor : c));
      resetCompetitorForm();
      setShowCompetitorForm(false);
      setEditingCompetitor(null);
    } catch (err) {
      console.error('Error updating competitor:', err);
      setError('Failed to update competitor');
    }
  };

  const deleteCompetitor = async (competitor: CompetitiveIntelligence) => {
    if (!window.confirm(`Delete competitor "${competitor.competitor_name}"?`)) return;

    try {
      await MarketIntelligenceService.deleteCompetitor(competitor.id!);
      setCompetitors(prev => prev.filter(c => c.id !== competitor.id));
    } catch (err) {
      console.error('Error deleting competitor:', err);
      setError('Failed to delete competitor');
    }
  };

  // News operations
  const toggleBookmark = async (newsItem: MarketNews) => {
    try {
      const updated = await MarketIntelligenceService.toggleBookmark(newsItem.id!, !newsItem.is_bookmarked);
      setNews(prev => prev.map(n => n.id === updated.id ? updated : n));
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      setError('Failed to update bookmark');
    }
  };

  const markAsRead = async (newsItem: MarketNews) => {
    if (newsItem.is_read) return;
    
    try {
      await MarketIntelligenceService.markNewsAsRead(newsItem.id!);
      setNews(prev => prev.map(n => n.id === newsItem.id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  // Form helpers
  const startEditTrend = (trend: MarketTrend) => {
    setEditingTrend(trend);
    setTrendForm({
      trend_name: trend.trend_name,
      trend_category: trend.trend_category,
      description: trend.description || '',
      impact_level: trend.impact_level,
      trend_direction: trend.trend_direction,
      confidence_score: trend.confidence_score,
      relevance_to_product: trend.relevance_to_product,
      potential_impact_score: trend.potential_impact_score,
      opportunity_threat: trend.opportunity_threat,
      projected_timeline: trend.projected_timeline || '',
      tags: trend.tags || []
    });
    setShowTrendForm(true);
  };

  const startEditCompetitor = (competitor: CompetitiveIntelligence) => {
    setEditingCompetitor(competitor);
    setCompetitorForm({
      competitor_name: competitor.competitor_name,
      competitor_type: competitor.competitor_type,
      market_position: competitor.market_position,
      website_url: competitor.website_url || '',
      key_products: competitor.key_products || [],
      strengths: competitor.strengths || [],
      weaknesses: competitor.weaknesses || [],
      threat_level_score: competitor.threat_level_score,
      monitoring_frequency: competitor.monitoring_frequency
    });
    setShowCompetitorForm(true);
  };

  const resetTrendForm = () => {
    setTrendForm({
      trend_name: '',
      trend_category: 'technology',
      description: '',
      impact_level: 'medium',
      trend_direction: 'stable',
      confidence_score: 0.5,
      relevance_to_product: 0.5,
      potential_impact_score: 0.5,
      opportunity_threat: 'neutral',
      projected_timeline: '',
      tags: []
    });
    setEditingTrend(null);
  };

  const resetCompetitorForm = () => {
    setCompetitorForm({
      competitor_name: '',
      competitor_type: 'direct',
      market_position: 'unknown',
      website_url: '',
      key_products: [],
      strengths: [],
      weaknesses: [],
      threat_level_score: 0.5,
      monitoring_frequency: 'monthly'
    });
    setEditingCompetitor(null);
  };

  // Helper functions
  const getTrendDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'growing': return <TrendingUp className="text-green-500" size={16} />;
      case 'declining': return <TrendingDown className="text-red-500" size={16} />;
      case 'emerging': return <Zap className="text-purple-500" size={16} />;
      default: return <Activity className="text-gray-500" size={16} />;
    }
  };

  const getOpportunityColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-green-100 text-green-800 border-green-200';
      case 'threat': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getThreatLevelColor = (score: number) => {
    if (score > 0.7) return 'bg-red-100 text-red-800';
    if (score > 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getImpactColor = (assessment: string) => {
    switch (assessment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter data
  const filteredTrends = trends.filter(trend => {
    if (activeFilter !== 'all' && trend.trend_category !== activeFilter) return false;
    if (searchQuery && !trend.trend_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredCompetitors = competitors.filter(competitor => {
    if (activeFilter !== 'all' && competitor.competitor_type !== activeFilter) return false;
    if (searchQuery && !competitor.competitor_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredNews = news.filter(item => {
    if (activeFilter !== 'all' && item.news_category !== activeFilter) return false;
    if (searchQuery && !item.headline.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading market intelligence...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Market Intelligence</h2>
          <p className="text-slate-600 mt-1">Track market trends, competitors, and opportunities</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowDataScraper(true)}
            className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
          >
            <Download size={20} />
            <span>Scrape Data</span>
          </button>
          <button
            onClick={generateAIInsights}
            disabled={loadingAI}
            className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Brain size={20} />
            <span>{loadingAI ? 'Analyzing...' : 'AI Insights'}</span>
          </button>
          <div className="relative">
            <select
              value={activeView}
              onChange={(e) => setActiveView(e.target.value as any)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8"
            >
              <option value="overview">Overview</option>
              <option value="trends">Market Trends</option>
              <option value="competitors">Competitors</option>
              <option value="news">Market News</option>
              <option value="reports">Research Reports</option>
              <option value="alerts">Alerts</option>
              <option value="analytics">Analytics</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-red-500" size={20} />
              <p className="text-red-800">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Overview */}
      {activeView === 'overview' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Market Trends</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.totalTrendsTracked}</p>
                  <p className="text-xs text-green-600 mt-1">{analytics.growingTrends} growing</p>
                </div>
                <TrendingUp className="text-blue-600" size={32} />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Competitors</p>
                  <p className="text-2xl font-bold text-red-600">{analytics.competitorsTracked}</p>
                  <p className="text-xs text-red-600 mt-1">{analytics.highThreatCompetitors} high threat</p>
                </div>
                <Shield className="text-red-600" size={32} />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">News Articles</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.newsArticlesTracked}</p>
                  <p className="text-xs text-green-600 mt-1">{analytics.bookmarkedArticles} bookmarked</p>
                </div>
                <Globe className="text-green-600" size={32} />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Alerts</p>
                  <p className="text-2xl font-bold text-purple-600">{analytics.activeAlerts}</p>
                  <p className="text-xs text-purple-600 mt-1">Monitoring</p>
                </div>
                <Bell className="text-purple-600" size={32} />
              </div>
            </div>
          </div>

          {/* Quick Overview Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4">Recent Market Trends</h3>
              <div className="space-y-3">
                {trends.slice(0, 5).map(trend => (
                  <div key={trend.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTrendDirectionIcon(trend.trend_direction)}
                      <div>
                        <p className="font-medium text-sm">{trend.trend_name}</p>
                        <p className="text-xs text-gray-500 capitalize">{trend.trend_category}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded border ${getOpportunityColor(trend.opportunity_threat)}`}>
                      {trend.opportunity_threat}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4">Top Competitive Threats</h3>
              <div className="space-y-3">
                {competitors.slice(0, 5).map(competitor => (
                  <div key={competitor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Building className="text-gray-500" size={16} />
                      <div>
                        <p className="font-medium text-sm">{competitor.competitor_name}</p>
                        <p className="text-xs text-gray-500 capitalize">{competitor.competitor_type}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${getThreatLevelColor(competitor.threat_level_score)}`}>
                      {Math.round(competitor.threat_level_score * 100)}% threat
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Market Trends View */}
      {activeView === 'trends' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Market Trends</h3>
            <button
              onClick={() => setShowTrendForm(true)}
              className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Trend</span>
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search trends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">All Categories</option>
                <option value="technology">Technology</option>
                <option value="industry">Industry</option>
                <option value="consumer">Consumer</option>
                <option value="economic">Economic</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTrends.map(trend => (
                <div key={trend.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getTrendDirectionIcon(trend.trend_direction)}
                      <h4 className="font-medium">{trend.trend_name}</h4>
                    </div>
                    <div className="flex space-x-1">
                      <button onClick={() => startEditTrend(trend)} className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => deleteTrend(trend)} className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {trend.description && (
                    <p className="text-sm text-gray-600 mb-3">{trend.description}</p>
                  )}
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Relevance</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${trend.relevance_to_product * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Impact</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full" 
                          style={{ width: `${trend.potential_impact_score * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs rounded border ${getOpportunityColor(trend.opportunity_threat)}`}>
                      {trend.opportunity_threat}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{trend.trend_category}</span>
                  </div>
                </div>
              ))}
            </div>

            {filteredTrends.length === 0 && (
              <div className="text-center py-12">
                <TrendingUp className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trends found</h3>
                <p className="text-gray-600 mb-4">Start tracking market trends to stay competitive</p>
                <button
                  onClick={() => setShowTrendForm(true)}
                  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                >
                  Add First Trend
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Competitors View */}
      {activeView === 'competitors' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Competitive Intelligence</h3>
            <button
              onClick={() => setShowCompetitorForm(true)}
              className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Competitor</span>
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search competitors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">All Types</option>
                <option value="direct">Direct</option>
                <option value="indirect">Indirect</option>
                <option value="substitute">Substitute</option>
                <option value="emerging">Emerging</option>
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCompetitors.map(competitor => (
                <div key={competitor.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold">{competitor.competitor_name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-600 capitalize">{competitor.competitor_type}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600 capitalize">{competitor.market_position}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded ${getThreatLevelColor(competitor.threat_level_score)}`}>
                        Threat: {Math.round(competitor.threat_level_score * 100)}%
                      </span>
                      <div className="flex space-x-1">
                        <button onClick={() => startEditCompetitor(competitor)} className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteCompetitor(competitor)} className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {competitor.unique_value_proposition && (
                    <p className="text-sm text-gray-600 mb-4">{competitor.unique_value_proposition}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="font-medium text-sm text-green-800 mb-2">Strengths</h5>
                      <ul className="space-y-1">
                        {(competitor.strengths || []).slice(0, 3).map((strength, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start space-x-1">
                            <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={10} />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm text-red-800 mb-2">Weaknesses</h5>
                      <ul className="space-y-1">
                        {(competitor.weaknesses || []).slice(0, 3).map((weakness, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start space-x-1">
                            <X className="text-red-500 mt-0.5 flex-shrink-0" size={10} />
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {competitor.website_url && (
                    <div className="pt-4 border-t border-gray-100">
                      <a
                        href={competitor.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                      >
                        <ExternalLink size={12} />
                        <span>Visit Website</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredCompetitors.length === 0 && (
              <div className="text-center py-12">
                <Shield className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No competitors tracked</h3>
                <p className="text-gray-600 mb-4">Start building your competitive intelligence</p>
                <button
                  onClick={() => setShowCompetitorForm(true)}
                  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                >
                  Add First Competitor
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* News View */}
      {activeView === 'news' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Market News</h3>
            <button
              onClick={() => setShowNewsForm(true)}
              className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add News</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search news..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Categories</option>
                  <option value="market-analysis">Market Analysis</option>
                  <option value="product-updates">Product Updates</option>
                  <option value="funding">Funding</option>
                  <option value="regulatory">Regulatory</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredNews.map(item => (
                <div key={item.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 
                          className={`text-lg font-medium cursor-pointer hover:text-blue-600 ${
                            !item.is_read ? 'text-gray-900' : 'text-gray-600'
                          }`}
                          onClick={() => markAsRead(item)}
                        >
                          {item.headline}
                        </h4>
                        {!item.is_read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span>{item.source_name}</span>
                        {item.published_date && (
                          <>
                            <span>•</span>
                            <span>{new Date(item.published_date).toLocaleDateString()}</span>
                          </>
                        )}
                        <span className={`px-2 py-1 rounded text-xs ${getImpactColor(item.impact_assessment)}`}>
                          {item.impact_assessment}
                        </span>
                      </div>
                      
                      {item.summary && (
                        <p className="text-gray-600 text-sm mb-3">{item.summary}</p>
                      )}
                      
                      {item.business_implications && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                          <p className="text-blue-800 text-sm">{item.business_implications}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => toggleBookmark(item)}
                        className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                      >
                        {item.is_bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      </button>
                      {item.source_url && (
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-blue-600"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredNews.length === 0 && (
              <div className="text-center py-12">
                <Globe className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No news articles found</h3>
                <p className="text-gray-600 mb-4">Stay informed about market developments</p>
                <button
                  onClick={() => setShowNewsForm(true)}
                  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                >
                  Add News Article
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics View */}
      {activeView === 'analytics' && analytics && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Market Intelligence Analytics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{analytics.totalTrendsTracked}</p>
                <p className="text-sm text-gray-600">Total Trends</p>
                <p className="text-xs text-green-600 mt-1">{analytics.growingTrends} growing</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{analytics.opportunitiesIdentified}</p>
                <p className="text-sm text-gray-600">Opportunities</p>
                <p className="text-xs text-purple-600 mt-1">Identified</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{analytics.competitorsTracked}</p>
                <p className="text-sm text-gray-600">Competitors</p>
                <p className="text-xs text-red-600 mt-1">{analytics.highThreatCompetitors} high threat</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{analytics.newsArticlesTracked}</p>
                <p className="text-sm text-gray-600">News Articles</p>
                <p className="text-xs text-green-600 mt-1">{analytics.bookmarkedArticles} bookmarked</p>
              </div>
            </div>
          </div>

          {/* Category Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h4 className="font-semibold mb-4">Trends by Category</h4>
              <div className="space-y-3">
                {Object.entries(analytics.trendsByCategory).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm capitalize text-gray-700">{category.replace('-', ' ')}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(count / analytics.totalTrendsTracked) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h4 className="font-semibold mb-4">Threat Level Distribution</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Low Threat</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(analytics.threatLevelDistribution.low / analytics.competitorsTracked) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{analytics.threatLevelDistribution.low}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Medium Threat</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full" 
                        style={{ width: `${(analytics.threatLevelDistribution.medium / analytics.competitorsTracked) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{analytics.threatLevelDistribution.medium}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">High Threat</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${(analytics.threatLevelDistribution.high / analytics.competitorsTracked) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{analytics.threatLevelDistribution.high}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trend Form Modal */}
      {showTrendForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {editingTrend ? 'Edit Market Trend' : 'Add Market Trend'}
                </h2>
                <button
                  onClick={() => {
                    setShowTrendForm(false);
                    resetTrendForm();
                  }}
                  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trend Name *
                </label>
                <input
                  type="text"
                  value={trendForm.trend_name}
                  onChange={(e) => setTrendForm({...trendForm, trend_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter trend name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={trendForm.trend_category}
                    onChange={(e) => setTrendForm({...trendForm, trend_category: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="technology">Technology</option>
                    <option value="industry">Industry</option>
                    <option value="consumer">Consumer</option>
                    <option value="economic">Economic</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Direction
                  </label>
                  <select
                    value={trendForm.trend_direction}
                    onChange={(e) => setTrendForm({...trendForm, trend_direction: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="declining">Declining</option>
                    <option value="stable">Stable</option>
                    <option value="growing">Growing</option>
                    <option value="emerging">Emerging</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={trendForm.description}
                  onChange={(e) => setTrendForm({...trendForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the trend and its implications"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relevance to Product
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={trendForm.relevance_to_product}
                    onChange={(e) => setTrendForm({...trendForm, relevance_to_product: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round(trendForm.relevance_to_product * 100)}%
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Potential Impact
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={trendForm.potential_impact_score}
                    onChange={(e) => setTrendForm({...trendForm, potential_impact_score: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round(trendForm.potential_impact_score * 100)}%
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opportunity/Threat
                  </label>
                  <select
                    value={trendForm.opportunity_threat}
                    onChange={(e) => setTrendForm({...trendForm, opportunity_threat: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="threat">Threat</option>
                    <option value="neutral">Neutral</option>
                    <option value="opportunity">Opportunity</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowTrendForm(false);
                  resetTrendForm();
                }}
                className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
              >
                Cancel
              </button>
              <button
                onClick={() => editingTrend ? updateTrend(editingTrend) : createTrend()}
                className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
              >
                <Save size={16} />
                <span>{editingTrend ? 'Update' : 'Create'} Trend</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Competitor Form Modal */}
      {showCompetitorForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {editingCompetitor ? 'Edit Competitor' : 'Add Competitor'}
                </h2>
                <button
                  onClick={() => {
                    setShowCompetitorForm(false);
                    resetCompetitorForm();
                  }}
                  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Competitor Name *
                </label>
                <input
                  type="text"
                  value={competitorForm.competitor_name}
                  onChange={(e) => setCompetitorForm({...competitorForm, competitor_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter competitor name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Competitor Type
                  </label>
                  <select
                    value={competitorForm.competitor_type}
                    onChange={(e) => setCompetitorForm({...competitorForm, competitor_type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="direct">Direct</option>
                    <option value="indirect">Indirect</option>
                    <option value="substitute">Substitute</option>
                    <option value="emerging">Emerging</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Market Position
                  </label>
                  <select
                    value={competitorForm.market_position}
                    onChange={(e) => setCompetitorForm({...competitorForm, market_position: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="leader">Leader</option>
                    <option value="challenger">Challenger</option>
                    <option value="follower">Follower</option>
                    <option value="niche">Niche</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={competitorForm.website_url}
                  onChange={(e) => setCompetitorForm({...competitorForm, website_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://competitor.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Threat Level
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={competitorForm.threat_level_score}
                  onChange={(e) => setCompetitorForm({...competitorForm, threat_level_score: parseFloat(e.target.value)})}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round(competitorForm.threat_level_score * 100)}% threat level
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCompetitorForm(false);
                  resetCompetitorForm();
                }}
                className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
              >
                Cancel
              </button>
              <button
                onClick={() => editingCompetitor ? updateCompetitor(editingCompetitor) : createCompetitor()}
                className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
              >
                <Save size={16} />
                <span>{editingCompetitor ? 'Update' : 'Create'} Competitor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Modal */}
      {showAIInsights && aiInsights && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="text-purple-600" size={24} />
                  <h2 className="text-xl font-semibold">Market Intelligence AI Insights</h2>
                </div>
                <button
                  onClick={() => setShowAIInsights(false)}
                  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-3">Trend Analysis</h3>
                <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">{aiInsights.trendAnalysis}</p>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-3">Competitive Threats</h3>
                <p className="text-gray-700 bg-red-50 p-4 rounded-lg">{aiInsights.competitiveThreats}</p>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-3">Market Opportunities</h3>
                <p className="text-gray-700 bg-green-50 p-4 rounded-lg">{aiInsights.marketOpportunities}</p>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-3">Strategic Recommendations</h3>
                <ul className="space-y-2">
                  {aiInsights.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2 text-gray-700">
                      <Target size={14} className="text-purple-500 mt-1 flex-shrink-0" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowAIInsights(false)}
                className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
              >
                Close Insights
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Scraper Modal */}
      {showDataScraper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Download className="text-green-600" size={24} />
                  <h2 className="text-xl font-semibold">Market Data Scraper</h2>
                </div>
                <button
                  onClick={() => setShowDataScraper(false)}
                  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Instructions Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Collection Instructions (Optional)
                </label>
                <textarea
                  value={dataInstructions}
                  onChange={(e) => setDataInstructions(e.target.value)}
                  placeholder="Describe what kind of market data you want to collect. For example: 'Focus on technology trends in healthcare', 'Look for emerging fintech companies', 'Find consumer behavior changes in retail', etc."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={4}
                />
              </div>

              {/* Search Query */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Query *
                </label>
                <input
                  type="text"
                  value={scrapingQuery}
                  onChange={(e) => setScrapingQuery(e.target.value)}
                  placeholder="Enter your market research query (e.g., 'AI in healthcare', 'sustainable fashion trends')"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Scrape Button */}
              <button
                onClick={handleDataScraping}
                disabled={isScrapingData || !scrapingQuery.trim()}
                className="w-full px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {isScrapingData ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    <span>Scraping Data...</span>
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    <span>Scrape Market Data</span>
                  </>
                )}
              </button>

              {/* Scraping Results */}
              {scrapingResults.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Scraped Data Results</h3>
                  {scrapingResults.map((result, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Query: "{result.query}"</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(result.timestamp).toLocaleString()}
                        </span>
                      </div>

                      {/* Market Trends */}
                      {result.trends && result.trends.length > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium text-blue-600">Market Trends ({result.trends.length})</h5>
                            <button
                              onClick={() => importScrapedData('trends', result.trends)}
                              className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                            >
                              Import Trends
                            </button>
                          </div>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {result.trends.map((trend: any, tIndex: number) => (
                              <div key={tIndex} className="bg-blue-50 p-3 rounded">
                                <div className="font-medium">{trend.name}</div>
                                <div className="text-sm text-gray-600">{trend.category} • {trend.direction}</div>
                                <div className="text-sm text-gray-500 mt-1">{trend.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* News Articles */}
                      {result.news && result.news.length > 0 && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium text-green-600">News Articles ({result.news.length})</h5>
                            <button
                              onClick={() => importScrapedData('news', result.news)}
                              className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                            >
                              Import News
                            </button>
                          </div>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {result.news.map((article: any, nIndex: number) => (
                              <div key={nIndex} className="bg-green-50 p-3 rounded">
                                <div className="font-medium">{article.headline}</div>
                                <div className="text-sm text-gray-600">{article.source}</div>
                                <div className="text-sm text-gray-500 mt-1">{article.summary}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setScrapingResults([]);
                  setScrapingQuery('');
                  setDataInstructions('');
                  setShowDataScraper(false);
                }}
                className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketIntelligence;