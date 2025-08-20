import React, { useState } from 'react';
   import { Mail, BarChart3, Filter, Plus, Edit2, Brain } from 'lucide-react';

   const EmailIntelligence: React.FC = () => {
     const [emails] = useState([
       { id: 1, sender: 'team@colruyt.be', subject: 'Project Update', priority: 'High', status: 'Unread', date: '2025-08-18' },
       { id: 2, sender: 'manager@colruyt.be', subject: 'Meeting Schedule', priority: 'Medium', status: 'Read', date: '2025-08-17' },
     ]);

     return (
       <div className="bg-white rounded-xl p-6 border border-slate-200">
         <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
           <Mail className="mr-2" size={20} /> Email Intelligence
         </h3>
         <div className="mb-4 flex justify-between items-center">
           <div className="flex space-x-2">
             <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
               <Plus size={16} className="inline mr-1" /> New Email
             </button>
             <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
               <Filter size={16} className="inline mr-1" /> Filter
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
           <p className="text-sm text-gray-600">AI suggests prioritizing emails from stakeholders with high influence scores.</p>
         </div>
         <table className="w-full text-sm text-left text-gray-600">
           <thead className="text-xs text-gray-700 uppercase bg-gray-100">
             <tr>
               <th className="py-3 px-6">Sender</th>
               <th className="py-3 px-6">Subject</th>
               <th className="py-3 px-6">Priority</th>
               <th className="py-3 px-6">Status</th>
               <th className="py-3 px-6">Date</th>
               <th className="py-3 px-6">Actions</th>
             </tr>
           </thead>
           <tbody>
             {emails.map(email => (
               <tr key={email.id} className="border-b hover:bg-gray-50">
                 <td className="py-4 px-6">{email.sender}</td>
                 <td className="py-4 px-6">{email.subject}</td>
                 <td className="py-4 px-6">
                   <span className={`px-2 py-1 rounded-full text-xs ${
                     email.priority === 'High' ? 'bg-red-100 text-red-800' :
                     email.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                   }`}>
                     {email.priority}
                   </span>
                 </td>
                 <td className="py-4 px-6">{email.status}</td>
                 <td className="py-4 px-6">{email.date}</td>
                 <td className="py-4 px-6">
                   <button className="text-blue-600 hover:text-blue-800">
                     <Edit2 size={16} />
                   </button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     );
   };

   export default EmailIntelligence;