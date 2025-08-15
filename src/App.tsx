import React, { useState } from 'react';
import { Calendar, Mail, Users, CheckSquare, BarChart3, Settings, Plus, Upload, FileText, Bell, Target, Clock, TrendingUp, MessageSquare, Filter, Search, Download, Edit, Trash2, Eye } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState({ name: 'Product Owner', email: 'po@colruyt.be' });
  
  const [priorities] = useState([
    { id: 1, title: 'Fix critical payment bug', category: 'sprint', urgency: 5, importance: 5, status: 'in-progress', dueDate: '2025-08-15' },
    { id: 2, title: 'User onboarding flow redesign', category: 'backlog', urgency: 3, importance: 4, status: 'todo', dueDate: '2025-08-20' },
    { id: 3, title: 'Performance optimization', category: 'sprint', urgency: 4, importance: 4, status: 'todo', dueDate: '2025-08-18' },
    { id: 4, title: 'Market research review', category: 'personal', urgency: 2, importance: 3, status: 'done', dueDate: '2025-08-14' }
  ]);

  const [meetings] = useState([
    { id: 1, title: 'Daily Standup', type: 'standup', dateTime: '2025-08-14T09:00', duration: 15, attendees: ['Team'], summary: 'Sprint progress review' },
    { id: 2, title: 'Sprint Planning', type: 'planning', dateTime: '2025-08-16T14:00', duration: 120, attendees: ['Dev Team', 'Scrum Master'], summary: 'Next sprint scope definition' },
    { id: 3, title: 'Stakeholder Review', type: 'review', dateTime: '2025-08-15T15:00', duration: 60, attendees: ['Business Team'], summary: 'Feature demo and feedback' }
  ]);

  const [communications] = useState([
    { id: 1, type: 'email', subject: 'Sprint Review Feedback', from: 'lisa.chen@colruyt.be', content: 'Great progress on the payment feature. Some concerns about UX flow...', sentiment: 'neutral', priority: 'high', followUp: true },
    { id: 2, type: 'email', subject: 'Bug Report', from: 'support@colruyt.be', content: 'Critical issue reported by multiple users...', sentiment: 'negative', priority: 'urgent', followUp: true },
    { id: 3, type: 'message', subject: 'Design Review Complete', from: 'mark.peters@colruyt.be', content: 'Mockups are ready for review...', sentiment: 'positive', priority: 'medium', followUp: false }
  ]);

  const Navigation = () => {
    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'priorities', label: 'Priorities', icon: Target },
      { id: 'emails', label: 'Email Intelligence', icon: Mail },
      { id: 'meetings', label: 'Meetings', icon: Calendar },
      { id: 'stakeholders', label: 'Stakeholders', icon: Users },
      { id: 'market', label: 'Market Intelligence', icon: TrendingUp },
      { id: 'planning', label: 'Daily Planning', icon: CheckSquare },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'settings', label: 'Settings', icon: Settings }
    ];

    return (
      <div className="w-64 bg-slate-900 text-white p-6 min-h-screen overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-blue-400">Virtual PO Assistant</h1>
          <p className="text-sm text-slate-300 mt-1">Colruyt Group - Xtra App</p>
        </div>
        
        <nav className="space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-8 p-4 bg-slate-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">PO</span>
            </div>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Dashboard = () => {
    const todaysPriorities = priorities.filter(p => p.status === 'in-progress' || p.urgency >= 4);
    const upcomingMeetings = meetings.filter(m => new Date(m.dateTime) > new Date()).slice(0, 3);
    const actionRequired = communications.filter(c => c.followUp || c.priority === 'urgent').length;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Good morning, {user.name.split(' ')[0]}!</h2>
            <p className="text-slate-600 mt-1">Here's your day at a glance</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Today</p>
            <p className="text-lg font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Today's Focus</p>
                <p className="text-2xl font-bold text-slate-900">{todaysPriorities.length}</p>
                <p className="text-sm text-green-600 mt-1">High priority items</p>
              </div>
              <Target className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-slate-900">{upcomingMeetings.length}</p>
                <p className="text-sm text-blue-600 mt-1">Next: {upcomingMeetings[0]?.title}</p>
              </div>
              <Calendar className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Action Required</p>
                <p className="text-2xl font-bold text-slate-900">{actionRequired}</p>
                <p className="text-sm text-orange-600 mt-1">Follow-ups needed</p>
              </div>
              <Bell className="text-orange-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Sprint Progress</p>
                <p className="text-2xl font-bold text-slate-900">73%</p>
                <p className="text-sm text-green-600 mt-1">On track</p>
              </div>
              <BarChart3 className="text-purple-600" size={32} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Priority Matrix</h3>
                <button 
                  onClick={() => setActiveTab('priorities')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All →
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h4 className="font-medium text-red-900 mb-3">High Urgency + High Importance</h4>
                  {priorities.filter(p => p.urgency >= 4 && p.importance >= 4).map(priority => (
                    <div key={priority.id} className="bg-white p-3 rounded mb-2 shadow-sm">
                      <p className="text-sm font-medium">{priority.title}</p>
                      <p className="text-xs text-slate-500">{priority.category}</p>
                    </div>
                  ))}
                </div>

                <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <h4 className="font-medium text-orange-900 mb-3">High Urgency + Low Importance</h4>
                  {priorities.filter(p => p.urgency >= 4 && p.importance < 4).map(priority => (
                    <div key={priority.id} className="bg-white p-3 rounded mb-2 shadow-sm">
                      <p className="text-sm font-medium">{priority.title}</p>
                      <p className="text-xs text-slate-500">{priority.category}</p>
                    </div>
                  ))}
                </div>

                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <h4 className="font-medium text-blue-900 mb-3">Low Urgency + High Importance</h4>
                  {priorities.filter(p => p.urgency < 4 && p.importance >= 4).map(priority => (
                    <div key={priority.id} className="bg-white p-3 rounded mb-2 shadow-sm">
                      <p className="text-sm font-medium">{priority.title}</p>
                      <p className="text-xs text-slate-500">{priority.category}</p>
                    </div>
                  ))}
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-3">Low Urgency + Low Importance</h4>
                  {priorities.filter(p => p.urgency < 4 && p.importance < 4).map(priority => (
                    <div key={priority.id} className="bg-white p-3 rounded mb-2 shadow-sm">
                      <p className="text-sm font-medium">{priority.title}</p>
                      <p className="text-xs text-slate-500">{priority.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setActiveTab('priorities')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <Plus size={16} className="text-blue-600" />
                  <span className="text-sm">Add Priority</span>
                </button>
                <button 
                  onClick={() => setActiveTab('emails')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <Mail size={16} className="text-green-600" />
                  <span className="text-sm">Draft Email</span>
                </button>
                <button 
                  onClick={() => setActiveTab('meetings')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <Calendar size={16} className="text-purple-600" />
                  <span className="text-sm">Schedule Meeting</span>
                </button>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <BarChart3 size={16} className="text-orange-600" />
                  <span className="text-sm">View Reports</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold mb-4">Upcoming Meetings</h3>
              <div className="space-y-3">
                {upcomingMeetings.map(meeting => (
                  <div key={meeting.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{meeting.title}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(meeting.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {meeting.duration}m
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PlaceholderComponent = ({ title }: { title: string }) => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
        <p className="text-slate-600 mt-1">This feature is coming soon!</p>
      </div>
      <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Under Construction</h3>
        <p className="text-slate-600">We're working hard to bring you this amazing feature.</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'priorities':
        return <PlaceholderComponent title="Priority Management" />;
      case 'emails':
        return <PlaceholderComponent title="Email Intelligence" />;
      case 'meetings':
        return <PlaceholderComponent title="Meeting Management" />;
      case 'stakeholders':
        return <PlaceholderComponent title="Stakeholder Management" />;
      case 'market':
        return <PlaceholderComponent title="Market Intelligence" />;
      case 'planning':
        return <PlaceholderComponent title="Daily Planning" />;
      case 'analytics':
        return <PlaceholderComponent title="Analytics & Reporting" />;
      case 'settings':
        return <PlaceholderComponent title="Settings" />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Navigation />
      <main className="flex-1 p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;