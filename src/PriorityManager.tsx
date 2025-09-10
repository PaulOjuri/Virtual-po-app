import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useRole } from './contexts/RoleContext';
import { Target, Plus, Search, Filter, Edit, Trash2, Calendar, User, Star, Zap, MoreHorizontal, X, CheckSquare, Grid, List } from 'lucide-react';
import { Priority, PriorityService } from './services/priorityService';
import { DraggableMatrix } from './components/DraggableMatrix';
import { PriorityTemplates } from './components/PriorityTemplates';
import { BulkOperations } from './components/BulkOperations';
import { AgingAlerts } from './components/AgingAlerts';
import AIChat from './components/AIChat';

const PriorityManager: React.FC = () => {
  const { user } = useAuth();
  const { getActionLabel, getQuickActions, applyTerminology, getRoleSpecificTemplates } = useRole();
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // View and UI state
  const [activeView, setActiveView] = useState<'matrix' | 'list'>('matrix');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'backlog' | 'in-progress' | 'review' | 'done'>('all');
  
  // Modal and form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingPriority, setEditingPriority] = useState<Priority | null>(null);
  
  // Bulk operations state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority_level: 'medium' as Priority['priority_level'],
    urgency: 3,
    impact: 3,
    assigned_to: '',
    due_date: '',
    tags: [] as string[],
  });

  useEffect(() => {
    console.log('PriorityManager mounted. User:', user?.email);
    loadPriorities();
  }, []);

  const loadPriorities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PriorityService.getAllPriorities();
      setPriorities(data);
      console.log(`Loaded ${data.length} priorities`);
    } catch (err) {
      setError('Failed to load priorities');
      console.error('Error loading priorities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePriority = async () => {
    if (!user) {
      setError('You must be logged in to create priorities');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a priority title');
      return;
    }

    try {
      setError(null);
      
      const priorityData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority_level: formData.priority_level,
        status: 'backlog' as Priority['status'],
        urgency: formData.urgency,
        impact: formData.impact,
        assigned_to: formData.assigned_to.trim(),
        due_date: formData.due_date || undefined,
        tags: formData.tags.filter(tag => tag.trim()),
        progress: 0,
      };

      console.log('Creating priority:', priorityData);
      const newPriority = await PriorityService.createPriority(priorityData);
      setPriorities(prev => [newPriority, ...prev]);
      resetForm();
      setShowCreateForm(false);
      console.log('Priority created successfully:', newPriority.id);
      
    } catch (err) {
      console.error('Error creating priority:', err);
      setError(`Failed to create priority: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleUpdatePriority = async (updatedPriority: Priority) => {
    if (!user) {
      setError('You must be logged in to update priorities');
      return;
    }

    try {
      setError(null);
      
      const priorityData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority_level: formData.priority_level,
        urgency: formData.urgency,
        impact: formData.impact,
        assigned_to: formData.assigned_to.trim(),
        due_date: formData.due_date || undefined,
        tags: formData.tags.filter(tag => tag.trim()),
      };
      
      const updated = await PriorityService.updatePriority(updatedPriority.id!, priorityData);
      setPriorities(prev => prev.map(p => p.id === updated.id ? updated : p));
      setEditingPriority(null);
      setShowCreateForm(false);
      resetForm();
      console.log('Priority updated successfully:', updated.id);
    } catch (err) {
      console.error('Error updating priority:', err);
      setError(`Failed to update priority: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeletePriority = async (priority: Priority) => {
    if (!window.confirm(`Are you sure you want to delete "${priority.title}"?`)) return;
    
    try {
      setError(null);
      await PriorityService.deletePriority(priority.id!);
      setPriorities(prev => prev.filter(p => p.id !== priority.id));
      console.log('Priority deleted:', priority.id);
    } catch (err) {
      console.error('Error deleting priority:', err);
      setError('Failed to delete priority');
    }
  };

  const startEdit = (priority: Priority) => {
    setEditingPriority(priority);
    setFormData({
      title: priority.title,
      description: priority.description || '',
      priority_level: priority.priority_level,
      urgency: priority.urgency,
      impact: priority.impact,
      assigned_to: priority.assigned_to || '',
      due_date: priority.due_date || '',
      tags: priority.tags || [],
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority_level: 'medium',
      urgency: 3,
      impact: 3,
      assigned_to: '',
      due_date: '',
      tags: [],
    });
    setEditingPriority(null);
  };

  const handleBulkStatusUpdate = async (status: Priority['status']) => {
    try {
      setError(null);
      await PriorityService.bulkUpdateStatus(selectedIds, status);
      setPriorities(prev => 
        prev.map(p => 
          selectedIds.includes(p.id!) ? { ...p, status } : p
        )
      );
      setSelectedIds([]);
      console.log(`Bulk updated ${selectedIds.length} priorities to status: ${status}`);
    } catch (err) {
      console.error('Error bulk updating priorities:', err);
      setError('Failed to update priorities');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} priorities?`)) return;
    
    try {
      setError(null);
      await PriorityService.bulkDelete(selectedIds);
      setPriorities(prev => prev.filter(p => !selectedIds.includes(p.id!)));
      setSelectedIds([]);
      console.log(`Bulk deleted ${selectedIds.length} priorities`);
    } catch (err) {
      console.error('Error bulk deleting priorities:', err);
      setError('Failed to delete priorities');
    }
  };

  // Filter priorities based on search and filters
  const filteredPriorities = priorities.filter(priority => {
    const matchesSearch = priority.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (priority.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (priority.assigned_to || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || priority.priority_level === filterLevel;
    const matchesStatus = filterStatus === 'all' || priority.status === filterStatus;
    
    return matchesSearch && matchesLevel && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading priorities...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{applyTerminology('Priority Management')}</h2>
          <p className="text-slate-600 mt-1">Impact vs Urgency matrix with {applyTerminology('priority')} tracking</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTemplates(true)}
            className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
          >
            <Zap size={20} />
            <span>Templates</span>
          </button>
          <button
            onClick={() => {
              console.log('New Priority button clicked');
              setShowCreateForm(true);
              resetForm();
            }}
            className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>New Priority</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-800">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Aging Alerts */}
      <AgingAlerts 
        priorities={priorities}
        onPriorityUpdate={(updated: Priority) => {
          setPriorities(prev => prev.map(p => p.id === updated.id ? updated : p));
        }}
        onRefresh={loadPriorities}
      />

      {/* Bulk Operations */}
      {selectedIds.length > 0 && (
        <BulkOperations
          selectedIds={selectedIds}
          priorities={priorities}
          onBulkStatusUpdate={handleBulkStatusUpdate}
          onBulkDelete={handleBulkDelete}
          onBulkAssign={async () => {}}
          onBulkUpdateDueDate={async () => {}}
          onBulkUpdateTags={async () => {}}
          onClearSelection={() => setSelectedIds([])}
        />
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search priorities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="backlog">Backlog</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
          
          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={() => setActiveView('matrix')}
              className={`px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 ${
                activeView === 'matrix' 
                  ? 'bg-green-200' 
                  : ''
              }`}
              title="Matrix View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 ${
                activeView === 'list' 
                  ? 'bg-green-200' 
                  : ''
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredPriorities.length} of {priorities.length} priorities
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-slate-200">
        {activeView === 'matrix' ? (
          <div className="p-6">
            <DraggableMatrix
              priorities={filteredPriorities}
              onEdit={startEdit}
              onDelete={handleDeletePriority}
              onPositionChange={(priorityId, urgency, impact) => {
                // Update position in database
                PriorityService.updatePriorityPosition(priorityId, urgency, impact)
                  .then(() => loadPriorities())
                  .catch(err => {
                    console.error('Error updating position:', err);
                    setError('Failed to update priority position');
                  });
              }}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          </div>
        ) : (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredPriorities.length && filteredPriorities.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(filteredPriorities.map(p => p.id!));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Title</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Impact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Urgency</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Assigned To</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Due Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPriorities.map((priority) => (
                    <tr key={priority.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(priority.id!)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds([...selectedIds, priority.id!]);
                            } else {
                              setSelectedIds(selectedIds.filter(id => id !== priority.id));
                            }
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{priority.title}</div>
                          {priority.description && (
                            <div className="text-sm text-gray-600 mt-1">
                              {priority.description}
                            </div>
                          )}
                          {priority.tags && priority.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {priority.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          priority.status === 'done' ? 'bg-green-100 text-green-800' :
                          priority.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          priority.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {priority.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          priority.priority_level === 'critical' ? 'bg-red-100 text-red-800' :
                          priority.priority_level === 'high' ? 'bg-orange-100 text-orange-800' :
                          priority.priority_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {priority.priority_level}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="text-sm font-medium">{priority.impact}</span>
                          <span className="text-xs text-gray-400">/5</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="text-sm font-medium">{priority.urgency}</span>
                          <span className="text-xs text-gray-400">/5</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {priority.assigned_to ? (
                          <span className="text-sm text-gray-900">{priority.assigned_to}</span>
                        ) : (
                          <span className="text-sm text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {priority.due_date ? (
                          <span className="text-sm text-gray-600">{priority.due_date}</span>
                        ) : (
                          <span className="text-sm text-gray-400">No due date</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(priority)}
                            className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                            title="Edit priority"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeletePriority(priority)}
                            className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                            title="Delete priority"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPriorities.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Target className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No priorities found</h3>
                  <p className="text-gray-600">
                    {priorities.length === 0 
                      ? "Get started by creating your first priority." 
                      : "Try adjusting your search or filters."}
                  </p>
                  {priorities.length === 0 && (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                    >
                      <Plus size={16} />
                      <span>{getActionLabel('create_priority')}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Priority Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingPriority ? `Edit ${applyTerminology('Priority')}` : `${getActionLabel('create_priority')}`}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter priority title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the priority in detail"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority_level}
                    onChange={(e) => setFormData({...formData, priority_level: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Person responsible"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Impact (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.impact}
                    onChange={(e) => setFormData({...formData, impact: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.urgency}
                    onChange={(e) => setFormData({...formData, urgency: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="feature, bug, enhancement, etc."
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingPriority) {
                    handleUpdatePriority(editingPriority);
                  } else {
                    handleCreatePriority();
                  }
                }}
                disabled={!formData.title.trim()}
                className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
{editingPriority ? `Update ${applyTerminology('Priority')}` : getActionLabel('create_priority')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      <PriorityTemplates
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onCreateFromTemplate={(templateData) => {
          setFormData({
            title: templateData.title || '',
            description: templateData.description || '',
            priority_level: templateData.priority_level || 'medium',
            urgency: templateData.urgency || 3,
            impact: templateData.impact || 3,
            assigned_to: templateData.assigned_to || '',
            due_date: templateData.due_date || '',
            tags: templateData.tags || [],
          });
          setShowTemplates(false);
          setShowCreateForm(true);
        }}
      />

      {/* AI Chat Assistant */}
      <AIChat 
        currentContext="priorities"
        contextData={{
          priorities: priorities,
          searchTerm: searchTerm,
          activeView: activeView
        }}
      />
    </div>
  );
};

export default PriorityManager;