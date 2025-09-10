import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RoleProvider, useRoleNavigation, useRole } from './contexts/RoleContext';
import { Login } from './components/Login';
import NotificationSystem, { NotificationPanel, Notification } from './components/NotificationSystem';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
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
import LandingPage from './LandingPage';
import RoleOnboarding from './components/RoleOnboarding';

type AppState = 'landing' | 'onboarding' | 'login' | 'app';

const PlatformApp: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const { getFilteredNavigation } = useRoleNavigation();
  const { currentRole } = useRole();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  const baseNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'unified', label: 'AI command center', icon: Brain },
    { id: 'priorities', label: 'Priorities', icon: Target },
    { id: 'notes', label: 'Notes', icon: Edit3 },
    { id: 'calendar', label: 'SAFe calendar', icon: CalendarDays },
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
        return <UnifiedDashboard onNavigate={setActiveTab} />;
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

  const getRoleName = () => {
    if (currentRole) {
      return currentRole.display_name || currentRole.id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return 'Team Member';
  };

  // Notification handling functions (placeholder implementation)
  const handleNotificationAction = (notification: Notification, action: string) => {
    console.log('Notification action:', action, notification);
    // Implementation would go here
  };

  const handleMarkAllAsRead = () => {
    console.log('Mark all notifications as read');
    // Implementation would go here
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-info">
            <div className="profile-name">{user?.user_metadata?.full_name || 'User'}</div>
            <div className="profile-role">{getRoleName()}</div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
          <div className="mt-3">
            <NotificationSystem 
              isExpanded={showNotificationPanel}
              onToggleExpanded={setShowNotificationPanel}
            />
          </div>
        </div>

        {/* Navigation or Notification Panel */}
        {showNotificationPanel ? (
          <div className="flex-1 overflow-hidden">
            <NotificationPanel
              notifications={[]} // Placeholder - would need to get actual notifications
              onNotificationAction={handleNotificationAction}
              onMarkAllAsRead={handleMarkAllAsRead}
              onClose={() => setShowNotificationPanel(false)}
            />
          </div>
        ) : (
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
        )}

        {/* Sign Out Button */}
        <div className="ai-toggle-container">
          <button
            onClick={signOut}
            className="w-full px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
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

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { currentRole } = useRole();
  const [appState, setAppState] = useState<AppState>('landing');

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner fullScreen text="Loading your personalized platform..." size="xl" />;
  }

  // If user is not authenticated, show based on app state
  if (!user) {
    switch (appState) {
      case 'landing':
        return (
          <LandingPage 
            onGetStarted={() => setAppState('onboarding')} 
            onSignIn={() => setAppState('login')}
          />
        );
      case 'onboarding':
        return (
          <RoleOnboarding
            onComplete={() => setAppState('login')}
            onBack={() => setAppState('landing')}
          />
        );
      case 'login':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <Login onBack={() => setAppState('landing')} />
            </div>
          </div>
        );
      default:
        return (
          <LandingPage 
            onGetStarted={() => setAppState('onboarding')} 
            onSignIn={() => setAppState('login')}
          />
        );
    }
  }

  // If user is authenticated but no role is set, show role selection onboarding
  if (user && !currentRole) {
    return (
      <RoleOnboarding
        onComplete={() => setAppState('app')}
        onBack={() => setAppState('landing')}
      />
    );
  }

  // Show main app if user is authenticated and has a role
  return <PlatformApp />;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RoleProvider>
          <AppContent />
        </RoleProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;