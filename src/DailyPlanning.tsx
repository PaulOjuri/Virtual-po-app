import React, { useState } from 'react';
import { Calendar, CheckSquare, Clock, BarChart3, Plus, Brain, Filter } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Done';
  dueDate: string;
}

interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

const DailyPlanning: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
  const [filterDate, setFilterDate] = useState('2025-08-20');

  const [tasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Finalize Xtra App Requirements',
      priority: 'High',
      status: 'In Progress',
      dueDate: '2025-08-25',
    },
    {
      id: 2,
      title: 'Review Stakeholder Feedback',
      priority: 'Medium',
      status: 'To Do',
      dueDate: '2025-08-20',
    },
  ]);

  const [meetings] = useState<Meeting[]>([
    {
      id: 1,
      title: 'Xtra App Sprint Planning',
      date: '2025-08-20',
      time: '10:00 AM',
      status: 'Scheduled',
    },
    {
      id: 2,
      title: 'Product Roadmap Update',
      date: '2025-08-20',
      time: '11:00 AM',
      status: 'Scheduled',
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDailyMetrics = () => {
    const todayTasks = tasks.filter(t => t.dueDate === filterDate).length;
    const todayMeetings = meetings.filter(m => m.date === filterDate).length;
    const highPriorityTasks = tasks.filter(t => t.priority === 'High' && t.dueDate === filterDate).length;
    const completedToday = tasks.filter(t => t.status === 'Done' && t.dueDate === filterDate).length;

    return {
      todayTasks,
      todayMeetings,
      highPriorityTasks,
      completedToday,
      recommendations: [
        'Focus on finalizing Xtra App requirements today',
        'Prepare for Sprint Planning meeting at 10:00 AM',
        'Review stakeholder feedback before EOD',
      ],
    };
  };

  const metrics = getDailyMetrics();

  const filteredTasks = tasks.filter(task => task.dueDate === filterDate);
  const filteredMeetings = meetings.filter(meeting => meeting.date === filterDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Daily Planning</h2>
          <p className="text-slate-600 mt-1">AI-driven daily task and meeting scheduler</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus size={20} />
            <span>Add Task/Meeting</span>
          </button>
        </div>
      </div>

      {/* AI Daily Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-blue-900">AI Daily Insights</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {metrics.recommendations.map((recommendation, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckSquare className="text-blue-500" size={16} />
                <span className="font-medium text-gray-900">Smart Suggestion</span>
              </div>
              <p className="text-sm text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex space-x-4 items-center">
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-600" />
          <input
            type="date"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Daily Overview', icon: Calendar },
            { id: 'analytics', label: 'Daily Analytics', icon: BarChart3 },
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

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-semibold mb-4">Today's Tasks</h3>
            <div className="space-y-4">
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <div
                    key={task.id}
                    className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Status: {task.status}</span>
                      <span>•</span>
                      <span>Due: {task.dueDate}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center">No tasks scheduled for this date.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-semibold mb-4">Today's Meetings</h3>
            <div className="space-y-4">
              {filteredMeetings.length > 0 ? (
                filteredMeetings.map(meeting => (
                  <div
                    key={meeting.id}
                    className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${getStatusColor(meeting.status)}`}>
                        {meeting.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Date: {meeting.date}</span>
                      <span>•</span>
                      <span>Time: {meeting.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center">No meetings scheduled for this date.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.todayTasks}</p>
              </div>
              <CheckSquare className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Meetings</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.todayMeetings}</p>
              </div>
              <Calendar className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High-Priority Tasks</p>
                <p className="text-2xl font-bold text-red-600">{metrics.highPriorityTasks}</p>
              </div>
              <Clock className="text-red-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-green-600">{metrics.completedToday}</p>
              </div>
              <CheckSquare className="text-green-600" size={32} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyPlanning;
