import React from 'react';
import { Priority } from '../services/priorityService';
import { CheckSquare, X } from 'lucide-react';

interface BulkOperationsProps {
  selectedIds: string[];
  priorities: Priority[];
  onBulkStatusUpdate: (priorityIds: string[], status: Priority['status']) => void;
  onBulkDelete: (priorityIds: string[]) => void;
  onBulkAssign: (priorityIds: string[], assignee: string) => void;
  onBulkUpdateDueDate: (priorityIds: string[], dueDate: string) => void;
  onBulkUpdateTags: (priorityIds: string[], tags: string[]) => void;
  onClearSelection: () => void;
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({
  selectedIds,
  onClearSelection,
}) => {
  const selectedCount = selectedIds.length;

  if (selectedCount === 0) return null;

  return (
    <div className="bg-white border border-blue-200 rounded-lg shadow-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckSquare className="text-blue-600" size={20} />
          <span className="font-medium text-gray-900">
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>
        <button
          onClick={onClearSelection}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>
      <div className="mt-3">
        <p className="text-sm text-gray-600">Bulk operations will be added here.</p>
      </div>
    </div>
  );
};
