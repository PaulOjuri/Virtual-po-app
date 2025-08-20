import React, { useState, useEffect } from 'react';
import { BarChart3, Globe, Newspaper, TrendingUp } from 'lucide-react';

// Define the shape of a news article
interface NewsArticle {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  source: string;
  topic: string;
  date: string;
  url: string;
}

const MarketIntelligence: React.FC = () => {
  const [news, setNews] = useState({ global: [], belgian: [] } as { global: NewsArticle[]; belgian: NewsArticle[] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterTopic, setFilterTopic] = useState('All Topics');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/.netlify/functions/fetch-news');
        const data = await response.json();
        setNews(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load news');
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const filterNews = (articles: NewsArticle[]) => {
    return articles.filter(article => {
      const priorityMatch = filterPriority === 'All' || article.priority === filterPriority;
      const topicMatch = filterTopic === 'All Topics' || article.topic === filterTopic;
      return priorityMatch && topicMatch;
    });
  };

  const uniqueTopics = Array.from(new Set(news.belgian.flatMap(n => n.topic).concat(news.global.flatMap(n => n.topic))));

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Globe className="mr-2" size={20} /> Market Intelligence
      </h3>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <TrendingUp size={16} className="inline mr-1" /> Trend Overview
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <BarChart3 size={16} className="inline mr-1" /> Market Analytics
          </button>
        </div>
        <div className="flex space-x-2">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            <option value="All Topics">All Topics</option>
            {uniqueTopics.map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <Newspaper size={16} className="inline mr-1" /> Media Scan
          </button>
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Newspaper size={16} className="mr-1" /> Media Scan - Belgian News
        </h4>
        {loading ? (
          <p className="text-sm text-gray-600">Loading news...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <ul className="space-y-4">
            {filterNews(news.belgian).length > 0 ? (
              filterNews(news.belgian).map((article, index) => (
                <li key={index} className="border-b pb-2">
                  <div className={`font-medium ${article.priority === 'High' ? 'text-red-600' : article.priority === 'Medium' ? 'text-yellow-600' : 'text-gray-600'}`}>
                    {article.title} ({article.priority})
                  </div>
                  <p className="text-xs text-gray-500">{article.description}</p>
                  <p className="text-xs text-gray-500">Source: {article.source} • Topic: {article.topic} • Date: {new Date(article.date).toLocaleDateString()}</p>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Read more
                  </a>
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-600">No relevant Belgian news found.</p>
            )}
          </ul>
        )}
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Globe size={16} className="mr-1" /> Media Scan - Global News
        </h4>
        {loading ? (
          <p className="text-sm text-gray-600">Loading news...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <ul className="space-y-4">
            {filterNews(news.global).length > 0 ? (
              filterNews(news.global).map((article, index) => (
                <li key={index} className="border-b pb-2">
                  <div className={`font-medium ${article.priority === 'High' ? 'text-red-600' : article.priority === 'Medium' ? 'text-yellow-600' : 'text-gray-600'}`}>
                    {article.title} ({article.priority})
                  </div>
                  <p className="text-xs text-gray-500">{article.description}</p>
                  <p className="text-xs text-gray-500">Source: {article.source} • Topic: {article.topic} • Date: {new Date(article.date).toLocaleDateString()}</p>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Read more
                  </a>
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-600">No relevant global news found.</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MarketIntelligence;
