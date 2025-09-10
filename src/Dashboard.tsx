import React, { useState, useEffect } from 'react';
import { useRole } from './contexts/RoleContext';
import { 
  BarChart3, Target, Users, Calendar, Mail, TrendingUp, TrendingDown, 
  Clock, CheckCircle, AlertCircle, Zap, Brain, ArrowRight, Plus, 
  Activity, MessageSquare, FileText, Star, Bell, Settings, RefreshCw,
  ChevronUp, ChevronDown, Eye, ArrowUpRight, Edit3, CalendarDays,
  Sparkles, BookOpen, ListTodo, GitBranch, Layers, PieChart,
  Filter, Download, MoreHorizontal, X, Maximize2, AlertTriangle
} from 'lucide-react';
import { NotesService, TodoItem } from './services/notesService';
import { CalendarService, CalendarEvent } from './services/calendarService';
import { analyticsService } from './services/analyticsService';
import AIChat from './components/AIChat';

interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'list' | 'activity' | 'calendar' | 'notes';
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  isVisible: boolean;
  data?: any;
}

interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
  trend?: number[];
  description?: string;
}

const Dashboard: React.FC = () => {
  const { currentRole, applyTerminology, getQuickActions, shouldShowModule } = useRole();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);
  const [customizationMode, setCustomizationMode] = useState(false);

  // Data states
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [activePriorities, setActivePriorities] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [pendingTodos, setPendingTodos] = useState<TodoItem[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  
  // Interactive states
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Customization states
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard-widget-order');
    return saved ? JSON.parse(saved) : [
      'active-priorities', 'stakeholder-health', 'performance-score', 'notes-created',
      'priorities-table', 'calendar', 'recent-notes', 'todos', 'activity-feed'
    ];
  });
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [availableWidgets] = useState([
    // Individual metric cards
    { id: 'active-priorities', title: 'Active Priorities Count', icon: Target, description: 'Number of active priorities' },
    { id: 'stakeholder-health', title: 'Stakeholder Health', icon: Users, description: 'Stakeholder engagement score' },
    { id: 'performance-score', title: 'Performance Score', icon: TrendingUp, description: 'Overall performance metrics' },
    { id: 'notes-created', title: 'Documentation Score', icon: FileText, description: 'Documentation completion score' },
    // Larger components
    { id: 'priorities-table', title: 'Priorities Table', icon: Target, description: 'Detailed priorities overview' },
    { id: 'calendar', title: 'Calendar Events', icon: CalendarDays, description: 'Upcoming calendar events' },
    { id: 'recent-notes', title: 'Recent Notes', icon: Edit3, description: 'Latest notes and documentation' },
    { id: 'todos', title: 'Todo List', icon: CheckCircle, description: 'Pending tasks and action items' },
    { id: 'activity-feed', title: 'Activity Feed', icon: Activity, description: 'Recent activity and updates' },
    { id: 'analytics', title: 'Analytics Overview', icon: TrendingUp, description: 'Data insights and trends' },
    { id: 'quick-actions', title: 'Quick Actions', icon: Zap, description: 'Role-based quick actions' }
  ]);

  useEffect(() => {
    loadDashboardData();
    setupDefaultWidgets();
  }, [timeRange, currentRole]);

  // Save widget order to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard-widget-order', JSON.stringify(widgetOrder));
  }, [widgetOrder]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMetrics(),
        loadPriorities(),
        loadCalendarEvents(),
        loadNotes(),
        loadTodos(),
        loadActivityFeed()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      // Load real data from services
      const [priorities, meetings, stakeholders, analytics] = await Promise.all([
        import('./services/priorityService').then(m => m.PriorityService.getAllPriorities()).catch(() => []),
        import('./services/meetingService').then(m => m.MeetingService.getAllMeetings()).catch(() => []),
        import('./services/stakeholderService').then(m => m.StakeholderService.getAllStakeholders()).catch(() => []),
        analyticsService.getDashboardMetrics(timeRange).catch(() => null)
      ]);

      const activePrioritiesCount = priorities.filter(p => p.status === 'in-progress' || p.status === 'review').length;
      const highPriorityCount = priorities.filter(p => p.priority_level === 'critical' || p.priority_level === 'high').length;
      const completedMeetingsCount = meetings.filter(m => m.status === 'completed').length;
      const stakeholderHealthScore = stakeholders.length > 0 
        ? Math.round(stakeholders.reduce((sum, s) => sum + (s.relationship_health || 7), 0) / stakeholders.length * 10)
        : 92;

      const baseMetrics: DashboardMetric[] = [
        {
          id: 'active-priorities',
          title: 'Active Priorities',
          value: activePrioritiesCount,
          change: analytics?.priorityChange || '+12.5%',
          changeType: 'positive',
          icon: Target,
          color: 'blue',
          trend: analytics?.priorityTrend || [18, 22, 19, 25, activePrioritiesCount],
          description: 'Currently tracked priorities'
        },
        {
          id: 'high-priority-items',
          title: 'High Priority Items',
          value: highPriorityCount,
          change: `${highPriorityCount > 5 ? 'High' : 'Normal'} load`,
          changeType: highPriorityCount > 8 ? 'negative' : highPriorityCount > 5 ? 'neutral' : 'positive',
          icon: AlertCircle,
          color: highPriorityCount > 8 ? 'red' : 'orange',
          trend: [4, 6, 5, 7, highPriorityCount],
          description: 'Critical and high priority items'
        },
        {
          id: 'sprint-velocity',
          title: 'Sprint Velocity',
          value: analytics?.velocity || 47,
          change: analytics?.velocityChange || '+23.4%',
          changeType: 'positive',
          icon: Zap,
          color: 'green',
          trend: analytics?.velocityTrend || [32, 38, 35, 42, 47],
          description: 'Story points per sprint'
        },
        {
          id: 'stakeholder-health',
          title: 'Stakeholder Health',
          value: `${stakeholderHealthScore}%`,
          change: analytics?.stakeholderChange || '-2.1%',
          changeType: stakeholderHealthScore >= 90 ? 'positive' : stakeholderHealthScore >= 80 ? 'neutral' : 'negative',
          icon: Users,
          color: 'purple',
          trend: [95, 93, 94, 94, stakeholderHealthScore],
          description: 'Stakeholder engagement score'
        },
        {
          id: 'meetings-completed',
          title: 'Meetings This Week',
          value: completedMeetingsCount,
          change: `${completedMeetingsCount > 8 ? 'Busy' : 'Normal'} schedule`,
          changeType: completedMeetingsCount > 10 ? 'negative' : 'positive',
          icon: CalendarDays,
          color: 'orange',
          trend: [8, 10, 12, 9, completedMeetingsCount],
          description: 'Meetings attended this week'
        },
        {
          id: 'notes-created',
          title: 'Documentation Score',
          value: analytics?.documentationScore || 85,
          change: analytics?.documentationChange || '+8 this week',
          changeType: 'positive',
          icon: Edit3,
          color: 'indigo',
          trend: [75, 82, 78, 88, analytics?.documentationScore || 85],
          description: 'Notes and documentation quality'
        }
      ];

    // Filter metrics based on role and module visibility
    const filteredMetrics = baseMetrics.filter(metric => {
      switch (metric.id) {
        case 'notes-created':
          return shouldShowModule('notes');
        case 'ceremonies-completed':
          return shouldShowModule('calendar');
        case 'knowledge-articles':
          return shouldShowModule('knowledge');
        default:
          return true;
      }
    });

    setMetrics(filteredMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
      // Fallback to basic metrics if there's an error
      setMetrics([
        {
          id: 'active-priorities',
          title: 'Active Priorities',
          value: 'N/A',
          change: '--',
          changeType: 'neutral',
          icon: Target,
          color: 'blue',
          description: 'Currently tracked priorities'
        }
      ]);
    }
  };

  const loadPriorities = async () => {
    try {
      const { PriorityService } = await import('./services/priorityService');
      const priorities = await PriorityService.getAllPriorities();
      
      // Transform priorities to dashboard format and get active ones
      const activePriorities = priorities
        .filter(p => p.status === 'in-progress' || p.status === 'review' || p.status === 'backlog')
        .sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority_level as keyof typeof priorityOrder] - priorityOrder[a.priority_level as keyof typeof priorityOrder];
        })
        .slice(0, 8)
        .map(p => ({
          id: p.id || 'P-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
          title: p.title,
          assignee: p.assigned_to || 'Unassigned',
          status: p.status === 'in-progress' ? 'In Progress' : 
                 p.status === 'review' ? 'In Review' :
                 p.status === 'backlog' ? 'Planning' : 'Done',
          priority: p.priority_level === 'critical' ? 'Critical' :
                   p.priority_level === 'high' ? 'High' :
                   p.priority_level === 'medium' ? 'Medium' : 'Low',
          progress: p.progress || (p.status === 'done' ? 100 : 
                                 p.status === 'review' ? 90 :
                                 p.status === 'in-progress' ? Math.floor(Math.random() * 60) + 30 : 10),
          dueDate: p.due_date || new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          storyPoints: Math.floor(p.urgency || Math.random() * 13) + 1,
          description: p.description
        }));

      setActivePriorities(activePriorities.length > 0 ? activePriorities : [
        {
          id: 'DEMO-001',
          title: 'Complete Dashboard Implementation',
          assignee: 'Development Team',
          status: 'In Progress',
          priority: 'High',
          progress: 85,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          storyPoints: 8,
          description: 'Implement functional dashboard with real-time data'
        }
      ]);
    } catch (error) {
      console.error('Error loading priorities:', error);
      setActivePriorities([]);
    }
  };

  const loadCalendarEvents = async () => {
    try {
      const { CalendarService } = await import('./services/calendarService');
      const events = await CalendarService.getEvents({
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
      });
      setUpcomingEvents(events.slice(0, 5));
    } catch (error) {
      try {
        // Try meeting service as fallback
        const { MeetingService } = await import('./services/meetingService');
        const meetings = await MeetingService.getAllMeetings({
          date_from: new Date().toISOString().split('T')[0],
          status: 'scheduled'
        });
        
        const upcomingMeetings = meetings
          .filter(m => new Date(m.date + 'T' + m.time) > new Date())
          .slice(0, 5)
          .map(m => ({
            id: m.id || Math.random().toString(),
            title: m.title,
            type: m.meeting_type as any,
            startTime: new Date(m.date + 'T' + m.time),
            endTime: new Date(new Date(m.date + 'T' + m.time).getTime() + (m.duration || 60) * 60 * 1000),
            isVirtual: !!m.meeting_url,
            attendees: m.attendees || [],
            organizer: 'user',
            isRecurring: m.recurring,
            reminderMinutes: [15],
            status: m.status as any,
            tags: m.tags || [],
            createdAt: m.created_at || new Date().toISOString(),
            updatedAt: m.updated_at || new Date().toISOString(),
            createdBy: m.user_id || 'current-user',
            location: m.location,
            description: m.description
          }));
        
        setUpcomingEvents(upcomingMeetings);
      } catch (meetingError) {
        // Final fallback to demo data
        setUpcomingEvents([
          {
            id: '1',
            title: 'Sprint Planning',
            type: 'sprint_planning',
            startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
            endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
            isVirtual: false,
            attendees: [],
            organizer: 'scrum-master',
            isRecurring: false,
            reminderMinutes: [15],
            status: 'scheduled',
            tags: ['sprint', 'planning'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'current-user',
            description: 'Weekly sprint planning session'
          },
          {
            id: '2',
            title: 'Stakeholder Review',
            type: 'review',
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
            endTime: new Date(Date.now() + 25.5 * 60 * 60 * 1000),
            isVirtual: true,
            attendees: [],
            organizer: 'product-owner',
            isRecurring: false,
            reminderMinutes: [30],
            status: 'scheduled',
            tags: ['stakeholder', 'review'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'current-user',
            description: 'Monthly stakeholder review meeting'
          }
        ]);
      }
    }
  };

  const loadNotes = async () => {
    try {
      const notes = await NotesService.getNotes();
      const sortedNotes = notes
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);
      setRecentNotes(sortedNotes);
    } catch (error) {
      // Fallback to demo notes
      setRecentNotes([
        {
          id: 'note-1',
          title: 'Sprint Retrospective Notes',
          content: 'Key insights from the sprint retrospective meeting...',
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          todos: [{ id: '1', text: 'Follow up on velocity improvements', completed: false }]
        },
        {
          id: 'note-2', 
          title: 'Stakeholder Feedback Summary',
          content: 'Compilation of recent stakeholder feedback...',
          updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          todos: []
        }
      ]);
    }
  };

  const loadTodos = async () => {
    try {
      const todos = await NotesService.getTodos();
      const pendingTodos = todos
        .filter(t => !t.completed)
        .sort((a, b) => {
          // Sort by priority (if exists) then by due date
          if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          }
          return a.dueDate ? -1 : b.dueDate ? 1 : 0;
        })
        .slice(0, 5);
      setPendingTodos(pendingTodos);
    } catch (error) {
      // Fallback to demo todos
      setPendingTodos([
        {
          id: 'todo-1',
          text: 'Review API documentation updates',
          completed: false,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          priority: 'high'
        },
        {
          id: 'todo-2',
          text: 'Schedule stakeholder alignment meeting',
          completed: false,
          dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          priority: 'medium'
        },
        {
          id: 'todo-3',
          text: 'Update sprint velocity tracking',
          completed: false,
          priority: 'low'
        }
      ]);
    }
  };

  const loadActivityFeed = async () => {
    try {
      // Try to get recent analytics data for activity feed
      const analyticsData = await analyticsService.getRecentActivity(7);
      
      if (analyticsData && analyticsData.length > 0) {
        const formattedActivities = analyticsData.map((activity: any, index: number) => ({
          id: activity.id || index.toString(),
          type: activity.type || 'system',
          action: activity.action || 'updated',
          title: activity.description || activity.title,
          time: activity.timestamp ? new Date(activity.timestamp).toLocaleString() : `${index + 1} hours ago`,
          icon: activity.type === 'priority' ? Target :
                activity.type === 'meeting' ? Calendar :
                activity.type === 'note' ? Edit3 :
                activity.type === 'stakeholder' ? Users : Activity,
          color: activity.type === 'priority' ? 'blue' :
                activity.type === 'meeting' ? 'green' :
                activity.type === 'note' ? 'indigo' :
                activity.type === 'stakeholder' ? 'purple' : 'gray'
        }));
        setActivityFeed(formattedActivities.slice(0, 6));
      } else {
        throw new Error('No analytics data available');
      }
    } catch (error) {
      // Fallback to generated activity based on current data
      const activities = [];
      
      // Add priority-based activities
      if (activePriorities.length > 0) {
        activities.push({
          id: 'activity-priority-1',
          type: 'priority',
          action: 'updated',
          title: `Priority updated: ${activePriorities[0]?.title || 'High priority item'}`,
          time: '2 hours ago',
          icon: Target,
          color: 'blue'
        });
      }

      // Add meeting-based activities  
      if (upcomingEvents.length > 0) {
        activities.push({
          id: 'activity-meeting-1',
          type: 'meeting',
          action: 'scheduled',
          title: `Upcoming: ${upcomingEvents[0]?.title || 'Team meeting'}`,
          time: '4 hours ago',
          icon: Calendar,
          color: 'green'
        });
      }

      // Add note-based activities
      if (recentNotes.length > 0) {
        activities.push({
          id: 'activity-note-1',
          type: 'note',
          action: 'created',
          title: `Note updated: ${recentNotes[0]?.title || 'Meeting notes'}`,
          time: '6 hours ago',
          icon: Edit3,
          color: 'indigo'
        });
      }

      // Add general activities if we don't have specific data
      if (activities.length < 3) {
        activities.push(
          {
            id: 'activity-general-1',
            type: 'system',
            action: 'updated',
            title: 'Dashboard metrics refreshed',
            time: '1 day ago',
            icon: Activity,
            color: 'purple'
          },
          {
            id: 'activity-general-2',
            type: 'stakeholder',
            action: 'updated',
            title: 'Stakeholder feedback processed',
            time: '2 days ago',
            icon: MessageSquare,
            color: 'purple'
          }
        );
      }

      setActivityFeed(activities.slice(0, 5));
    }
  };

  const setupDefaultWidgets = () => {
    const defaultWidgets: DashboardWidget[] = [
      {
        id: 'metrics-overview',
        title: 'Key Metrics',
        type: 'metric',
        size: 'large',
        position: { x: 0, y: 0 },
        isVisible: true
      },
      {
        id: 'priorities-list',
        title: 'Active Priorities',
        type: 'list',
        size: 'medium',
        position: { x: 0, y: 1 },
        isVisible: true
      },
      {
        id: 'upcoming-events',
        title: 'Upcoming Events',
        type: 'calendar',
        size: 'medium',
        position: { x: 1, y: 1 },
        isVisible: shouldShowModule('calendar')
      },
      {
        id: 'recent-notes',
        title: 'Recent Notes',
        type: 'notes',
        size: 'medium',
        position: { x: 0, y: 2 },
        isVisible: shouldShowModule('notes')
      },
      {
        id: 'pending-todos',
        title: 'Pending Todos',
        type: 'list',
        size: 'medium',
        position: { x: 1, y: 2 },
        isVisible: shouldShowModule('notes')
      },
      {
        id: 'activity-feed',
        title: 'Recent Activity',
        type: 'activity',
        size: 'medium',
        position: { x: 2, y: 1 },
        isVisible: true
      }
    ];

    setWidgets(defaultWidgets.filter(w => w.isVisible));
  };

  // Drag and Drop Functions
  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault();
    
    if (!draggedWidget || draggedWidget === targetWidgetId) return;

    const newOrder = [...widgetOrder];
    const draggedIndex = newOrder.indexOf(draggedWidget);
    const targetIndex = newOrder.indexOf(targetWidgetId);

    // Remove dragged widget from current position
    newOrder.splice(draggedIndex, 1);
    
    // Insert dragged widget at target position
    newOrder.splice(targetIndex, 0, draggedWidget);
    
    setWidgetOrder(newOrder);
    setDraggedWidget(null);
  };

  const handleDeleteWidget = (widgetId: string) => {
    setWidgetOrder(prev => prev.filter(id => id !== widgetId));
  };

  const handleAddWidget = (widgetId: string) => {
    if (!widgetOrder.includes(widgetId)) {
      setWidgetOrder(prev => [...prev, widgetId]);
    }
    setShowAddWidget(false);
  };

  const getMetricColor = (color: string) => {
    const colors = {
      blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', border: 'border-blue-200' },
      green: { bg: 'bg-green-50', iconBg: 'bg-green-100', iconColor: 'text-green-600', border: 'border-green-200' },
      purple: { bg: 'bg-purple-50', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', border: 'border-purple-200' },
      orange: { bg: 'bg-orange-50', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', border: 'border-orange-200' },
      indigo: { bg: 'bg-indigo-50', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', border: 'border-indigo-200' },
      teal: { bg: 'bg-teal-50', iconBg: 'bg-teal-100', iconColor: 'text-teal-600', border: 'border-teal-200' }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getChangeColor = (changeType: 'positive' | 'negative' | 'neutral') => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'In Progress': return { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', icon: Activity };
      case 'In Review': return { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500', icon: Eye };
      case 'Planning': return { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', icon: Clock };
      case 'Done': return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', icon: CheckCircle };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500', icon: AlertCircle };
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

  const renderMetricCard = (metric: DashboardMetric, index: number) => {
    const Icon = metric.icon;
    const colorConfig = getMetricColor(metric.color);
    
    return (
      <div 
        key={metric.id} 
        className={`bg-white rounded-xl border ${colorConfig.border} p-6 hover:shadow-lg transition-all duration-300`}
        style={{animationDelay: `${index * 100}ms`}}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorConfig.iconBg}`}>
            <Icon className={`${colorConfig.iconColor} w-6 h-6`} />
          </div>
          <div className={`flex items-center text-sm font-semibold ${getChangeColor(metric.changeType)}`}>
            {metric.changeType === 'positive' ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : metric.changeType === 'negative' ? (
              <TrendingDown className="w-4 h-4 mr-1" />
            ) : null}
            {metric.change}
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</p>
          <p className="text-gray-600 text-sm font-medium">{metric.title}</p>
          {metric.description && (
            <p className="text-gray-500 text-xs mt-1">{metric.description}</p>
          )}
        </div>
        {metric.trend && (
          <div className="mt-4 flex items-end space-x-1">
            {metric.trend.map((value, i) => (
              <div
                key={i}
                className={`${colorConfig.iconColor.replace('text-', 'bg-')} rounded-sm opacity-60`}
                style={{
                  height: `${(value / Math.max(...metric.trend!)) * 20 + 4}px`,
                  width: '8px'
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderQuickActions = () => {
    const quickActions = getQuickActions();
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Zap className="mr-2" size={20} />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Draggable Widget Wrapper Component
  const DraggableWidget: React.FC<{
    widgetId: string;
    title: string;
    children: React.ReactNode;
    className?: string;
  }> = ({ widgetId, title, children, className = "" }) => {
    const isDragging = draggedWidget === widgetId;
    
    return (
      <div
        draggable={customizationMode}
        onDragStart={(e) => handleDragStart(e, widgetId)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, widgetId)}
        className={`relative transition-all duration-200 ${
          customizationMode ? 'cursor-move hover:shadow-lg' : ''
        } ${isDragging ? 'opacity-50 scale-95' : ''} ${className}`}
      >
        {/* Customization Controls */}
        {customizationMode && (
          <div className="absolute -top-2 -right-2 z-10 flex space-x-1">
            <button
              onClick={() => handleDeleteWidget(widgetId)}
              className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
              title="Delete widget"
            >
              <X size={12} />
            </button>
            <div className="w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs shadow-lg cursor-move">
              <MoreHorizontal size={12} />
            </div>
          </div>
        )}
        
        {/* Drop Zone Indicator */}
        {customizationMode && draggedWidget && draggedWidget !== widgetId && (
          <div className="absolute inset-0 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 bg-opacity-50 flex items-center justify-center">
            <span className="text-blue-600 font-medium">Drop here</span>
          </div>
        )}
        
        {children}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentRole?.name || 'Product Owner'} Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor {applyTerminology('product')} development and {applyTerminology('stakeholder')} activities
            </p>
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
            <button 
              onClick={() => setCustomizationMode(!customizationMode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                customizationMode 
                  ? 'bg-green-100 border border-green-200 text-green-700 hover:bg-green-200' 
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Settings size={16} />
              <span>{customizationMode ? 'Done' : 'Customize'}</span>
            </button>
            <button 
              onClick={loadDashboardData}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2">
              <Download size={16} />
              <span>Export</span>
            </button>
            {customizationMode && (
              <button 
                onClick={() => setShowAddWidget(true)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Widget</span>
              </button>
            )}
          </div>
        </div>

        {/* Individual Draggable Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {widgetOrder.map(widgetId => {
            switch (widgetId) {
              case 'active-priorities':
                const activeMetric = metrics.find(m => m.id === 'active-priorities');
                return activeMetric ? (
                  <DraggableWidget key={widgetId} widgetId={widgetId} title={activeMetric.title} size="small">
                    {renderMetricCard(activeMetric, 0)}
                  </DraggableWidget>
                ) : null;
                
              case 'stakeholder-health':
                const stakeholderMetric = metrics.find(m => m.id === 'stakeholder-health');
                return stakeholderMetric ? (
                  <DraggableWidget key={widgetId} widgetId={widgetId} title={stakeholderMetric.title} size="small">
                    {renderMetricCard(stakeholderMetric, 0)}
                  </DraggableWidget>
                ) : null;
                
              case 'performance-score':
                const perfMetric = metrics.find(m => m.id === 'performance-score');
                return perfMetric ? (
                  <DraggableWidget key={widgetId} widgetId={widgetId} title={perfMetric.title} size="small">
                    {renderMetricCard(perfMetric, 0)}
                  </DraggableWidget>
                ) : null;
                
              case 'notes-created':
                const notesMetric = metrics.find(m => m.id === 'notes-created');
                return notesMetric ? (
                  <DraggableWidget key={widgetId} widgetId={widgetId} title={notesMetric.title} size="small">
                    {renderMetricCard(notesMetric, 0)}
                  </DraggableWidget>
                ) : null;
                
              default:
                return null;
            }
          })}
        </div>

        {/* Quick Actions */}
        {widgetOrder.includes('quick-actions') && getQuickActions().length > 0 && (
          <DraggableWidget widgetId="quick-actions" title="Quick Actions" size="large">
            {renderQuickActions()}
          </DraggableWidget>
        )}

        {/* Large Widgets Grid */}  
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {widgetOrder.map(widgetId => {
            switch (widgetId) {
              case 'priorities-table':
                return (
                  <div key={widgetId} className="lg:col-span-1">
                    <DraggableWidget widgetId={widgetId} title="Active Priorities" size="large">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Active Priorities</h2>
                    <p className="text-sm text-gray-600">Current feature development status and progress</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="In Progress">In Progress</option>
                      <option value="In Review">In Review</option>
                      <option value="Planning">Planning</option>
                    </select>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Priority</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                    <button 
                      onClick={() => setShowAnalytics(!showAnalytics)}
                      className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                        showAnalytics 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <BarChart3 size={14} className="mr-1 inline" />
                      Analytics
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1">
                      <span>View all</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Feature</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Priority</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Progress</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePriorities
                      .filter(priority => filterStatus === 'all' || priority.status === filterStatus)
                      .filter(priority => filterPriority === 'all' || priority.priority === filterPriority)
                      .map((priority, index) => {
                      const statusConfig = getStatusConfig(priority.status);
                      const priorityConfig = getPriorityConfig(priority.priority);
                      const StatusIcon = statusConfig.icon;
                      const isOverdue = new Date(priority.dueDate) < new Date() && priority.status !== 'Done';
                      
                      return (
                        <tr 
                          key={index} 
                          className={`border-b border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer ${
                            selectedPriority === priority.id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                          onClick={() => setSelectedPriority(selectedPriority === priority.id ? null : priority.id)}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-start space-x-3">
                              <div className={`p-1 rounded ${statusConfig.bg} mt-1`}>
                                <StatusIcon size={12} className={statusConfig.text} />
                              </div>
                              <div className="flex-1">
                                <span className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                  {priority.title}
                                </span>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs text-gray-500">{priority.id}</span>
                                  {priority.assignee && (
                                    <>
                                      <span className="text-xs text-gray-400">•</span>
                                      <span className="text-xs text-gray-600">{priority.assignee}</span>
                                    </>
                                  )}
                                  {priority.storyPoints && (
                                    <>
                                      <span className="text-xs text-gray-400">•</span>
                                      <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                        {priority.storyPoints} pts
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></div>
                              <span>{priority.status}</span>
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.bg} ${priorityConfig.text}`}>
                              {priority.priority}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="flex-1 bg-gray-200 rounded-full h-2.5 max-w-24">
                                <div 
                                  className={`h-2.5 rounded-full transition-all duration-500 ${
                                    priority.progress === 100 ? 'bg-green-500' : 
                                    priority.progress >= 75 ? 'bg-blue-500' : 
                                    priority.progress >= 50 ? 'bg-yellow-500' :
                                    priority.progress >= 25 ? 'bg-orange-500' : 'bg-gray-400'
                                  }`}
                                  style={{ width: `${priority.progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-600 min-w-12">{priority.progress}%</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                {new Date(priority.dueDate).toLocaleDateString()}
                              </span>
                              {isOverdue && (
                                <AlertTriangle size={14} className="text-red-500" />
                              )}
                            </div>
                            {priority.dueDate && (
                              <div className="text-xs text-gray-500 mt-1">
                                {Math.ceil((new Date(priority.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
                    </DraggableWidget>
                  </div>
                );

              default:
                return null;
            }
          })}
        </div>

      </div>

      {/* AI Chat Assistant */}
      <AIChat 
        currentContext="dashboard"
        contextData={{
          metrics: metrics,
          priorities: activePriorities,
          upcomingEvents: upcomingEvents,
          recentNotes: recentNotes,
          pendingTodos: pendingTodos,
          currentRole: currentRole
        }}
      />
      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-96 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Add Widget</h3>
                <button
                  onClick={() => setShowAddWidget(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 mt-1">Choose a widget to add to your dashboard</p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableWidgets
                  .filter(widget => !widgetOrder.includes(widget.id))
                  .map(widget => {
                    const Icon = widget.icon;
                    return (
                      <button
                        key={widget.id}
                        onClick={() => handleAddWidget(widget.id)}
                        className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                      >
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Icon size={20} className="text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{widget.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{widget.description}</p>
                        </div>
                      </button>
                    );
                  })}
              </div>
              
              {availableWidgets.filter(widget => !widgetOrder.includes(widget.id)).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">All available widgets have been added to your dashboard.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

