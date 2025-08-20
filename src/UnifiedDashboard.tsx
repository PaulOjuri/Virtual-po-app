import React from 'react';
import { TrendingUp, Users, CheckCircle, AlertCircle } from 'lucide-react';

const UnifiedDashboard: React.FC = () => {
  // Example metrics
  const metrics = [
    {
      title: 'Active Projects',
      value: 12,
      trend: '+15%',
      timeframe: 'this-week',
    },
    {
      title: 'Stakeholders Engaged',
      value: 8,
      trend: '+5%',
      timeframe: 'this-week',
    },
    {
      title: 'Tasks Completed',
      value: 42,
      trend: '+22%',
      timeframe: 'this-week',
    },
    {
      title: 'Risks Identified',
      value: 3,
      trend: '-2%',
      timeframe: 'this-week',
    },
  ];

  const getHealthColor = (health: number) => {
    if (health >= 0.85) return 'text-green-600';
    if (health >= 0.65) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Unified Dashboard</h2>
        <p className="text-slate-600 mt-1">
          Overview of project performance, tasks, risks, and stakeholder engagement.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-start"
          >
            <div className="flex items-center justify-between w-full">
              <h3 className="text-sm font-medium text-slate-600">{metric.title}</h3>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{metric.value}</p>
            <p className="text-sm text-green-600">{metric.trend}</p>
            <p className="text-xs text-slate-500 mt-1">{metric.timeframe}</p>
          </div>
        ))}
      </div>

      {/* Example Health Indicator */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Project Health</h3>
        <p className={`${getHealthColor(0.82)} font-medium`}>Overall: 82% Healthy</p>
      </div>
    </div>
  );
};

export default UnifiedDashboard;
