import React from 'react';
import { BarChart3 } from 'lucide-react';

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

interface AnalyticsProps {
  news: { global: NewsArticle[]; belgian: NewsArticle[] };
}

const Analytics: React.FC<AnalyticsProps> = ({ news }) => {
  // Count priorities
  const priorityCounts = {
    Low: news.global.filter(a => a.priority === 'Low').length + news.belgian.filter(a => a.priority === 'Low').length,
    Medium: news.global.filter(a => a.priority === 'Medium').length + news.belgian.filter(a => a.priority === 'Medium').length,
    High: news.global.filter(a => a.priority === 'High').length + news.belgian.filter(a => a.priority === 'High').length,
  };

  // Simple max value for scaling
  const maxCount = Math.max(...Object.values(priorityCounts));

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <BarChart3 className="mr-2" size={20} /> Market Analytics
      </h3>
      <div className="space-y-4">
        <div className="flex items-end h-40">
          {Object.entries(priorityCounts).map(([priority, count]) => (
            <div key={priority} className="flex-1 mx-1">
              <div
                className={`bg-${priority === 'High' ? 'red' : priority === 'Medium' ? 'yellow' : 'gray'}-500`}
                style={{ height: `${(count / maxCount) * 100 || 0}%`, minHeight: '5px' }}
              ></div>
              <p className="text-center text-sm mt-2">{priority}: {count}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600">Bar heights represent the number of news items by priority level.</p>
      </div>
    </div>
  );
};

export default Analytics;
