import React, { useState, useEffect } from 'react';
import { useRole } from './contexts/RoleContext';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Clock, Users, Target, MessageSquare, CheckCircle, AlertTriangle, Activity, PieChart, LineChart, Filter, Download, RefreshCw, ArrowUp, ArrowDown, Minus, Brain, Zap, Star, FileText } from 'lucide-react';
import { 
  analyticsService,
  AnalyticsOverview,
  PriorityAnalytics,
  MeetingAnalytics,
  StakeholderMatrix,
  ActivityTimeline,
  EmailSentimentAnalytics,
  PriorityAging,
  CommunicationAnalytics,
  KnowledgeBaseAnalytics,
  PerformanceTrends,
  AIInsight
} from './services/analyticsService';

const Analytics: React.FC = () => {
  const { applyTerminology } = useRole();
  const [activeView, setActiveView] = useState<'overview' | 'priorities' | 'communication' | 'performance' | 'trends'>('overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Data state
  const [overviewData, setOverviewData] = useState<AnalyticsOverview | null>(null);
  const [priorityAnalytics, setPriorityAnalytics] = useState<PriorityAnalytics[]>([]);
  const [meetingAnalytics, setMeetingAnalytics] = useState<MeetingAnalytics[]>([]);
  const [stakeholderMatrix, setStakeholderMatrix] = useState<StakeholderMatrix[]>([]);
  const [activityTimeline, setActivityTimeline] = useState<ActivityTimeline[]>([]);
  const [emailSentiment, setEmailSentiment] = useState<EmailSentimentAnalytics[]>([]);
  const [priorityAging, setPriorityAging] = useState<PriorityAging[]>([]);
  const [communicationAnalytics, setCommunicationAnalytics] = useState<CommunicationAnalytics[]>([]);
  const [knowledgeBaseAnalytics, setKnowledgeBaseAnalytics] = useState<KnowledgeBaseAnalytics[]>([]);
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrends[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);

  // Load analytics data
  const loadAnalytics = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Load all analytics data in parallel
      const [
        overview,
        priorities,
        meetings,
        stakeholders,
        activity,
        sentiment,
        aging,
        communication,
        knowledgeBase,
        performance,
        insights,
        metrics
      ] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getPriorityAnalytics(),
        analyticsService.getMeetingAnalytics(),
        analyticsService.getStakeholderMatrix(),
        analyticsService.getActivityTimeline(),
        analyticsService.getEmailSentimentAnalytics(),
        analyticsService.getPriorityAging(),
        analyticsService.getCommunicationAnalytics(),
        analyticsService.getKnowledgeBaseAnalytics(),
        analyticsService.getPerformanceTrends(),
        analyticsService.getAIInsights(),
        analyticsService.getDashboardMetrics()
      ]);

      // Set all the state
      setOverviewData(overview);
      setPriorityAnalytics(priorities);
      setMeetingAnalytics(meetings);
      setStakeholderMatrix(stakeholders);
      setActivityTimeline(activity);
      setEmailSentiment(sentiment);
      setPriorityAging(aging);
      setCommunicationAnalytics(communication);
      setKnowledgeBaseAnalytics(knowledgeBase);
      setPerformanceTrends(performance);
      setAiInsights(insights);
      setDashboardMetrics(metrics);

    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and real-time subscription
  useEffect(() => {
    loadAnalytics();

    // Subscribe to real-time updates
    const unsubscribe = analyticsService.subscribeToAnalyticsUpdates(() => {
      loadAnalytics(true); // Refresh data when changes occur
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRefresh = () => {
    loadAnalytics(true);
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="text-green-500" size={16} />;
    if (current < previous) return <ArrowDown className="text-red-500" size={16} />;
    return <Minus className="text-gray-500" size={16} />;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatPercentage = (value: number) => `${Math.round(value)}%`;
  const formatNumber = (value: number) => value.toLocaleString();

  if (loading && !overviewData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (error && !overviewData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-16 w-16 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => loadAnalytics()}
          className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Analytics & Reporting</h2>
          <p className="text-slate-600 mt-1">Performance insights and data-driven recommendations</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2">
            <Download size={16} />
            <span>Export</span>
          </button>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-red-500" size={20} />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {aiInsights.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="text-purple-600" size={24} />
            <h3 className="text-lg font-semibold text-purple-900">AI-Powered Insights</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {aiInsights.slice(0, 3).map((insight, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="text-purple-500" size={16} />
                  <span className="font-medium text-gray-900">{insight.insight_title}</span>
                </div>
                <p className="text-sm text-gray-700">{insight.insight_description}</p>
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    insight.priority_level === 'high' ? 'bg-red-100 text-red-800' :
                    insight.priority_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {insight.priority_level} priority
                  </span>
                </div>
              </div>
            ))}
          </div>

          {aiInsights.length > 3 && (
            <div className="text-center">
              <button className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2">
                View all {aiInsights.length} insights
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'priorities', label: 'Priority Analytics', icon: Target },
            { id: 'communication', label: 'Communication', icon: MessageSquare },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'trends', label: 'Trends', icon: LineChart }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeView === tab.id
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

      {/* Overview Tab */}
      {activeView === 'overview' && overviewData && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Priority Metrics */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Target className="text-blue-600" size={24} />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {overviewData.total_priorities > 0 
                      ? formatPercentage((overviewData.completed_priorities / overviewData.total_priorities) * 100)
                      : '0%'
                    }
                  </p>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(overviewData.total_priorities)}</p>
                <p className="text-sm text-gray-600">Total Priorities</p>
                <p className="text-xs text-red-600 mt-1">{overviewData.critical_priorities} critical</p>
              </div>
            </div>

            {/* Meeting Metrics */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-green-100">
                  <Calendar className="text-green-600" size={24} />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="text-lg font-semibold text-green-600">{overviewData.upcoming_meetings}</p>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(overviewData.total_meetings)}</p>
                <p className="text-sm text-gray-600">Total Meetings</p>
                <p className="text-xs text-gray-600 mt-1">{Math.round(overviewData.avg_meeting_duration)}min avg</p>
              </div>
            </div>

            {/* Email Metrics */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-purple-100">
                  <MessageSquare className="text-purple-600" size={24} />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Unread</p>
                  <p className="text-lg font-semibold text-purple-600">{overviewData.unread_emails}</p>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(overviewData.total_emails)}</p>
                <p className="text-sm text-gray-600">Total Emails</p>
                <p className="text-xs text-green-600 mt-1">{overviewData.positive_emails} positive</p>
              </div>
            </div>

            {/* Stakeholder Metrics */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Users className="text-orange-600" size={24} />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Health</p>
                  <p className="text-lg font-semibold text-orange-600">{Math.round(overviewData.avg_relationship_health * 20)}%</p>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(overviewData.total_stakeholders)}</p>
                <p className="text-sm text-gray-600">Stakeholders</p>
                <p className="text-xs text-green-600 mt-1">{overviewData.key_stakeholders} key stakeholders</p>
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4">Knowledge Base</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Documents</span>
                  <span className="font-medium">{overviewData.total_documents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Starred</span>
                  <span className="font-medium">{overviewData.starred_documents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Folders</span>
                  <span className="font-medium">{overviewData.total_folders}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4">Daily Planning</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Tasks</span>
                  <span className="font-medium">{overviewData.total_tasks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium">{overviewData.completed_tasks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plans Created</span>
                  <span className="font-medium">{overviewData.total_plans}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4">Activity Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Items</span>
                  <span className="font-medium">
                    {overviewData.total_priorities + overviewData.total_meetings + overviewData.total_emails + overviewData.total_stakeholders}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium">{overviewData.completed_priorities + overviewData.completed_meetings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active</span>
                  <span className="font-medium">
                    {(overviewData.total_priorities - overviewData.completed_priorities) + overviewData.upcoming_meetings}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          {activityTimeline.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4">Recent Activity Timeline</h3>
              <div className="space-y-3">
                {activityTimeline.slice(0, 10).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {activity.activity_type === 'priority' && <Target size={16} className="text-blue-500" />}
                      {activity.activity_type === 'meeting' && <Calendar size={16} className="text-green-500" />}
                      {activity.activity_type === 'email' && <MessageSquare size={16} className="text-purple-500" />}
                      {activity.activity_type === 'stakeholder' && <Users size={16} className="text-orange-500" />}
                      {activity.activity_type === 'task' && <CheckCircle size={16} className="text-indigo-500" />}
                      <div>
                        <p className="font-medium text-sm capitalize">{activity.activity_type} Activity</p>
                        <p className="text-xs text-gray-500">{new Date(activity.activity_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">{activity.total_count} items</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Priority Analytics Tab */}
      {activeView === 'priorities' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Priority Distribution */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
              <div className="space-y-3">
                {priorityAnalytics
                  .reduce((acc: any[], item) => {
                    const existing = acc.find(p => p.priority_level === item.priority_level);
                    if (existing) {
                      existing.count += item.count;
                    } else {
                      acc.push({ priority_level: item.priority_level, count: item.count });
                    }
                    return acc;
                  }, [])
                  .map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          item.priority_level === 'critical' ? 'bg-red-500' :
                          item.priority_level === 'high' ? 'bg-orange-500' :
                          item.priority_level === 'medium' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-700 capitalize">{item.priority_level}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Priority Age Analysis */}
            {priorityAging.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-semibold mb-4">Priority Age Analysis</h3>
                <div className="space-y-3">
                  {priorityAging.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          item.age_group === '< 1 week' ? 'bg-green-500' :
                          item.age_group === '1-2 weeks' ? 'bg-yellow-500' :
                          item.age_group === '2-4 weeks' ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-700">{item.age_group}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900">{item.count} items</span>
                        <p className="text-xs text-gray-500">Avg urgency: {item.avg_urgency}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {priorityAging.some(item => item.age_group === '> 1 month' && item.count > 0) && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="text-yellow-600" size={16} />
                      <span className="text-sm font-medium text-yellow-800">
                        Some priorities are older than 1 month - consider review
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Performance Trends */}
          {performanceTrends.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4">Performance Trends (Last 12 Weeks)</h3>
              <div className="space-y-4">
                {performanceTrends.slice(0, 8).map((week, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">Week of {new Date(week.week_start).toLocaleDateString()}</span>
                      <span className="text-gray-600">
                        {week.priority_completion_rate}% completion rate
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 relative">
                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{ width: `${week.priority_completion_rate}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{week.completed_priorities}/{week.total_priorities} priorities</span>
                      <span>{week.completed_meetings}/{week.total_meetings} meetings</span>
                      <span>{week.completed_tasks}/{week.total_tasks} tasks</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Communication Tab */}
      {activeView === 'communication' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stakeholder Matrix */}
            {stakeholderMatrix.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-semibold mb-4">Stakeholder Matrix</h3>
                <div className="space-y-3">
                  {stakeholderMatrix.map((quadrant, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          quadrant.quadrant === 'manage_closely' ? 'bg-red-500' :
                          quadrant.quadrant === 'keep_satisfied' ? 'bg-yellow-500' :
                          quadrant.quadrant === 'keep_informed' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-700">
                          {quadrant.quadrant.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900">{quadrant.count}</span>
                        <p className="text-xs text-gray-500">{Math.round(quadrant.avg_health * 20)}% health</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Communication Frequency */}
            {communicationAnalytics.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-semibold mb-4">Communication Frequency</h3>
                <div className="space-y-3">
                  {communicationAnalytics.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {item.communication_frequency}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900">{item.stakeholder_count}</span>
                        <p className="text-xs text-gray-500">{item.total_communications} comms</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Email Sentiment */}
            {emailSentiment.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-semibold mb-4">Email Sentiment Trends</h3>
                <div className="space-y-3">
                  {emailSentiment
                    .reduce((acc: any[], item) => {
                      const existing = acc.find(s => s.sentiment === item.sentiment);
                      if (existing) {
                        existing.count += item.count;
                      } else {
                        acc.push({ sentiment: item.sentiment, count: item.count });
                      }
                      return acc;
                    }, [])
                    .map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            item.sentiment === 'positive' ? 'bg-green-500' :
                            item.sentiment === 'negative' ? 'bg-red-500' :
                            'bg-gray-500'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-700 capitalize">{item.sentiment}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Knowledge Base Analytics */}
          {knowledgeBaseAnalytics.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4">Knowledge Base Usage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {knowledgeBaseAnalytics.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText size={16} className="text-blue-500" />
                      <span className="font-medium text-sm uppercase">{item.file_type}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Star size={12} className="text-yellow-500" />
                      <span className="text-xs text-gray-600">{item.starred_count} starred</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{(item.avg_size / 1024 / 1024).toFixed(1)} MB avg</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Performance Tab */}
      {activeView === 'performance' && dashboardMetrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Priority Completion</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardMetrics.priorityCompletionRate}%
                  </p>
                </div>
                <CheckCircle className="text-green-600" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Meeting Efficiency</p>
                  <p className="text-2xl font-bold text-blue-600">{dashboardMetrics.meetingEfficiency}%</p>
                </div>
                <Calendar className="text-blue-600" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Stakeholder Health</p>
                  <p className="text-2xl font-bold text-purple-600">{dashboardMetrics.stakeholderHealthScore}%</p>
                </div>
                <Users className="text-purple-600" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Productivity Score</p>
                  <p className="text-2xl font-bold text-orange-600">{dashboardMetrics.productivityScore}%</p>
                </div>
                <Activity className="text-orange-600" size={32} />
              </div>
            </div>
          </div>

          {/* Weekly Performance Chart */}
          {performanceTrends.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4">Weekly Performance Trends</h3>
              <div className="space-y-4">
                {performanceTrends.map((week, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">
                        {new Date(week.week_start).toLocaleDateString()} - {new Date(new Date(week.week_start).getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-600">Priority: {week.priority_completion_rate}%</span>
                        <span className="text-gray-600">Meeting: {week.meeting_completion_rate}%</span>
                        <span className="text-gray-600">Task: {week.task_completion_rate}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Priorities</span>
                          <span>{week.completed_priorities}/{week.total_priorities}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${week.priority_completion_rate}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Meetings</span>
                          <span>{week.completed_meetings}/{week.total_meetings}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${week.meeting_completion_rate}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Tasks</span>
                          <span>{week.completed_tasks}/{week.total_tasks}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${week.task_completion_rate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trends Tab */}
      {activeView === 'trends' && (
        <div className="text-center py-12">
          <LineChart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Trend Analysis</h3>
          <p className="text-gray-600 mb-4">Predictive analytics and advanced visualizations coming soon</p>
          <button className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2">
            Configure Advanced Analytics
          </button>
        </div>
      )}
    </div>
  );
};

export default Analytics;