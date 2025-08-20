import React, { useState } from 'react';
import { BarChart3, Brain, Filter, Plus, TrendingUp, Newspaper } from 'lucide-react';

interface MarketTrend {
  id: number;
  title: string;
  description: string;
  category: 'Technology' | 'Retail' | 'Consumer Behavior';
  impact: 'High' | 'Medium' | 'Low';
  source: string;
  date: string;
}

interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  source: 'Reuters' | 'VRT NWS' | 'Le Soir' | 'Euromonitor' | 'Other';
  topic: 'Retail' | 'Economy' | 'Consumer Behavior' | 'Media';
  date: string;
  relevance: 'High' | 'Medium' | 'Low';
}

interface MarketMetrics {
  totalTrends: number;
  highImpactTrends: number;
  technologyTrends: number;
  recentTrends: number;
  recommendations: string[];
}

interface NewsMetrics {
  totalArticles: number;
  highRelevanceArticles: number;
  retailArticles: number;
  recentArticles: number;
  recommendations: string[];
}

const MarketIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'media'>('overview');
  const [filterCategory, setFilterCategory] = useState<'All' | 'Technology' | 'Retail' | 'Consumer Behavior'>('All');
  const [filterNewsSource, setFilterNewsSource] = useState<
    'All' | 'Reuters' | 'VRT NWS' | 'Le Soir' | 'Euromonitor' | 'Other'
  >('All');
  const [filterNewsTopic, setFilterNewsTopic] = useState<'All' | 'Retail' | 'Economy' | 'Consumer Behavior' | 'Media'>(
    'All',
  );
  const [selectedTrend, setSelectedTrend] = useState<MarketTrend | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const [trends] = useState<MarketTrend[]>([
    {
      id: 1,
      title: 'Rise of Mobile Commerce',
      description: 'Increasing adoption of mobile apps for grocery shopping.',
      category: 'Technology',
      impact: 'High',
      source: 'Industry Report 2025',
      date: '2025-08-15',
    },
    {
      id: 2,
      title: 'Sustainability in Retail',
      description: 'Consumers prioritize eco-friendly packaging and sourcing.',
      category: 'Consumer Behavior',
      impact: 'Medium',
      source: 'Consumer Survey 2025',
      date: '2025-08-10',
    },
    {
      id: 3,
      title: 'Competitor Loyalty Program Expansion',
      description: 'Rival retailers enhancing loyalty programs with personalized offers.',
      category: 'Retail',
      impact: 'High',
      source: 'Competitor Analysis',
      date: '2025-08-18',
    },
  ]);

  const [newsArticles] = useState<NewsArticle[]>([
    {
      id: 1,
      title: 'Belgian Retail Sees Growth in Soft Drinks Despite Health Trends',
      summary:
        'Soft drink sales in Belgium declined in volume but saw value growth in 2024 due to health-conscious consumers seeking diverse flavors.',
      source: 'Euromonitor',
      topic: 'Retail',
      date: '2025-08-13',
      relevance: 'Medium',
    },
    {
      id: 2,
      title: 'Media Consolidation in Flanders and Wallonia',
      summary:
        'Mediahuis and DPG Media dominate Flemish news, while Rossel and IPM lead in Wallonia, with digital subscriptions up 4% in 2024.',
      source: 'Reuters',
      topic: 'Media',
      date: '2025-06-17',
      relevance: 'High',
    },
    {
      id: 3,
      title: 'Knokke-Heist Store Pioneers New Retail Loyalty Model',
      summary: 'A Belgian store introduces a loyalty model focused on community connection, challenging traditional price-based promotions.',
      source: 'Other',
      topic: 'Retail',
      date: '2025-08-14',
      relevance: 'High',
    },
    {
      id: 4,
      title: 'Decline in Belgian Newspaper Readership',
      summary: 'Combined print and digital readership dropped 2.7% in 2023, with quality newspapers like Le Soir seeing slight gains.',
      source: 'Reuters',
      topic: 'Media',
      date: '2023-06-14',
      relevance: 'Low',
    },
    {
      id: 5,
      title: 'Beer Consumption Falls in Belgium',
      summary: 'Total beer consumption dropped by 2% in 2024, impacting local retailers and the Xtra App’s beverage category.',
      source: 'Le Soir',
      topic: 'Consumer Behavior',
      date: '2025-02-06',
      relevance: 'Medium',
    },
  ]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMarketMetrics = (): MarketMetrics => {
    const totalTrends = trends.length;
    const highImpactTrends = trends.filter(t => t.impact === 'High').length;
    const technologyTrends = trends.filter(t => t.category === 'Technology').length;
    const recentTrends = trends.filter(t => new Date(t.date) >= new Date('2025-08-01')).length;

    return {
      totalTrends,
      highImpactTrends,
      technologyTrends,
      recentTrends,
      recommendations: [
        'Enhance Xtra App with mobile-first checkout features',
        'Incorporate sustainable packaging options in product listings',
        'Analyze competitor loyalty programs for Xtra App improvements',
      ],
    };
  };

  const getNewsMetrics = (): NewsMetrics => {
    const totalArticles = newsArticles.length;
    const highRelevanceArticles = newsArticles.filter(a => a.relevance === 'High').length;
    const retailArticles = newsArticles.filter(a => a.topic === 'Retail').length;
    const recentArticles = newsArticles.filter(a => new Date(a.date) >= new Date('2025-08-01')).length;

    return {
      totalArticles,
      highRelevanceArticles,
      retailArticles,
      recentArticles,
      recommendations: [
        'Monitor loyalty program trends for Xtra App enhancements',
        'Integrate health-conscious product filters in the app',
        'Evaluate media consolidation impacts on advertising strategies',
      ],
    };
  };

  const marketMetrics = getMarketMetrics();
  const newsMetrics = getNewsMetrics();

  const filteredTrends = trends.filter(trend => {
    return filterCategory === 'All' || trend.category === filterCategory;
  });

  const filteredArticles = newsArticles.filter(article => {
    return (
      (filterNewsSource === 'All' || article.source === filterNewsSource) &&
      (filterNewsTopic === 'All' || article.topic === filterNewsTopic)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Market Intelligence</h2>
          <p className="text-slate-600 mt-1">AI-driven market trends and Belgian media insights</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus size={20} />
            <span>Add Trend</span>
          </button>
        </div>
      </div>

      {/* AI Market Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-blue-900">
            {activeTab === 'media' ? 'AI Media Insights' : 'AI Market Insights'}
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {(activeTab === 'media' ? newsMetrics.recommendations : marketMetrics.recommendations).map(
            (recommendation, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  {activeTab === 'media' ? (
                    <Newspaper className="text-blue-500" size={16} />
                  ) : (
                    <TrendingUp className="text-blue-500" size={16} />
                  )}
                  <span className="font-medium text-gray-900">
                    {activeTab === 'media' ? 'Media Recommendation' : 'Strategic Recommendation'}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Trend Overview', icon: TrendingUp },
            { id: 'analytics', label: 'Market Analytics', icon: BarChart3 },
            { id: 'media', label: 'Media Scan', icon: Newspaper },
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
      {activeTab !== 'media' && (
        <div className="flex space-x-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-600" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value as any)}
            >
              <option value="All">All Categories</option>
              <option value="Technology">Technology</option>
              <option value="Retail">Retail</option>
              <option value="Consumer Behavior">Consumer Behavior</option>
            </select>
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <div className="flex space-x-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-600" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterNewsSource}
              onChange={e => setFilterNewsSource(e.target.value as any)}
            >
              <option value="All">All Sources</option>
              <option value="Reuters">Reuters</option>
              <option value="VRT NWS">VRT NWS</option>
              <option value="Le Soir">Le Soir</option>
              <option value="Euromonitor">Euromonitor</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-600" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterNewsTopic}
              onChange={e => setFilterNewsTopic(e.target.value as any)}
            >
              <option value="All">All Topics</option>
              <option value="Retail">Retail</option>
              <option value="Economy">Economy</option>
              <option value="Consumer Behavior">Consumer Behavior</option>
              <option value="Media">Media</option>
            </select>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Market Trends</h3>
          <div className="space-y-4">
            {filteredTrends.map(trend => (
              <div
                key={trend.id}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedTrend(trend)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{trend.title}</h4>
                    <p className="text-sm text-gray-600">{trend.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${getImpactColor(trend.impact)}`}>
                    {trend.impact}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Category: {trend.category}</span>
                  <span>•</span>
                  <span>Source: {trend.source}</span>
                  <span>•</span>
                  <span>Date: {trend.date}</span>
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
                <p className="text-sm text-gray-600">Total Trends</p>
                <p className="text-2xl font-bold text-gray-900">{marketMetrics.totalTrends}</p>
              </div>
              <BarChart3 className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High-Impact Trends</p>
                <p className="text-2xl font-bold text-red-600">{marketMetrics.highImpactTrends}</p>
              </div>
              <TrendingUp className="text-red-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Technology Trends</p>
                <p className="text-2xl font-bold text-blue-600">{marketMetrics.technologyTrends}</p>
              </div>
              <BarChart3 className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recent Trends</p>
                <p className="text-2xl font-bold text-green-600">{marketMetrics.recentTrends}</p>
              </div>
              <TrendingUp className="text-green-600" size={32} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Belgian Media Scan</h3>
          <div className="space-y-4">
            {filteredArticles.map(article => (
              <div
                key={article.id}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{article.title}</h4>
                    <p className="text-sm text-gray-600">{article.summary}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${getImpactColor(article.relevance)}`}>
                    {article.relevance}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Source: {article.source}</span>
                  <span>•</span>
                  <span>Topic: {article.topic}</span>
                  <span>•</span>
                  <span>Date: {article.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend Details Modal */}
      {selectedTrend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Trend Details</h3>
            <div className="space-y-3 text-sm">
              <p><span className="font-medium">Title:</span> {selectedTrend.title}</p>
              <p><span className="font-medium">Description:</span> {selectedTrend.description}</p>
              <p><span className="font-medium">Category:</span> {selectedTrend.category}</p>
              <p>
                <span className="font-medium">Impact:</span>{' '}
                <span className={getImpactColor(selectedTrend.impact)}>{selectedTrend.impact}</span>
              </p>
              <p><span className="font-medium">Source:</span> {selectedTrend.source}</p>
              <p><span className="font-medium">Date:</span> {selectedTrend.date}</p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                onClick={() => setSelectedTrend(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article Details Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Article Details</h3>
            <div className="space-y-3 text-sm">
              <p><span className="font-medium">Title:</span> {selectedArticle.title}</p>
              <p><span className="font-medium">Summary:</span> {selectedArticle.summary}</p>
              <p><span className="font-medium">Source:</span> {selectedArticle.source}</p>
              <p><span className="font-medium">Topic:</span> {selectedArticle.topic}</p>
              <p>
                <span className="font-medium">Relevance:</span>{' '}
                <span className={getImpactColor(selectedArticle.relevance)}>{selectedArticle.relevance}</span>
              </p>
              <p><span className="font-medium">Date:</span> {selectedArticle.date}</p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                onClick={() => setSelectedArticle(null)}
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
