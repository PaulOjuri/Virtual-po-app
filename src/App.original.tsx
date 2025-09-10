import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RoleProvider, useRoleNavigation } from './contexts/RoleContext';
import { Login } from './components/Login';
import NotificationSystem from './components/NotificationSystem';
import MarketIntelligence from './MarketIntelligence';
import { Calendar, Mail, Users, CheckSquare, BarChart3, Settings as SettingsIcon, Target, Brain, FileText, TrendingUp, LogOut, Edit3, CalendarDays } from 'lucide-react';
import UnifiedDashboard from './UnifiedDashboard';
import EmailIntelligence from './EmailIntelligence';
import StakeholderManager from './StakeholderManager';
import PriorityManager from './PriorityManager';
import MeetingManager from './MeetingManager';
import DailyPlanning from './DailyPlanning';
import KnowledgeBase from './KnowledgeBase';
import Analytics from './Analytics';
import Settings from './Settings';
import Dashboard from './Dashboard';
import NotesApp from './NotesApp';
import SAFeCalendar from './SAFeCalendar';

const AppContent: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const { getFilteredNavigation } = useRoleNavigation();
  const [activeTab, setActiveTab] = useState('dashboard');

  const baseNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'unified', label: 'AI Command Center', icon: Brain },
    { id: 'priorities', label: 'Priorities', icon: Target },
    { id: 'notes', label: 'Notes', icon: Edit3 },
    { id: 'calendar', label: 'SAFe Calendar', icon: CalendarDays },
    { id: 'emails', label: 'Email intelligence', icon: Mail },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'stakeholders', label: 'Stakeholders', icon: Users },
    { id: 'knowledge', label: 'Knowledge base', icon: FileText },
    { id: 'market', label: 'Market intelligence', icon: TrendingUp },
    { id: 'planning', label: 'Daily planning', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  const navItems = getFilteredNavigation(baseNavItems);

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'unified':
        return <UnifiedDashboard />;
      case 'priorities':
        return <PriorityManager />;
      case 'notes':
        return <NotesApp />;
      case 'calendar':
        return <SAFeCalendar />;
      case 'emails':
        return <EmailIntelligence />;
      case 'meetings':
        return <MeetingManager />;
      case 'stakeholders':
        return <StakeholderManager />;
      case 'knowledge':
        return <KnowledgeBase />;
      case 'market':
        return <MarketIntelligence />;
      case 'planning':
        return <DailyPlanning />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Show login page if user is not authenticated
  if (!user) {
    return <Login />;
  }

  // Show main app if user is authenticated
  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-info">
            <div className="profile-name">Paulo Juri</div>
            <div className="profile-role">Product Owner</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
          <div className="mt-3">
            <NotificationSystem />
          </div>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="nav-list">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <li key={item.id} className={`nav-item ${item.emphasized ? 'emphasized' : ''}`}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`nav-button ${activeTab === item.id ? 'active' : ''}`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sign Out Button */}
        <div className="ai-toggle-container">
          <button
            onClick={signOut}
            className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-area">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <RoleProvider>
        <AppContent />
      </RoleProvider>
    </AuthProvider>
  );
};

export default App;