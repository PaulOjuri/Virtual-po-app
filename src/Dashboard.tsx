import React, { useState } from 'react';
import { 
  BarChart3, Target, Users, Calendar, Mail, TrendingUp, TrendingDown, 
  Clock, CheckCircle, AlertCircle, Zap, Brain, ArrowRight, Plus, 
  Activity, MessageSquare, FileText, Star, Bell, Settings, RefreshCw,
  ChevronUp, ChevronDown, Eye, ArrowUpRight, DollarSign, Package,
  Truck, AlertTriangle, Download, GitBranch, Code, Sparkles
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Product Owner Metrics
  const productMetrics = [
    {
      title: 'Active Priorities',
      value: '24',
      change: '+12.5%',
      changeType: 'positive',
      icon: Target,
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      changeColor: 'text-green-600'
    },
    {
      title: 'Sprint Velocity', 
      value: '47',
      change: '+23.4%',
      changeType: 'positive',
      icon: Zap,
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      changeColor: 'text-green-600'
    },
    {
      title: 'Stakeholder Health',
      value: '92%',
      change: '-2.1%',
      changeType: 'negative',
      icon: Users,
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      changeColor: 'text-red-600'
    },
    {
      title: 'Feature Completion',
      value: '87%',
      change: '+8.3%',
      changeType: 'positive',
      icon: CheckCircle,
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      changeColor: 'text-green-600'
    }
  ];

  const sprintData = [
    { sprint: 'Sprint 19', planned: 45, completed: 42, carryover: 3 },
    { sprint: 'Sprint 20', planned: 38, completed: 35, carryover: 5 },
    { sprint: 'Sprint 21', planned: 50, completed: 47, carryover: 2 },
    { sprint: 'Sprint 22', planned: 42, completed: 40, carryover: 4 },
    { sprint: 'Sprint 23', planned: 48, completed: 45, carryover: 1 },
    { sprint: 'Current', planned: 44, completed: 28, carryover: 0 }
  ];

  const activePriorities = [
    { 
      id: 'FEAT-001', 
      title: 'Payment System Security Enhancement', 
      assignee: 'Sarah Johnson', 
      status: 'In Progress', 
      priority: 'Critical',
      progress: 75,
      dueDate: '2025-08-25',
      storyPoints: 8
    },
    { 
      id: 'FEAT-002', 
      title: 'Mobile App Performance Optimization', 
      assignee: 'Mark Peters', 
      status: 'In Review', 
      priority: 'High',
      progress: 90,
      dueDate: '2025-08-28',
      storyPoints: 5
    },
    { 
      id: 'FEAT-003', 
      title: 'User Dashboard Redesign', 
      assignee: 'Lisa Chen', 
      status: 'In Progress', 
      priority: 'Medium',
      progress: 45,
      dueDate: '2025-09-02',
      storyPoints: 13
    },
    { 
      id: 'FEAT-004', 
      title: 'API Rate Limiting Implementation', 
      assignee: 'Dev Team', 
      status: 'Planning', 
      priority: 'High',
      progress: 15,
      dueDate: '2025-09-05',
      storyPoints: 8
    },
    { 
      id: 'FEAT-005', 
      title: 'Multi-language Support', 
      assignee: 'Frontend Team', 
      status: 'Backlog', 
      priority: 'Low',
      progress: 0,
      dueDate: '2025-09-15',
      storyPoints: 21
    }
  ];

  const upcomingActivities = [
    { date: 'Today', activity: 'Sprint Planning Meeting', type: 'meeting', time: '2:00 PM' },
    { date: 'Tomorrow', activity: 'Stakeholder Demo - Payment Features', type: 'demo', time: '10:00 AM' },
    { date: 'Aug 28', activity: 'Product Roadmap Review', type: 'review', time: '3:00 PM' },
    { date: 'Aug 30', activity: 'User Research Synthesis', type: 'research', time: '1:30 PM' }
  ];

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'In Progress': return { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' };
      case 'In Review': return { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' };
      case 'Planning': return { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' };
      case 'Backlog': return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
      case 'Done': return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch(priority) {
      case 'Critical': return { bg: 'bg-red-100', text: 'text-red-800' };
      case 'High': return { bg: 'bg-orange-100', text: 'text-orange-800' };
      case 'Medium': return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'Low': return { bg: 'bg-blue-100', text: 'text-blue-800' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const getActivityTypeConfig = (type: string) => {
    switch(type) {
      case 'meeting': return { bg: 'bg-blue-100', text: 'text-blue-800', icon: Users };
      case 'demo': return { bg: 'bg-green-100', text: 'text-green-800', icon: Eye };
      case 'review': return { bg: 'bg-purple-100', text: 'text-purple-800', icon: FileText };
      case 'research': return { bg: 'bg-orange-100', text: 'text-orange-800', icon: Brain };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock };
    }
  };

  const maxSprintValue = Math.max(...sprintData.map(d => d.planned));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Owner Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor product development and stakeholder activities</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button className="btn-secondary flex items-center space-x-2">
              <Download size={16} />
              <span>Export</span>
            </button>
            <button className="btn-primary flex items-center space-x-2">
              <Plus size={16} />
              <span>New Priority</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {productMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className={`stat-card ${metric.bgColor} animate-slide-up`} style={{animationDelay: `${index * 100}ms`}}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${metric.iconBg}`}>
                    <Icon className={`${metric.iconColor} w-6 h-6`} />
                  </div>
                  <div className={`flex items-center text-sm font-semibold ${metric.changeColor}`}>
                    {metric.changeType === 'positive' ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {metric.change}
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</p>
                  <p className="text-gray-600 text-sm font-medium">{metric.title}</p>
                  <p className="text-gray-500 text-xs mt-1">vs last sprint</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sprint Progress and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sprint Velocity Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Sprint Velocity Trends</h2>
                  <p className="text-sm text-gray-600">Story points planned vs completed over recent sprints</p>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Planned</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600">Carryover</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {sprintData.map((sprint, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-900">{sprint.sprint}</span>
                      <span className="text-gray-600">
                        {sprint.completed}/{sprint.planned} points
                        {sprint.carryover > 0 && ` (+${sprint.carryover} carryover)`}
                      </span>
                    </div>
                    <div className="flex rounded-lg overflow-hidden h-8 bg-gray-100">
                      <div 
                        className="bg-green-500 transition-all duration-300" 
                        style={{width: `${(sprint.completed / maxSprintValue) * 100}%`}}
                        title={`Completed: ${sprint.completed} points`}
                      />
                      <div 
                        className="bg-blue-200 transition-all duration-300" 
                        style={{width: `${((sprint.planned - sprint.completed) / maxSprintValue) * 100}%`}}
                        title={`Remaining: ${sprint.planned - sprint.completed} points`}
                      />
                      {sprint.carryover > 0 && (
                        <div 
                          className="bg-orange-500 transition-all duration-300" 
                          style={{width: `${(sprint.carryover / maxSprintValue) * 100}%`}}
                          title={`Carryover: ${sprint.carryover} points`}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Activities</h2>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6 space-y-4">
              {upcomingActivities.map((item, index) => {
                const config = getActivityTypeConfig(item.type);
                const Icon = config.icon;
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${config.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{item.activity}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">{item.date}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{item.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Priorities Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Active Priorities</h2>
                <p className="text-sm text-gray-600">Current feature development status and progress</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1">
                <span>View backlog</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Feature</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Assignee</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Priority</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Story Points</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Due Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Progress</th>
                </tr>
              </thead>
              <tbody>
                {activePriorities.map((priority, index) => {
                  const statusConfig = getStatusConfig(priority.status);
                  const priorityConfig = getPriorityConfig(priority.priority);
                  
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-medium text-gray-900">{priority.title}</span>
                          <div className="text-xs text-gray-500 mt-1">{priority.id}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-900">{priority.assignee}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></div>
                          <span className={`status-chip ${statusConfig.bg} ${statusConfig.text}`}>
                            {priority.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`status-chip ${priorityConfig.bg} ${priorityConfig.text}`}>
                          {priority.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{priority.storyPoints}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-600 text-sm">{new Date(priority.dueDate).toLocaleDateString()}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-24">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                priority.progress === 100 ? 'bg-green-500' : 
                                priority.progress >= 50 ? 'bg-blue-500' : 
                                priority.progress > 0 ? 'bg-yellow-500' : 'bg-gray-400'
                              }`}
                              style={{ width: `${priority.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600 min-w-12">{priority.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
