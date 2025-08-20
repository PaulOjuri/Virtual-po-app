import React, { useState } from 'react';
   import { Calendar, Mail, Users, CheckSquare, BarChart3, Settings, Target, Brain, FileText } from 'lucide-react';
   import UnifiedDashboard from './UnifiedDashboard';
   import EmailIntelligence from './EmailIntelligence';
   import StakeholderManager from './StakeholderManager';
   import PriorityManager from './PriorityManager';
   import MeetingManager from './MeetingManager';
   import DailyPlanning from './DailyPlanning';
   import MarketIntelligence from './MarketIntelligence';
   import KnowledgeBase from './KnowledgeBase';

   const App: React.FC = () => {
     const [activeTab, setActiveTab] = useState('dashboard');
     const [user] = useState({ name: 'Product Owner', email: 'po@colruyt.be' });

     const navItems = [
       { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
       { id: 'unified', label: 'AI Command Center', icon: Brain },
       { id: 'priorities', label: 'Priorities', icon: Target },
       { id: 'emails', label: 'Email Intelligence', icon: Mail },
       { id: 'meetings', label: 'Meetings', icon: Calendar },
       { id: 'stakeholders', label: 'Stakeholders', icon: Users },
       { id: 'market', label: 'Market Intelligence', icon: BarChart3 },
       { id: 'planning', label: 'Daily Planning', icon: CheckSquare },
       { id: 'knowledge', label: 'Knowledge Base', icon: FileText },
       { id: 'analytics', label: 'Analytics', icon: BarChart3 },
       { id: 'settings', label: 'Settings', icon: Settings },
     ];

     const Navigation: React.FC = () => {
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

     const PlaceholderComponent: React.FC<{ title: string }> = ({ title }) => (
       <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
         <h3 className="text-lg font-semibold text-gray-900 mb-4">{title} coming soon 🚧</h3>
         <p className="text-gray-600">This feature is under development and will be available soon.</p>
       </div>
     );

     const Dashboard: React.FC = () => (
       <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
         <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard</h3>
         <p className="text-gray-600">Main dashboard with key metrics and quick actions.</p>
       </div>
     );

     const renderContent = () => {
       switch (activeTab) {
         case 'dashboard':
           return <Dashboard />;
         case 'unified':
           return <UnifiedDashboard />;
         case 'priorities':
           return <PriorityManager />;
         case 'emails':
           return <EmailIntelligence />;
         case 'meetings':
           return <MeetingManager />;
         case 'stakeholders':
           return <StakeholderManager />;
         case 'market':
           return <MarketIntelligence />;
         case 'planning':
           return <DailyPlanning />;
         case 'knowledge':
           return <KnowledgeBase />;
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
         <main className="flex-1 p-8">{renderContent()}</main>
       </div>
     );
   };

   export default App;