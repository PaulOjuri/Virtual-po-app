import React, { useState } from 'react';
import { Calendar, Users, Clock, BarChart3, Plus, Edit2, Brain, Filter, Target, CheckSquare } from 'lucide-react';

interface Meeting {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  attendees: string[];
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  location: string;
  tags: string[];
}

const MeetingManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'analytics'>('overview');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Scheduled' | 'Completed' | 'Cancelled'>('All');

  const [meetings] = useState<Meeting[]>([
    {
      id: 1,
      title: 'Xtra App Sprint Planning',
      description: 'Plan user stories and tasks for Sprint 3.',
      date: '2025-08-22',
      time: '10:00 AM',
      attendees: ['Sarah Johnson', 'Mark Peters', 'Lisa Chen'],
      status: 'Scheduled',
      location: 'Zoom',
      tags: ['sprint', 'planning'],
    },
    {
      id: 2,
      title: 'Stakeholder Feedback Review',
      description: 'Discuss feedback from recent stakeholder surveys.',
      date: '2025-08-18',
      time: '2:00 PM',
      attendees: ['Mark Peters', 'Lisa Chen'],
      status: 'Completed',
      location: 'Conference Room A',
      tags: ['feedback', 'stakeholders'],
    },
    {
      id: 3,
      title: 'Product Roadmap Update',
      description: 'Review and update the product roadmap with executives.',
      date: '2025-08-25',
      time: '11:00 AM',
      attendees: ['Lisa Chen', 'Sarah Johnson'],
      status: 'Scheduled',
      location: 'Teams',
      tags: ['roadmap', 'executive'],
    },
  ]);

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

  const getMeetingMetrics = () => {
    const totalMeetings = meetings.length;
    const upcoming = meetings.filter(m => new Date(m.date) >= new Date('2025-08-20')).length;
    const completed = meetings.filter(m => m.status === 'Completed').length;
    const highPriorityAttendees = meetings.filter(m => m.attendees.includes('Lisa Chen')).length;

    return {
      totalMeetings,
      upcoming,
      completed,
      highPriorityAttendees,
      recommendations: [
        'Prepare agenda for Xtra App Sprint Planning meeting',
        'Follow up on action items from Stakeholder Feedback Review',
        'Schedule prep call for Product Roadmap Update with Lisa Chen',
      ],
    };
  };

  const metrics = getMeetingMetrics();

  const filteredMeetings = meetings.filter(meeting => {
    return filterStatus === 'All' || meeting.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Meeting Management</h2>
          <p className="text-slate-600 mt-1">AI-driven meeting scheduling and insights</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus size={20} />
            <span>Add Meeting</span>
          </button>
        </div>
      </div>

      {/* AI Meeting Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-blue-900">AI Meeting Insights</h3>
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
            { id: 'overview', label: 'Meeting Overview', icon: Calendar },
            { id: 'calendar', label: 'Calendar View', icon: Calendar },
            { id: 'analytics', label: 'Meeting Analytics', icon: BarChart3 },
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
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Meeting List</h3>
          <div className="space-y-4">
            {filteredMeetings.map(meeting => (
              <div
                key={meeting.id}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedMeeting(meeting)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                    <p className="text-sm text-gray-600">{meeting.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(meeting.status)}`}>
                    {meeting.status}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Date: {meeting.date}</span>
                  <span>•</span>
                  <span>Time: {meeting.time}</span>
                  <span>•</span>
                  <span>Location: {meeting.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Calendar View</h3>
          <div className="text-center py-12">
            <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Calendar</h3>
            <p className="text-gray-600 mb-4">Visualize meetings in a calendar format</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Load Calendar
            </button>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Meetings</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalMeetings}</p>
              </div>
              <Calendar className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Meetings</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.upcoming}</p>
              </div>
              <Clock className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Meetings</p>
                <p className="text-2xl font-bold text-green-600">{metrics.completed}</p>
              </div>
              <CheckSquare className="text-green-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High-Priority Attendees</p>
                <p className="text-2xl font-bold text-red-600">{metrics.highPriorityAttendees}</p>
              </div>
              <Users className="text-red-600" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Meeting Details</h3>
            <div className="space-y-3 text-sm">
              <p><span className="font-medium">Title:</span> {selectedMeeting.title}</p>
              <p><span className="font-medium">Description:</span> {selectedMeeting.description}</p>
              <p><span className="font-medium">Date:</span> {selectedMeeting.date}</p>
              <p><span className="font-medium">Time:</span> {selectedMeeting.time}</p>
              <p><span className="font-medium">Status:</span>{' '}
                <span className={getStatusColor(selectedMeeting.status)}>{selectedMeeting.status}</span>
              </p>
              <p><span className="font-medium">Location:</span> {selectedMeeting.location}</p>
              <p><span className="font-medium">Attendees:</span> {selectedMeeting.attendees.join(', ')}</p>
              <p><span className="font-medium">Tags:</span> {selectedMeeting.tags.join(', ')}</p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                onClick={() => setSelectedMeeting(null)}
              >
                <span>Close</span>
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Edit2 size={16} />
                <span>Edit Meeting</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingManager;
