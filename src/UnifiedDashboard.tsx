import React, { useState } from 'react';
   import { BarChart3, TrendingUp, TrendingDown, Brain, Zap, Clock, Mail, Calendar, Target, Activity, Network, MessageSquare, ArrowUp, ArrowDown, Minus } from 'lucide-react';

   const UnifiedDashboard: React.FC = () => {
     // Example metrics
     const metrics = [
       { title: 'Productivity Score', value: '82%', change: 5, trend: 'up', icon: BarChart3 },
       { title: 'Tasks Completed', value: '24/30', change: 3, trend: 'up', icon: Target },
       { title: 'Meetings Scheduled', value: '8', change: -1, trend: 'down', icon: Calendar },
       { title: 'Emails Processed', value: '45', change: 10, trend: 'up', icon: Mail },
     ];

     const recentActivities = [
       { id: 1, type: 'Meeting', description: 'Sprint Planning with Team', time: '2h ago', icon: Calendar },
       { id: 2, type: 'Email', description: 'Sent project update to stakeholders', time: '3h ago', icon: Mail },
       { id: 3, type: 'Task', description: 'Completed market analysis report', time: '5h ago', icon: Target },
     ];

     return (
       <div className="bg-white rounded-xl p-6 border border-slate-200">
         <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
           <Brain className="mr-2" size={20} /> AI Command Center
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
           {metrics.map(metric => (
             <div key={metric.title} className="bg-gray-50 p-4 rounded-lg">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm text-gray-600">{metric.title}</p>
                   <p className="text-xl font-semibold text-gray-900">{metric.value}</p>
                 </div>
                 <metric.icon size={24} className="text-blue-600" />
               </div>
               <div className="flex items-center mt-2">
                 {metric.trend === 'up' ? (
                   <ArrowUp size={16} className="text-green-600" />
                 ) : metric.trend === 'down' ? (
                   <ArrowDown size={16} className="text-red-600" />
                 ) : (
                   <Minus size={16} className="text-gray-600" />
                 )}
                 <span className={`text-sm ml-1 ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                   {Math.abs(metric.change)}% {metric.trend === 'up' ? 'increase' : metric.trend === 'down' ? 'decrease' : 'no change'}
                 </span>
               </div>
             </div>
           ))}
         </div>
         <div className="bg-gray-50 p-4 rounded-lg mb-6">
           <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
             <Zap size={16} className="mr-1" /> AI Recommendations
           </h4>
           <p className="text-sm text-gray-600">Schedule a follow-up meeting with key stakeholders to align on priorities.</p>
         </div>
         <div>
           <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
             <Activity size={16} className="mr-1" /> Recent Activity
           </h4>
           <ul className="space-y-2">
             {recentActivities.map(activity => (
               <li key={activity.id} className="flex items-center space-x-3">
                 <activity.icon size={16} className="text-blue-600" />
                 <div>
                   <p className="text-sm text-gray-900">{activity.description}</p>
                   <p className="text-xs text-gray-500">{activity.time}</p>
                 </div>
               </li>
             ))}
           </ul>
         </div>
       </div>
     );
   };

   export default UnifiedDashboard;