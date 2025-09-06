import React from 'react';
import { Priority } from '../services/priorityService';

interface DraggableMatrixProps {
  priorities: Priority[];
  onEdit: (priority: Priority) => void;
  onDelete: (priority: Priority) => void;
  onPositionChange: (priorityId: string, urgency: number, impact: number) => void;
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export const DraggableMatrix: React.FC<DraggableMatrixProps> = ({
  priorities,
  onEdit,
  onDelete,
  onPositionChange,
  selectedIds,
  onSelectionChange,
}) => {
  // Simple matrix view without drag and drop for now
  const highImpactHighUrgency = priorities.filter(p => p.impact >= 4 && p.urgency >= 4);
  const highImpactLowUrgency = priorities.filter(p => p.impact >= 4 && p.urgency < 4);
  const lowImpactHighUrgency = priorities.filter(p => p.impact < 4 && p.urgency >= 4);
  const lowImpactLowUrgency = priorities.filter(p => p.impact < 4 && p.urgency < 4);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 min-h-[300px]">
        <h3 className="font-semibold text-sm text-gray-900 mb-4">Do First (High Impact, High Urgency)</h3>
        <div className="space-y-2">
          {highImpactHighUrgency.map((priority) => (
            <div key={priority.id} className="bg-white p-3 border rounded-lg">
              <h4 className="font-medium text-sm">{priority.title}</h4>
              <p className="text-xs text-gray-600">{priority.status}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 min-h-[300px]">
        <h3 className="font-semibold text-sm text-gray-900 mb-4">Schedule (High Impact, Low Urgency)</h3>
        <div className="space-y-2">
          {highImpactLowUrgency.map((priority) => (
            <div key={priority.id} className="bg-white p-3 border rounded-lg">
              <h4 className="font-medium text-sm">{priority.title}</h4>
              <p className="text-xs text-gray-600">{priority.status}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 min-h-[300px]">
        <h3 className="font-semibold text-sm text-gray-900 mb-4">Delegate (Low Impact, High Urgency)</h3>
        <div className="space-y-2">
          {lowImpactHighUrgency.map((priority) => (
            <div key={priority.id} className="bg-white p-3 border rounded-lg">
              <h4 className="font-medium text-sm">{priority.title}</h4>
              <p className="text-xs text-gray-600">{priority.status}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[300px]">
        <h3 className="font-semibold text-sm text-gray-900 mb-4">Eliminate (Low Impact, Low Urgency)</h3>
        <div className="space-y-2">
          {lowImpactLowUrgency.map((priority) => (
            <div key={priority.id} className="bg-white p-3 border rounded-lg">
              <h4 className="font-medium text-sm">{priority.title}</h4>
              <p className="text-xs text-gray-600">{priority.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
