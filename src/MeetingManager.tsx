import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useRole } from './contexts/RoleContext';
import { Calendar, Users, Clock, BarChart3, Plus, Edit2, Brain, Filter, Target, CheckSquare, 
         X, Trash2, Video, MapPin, Tag, AlertCircle, Save, FileText, Activity } from 'lucide-react';
import { MeetingService, Meeting, MeetingAttendee, ActionItem, Decision } from './services/meetingService';
import AIChat from './components/AIChat';

const MeetingManager: React.FC = () => {
  const { user } = useAuth();
  const { applyTerminology, getActionLabel } = useRole();

  // Core state
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // View state
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'analytics'>('overview');
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'kanban'>('list');
  
  // Modal states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMeetingDetails, setShowMeetingDetails] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<'all' | Meeting['status']>('all');
  const [filterType, setFilterType] = useState<'all' | Meeting['meeting_type']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    location: '',
    meeting_type: 'general' as Meeting['meeting_type'],
    priority_level: 'medium' as Meeting['priority_level'],
    agenda: '',
    meeting_url: '',
    recurring: false,
    recurring_pattern: '',
    tags: [] as string[],
    attendees: [] as Omit<MeetingAttendee, 'id' | 'meeting_id' | 'user_id'>[]
  });
  
  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalMeetings: 0,
    completedMeetings: 0,
    averageDuration: 0,
    meetingsByType: {} as { [key: string]: number },
    attendanceRate: 0,
    upcomingMeetings: 0,
    actionItemsCreated: 0,
    decisionsRecorded: 0
  });


  // Load data on mount
  useEffect(() => {
    if (user) {
      loadMeetings();
      loadAnalytics();
    }
  }, [user]);

  // Functions
  const loadMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MeetingService.getAllMeetings();
      setMeetings(data);
    } catch (err) {
      console.error('Error loading meetings:', err);
      setError('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await MeetingService.getMeetingAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  };

  const handleCreateMeeting = async () => {
    
    if (!user) {
      setError('You must be logged in to create meetings');
      return;
    }

    if (!formData.title || !formData.date || !formData.time) {
      setError('Please fill in required fields (Title, Date, Time)');
      return;
    }

    try {
      setError(null);
      
      const meetingData = {
        ...formData,
        status: 'scheduled' as Meeting['status'],
        action_items: [],
        decisions: [],
        tags: formData.tags.filter(tag => tag.trim())
      };

      const newMeeting = await MeetingService.createMeeting(meetingData);
      
      setMeetings(prev => [newMeeting, ...prev]);
      resetForm();
      setShowCreateForm(false);
      await loadAnalytics();
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError(err instanceof Error ? err.message : 'Failed to create meeting');
    }
  };

  const handleUpdateMeeting = async (meeting: Meeting) => {
    
    if (!user) {
      setError('You must be logged in to update meetings');
      return;
    }

    try {
      setError(null);
      
      const meetingData = {
        ...formData,
        tags: formData.tags.filter(tag => tag.trim())
      };

      const updatedMeeting = await MeetingService.updateMeeting(meeting.id!, meetingData);
      setMeetings(prev => prev.map(m => m.id === updatedMeeting.id ? updatedMeeting : m));
      setEditingMeeting(null);
      setShowCreateForm(false);
      resetForm();
      await loadAnalytics();
    } catch (err) {
      console.error('Error updating meeting:', err);
      setError(err instanceof Error ? err.message : 'Failed to update meeting');
    }
  };

  const handleDeleteMeeting = async (meeting: Meeting) => {
    if (!window.confirm(`Are you sure you want to delete "${meeting.title}"?`)) return;
    
    
    try {
      setError(null);
      await MeetingService.deleteMeeting(meeting.id!);
      setMeetings(prev => prev.filter(m => m.id !== meeting.id));
      setShowMeetingDetails(false);
      await loadAnalytics();
    } catch (err) {
      console.error('Error deleting meeting:', err);
      setError('Failed to delete meeting');
    }
  };

  const handleStatusUpdate = async (meetingId: string, status: Meeting['status']) => {
    
    try {
      setError(null);
      await MeetingService.updateMeetingStatus(meetingId, status);
      setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, status } : m));
      await loadAnalytics();
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update meeting status');
    }
  };

  const startEdit = (meeting: Meeting) => {
    
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description || '',
      date: meeting.date,
      time: meeting.time,
      duration: meeting.duration,
      location: meeting.location || '',
      meeting_type: meeting.meeting_type,
      priority_level: meeting.priority_level,
      agenda: meeting.agenda || '',
      meeting_url: meeting.meeting_url || '',
      recurring: meeting.recurring,
      recurring_pattern: meeting.recurring_pattern || '',
      tags: meeting.tags,
      attendees: meeting.attendees || []
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: 60,
      location: '',
      meeting_type: 'general',
      priority_level: 'medium',
      agenda: '',
      meeting_url: '',
      recurring: false,
      recurring_pattern: '',
      tags: [],
      attendees: []
    });
    setEditingMeeting(null);
  };

  const addAttendee = () => {
    setFormData({
      ...formData,
      attendees: [...formData.attendees, {
        attendee_name: '',
        attendee_email: '',
        attendance_status: 'invited',
        is_organizer: false,
        is_required: true
      }]
    });
  };

  const updateAttendee = (index: number, field: keyof MeetingAttendee, value: any) => {
    const updatedAttendees = formData.attendees.map((attendee, i) => 
      i === index ? { ...attendee, [field]: value } : attendee
    );
    setFormData({ ...formData, attendees: updatedAttendees });
  };

  const removeAttendee = (index: number) => {
    setFormData({
      ...formData,
      attendees: formData.attendees.filter((_, i) => i !== index)
    });
  };

  // Filter meetings based on search and filters
  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (meeting.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (meeting.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || meeting.status === filterStatus;
    const matchesType = filterType === 'all' || meeting.meeting_type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Helper functions for styling
  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'postponed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Meeting['priority_level']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMeetingTypeIcon = (type: Meeting['meeting_type']) => {
    switch (type) {
      case 'sprint-planning': return <Target size={16} />;
      case 'retrospective': return <BarChart3 size={16} />;
      case 'standup': return <Activity size={16} />;
      case 'stakeholder': return <Users size={16} />;
      case 'one-on-one': return <Users size={16} />;
      default: return <Calendar size={16} />;
    }
  };

  // Debug handlers
  const handleAddMeetingClick = () => {
    setShowCreateForm(true);
  };

  const handleButtonHover = () => {
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading meetings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* DEBUG: State Display */}
      <div className="bg-yellow-100 p-3 rounded-lg border border-yellow-200">
        <h4 className="font-medium text-yellow-800 mb-2">DEBUG Information</h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <div>showCreateForm: {showCreateForm.toString()}</div>
          <div>User: {user?.email || 'none'}</div>
          <div>Meetings loaded: {meetings.length}</div>
          <div>Loading: {loading.toString()}</div>
          <div>Error: {error || 'none'}</div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{getActionLabel('schedule_meeting')} Management</h2>
          <p className="text-slate-600 mt-1">AI-driven {applyTerminology('meeting')} scheduling and insights</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleAddMeetingClick}
            onMouseEnter={handleButtonHover}
            className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
            style={{ 
              cursor: 'pointer',
              pointerEvents: 'auto',
              zIndex: 10,
              position: 'relative'
            }}
          >
            <Plus size={20} />
            <span>DEBUG: Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-red-500" size={20} />
              <p className="text-red-800">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* AI Meeting Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-blue-900">AI Meeting Insights</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="text-blue-500" size={16} />
              <span className="font-medium text-gray-900">Optimization Tip</span>
            </div>
            <p className="text-sm text-gray-700">
              You have {analytics.upcomingMeetings} upcoming meetings. Consider batching similar meetings for efficiency.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="text-green-500" size={16} />
              <span className="font-medium text-gray-900">Time Insight</span>
            </div>
            <p className="text-sm text-gray-700">
              Average meeting duration: {analytics.averageDuration} minutes. Consider shorter focused sessions.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <CheckSquare className="text-purple-500" size={16} />
              <span className="font-medium text-gray-900">Action Items</span>
            </div>
            <p className="text-sm text-gray-700">
              {analytics.actionItemsCreated} action items created across {analytics.completedMeetings} completed meetings.
            </p>
          </div>
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
                className={`px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 ${
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
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-600" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="postponed">Postponed</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Types</option>
            <option value="general">General</option>
            <option value="sprint-planning">Sprint Planning</option>
            <option value="retrospective">Retrospective</option>
            <option value="standup">Standup</option>
            <option value="review">Review</option>
            <option value="stakeholder">Stakeholder</option>
            <option value="one-on-one">One-on-One</option>
          </select>

          <div className="text-sm text-gray-600 ml-auto">
            Showing {filteredMeetings.length} of {meetings.length} meetings
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="space-y-4">
            {filteredMeetings.map(meeting => (
              <div
                key={meeting.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getMeetingTypeIcon(meeting.meeting_type)}
                      <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded font-medium ${getStatusColor(meeting.status)}`}>
                        {meeting.status.replace('-', ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded font-medium ${getPriorityColor(meeting.priority_level)}`}>
                        {meeting.priority_level}
                      </span>
                    </div>
                    
                    {meeting.description && (
                      <p className="text-gray-600 text-sm mb-3">{meeting.description}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{meeting.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{meeting.time} ({meeting.duration}min)</span>
                      </div>
                      {meeting.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin size={14} />
                          <span>{meeting.location}</span>
                        </div>
                      )}
                      {meeting.attendees && meeting.attendees.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Users size={14} />
                          <span>{meeting.attendees.length} attendees</span>
                        </div>
                      )}
                    </div>

                    {meeting.tags && meeting.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {meeting.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={meeting.status}
                      onChange={(e) => handleStatusUpdate(meeting.id!, e.target.value as Meeting['status'])}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="postponed">Postponed</option>
                    </select>
                    
                    <button
                      onClick={() => {
                        setSelectedMeeting(meeting);
                        setShowMeetingDetails(true);
                      }}
                      className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                      title="View details"
                    >
                      <FileText size={16} />
                    </button>
                    
                    <button
                      onClick={() => startEdit(meeting)}
                      className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                      title="Edit meeting"
                    >
                      <Edit2 size={16} />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteMeeting(meeting)}
                      className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                      title="Delete meeting"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredMeetings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
                <p className="text-gray-600 mb-4">
                  {meetings.length === 0 
                    ? "Get started by scheduling your first meeting." 
                    : "Try adjusting your search or filters."}
                </p>
                {meetings.length === 0 && (
                  <button
                    onClick={handleAddMeetingClick}
                    className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Schedule Meeting</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Calendar View</h3>
          <div className="text-center py-12">
            <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Calendar</h3>
            <p className="text-gray-600 mb-4">Advanced calendar view coming in next update</p>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Meetings</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalMeetings}</p>
              </div>
              <Calendar className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.upcomingMeetings}</p>
              </div>
              <Clock className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{analytics.completedMeetings}</p>
              </div>
              <CheckSquare className="text-green-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.averageDuration}m</p>
              </div>
              <Clock className="text-purple-600" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Meeting Modal */}
      {showCreateForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateForm(false);
            }
          }}
        >
          <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ zIndex: 10000 }}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingMeeting ? 'Edit Meeting (DEBUG)' : 'Schedule New Meeting (DEBUG)'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* DEBUG: Show form state */}
              <div className="bg-blue-50 p-3 rounded border">
                <h4 className="font-medium text-blue-800 mb-2">DEBUG: Form State</h4>
                <div className="text-xs text-blue-700">
                  <div>Title: {formData.title || '(empty)'}</div>
                  <div>Date: {formData.date || '(empty)'}</div>
                  <div>Time: {formData.time || '(empty)'}</div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({...formData, title: e.target.value});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter meeting title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of the meeting"
                  />
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => {
                      setFormData({...formData, date: e.target.value});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => {
                      setFormData({...formData, time: e.target.value});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="480"
                    step="15"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Test Save Button */}
              <div className="bg-green-50 p-4 rounded border">
                <p className="text-green-800 font-medium mb-2">DEBUG: Test functionality</p>
                <p className="text-sm text-green-700 mb-3">
                  Click below to test if the save functionality works. This will create a test meeting if all required fields are filled.
                </p>
                <button
                  onClick={() => {
                    if (editingMeeting) {
                      handleUpdateMeeting(editingMeeting);
                    } else {
                      handleCreateMeeting();
                    }
                  }}
                  disabled={!formData.title.trim() || !formData.date || !formData.time}
                  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  <span>{editingMeeting ? 'Update Meeting (DEBUG)' : 'Create Meeting (DEBUG)'}</span>
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Details Modal */}
      {showMeetingDetails && selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedMeeting.title}</h2>
                  <p className="text-gray-600">{selectedMeeting.date} at {selectedMeeting.time}</p>
                </div>
                <button
                  onClick={() => {
                    setShowMeetingDetails(false);
                  }}
                  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Meeting Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded font-medium ${getStatusColor(selectedMeeting.status)}`}>
                        {selectedMeeting.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Priority:</span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded font-medium ${getPriorityColor(selectedMeeting.priority_level)}`}>
                        {selectedMeeting.priority_level}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-2 font-medium capitalize">{selectedMeeting.meeting_type.replace('-', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-2 font-medium">{selectedMeeting.duration} minutes</span>
                    </div>
                  </div>
                </div>

                {selectedMeeting.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600 text-sm">{selectedMeeting.description}</p>
                  </div>
                )}

                {selectedMeeting.agenda && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Agenda</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{selectedMeeting.agenda}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => startEdit(selectedMeeting)}
                className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
              >
                <Edit2 size={16} />
                <span>Edit Meeting</span>
              </button>
              <button
                onClick={() => setShowMeetingDetails(false)}
                className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Assistant */}
      <AIChat 
        currentContext="meetings"
        contextData={{
          meetings: meetings,
          viewMode: viewMode
        }}
      />
    </div>
  );
};

export default MeetingManager;