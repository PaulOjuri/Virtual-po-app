import React from 'react';
import { Priority } from '../services/priorityService';
import { X } from 'lucide-react';

interface PriorityTemplatesProps {
  onCreateFromTemplate: (templateData: Partial<Priority>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const PriorityTemplates: React.FC<PriorityTemplatesProps> = ({
  onCreateFromTemplate,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Create from Template</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-600">Template functionality will be added here.</p>
        </div>
      </div>
    </div>
  );
};
