import React from 'react';
import { Priority } from '../services/priorityService';
import { Bell } from 'lucide-react';

interface AgingAlertsProps {
  priorities: Priority[];
  onPriorityUpdate: (priority: Priority) => void;
  onRefresh: () => void;
}

export const AgingAlerts: React.FC<AgingAlertsProps> = ({
  priorities,
  onPriorityUpdate,
  onRefresh,
}) => {
  // Simple aging alerts placeholder
  const overdueCount = priorities.filter(p => 
    p.due_date && new Date(p.due_date) < new Date() && p.status !== 'done'
  ).length;

  if (overdueCount === 0) return null;

  return (
    <div className="mb-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Bell className="text-orange-600" size={20} />
          <div>
            <h3 className="font-medium text-gray-900">Priority Alerts</h3>
            <p className="text-sm text-gray-600">
              {overdueCount} overdue priorities need attention
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
