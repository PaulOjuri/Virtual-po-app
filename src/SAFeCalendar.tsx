import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useRole } from './contexts/RoleContext';
import { 
  Calendar, ChevronLeft, ChevronRight, Plus, Filter, Settings, 
  Clock, Users, MapPin, Bell, BellOff, Edit, Trash2, Copy,
  RefreshCw, Download, Upload, Search, Tag, AlertCircle,
  CheckCircle, Play, Pause, MoreHorizontal, X, Eye, EyeOff,
  Target, Zap, GitBranch, Layers, TrendingUp, BookOpen,
  Video, Phone, Globe, FileText, Star, Archive
} from 'lucide-react';
import { Calendar as BigCalendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-custom.css';
import { CalendarService, CalendarEvent, SAFeCeremony, PIEvent, CeremonyType, RecurrencePattern } from './services/calendarService';
import { NotesService } from './services/notesService';
import AIChat from './components/AIChat';

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  ceremonyTypes?: any[];
}

const SAFeCalendar: React.FC = () => {
  const { user } = useAuth();
  const { applyTerminology, getActionLabel, currentRole } = useRole();

  // Core state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [ceremonies, setCeremonies] = useState<SAFeCeremony[]>([]);
  const [piEvents, setPIEvents] = useState<PIEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'timebox' | 'agenda'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayEvents, setShowDayEvents] = useState(false);

  // Filter state
  const [ceremonyFilter, setCeremonyFilter] = useState<CeremonyType | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    type: 'sprint_planning',
    startTime: new Date(),
    endTime: new Date(),
    location: '',
    isVirtual: true,
    attendees: [],
    reminderMinutes: [15, 60],
    recurrence: undefined
  });

  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // SAFe ceremony types with role relevance
  const ceremonyTypes: { 
    type: CeremonyType; 
    label: string; 
    description: string; 
    roles: string[];
    color: string;
    icon: React.ComponentType<any>;
  }[] = [
    {
      type: 'sprint_planning',
      label: 'Sprint Planning',
      description: 'Plan work for the upcoming sprint',
      roles: ['product_owner', 'scrum_master', 'team_member'],
      color: 'bg-blue-500',
      icon: Target
    },
    {
      type: 'daily_standup',
      label: 'Daily Standup',
      description: 'Daily team synchronization',
      roles: ['scrum_master', 'team_member', 'product_owner'],
      color: 'bg-green-500',
      icon: Users
    },
    {
      type: 'sprint_review',
      label: 'Sprint Review',
      description: 'Demonstrate completed work',
      roles: ['product_owner', 'scrum_master', 'stakeholder'],
      color: 'bg-purple-500',
      icon: Eye
    },
    {
      type: 'sprint_retrospective',
      label: 'Sprint Retrospective',
      description: 'Reflect and improve team process',
      roles: ['scrum_master', 'team_member'],
      color: 'bg-orange-500',
      icon: RefreshCw
    },
    {
      type: 'backlog_refinement',
      label: 'Backlog Refinement',
      description: 'Refine and estimate backlog items',
      roles: ['product_owner', 'team_member'],
      color: 'bg-indigo-500',
      icon: BookOpen
    },
    {
      type: 'pi_planning',
      label: 'PI Planning',
      description: 'Program Increment planning event',
      roles: ['product_owner', 'scrum_master', 'release_train_engineer', 'product_manager'],
      color: 'bg-red-500',
      icon: GitBranch
    },
    {
      type: 'system_demo',
      label: 'System Demo',
      description: 'Demonstrate integrated system',
      roles: ['product_owner', 'release_train_engineer'],
      color: 'bg-cyan-500',
      icon: Play
    },
    {
      type: 'inspect_adapt',
      label: 'Inspect & Adapt',
      description: 'PI retrospective and planning',
      roles: ['all'],
      color: 'bg-yellow-500',
      icon: TrendingUp
    },
    {
      type: 'art_sync',
      label: 'ART Sync',
      description: 'Agile Release Train synchronization',
      roles: ['release_train_engineer', 'product_owner', 'scrum_master'],
      color: 'bg-pink-500',
      icon: Layers
    },
    {
      type: 'po_sync',
      label: 'PO Sync',
      description: 'Product Owner synchronization',
      roles: ['product_owner', 'product_manager'],
      color: 'bg-teal-500',
      icon: Target
    }
  ];

  useEffect(() => {
    loadCalendarData();
  }, [currentDate, ceremonyFilter, roleFilter]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const [eventsData, ceremoniesData, piEventsData] = await Promise.all([
        CalendarService.getEvents({
          startDate: getMonthStart(currentDate),
          endDate: getMonthEnd(currentDate),
          ceremonyType: ceremonyFilter === 'all' ? undefined : ceremonyFilter,
          includeCompleted: showCompleted
        }),
        CalendarService.getSAFeCeremonies(),
        CalendarService.getPIEvents()
      ]);

      setEvents(eventsData);
      setCeremonies(ceremoniesData);
      setPIEvents(piEventsData);
    } catch (err) {
      setError('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const getMonthStart = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getMonthEnd = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  const createEvent = async () => {
    try {
      const eventData = {
        ...formData,
        startTime: formData.startTime!,
        endTime: formData.endTime!,
        createdBy: user?.id || 'current-user'
      };

      const newEvent = await CalendarService.createEvent(eventData as CalendarEvent);
      
      // Add the new event to the events state
      setEvents(prev => [...prev, newEvent]);
      
      // Create reminders if specified
      if (formData.reminderMinutes?.length) {
        for (const minutes of formData.reminderMinutes) {
          const reminderTime = new Date(newEvent.startTime);
          reminderTime.setMinutes(reminderTime.getMinutes() - minutes);
          
          try {
            await NotesService.createReminder({
              calendarEventId: newEvent.id,
              reminderTime,
              type: 'ceremony',
              message: `${newEvent.title} starting in ${minutes} minutes`
            });
          } catch (reminderError) {
            // Reminder creation failed, but event was created successfully
          }
        }
      }

      setShowCreateForm(false);
      resetForm();
    } catch (err) {
      setError('Failed to create event');
    }
  };

  const updateEvent = async () => {
    if (!editingEvent) return;

    try {
      const updatedEvent = await CalendarService.updateEvent(editingEvent.id, formData);
      setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      setEditingEvent(null);
      setShowEventDetails(false);
      resetForm();
    } catch (err) {
      setError('Failed to update event');
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await CalendarService.deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      setShowEventDetails(false);
      setSelectedEvent(null);
    } catch (err) {
      setError('Failed to delete event');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'sprint_planning',
      startTime: new Date(),
      endTime: new Date(),
      location: '',
      isVirtual: true,
      attendees: [],
      reminderMinutes: [15, 60],
      recurrence: undefined
    });
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowDayEvents(true);
  };

  const getEventsForDay = (date: Date) => {
    if (!date) return [];
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    
    return filteredEvents.filter(event => {
      const eventStart = new Date(event.startTime);
      return eventStart >= dayStart && eventStart <= dayEnd;
    });
  };

  const filteredEvents = events.filter(event => {
    if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (ceremonyFilter !== 'all' && event.type !== ceremonyFilter) {
      return false;
    }

    if (roleFilter !== 'all') {
      const ceremonyConfig = ceremonyTypes.find(c => c.type === event.type);
      if (ceremonyConfig && !ceremonyConfig.roles.includes(roleFilter) && !ceremonyConfig.roles.includes('all')) {
        return false;
      }
    }

    return true;
  });


  const getUpcomingEvents = () => {
    const now = new Date();
    return filteredEvents
      .filter(event => new Date(event.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5);
  };

  const getTodayEvents = () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    return filteredEvents.filter(event => {
      const eventStart = new Date(event.startTime);
      return eventStart >= todayStart && eventStart <= todayEnd;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading calendar...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{applyTerminology('SAFe Calendar')}</h2>
          <p className="text-slate-600 mt-1">Track ceremonies, PI events, and agile activities</p>
        </div>

        <div className="flex items-center justify-start gap-3">
          <div className="relative w-64 h-10 bg-white border border-gray-300 rounded-lg shadow-sm flex items-center">
            <Search size={16} className="absolute left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 h-full w-full bg-transparent border-0 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-400"
            />
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* Filters and View Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">View:</span>
              {(['month', 'week', 'timebox', 'agenda'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 ${
                    viewMode === mode 
                      ? 'bg-green-200' 
                      : ''
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
            >
              <Filter size={16} />
              <span>Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Ceremony:</span>
                <select
                  value={ceremonyFilter}
                  onChange={(e) => setCeremonyFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Ceremonies</option>
                  {ceremonyTypes.map(ceremony => (
                    <option key={ceremony.type} value={ceremony.type}>
                      {ceremony.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="product_owner">Product Owner</option>
                  <option value="scrum_master">Scrum Master</option>
                  <option value="release_train_engineer">RTE</option>
                  <option value="product_manager">Product Manager</option>
                  <option value="team_member">Team Member</option>
                </select>
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show completed</span>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Navigation */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    const prev = new Date(currentDate);
                    prev.setMonth(prev.getMonth() - 1);
                    setCurrentDate(prev);
                  }}
                  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <h3 className="text-xl font-semibold text-gray-900">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                
                <button
                  onClick={() => {
                    const next = new Date(currentDate);
                    next.setMonth(next.getMonth() + 1);
                    setCurrentDate(next);
                  }}
                  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
              >
                Today
              </button>
            </div>

            {/* Calendar Content */}
            <div className="p-4">
              {viewMode === 'month' && (
                <MonthView
                  currentDate={currentDate}
                  events={filteredEvents}
                  onDateClick={handleDayClick}
                  onEventClick={(event) => {
                    setSelectedEvent(event);
                    setShowEventDetails(true);
                  }}
                  ceremonyTypes={ceremonyTypes}
                />
              )}

              {viewMode === 'week' && (
                <WeekView
                  currentDate={currentDate}
                  events={filteredEvents}
                  onDateClick={handleDayClick}
                  onEventClick={(event) => {
                    setSelectedEvent(event);
                    setShowEventDetails(true);
                  }}
                  ceremonyTypes={ceremonyTypes}
                />
              )}

              {viewMode === 'timebox' && (
                <TimeboxView
                  currentDate={currentDate}
                  events={filteredEvents}
                  ceremonies={ceremonyTypes}
                  onDateClick={setCurrentDate}
                  onEventClick={(event) => {
                    setSelectedEvent(event);
                    setShowEventDetails(true);
                  }}
                />
              )}
              
              {viewMode === 'agenda' && (
                <AgendaView
                  events={filteredEvents}
                  onEventClick={(event) => {
                    setSelectedEvent(event);
                    setShowEventDetails(true);
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Events */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Clock className="mr-2" size={18} />
              Today's Events
            </h4>
            
            <div className="space-y-3">
              {getTodayEvents().length === 0 ? (
                <p className="text-gray-500 text-sm">No events scheduled for today</p>
              ) : (
                getTodayEvents().map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    ceremonies={ceremonyTypes}
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowEventDetails(true);
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Calendar className="mr-2" size={18} />
              Upcoming Events
            </h4>
            
            <div className="space-y-3">
              {getUpcomingEvents().map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  ceremonies={ceremonyTypes}
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowEventDetails(true);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Ceremony Types Legend */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Ceremony Types</h4>
            
            <div className="space-y-2">
              {ceremonyTypes
                .filter(ceremony => 
                  ceremony.roles.includes('all') || 
                  ceremony.roles.includes(currentRole?.id || '') ||
                  roleFilter === 'all'
                )
                .map(ceremony => {
                  const Icon = ceremony.icon;
                  return (
                    <div key={ceremony.type} className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${ceremony.color}`}></div>
                      <Icon size={16} className="text-gray-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{ceremony.label}</p>
                        <p className="text-xs text-gray-500">{ceremony.description}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Day Events Modal */}
      {showDayEvents && selectedDate && (
        <DayEventsModal
          date={selectedDate}
          events={getEventsForDay(selectedDate)}
          ceremonies={ceremonyTypes}
          onClose={() => {
            setShowDayEvents(false);
            setSelectedDate(null);
          }}
          onEventClick={(event) => {
            setSelectedEvent(event);
            setShowEventDetails(true);
            setShowDayEvents(false);
          }}
        />
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          ceremonies={ceremonyTypes}
          onClose={() => {
            setShowEventDetails(false);
            setSelectedEvent(null);
          }}
          onEdit={(event) => {
            setEditingEvent(event);
            setFormData(event);
            setShowEventDetails(false);
          }}
          onDelete={deleteEvent}
        />
      )}

      {/* Create/Edit Event Modal */}
      {(showCreateForm || editingEvent) && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCreateForm(false);
                setEditingEvent(null);
                resetForm();
              }
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#111827' }}>
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (editingEvent) {
                  updateEvent();
                } else {
                  createEvent();
                }
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                    placeholder="Enter event title"
                    required
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      resize: 'vertical'
                    }}
                    placeholder="Enter event description"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startTime ? new Date(formData.startTime.getTime() - formData.startTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setFormData({ ...formData, startTime: new Date(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                      End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endTime ? new Date(formData.endTime.getTime() - formData.endTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setFormData({ ...formData, endTime: new Date(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Event Type
                  </label>
                  <select
                    value={formData.type || 'sprint_planning'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CeremonyType })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  >
                    {ceremonyTypes.map(ceremony => (
                      <option key={ceremony.type} value={ceremony.type}>
                        {ceremony.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingEvent(null);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg z-50">
          <div className="flex items-center">
            <AlertCircle size={16} className="mr-2" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 ml-4"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* AI Chat Assistant */}
      <AIChat 
        currentContext="calendar"
        contextData={{
          events: events,
          currentDate: currentDate,
          viewMode: viewMode
        }}
      />
    </div>
  );
};

// Helper Components
const MonthView: React.FC<CalendarViewProps> = ({ currentDate, events, onDateClick, onEventClick, ceremonyTypes = [] }) => {
  // Transform CalendarEvent to react-big-calendar format
  const bigCalendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.startTime),
    end: new Date(event.endTime),
    resource: event
  }));


  const handleSelectEvent = (event: any) => {
    onEventClick(event.resource);
  };

  const handleSelectSlot = (slotInfo: any) => {
    // Day click to show events for that day
    const selectedDate = new Date(slotInfo.start);
    onDateClick(selectedDate);
  };

  const handleNavigate = (date: Date) => {
    onDateClick(date);
  };

  const handleDrillDown = (date: Date) => {
    onDateClick(date);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm" style={{ height: '600px' }}>
      <BigCalendar
        localizer={localizer}
        events={bigCalendarEvents}
        startAccessor="start"
        endAccessor="end"
        view="month"
        onView={() => {}} // Prevent view changes since we control this externally
        views={['month']}
        date={currentDate}
        onNavigate={handleNavigate}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        onDrillDown={handleDrillDown}
        selectable
        popup
        drilldownView={null}
        style={{ height: '100%' }}
        className="rbc-calendar-safe"
        dayPropGetter={(date) => {
          const isToday = moment(date).isSame(moment(), 'day');
          const isCurrentMonth = moment(date).isSame(moment(currentDate), 'month');
          
          return {
            className: `${isToday ? 'rbc-today' : ''} ${!isCurrentMonth ? 'rbc-off-range' : ''} clickable-day`,
            style: {
              backgroundColor: isToday ? '#dbeafe' : !isCurrentMonth ? '#f9fafb' : 'white',
              cursor: 'pointer'
            }
          };
        }}
        eventPropGetter={(event) => {
          const ceremony = ceremonyTypes.find(c => c.type === event.resource.type);
          const colorMap: { [key: string]: string } = {
            'bg-blue-500': '#3b82f6',
            'bg-green-500': '#22c55e',
            'bg-purple-500': '#a855f7',
            'bg-orange-500': '#f97316',
            'bg-indigo-500': '#6366f1',
            'bg-red-500': '#ef4444',
            'bg-cyan-500': '#06b6d4',
            'bg-yellow-500': '#eab308',
            'bg-pink-500': '#ec4899',
            'bg-teal-500': '#14b8a6'
          };
          const backgroundColor = ceremony?.color ? colorMap[ceremony.color] || '#3b82f6' : '#3b82f6';
          
          return {
            style: {
              backgroundColor,
              borderRadius: '4px',
              border: 'none',
              color: 'white',
              fontSize: '12px'
            }
          };
        }}
        formats={{
          monthHeaderFormat: 'MMMM YYYY',
          dayHeaderFormat: 'dddd',
          dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
            `${localizer.format(start, 'MMM DD', culture)} - ${localizer.format(end, 'MMM DD', culture)}`
        }}
        components={{
          toolbar: () => null // Hide default toolbar since we have our own
        }}
      />
    </div>
  );
};

const AgendaView: React.FC<{
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}> = ({ events, onEventClick }) => {
  const groupedEvents = events.reduce((groups: { [date: string]: CalendarEvent[] }, event) => {
    const dateStr = new Date(event.startTime).toDateString();
    if (!groups[dateStr]) groups[dateStr] = [];
    groups[dateStr].push(event);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedEvents).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="space-y-6">
      {sortedDates.map(dateStr => (
        <div key={dateStr}>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {new Date(dateStr).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <div className="space-y-2">
            {groupedEvents[dateStr]
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .map(event => (
                <div
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(event.startTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const EventCard: React.FC<{
  event: CalendarEvent;
  ceremonies: any[];
  onClick: () => void;
}> = ({ event, ceremonies, onClick }) => {
  const ceremony = ceremonies.find(c => c.type === event.type);
  const Icon = ceremony?.icon || Calendar;
  
  return (
    <div
      onClick={onClick}
      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
    >
      <div className="flex items-start space-x-3">
        <div className={`w-3 h-3 rounded-full mt-2 ${ceremony?.color || 'bg-gray-400'}`}></div>
        <div className="flex-1 min-w-0">
          <h5 className="font-medium text-sm text-gray-900 truncate">{event.title}</h5>
          <p className="text-xs text-gray-600 mt-1">
            {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          {event.isVirtual && (
            <div className="flex items-center mt-1">
              <Video size={12} className="text-blue-500 mr-1" />
              <span className="text-xs text-blue-600">Virtual</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EventDetailsModal: React.FC<{
  event: CalendarEvent;
  ceremonies: any[];
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
}> = ({ event, ceremonies, onClose, onEdit, onDelete }) => {
  const ceremony = ceremonies.find(c => c.type === event.type);
  const Icon = ceremony?.icon || Calendar;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${ceremony?.color || 'bg-gray-400'}`}></div>
              <Icon size={20} className="text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">{event.title}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(event)}
                className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => onDelete(event.id)}
                className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-gray-900">{event.description || 'No description provided'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Start Time</h3>
              <p className="text-gray-900">
                {new Date(event.startTime).toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">End Time</h3>
              <p className="text-gray-900">
                {new Date(event.endTime).toLocaleString()}
              </p>
            </div>
          </div>

          {(event.location || event.isVirtual) && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
              <div className="flex items-center space-x-2">
                {event.isVirtual ? (
                  <>
                    <Video size={16} className="text-blue-500" />
                    <span className="text-blue-600">Virtual Meeting</span>
                  </>
                ) : (
                  <>
                    <MapPin size={16} className="text-gray-500" />
                    <span className="text-gray-900">{event.location}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {event.attendees && event.attendees.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Attendees</h3>
              <div className="flex flex-wrap gap-2">
                {event.attendees.map((attendee, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                    {attendee}
                  </span>
                ))}
              </div>
            </div>
          )}

          {event.reminderMinutes && event.reminderMinutes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Reminders</h3>
              <div className="flex items-center space-x-2">
                <Bell size={16} className="text-amber-500" />
                <span className="text-gray-900">
                  {event.reminderMinutes.map(mins => `${mins} min`).join(', ')} before
                </span>
              </div>
            </div>
          )}

          {ceremony && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Ceremony Type</h3>
              <div className="flex items-center space-x-2">
                <Icon size={16} className="text-gray-600" />
                <span className="text-gray-900">{ceremony.label}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{ceremony.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EventFormModal: React.FC<{
  event?: CalendarEvent | null;
  formData: Partial<CalendarEvent>;
  ceremonies: any[];
  onChange: (data: Partial<CalendarEvent>) => void;
  onSubmit: () => void;
  onClose: () => void;
}> = ({ event, formData, ceremonies, onChange, onSubmit, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {event ? 'Edit Event' : 'Create New Event'}
            </h2>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => onChange({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Event title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ceremony Type</label>
            <select
              value={formData.type || 'sprint_planning'}
              onChange={(e) => onChange({ ...formData, type: e.target.value as CeremonyType })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {ceremonies.map(ceremony => (
                <option key={ceremony.type} value={ceremony.type}>
                  {ceremony.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Event description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="datetime-local"
                value={formData.startTime ? new Date(formData.startTime.getTime() - formData.startTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                onChange={(e) => onChange({ ...formData, startTime: new Date(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="datetime-local"
                value={formData.endTime ? new Date(formData.endTime.getTime() - formData.endTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                onChange={(e) => onChange({ ...formData, endTime: new Date(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isVirtual || false}
                onChange={(e) => onChange({ ...formData, isVirtual: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Virtual meeting</span>
            </label>
          </div>

          {!formData.isVirtual && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => onChange({ ...formData, location: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Meeting location"
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
            >
              {event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Google Calendar-style Week View with time slots using react-big-calendar
const WeekView: React.FC<CalendarViewProps> = ({ currentDate, events, onDateClick, onEventClick, ceremonyTypes = [] }) => {
  // Transform CalendarEvent to react-big-calendar format
  const bigCalendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.startTime),
    end: new Date(event.endTime),
    resource: event
  }));

  const handleSelectEvent = (event: any) => {
    onEventClick(event.resource);
  };

  const handleSelectSlot = (slotInfo: any) => {
    // Day click to show events for that day
    const selectedDate = new Date(slotInfo.start);
    onDateClick(selectedDate);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm" style={{ height: '600px' }}>
      <BigCalendar
        localizer={localizer}
        events={bigCalendarEvents}
        startAccessor="start"
        endAccessor="end"
        view="week"
        onView={() => {}} // Prevent view changes since we control this externally
        views={['week']}
        date={currentDate}
        onNavigate={(date) => onDateClick(date)}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        popup
        step={30} // 30-minute time slots
        timeslots={2} // Two 30-minute slots per hour
        min={new Date(2024, 0, 1, 8, 0)} // Start at 8 AM
        max={new Date(2024, 0, 1, 20, 0)} // End at 8 PM
        style={{ height: '100%' }}
        className="rbc-calendar-safe"
        dayPropGetter={(date) => {
          const isToday = moment(date).isSame(moment(), 'day');
          
          return {
            className: isToday ? 'rbc-today' : '',
            style: {
              backgroundColor: isToday ? '#dbeafe' : 'white'
            }
          };
        }}
        eventPropGetter={(event) => {
          const ceremony = ceremonyTypes.find(c => c.type === event.resource.type);
          const colorMap: { [key: string]: string } = {
            'bg-blue-500': '#3b82f6',
            'bg-green-500': '#22c55e',
            'bg-purple-500': '#a855f7',
            'bg-orange-500': '#f97316',
            'bg-indigo-500': '#6366f1',
            'bg-red-500': '#ef4444',
            'bg-cyan-500': '#06b6d4',
            'bg-yellow-500': '#eab308',
            'bg-pink-500': '#ec4899',
            'bg-teal-500': '#14b8a6'
          };
          const backgroundColor = ceremony?.color ? colorMap[ceremony.color] || '#3b82f6' : '#3b82f6';
          
          return {
            style: {
              backgroundColor,
              borderRadius: '4px',
              border: 'none',
              color: 'white',
              fontSize: '12px'
            }
          };
        }}
        formats={{
          timeGutterFormat: 'h A',
          dayHeaderFormat: 'dddd M/D',
          dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
            `${localizer.format(start, 'MMM DD', culture)} - ${localizer.format(end, 'MMM DD', culture)}`
        }}
        components={{
          toolbar: () => null // Hide default toolbar since we have our own
        }}
      />
    </div>
  );
};

// SAFe Timebox View - organized by Program Increments and Iterations
const TimeboxView: React.FC<CalendarViewProps & {
  ceremonies: any[];
}> = ({ currentDate, events, ceremonies, onDateClick, onEventClick }) => {
  const currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;
  const currentYear = currentDate.getFullYear();
  
  // Group events by SAFe timeboxes
  const timeboxes = [
    {
      name: `PI ${currentQuarter} - ${currentYear}`,
      type: 'PI',
      startDate: new Date(currentYear, (currentQuarter - 1) * 3, 1),
      endDate: new Date(currentYear, currentQuarter * 3, 0),
      color: 'bg-purple-500'
    },
    {
      name: 'Innovation & Planning',
      type: 'IP',
      startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      endDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 7),
      color: 'bg-orange-500'
    }
  ];

  // Create sprints for current month
  const sprints = Array.from({ length: 4 }, (_, i) => {
    const sprintStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), i * 7 + 1);
    const sprintEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), (i + 1) * 7);
    return {
      name: `Sprint ${i + 1}`,
      type: 'Sprint',
      startDate: sprintStart,
      endDate: sprintEnd,
      color: 'bg-blue-500'
    };
  });

  const allTimeboxes = [...timeboxes, ...sprints];

  const getEventsForTimebox = (startDate: Date, endDate: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate >= startDate && eventDate <= endDate;
    });
  };

  const getCeremonyIcon = (ceremonyType: string) => {
    const ceremony = ceremonies.find(c => c.type === ceremonyType);
    return ceremony?.icon || Calendar;
  };

  const getCeremonyColor = (ceremonyType: string) => {
    const ceremony = ceremonies.find(c => c.type === ceremonyType);
    return ceremony?.color || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {allTimeboxes.map((timebox, index) => {
        const timeboxEvents = getEventsForTimebox(timebox.startDate, timebox.endDate);
        
        return (
          <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Timebox Header */}
            <div className={`${timebox.color} text-white p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{timebox.name}</h3>
                  <p className="text-sm opacity-90">
                    {timebox.startDate.toLocaleDateString()} - {timebox.endDate.toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-90">{timebox.type}</div>
                  <div className="text-lg font-bold">{timeboxEvents.length} events</div>
                </div>
              </div>
            </div>

            {/* Timebox Content */}
            <div className="p-4">
              {timeboxEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No events scheduled for this timebox</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {timeboxEvents.map(event => {
                    const Icon = getCeremonyIcon(event.type);
                    const ceremonyColor = getCeremonyColor(event.type);
                    
                    return (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 ${ceremonyColor} rounded-lg flex items-center justify-center`}>
                            <Icon size={20} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{event.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(event.startTime).toLocaleDateString()} at{' '}
                              {new Date(event.startTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {event.location && (
                              <div className="flex items-center mt-2">
                                <MapPin size={14} className="text-gray-400 mr-1" />
                                <span className="text-xs text-gray-500">{event.location}</span>
                              </div>
                            )}
                            {event.isVirtual && (
                              <div className="flex items-center mt-1">
                                <Video size={14} className="text-blue-500 mr-1" />
                                <span className="text-xs text-blue-600">Virtual</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions for Timebox */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  Duration: {Math.ceil((timebox.endDate.getTime() - timebox.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                </div>
                <button
                  onClick={() => onDateClick(timebox.startDate)}
                  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                >
                  View Details →
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Day Events Modal Component
const DayEventsModal: React.FC<{
  date: Date;
  events: CalendarEvent[];
  ceremonies: any[];
  onClose: () => void;
  onEventClick: (event: CalendarEvent) => void;
}> = ({ date, events, ceremonies, onClose, onEventClick }) => {
  const dayName = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Events for {dayName}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {events.length === 0 ? 'No events scheduled' : `${events.length} event${events.length === 1 ? '' : 's'} scheduled`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No events scheduled</p>
              <p className="text-gray-400 text-sm">
                This day is free from scheduled ceremonies and events.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {events
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map(event => {
                  const ceremony = ceremonies.find(c => c.type === event.type);
                  const Icon = ceremony?.icon || Calendar;
                  
                  return (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 ${ceremony?.color || 'bg-gray-400'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon size={20} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-1">{event.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {event.description || 'No description provided'}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Clock size={14} className="mr-1" />
                                  <span>
                                    {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {' - '}
                                    {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                {event.location && (
                                  <div className="flex items-center">
                                    <MapPin size={14} className="mr-1" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                                {event.isVirtual && (
                                  <div className="flex items-center">
                                    <Video size={14} className="mr-1 text-blue-500" />
                                    <span className="text-blue-600">Virtual</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SAFeCalendar;