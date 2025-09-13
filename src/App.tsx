import React, { useState } from 'react';
// import MinimalChat from './MinimalChat'; // DISABLED FOR DEBUGGING
import { BarChart3, Brain, Target, Edit3, CalendarDays, Mail, Calendar, Users, FileText, TrendingUp, CheckSquare, Settings as SettingsIcon, LogOut, User } from 'lucide-react';
import Dashboard from './Dashboard';
import Analytics from './Analytics';
import StakeholderManager from './StakeholderManager';
import UnifiedDashboard from './UnifiedDashboard';
import PriorityManager from './PriorityManager';
import MeetingManager from './MeetingManager';
import MarketIntelligence from './MarketIntelligence';
import EmailIntelligence from './EmailIntelligence';
import SAFeCalendar from './SAFeCalendar';
import NotesApp from './NotesApp';
import DailyPlanning from './DailyPlanning';
import DocumentKnowledgeBase from './DocumentKnowledgeBase';
import Settings from './Settings';
import VelocityLogo from './components/VelocityLogo';
import { MockProviders } from './contexts/MockProviders';

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<'app' | 'chat'>('app');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  
  const navItems = [
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

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <MockProviders>
            <Dashboard />
          </MockProviders>
        );
      case 'analytics':
        return (
          <MockProviders>
            <Analytics />
          </MockProviders>
        );
      case 'unified':
        return (
          <MockProviders>
            <UnifiedDashboard />
          </MockProviders>
        );
      case 'stakeholders':
        return (
          <MockProviders>
            <StakeholderManager />
          </MockProviders>
        );
      case 'priorities':
        return (
          <MockProviders>
            <PriorityManager />
          </MockProviders>
        );
      case 'meetings':
        return (
          <MockProviders>
            <MeetingManager />
          </MockProviders>
        );
      case 'market':
        return (
          <MockProviders>
            <MarketIntelligence />
          </MockProviders>
        );
      case 'emails':
        return (
          <MockProviders>
            <EmailIntelligence />
          </MockProviders>
        );
      case 'calendar':
        return (
          <MockProviders>
            <SAFeCalendar />
          </MockProviders>
        );
      case 'notes':
        return (
          <MockProviders>
            <NotesApp />
          </MockProviders>
        );
      case 'planning':
        return (
          <MockProviders>
            <DailyPlanning />
          </MockProviders>
        );
      case 'knowledge':
        return (
          <MockProviders>
            <DocumentKnowledgeBase />
          </MockProviders>
        );
      case 'settings':
        return (
          <MockProviders>
            <Settings />
          </MockProviders>
        );
      default:
        const selectedModule = navItems.find(item => item.id === activeTab);
        return (
          <div style={{ padding: '30px', background: 'white', minHeight: '100vh' }}>
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                {selectedModule?.label || 'Module'}
              </h1>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                Velocity - {selectedModule?.label} Module
              </p>
            </div>
            
            <div style={{ 
              background: '#f8fafc', 
              border: '2px dashed #e2e8f0',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ marginBottom: '20px' }}>
                {selectedModule?.icon && <selectedModule.icon size={48} color="#64748b" />}
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                {selectedModule?.label} Module
              </h2>
              <p style={{ color: '#6b7280', fontSize: '14px', maxWidth: '400px', lineHeight: '1.6' }}>
                This {selectedModule?.label.toLowerCase()} module is being restored. The full implementation will be loaded here.
              </p>
              <div style={{ 
                background: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '24px',
                textAlign: 'left',
                maxWidth: '500px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Module Status: 🔄 Being Restored
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                  We're gradually restoring all modules to avoid runtime errors.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };
  
  // ChatGPT-style AI Assistant Mode
  if (appMode === 'chat') {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAppMode('app')}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              <span>←</span>
              <span>Back to Virtual PO</span>
            </button>
            <div className="flex items-center space-x-2">
              <VelocityLogo size={32} />
              <h1 className="text-xl font-bold text-gray-900">AI Assistant</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Online</span>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Welcome Message */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div className="bg-white rounded-lg p-4 max-w-2xl shadow-sm border border-gray-200">
                <p className="text-gray-900 mb-2">
                  Hello! I'm your AI Assistant for the Virtual Product Owner platform. I can help you with:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Analyzing your product roadmap and priorities</li>
                  <li>• Generating insights from stakeholder feedback</li>
                  <li>• Optimizing meeting schedules and agendas</li>
                  <li>• Creating market intelligence reports</li>
                  <li>• Managing your daily planning and tasks</li>
                  <li>• Answering questions about your product data</li>
                </ul>
                <p className="text-gray-600 text-sm mt-3">
                  What would you like to discuss today?
                </p>
              </div>
            </div>

            {/* Sample conversation for demo */}
            <div className="flex items-start space-x-3 justify-end">
              <div className="bg-blue-500 rounded-lg p-4 max-w-2xl text-white shadow-sm">
                <p>Can you help me analyze the current sprint progress and identify any bottlenecks?</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div className="bg-white rounded-lg p-4 max-w-2xl shadow-sm border border-gray-200">
                <p className="text-gray-900 mb-3">
                  Based on your current sprint data, I've identified several key insights:
                </p>
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <h4 className="font-medium text-gray-900 mb-2">Sprint Progress Summary</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 12 of 18 story points completed (67%)</li>
                    <li>• 3 tasks are blocked awaiting stakeholder input</li>
                    <li>• 2 high-priority items are at risk of missing deadline</li>
                  </ul>
                </div>
                <p className="text-gray-700 text-sm">
                  I recommend scheduling a quick stakeholder sync to unblock the waiting items and reviewing the capacity allocation for the high-priority tasks.
                </p>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex items-end space-x-3 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <textarea
                  placeholder="Type your message here... (Press Shift+Enter for new line)"
                  className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                  }}
                />
                <button className="absolute right-2 top-2 w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center text-white transition-colors">
                  <span className="text-sm">→</span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>AI Assistant can make mistakes. Verify important information.</span>
              <span>Press Shift+Enter for new line, Enter to send</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full Virtual PO App
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col fixed left-0 top-0 h-full">
        {/* Profile Section */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <VelocityLogo size={40} />
            <div>
              <div className="font-bold text-white">Product Owner</div>
              <div className="text-sm text-gray-300">Velocity</div>
              <div className="text-xs text-gray-400">demo@velocity.app</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* AI Assistant Button */}
        <div className="px-4 pb-4">
          <button
            onClick={() => setAppMode('chat')}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
          >
            <Brain size={16} className="flex-shrink-0" />
            <span>AI Assistant</span>
          </button>
        </div>

        {/* Demo Sign Out Button */}
        <div className="px-4 pb-6">
          <button
            onClick={() => alert('Velocity Demo - Full version would handle authentication')}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors flex items-center space-x-2"
          >
            <LogOut size={16} className="flex-shrink-0" />
            <span>Demo Mode</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Header Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {navItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Velocity - Product Management Platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium text-white" style={{backgroundColor: 'rgba(22, 163, 74, 0.1)', color: '#16a34a'}}>
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#16a34a'}}></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Container */}
        <div className="flex-1 overflow-auto p-6 bg-gray-100">
          {renderContent()}
        </div>
      </div>

    </div>
  );
};

export default App;