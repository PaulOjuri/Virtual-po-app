import React, { useState } from 'react';
import { Target, Filter, AlertTriangle, CheckSquare, Clock, BarChart3, Plus, Edit2, Brain } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Done';
  dueDate: string;
  assignee: string;
  category: string;
  tags: string[];
}

const PriorityManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'To Do' | 'In Progress' | 'Done'>('All');
  const [filterPriority, setFilterPriority] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  const [tasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Finalize Xtra App Requirements',
      description: 'Complete the detailed requirements document for the Xtra App redesign.',
      priority: 'High',
      status: 'In Progress',
      dueDate: '2025-08-25',
      assignee: 'Sarah Johnson',
      category: 'Product Development',
      tags: ['urgent', 'requirements'],
    },
    {
      id: 2,
      title: 'Review Stakeholder Feedback',
      description: 'Consolidate feedback from recent stakeholder meetings.',
      priority: 'Medium',
      status: 'To Do',
      dueDate: '2025-08-30',
      assignee: 'Mark Peters',
      category: 'Stakeholder Management',
      tags: ['feedback', 'analysis'],
    },
    {
      id: 3,
      title: 'Plan Sprint 3',
      description: 'Define user stories and tasks for the next sprint.',
      priority: 'High',
      status: 'To Do',
      dueDate: '2025-08-22',
      assignee: 'Lisa Chen',
      category: 'Planning',
      tags: ['sprint', 'agile'],
    },
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'To Do':
        return <Clock className="text-blue-600" size={16} />;
      case 'In Progress':
        return <AlertTriangle className="text-yellow-600" size={16} />;
      case 'Done':
        return <CheckSquare className="text-green-600" size={16} />;
      default:
        return null;
    }
  };

  const getTaskMetrics = () => {
    const totalTasks = tasks.length;
    const highPriority = tasks.filter(t => t.priority === 'High').length;
    const overdue = tasks.filter(t => new Date(t.dueDate) < new Date('2025-08-20')).length;
    const completionRate = (tasks.filter(t => t.status === 'Done').length / totalTasks) * 100;

    return {
      totalTasks,
      highPriority,
      overdue,
      completionRate: Math.round(completionRate),
      recommendations: [
        'Prioritize finalizing Xtra App requirements by 2025-08-25',
        'Schedule stakeholder feedback review with Mark Peters',
        'Start sprint planning session for Sprint 3 this week',
      ],
    };
  };

  const metrics = getTaskMetrics();

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'All' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'All' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Priority Management</h2>
          <p className="text-slate-600 mt-1">AI-driven task prioritization and tracking</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus size={20} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* AI Prioritization Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-blue-900">AI Prioritization Insights</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {metrics.recommendations.map((recommendation, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="text-blue-500" size={16} />
                <span className="font-medium text-gray-900">Smart Suggestion</span>
              </div>
              <p className="text-sm text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Task Overview', icon: Target },
            { id: 'analytics', label: 'Task Analytics', icon: BarChart3 },
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
      <div className="flex space-x-4 items-center">
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-600" />
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
          >
            <option value="All">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-600" />
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value as any)}
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Task List</h3>
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(task.status)}
                    <span>{task.status}</span>
                  </div>
                  <span>•</span>
                  <span>Due: {task.dueDate}</span>
                  <span>•</span>
                  <span>Assignee: {task.assignee}</span>
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
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalTasks}</p>
              </div>
              <Target className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{metrics.highPriority}</p>
              </div>
              <AlertTriangle className="text-red-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-green-600">{metrics.completionRate}%</p>
              </div>
              <CheckSquare className="text-green-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue Tasks</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.overdue}</p>
              </div>
              <Clock className="text-orange-600" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Task Details</h3>
            <div className="space-y-3 text-sm">
              <p><span className="font-medium">Title:</span> {selectedTask.title}</p>
              <p><span className="font-medium">Description:</span> {selectedTask.description}</p>
              <p>
                <span className="font-medium">Priority:</span>{' '}
                <span className={getPriorityColor(selectedTask.priority)}>{selectedTask.priority}</span>
              </p>
              <p><span className="font-medium">Status:</span> {selectedTask.status}</p>
              <p><span className="font-medium">Due Date:</span> {selectedTask.dueDate}</p>
              <p><span className="font-medium">Assignee:</span> {selectedTask.assignee}</p>
              <p><span className="font-medium">Category:</span> {selectedTask.category}</p>
              <p><span className="font-medium">Tags:</span> {selectedTask.tags.join(', ')}</p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                onClick={() => setSelectedTask(null)}
              >
                <span>Close</span>
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Edit2 size={16} />
                <span>Edit Task</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriorityManager;
