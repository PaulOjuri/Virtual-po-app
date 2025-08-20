import React, { useState } from 'react';
   import { Users, User, Network, MessageSquare, BarChart3, AlertCircle, CheckCircle, Activity, Heart, Target, Brain, Calendar } from 'lucide-react';

   const StakeholderManager: React.FC = () => {
     const [stakeholders, setStakeholders] = useState([
       { id: 1, name: 'John Doe', role: 'Project Manager', influence: 5, interest: 4, sentiment: 'Positive', lastInteraction: '2025-08-17' },
       { id: 2, name: 'Jane Smith', role: 'Team Lead', influence: 3, interest: 5, sentiment: 'Neutral', lastInteraction: '2025-08-16' },
     ]);

     return (
       <div className="bg-white rounded-xl p-6 border border-slate-200">
         <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
           <Users className="mr-2" size={20} /> Stakeholder Manager
         </h3>
         <div className="mb-4 flex justify-between items-center">
           <div className="flex space-x-2">
             <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
               <User size={16} className="inline mr-1" /> Add Stakeholder
             </button>
             <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
               <Network size={16} className="inline mr-1" /> View Network
             </button>
           </div>
           <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
             <BarChart3 size={16} className="inline mr-1" /> Analytics
           </button>
         </div>
         <div className="bg-gray-50 p-4 rounded-lg mb-4">
           <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
             <Brain size={16} className="mr-1" /> AI Insights
           </h4>
           <p className="text-sm text-gray-600">Engage with John Doe to align on project goals.</p>
         </div>
         <table className="w-full text-sm text-left text-gray-600">
           <thead className="text-xs text-gray-700 uppercase bg-gray-100">
             <tr>
               <th className="py-3 px-6">Name</th>
               <th className="py-3 px-6">Role</th>
               <th className="py-3 px-6">Influence</th>
               <th className="py-3 px-6">Interest</th>
               <th className="py-3 px-6">Sentiment</th>
               <th className="py-3 px-6">Last Interaction</th>
               <th className="py-3 px-6">Actions</th>
             </tr>
           </thead>
           <tbody>
             {stakeholders.map(stakeholder => (
               <tr key={stakeholder.id} className="border-b hover:bg-gray-50">
                 <td className="py-4 px-6">{stakeholder.name}</td>
                 <td className="py-4 px-6">{stakeholder.role}</td>
                 <td className="py-4 px-6">{stakeholder.influence}/5</td>
                 <td className="py-4 px-6">{stakeholder.interest}/5</td>
                 <td className="py-4 px-6">
                   <span className={`px-2 py-1 rounded-full text-xs ${
                     stakeholder.sentiment === 'Positive' ? 'bg-green-100 text-green-800' :
                     stakeholder.sentiment === 'Neutral' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                   }`}>
                     {stakeholder.sentiment}
                   </span>
                 </td>
                 <td className="py-4 px-6">{stakeholder.lastInteraction}</td>
                 <td className="py-4 px-6">
                   <button className="text-blue-600 hover:text-blue-800">
                     <MessageSquare size={16} />
                   </button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     );
   };

   export default StakeholderManager;