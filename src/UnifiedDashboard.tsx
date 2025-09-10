import React, { useState, useEffect } from 'react';
import { useRole } from './contexts/RoleContext';
import { 
  BarChart3, Brain, Zap, Mail, Calendar, Target, Activity, ArrowUp, ArrowDown, Minus,
  Users, TrendingUp, Clock, CheckCircle, AlertTriangle, MessageSquare, FileText,
  Settings, RefreshCw, Filter, Download, Eye, MoreHorizontal, Maximize2,
  PieChart, GitBranch, Layers, BookOpen
} from 'lucide-react';
import { analyticsService } from './services/analyticsService';
import { aiChatService } from './services/aiChatService';

interface UnifiedDashboardProps {
  onNavigate?: (tabId: string) => void;
}

const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ onNavigate }) => {
  const { currentRole, applyTerminology, shouldShowModule } = useRole();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [expandedWidgets, setExpandedWidgets] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUnifiedData();
  }, [timeRange, currentRole]);

  const loadUnifiedData = async () => {
    setLoading(true);
    try {
      const [analytics, priorities, meetings, stakeholders, insights] = await Promise.all([
        analyticsService.getDashboardMetrics(timeRange).catch(() => null),
        import('./services/priorityService').then(m => m.PriorityService.getAllPriorities()).catch(() => []),
        import('./services/meetingService').then(m => m.MeetingService.getAllMeetings()).catch(() => []),
        import('./services/stakeholderService').then(m => m.StakeholderService.getAllStakeholders()).catch(() => []),
        generateAIInsights().catch(() => null)
      ]);
      
      setDashboardData({
        analytics,
        priorities,
        meetings,
        stakeholders,
        metrics: generateUnifiedMetrics(analytics, priorities, meetings, stakeholders)
      });
      setAiInsights(insights);
    } catch (error) {
      console.error('Error loading unified dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateUnifiedMetrics = (analytics: any, priorities: any[], meetings: any[], stakeholders: any[]) => {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const activePriorities = priorities.filter(p => p.status === 'in-progress' || p.status === 'review');
    const criticalPriorities = priorities.filter(p => p.priority_level === 'critical');
    const upcomingMeetings = meetings.filter(m => new Date(m.date) > now && m.status === 'scheduled');
    const recentMeetings = meetings.filter(m => new Date(m.date) >= weekStart && m.status === 'completed');
    const activeStakeholders = stakeholders.filter(s => s.relationship_health >= 7);
    
    const productivityScore = Math.round((
      (activePriorities.length > 0 ? 25 : 0) +
      (criticalPriorities.length <= 3 ? 25 : criticalPriorities.length <= 5 ? 15 : 5) +
      (recentMeetings.length >= 3 ? 25 : recentMeetings.length * 8) +
      (activeStakeholders.length / Math.max(stakeholders.length, 1)) * 25
    ));

    return [
      { 
        title: 'Productivity Score', 
        value: `${productivityScore}%`, 
        change: analytics?.productivityChange || 5, 
        trend: productivityScore >= 80 ? 'up' : productivityScore >= 60 ? 'stable' : 'down', 
        icon: BarChart3,
        color: productivityScore >= 80 ? 'green' : productivityScore >= 60 ? 'yellow' : 'red',
        description: 'Overall performance across all activities'
      },
      { 
        title: 'Active Priorities', 
        value: `${activePriorities.length}/${priorities.length}`, 
        change: activePriorities.length - (analytics?.lastActivePriorities || activePriorities.length), 
        trend: activePriorities.length > (analytics?.lastActivePriorities || 0) ? 'up' : 
               activePriorities.length < (analytics?.lastActivePriorities || 0) ? 'down' : 'stable', 
        icon: Target,
        color: 'blue',
        description: 'Currently in progress priorities'
      },
      { 
        title: 'Critical Items', 
        value: criticalPriorities.length.toString(), 
        change: criticalPriorities.length - (analytics?.lastCriticalItems || 0), 
        trend: criticalPriorities.length > 3 ? 'down' : criticalPriorities.length === 0 ? 'up' : 'stable', 
        icon: AlertTriangle,
        color: criticalPriorities.length > 3 ? 'red' : criticalPriorities.length > 1 ? 'yellow' : 'green',
        description: 'High-priority items requiring attention'
      },
      { 
        title: 'Meetings This Week', 
        value: recentMeetings.length.toString(), 
        change: recentMeetings.length - (analytics?.lastMeetingsCount || 0), 
        trend: recentMeetings.length > (analytics?.lastMeetingsCount || 0) ? 'up' : 'stable', 
        icon: Calendar,
        color: 'purple',
        description: 'Completed meetings this week'
      },
      { 
        title: 'Stakeholder Health', 
        value: `${Math.round(activeStakeholders.length / Math.max(stakeholders.length, 1) * 100)}%`, 
        change: Math.round((activeStakeholders.length / Math.max(stakeholders.length, 1) * 100) - (analytics?.lastStakeholderHealth || 85)), 
        trend: activeStakeholders.length / Math.max(stakeholders.length, 1) >= 0.8 ? 'up' : 'down', 
        icon: Users,
        color: 'teal',
        description: 'Healthy stakeholder relationships'
      },
      { 
        title: 'Knowledge Utilization', 
        value: '87%', 
        change: analytics?.knowledgeChange || 3, 
        trend: 'up', 
        icon: BookOpen,
        color: 'indigo',
        description: 'Knowledge base engagement rate'
      }
    ];
  };

  const generateAIInsights = async () => {
    try {
      const mockInsights = {
        recommendations: [
          {
            id: '1',
            title: 'Prioritization Optimization',
            description: 'Consider redistributing 2 medium-priority items to next sprint to focus on critical deliverables.',
            confidence: 0.85,
            action: 'Review backlog',
            impact: 'high'
          },
          {
            id: '2', 
            title: 'Stakeholder Engagement',
            description: 'Schedule follow-up meetings with 3 stakeholders showing decreased engagement.',
            confidence: 0.92,
            action: 'Schedule meetings',
            impact: 'medium'
          },
          {
            id: '3',
            title: 'Meeting Efficiency',
            description: 'Average meeting duration is 15% longer than optimal. Consider agenda optimization.',
            confidence: 0.78,
            action: 'Optimize agendas',
            impact: 'medium'
          }
        ],
        predictions: {
          sprintCompletion: 87,
          riskFactors: [
            { factor: 'Resource availability', level: 'medium', description: '2 team members have conflicting priorities' },
            { factor: 'External dependencies', level: 'high', description: '3 priorities depend on external API updates' }
          ],
          opportunities: [
            { opportunity: 'Process automation', impact: 'high', description: 'Automate 40% of routine tasks' },
            { opportunity: 'Knowledge sharing', impact: 'medium', description: 'Cross-team collaboration potential' }
          ]
        },
        trends: {
          productivity: [78, 82, 79, 85, 87, 84, 89],
          stakeholderSatisfaction: [88, 91, 87, 93, 89, 95, 92],
          deliveryVelocity: [42, 38, 45, 41, 48, 44, 47]
        }
      };
      
      return mockInsights;
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return null;
    }
  };

  const toggleWidget = (widgetId: string) => {
    const newExpanded = new Set(expandedWidgets);
    if (newExpanded.has(widgetId)) {
      newExpanded.delete(widgetId);
    } else {
      newExpanded.add(widgetId);
    }
    setExpandedWidgets(newExpanded);
  };

  const getMetricColorClasses = (color: string) => {
    const colors = {
      green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', icon: 'text-green-600' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', icon: 'text-blue-600' },
      red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', icon: 'text-red-600' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', icon: 'text-yellow-600' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', icon: 'text-purple-600' },
      teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200', icon: 'text-teal-600' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', icon: 'text-indigo-600' }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up' || change > 0) return <ArrowUp size={16} className="text-green-600" />;
    if (trend === 'down' || change < 0) return <ArrowDown size={16} className="text-red-600" />;
    return <Minus size={16} className="text-gray-600" />;
  };

  const getTrendText = (trend: string, change: number) => {
    if (trend === 'up' || change > 0) return 'text-green-600';
    if (trend === 'down' || change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const handleRecommendationAction = (action: string) => {
    if (!onNavigate) return;
    
    switch (action) {
      case 'Review backlog':
        onNavigate('priorities');
        break;
      case 'Schedule meetings':
        onNavigate('meetings');
        break;
      case 'Optimize agendas':
        onNavigate('meetings');
        break;
      default:
        console.log('Action not mapped:', action);
    }
  };

  const metrics = dashboardData?.metrics || [];
  const recentActivities = [
    { id: 1, type: 'Priority', description: 'High-priority feature completed', time: '2h ago', icon: Target },
    { id: 2, type: 'Meeting', description: 'Stakeholder review completed', time: '4h ago', icon: Calendar },
    { id: 3, type: 'Insight', description: 'AI recommendation implemented', time: '1d ago', icon: Brain },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading unified dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Brain className="mr-3 text-blue-600" size={28} /> 
              AI Command Center
            </h2>
            <p className="text-gray-600 mt-1">Unified intelligence across all {applyTerminology('product')} activities</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button 
              onClick={loadUnifiedData}
              className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric: any) => {
          const colorClasses = getMetricColorClasses(metric.color);
          const Icon = metric.icon;
          
          return (
            <div key={metric.title} className={`bg-white rounded-lg border ${colorClasses.border} p-4 hover:shadow-md transition-all`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${colorClasses.bg}`}>
                  <Icon size={20} className={colorClasses.icon} />
                </div>
                {metric.change !== 0 && (
                  <div className="flex items-center text-sm">
                    {getTrendIcon(metric.trend, metric.change)}
                  </div>
                )}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
              {metric.change !== 0 && (
                <div className={`flex items-center mt-2 text-xs ${getTrendText(metric.trend, metric.change)}`}>
                  {Math.abs(metric.change) > 0 && (
                    <span>
                      {metric.change > 0 ? '+' : ''}{metric.change}
                      {metric.title.includes('%') ? '' : ' from last period'}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AI Insights */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Zap className="mr-2 text-yellow-600" size={20} /> 
                  AI Insights & Recommendations
                </h3>
                <button 
                  onClick={() => toggleWidget('insights')}
                  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                >
                  <Maximize2 size={16} />
                </button>
              </div>
            </div>
            <div className="p-6">
              {aiInsights?.recommendations ? (
                <div className="space-y-4">
                  {aiInsights.recommendations.slice(0, expandedWidgets.has('insights') ? undefined : 2).map((rec: any) => (
                    <div key={rec.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{rec.title}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rec.impact === 'high' ? 'bg-red-100 text-red-800' :
                            rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {rec.impact} impact
                          </span>
                          <span className="text-xs text-gray-500">{Math.round(rec.confidence * 100)}% confidence</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                      <button 
                        onClick={() => handleRecommendationAction(rec.action)}
                        className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                      >
                        {rec.action}
                      </button>
                    </div>
                  ))}
                  {!expandedWidgets.has('insights') && aiInsights.recommendations.length > 2 && (
                    <button 
                      onClick={() => toggleWidget('insights')}
                      className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                    >
                      Show {aiInsights.recommendations.length - 2} more insights →
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Brain size={32} className="mx-auto mb-2 opacity-50" />
                  <p>AI insights are being generated...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <div className="lg:col-span-4 space-y-6">

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-semibold text-gray-700 flex items-center">
                <Activity size={16} className="mr-2 text-purple-600" /> 
                Recent Activity
              </h4>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {recentActivities.map(activity => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Icon size={14} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Risk & Opportunity Radar */}
          {aiInsights?.predictions && (
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-700 flex items-center">
                  <AlertTriangle size={16} className="mr-2 text-orange-600" /> 
                  Risk & Opportunities
                </h4>
              </div>
              <div className="p-4 space-y-3">
                {aiInsights.predictions.riskFactors?.slice(0, 2).map((risk: any, idx: number) => (
                  <div key={`risk-${idx}`} className="flex items-start space-x-2">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      risk.level === 'high' ? 'bg-red-500' :
                      risk.level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{risk.factor}</p>
                      <p className="text-xs text-gray-600">{risk.description}</p>
                    </div>
                  </div>
                ))}
                {aiInsights.predictions.opportunities?.slice(0, 1).map((opp: any, idx: number) => (
                  <div key={`opp-${idx}`} className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">💡 {opp.opportunity}</p>
                      <p className="text-xs text-gray-600">{opp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;