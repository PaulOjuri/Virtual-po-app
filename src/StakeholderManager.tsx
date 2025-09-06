import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Users, User, Plus, Search, Filter, Edit, Trash2, Phone, Mail, MessageSquare, Calendar, 
         TrendingUp, AlertCircle, CheckCircle, Network, MoreHorizontal, X, Star, 
         Building, Tag, Clock, Activity } from 'lucide-react';
import { Stakeholder, StakeholderService, CommunicationLog } from './services/stakeholderService';

const StakeholderManager: React.FC = () => {
  const { user } = useAuth();
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeView, setActiveView] = useState<'list' | 'matrix' | 'network'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterInfluence, setFilterInfluence] = useState<number>(0);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showStakeholderDetails, setShowStakeholderDetails] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);
  const [editingStakeholder, setEditingStakeholder] = useState<Stakeholder | null>(null);
  const [communications, setCommunications] = useState<CommunicationLog[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    company: '',
    influence: 3,
    interest: 3,
    communicationFrequency: 'weekly' as Stakeholder['communication_frequency'],
    preferredChannel: 'email' as Stakeholder['preferred_channel'],
    tags: [] as string[],
    notes: '',
  });

  useEffect(() => {
    loadStakeholders();
  }, []);

  const loadStakeholders = async () => {
    try {
      setLoading(true);
      const data = await StakeholderService.getAllStakeholders();
      setStakeholders(data);
    } catch (err) {
      setError('Failed to load stakeholders');
      console.error('Error loading stakeholders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStakeholder = async () => {
    if (!user) {
      setError('You must be logged in to create stakeholders');
      return;
    }

    if (!formData.name || !formData.email || !formData.role || !formData.department) {
      setError('Please fill in all required fields (Name, Email, Role, Department)');
      return;
    }

    try {
      setError(null);
      
      const stakeholderData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        company: formData.company,
        influence: formData.influence,
        interest: formData.interest,
        relationship_health: 0.7,
        last_contact: new Date().toISOString().split('T')[0],
        communication_frequency: formData.communicationFrequency,
        preferred_channel: formData.preferredChannel,
        tags: formData.tags,
        notes: formData.notes,
      };
      
      const newStakeholder = await StakeholderService.createStakeholder(stakeholderData);
      
      setStakeholders(prev => [...prev, newStakeholder]);
      resetForm();
      setShowCreateForm(false);
      
    } catch (err) {
      console.error('Error creating stakeholder:', err);
      setError(`Failed to create stakeholder: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleUpdateStakeholder = async (updatedStakeholder: Stakeholder) => {
    if (!user) {
      setError('You must be logged in to update stakeholders');
      return;
    }

    try {
      setError(null);
      
      const stakeholderData = {
        ...updatedStakeholder,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        company: formData.company,
        influence: formData.influence,
        interest: formData.interest,
        communication_frequency: formData.communicationFrequency,
        preferred_channel: formData.preferredChannel,
        tags: formData.tags,
        notes: formData.notes,
      };
      
      const updated = await StakeholderService.updateStakeholder(updatedStakeholder.id!, stakeholderData);
      setStakeholders(prev => prev.map(s => s.id === updated.id ? updated : s));
      setEditingStakeholder(null);
      setShowCreateForm(false);
      resetForm();
    } catch (err) {
      console.error('Error updating stakeholder:', err);
      setError(`Failed to update stakeholder: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeleteStakeholder = async (stakeholder: Stakeholder) => {
    if (!window.confirm('Are you sure you want to delete this stakeholder?')) return;
    
    try {
      await StakeholderService.deleteStakeholder(stakeholder.id!);
      setStakeholders(prev => prev.filter(s => s.id !== stakeholder.id));
      setShowStakeholderDetails(false);
    } catch (err) {
      console.error('Error deleting stakeholder:', err);
      setError('Failed to delete stakeholder');
    }
  };

  const handleViewDetails = async (stakeholder: Stakeholder) => {
    setSelectedStakeholder(stakeholder);
    setShowStakeholderDetails(true);
    
    try {
      const comms = await StakeholderService.getCommunicationHistory(stakeholder.id!);
      setCommunications(comms);
    } catch (err) {
      console.error('Error loading communication history:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      company: '',
      influence: 3,
      interest: 3,
      communicationFrequency: 'weekly',
      preferredChannel: 'email',
      tags: [],
      notes: '',
    });
  };

  const startEdit = (stakeholder: Stakeholder) => {
    setEditingStakeholder(stakeholder);
    setFormData({
      name: stakeholder.name,
      email: stakeholder.email,
      phone: stakeholder.phone || '',
      role: stakeholder.role,
      department: stakeholder.department,
      company: stakeholder.company || '',
      influence: stakeholder.influence,
      interest: stakeholder.interest,
      communicationFrequency: stakeholder.communication_frequency,
      preferredChannel: stakeholder.preferred_channel,
      tags: stakeholder.tags,
      notes: stakeholder.notes || '',
    });
    setShowCreateForm(true);
  };

  const filteredStakeholders = stakeholders.filter(stakeholder => {
    const matchesSearch = stakeholder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stakeholder.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stakeholder.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || stakeholder.department === filterDepartment;
    const matchesInfluence = stakeholder.influence >= filterInfluence;
    
    return matchesSearch && matchesDepartment && matchesInfluence;
  });

  const departments = Array.from(new Set(stakeholders.map(s => s.department)));

  const getHealthColor = (health: number) => {
    if (health >= 0.8) return 'text-green-600';
    if (health >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthIcon = (health: number) => {
    if (health >= 0.8) return <CheckCircle className="text-green-600" size={16} />;
    if (health >= 0.6) return <Activity className="text-yellow-600" size={16} />;
    return <AlertCircle className="text-red-600" size={16} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading stakeholders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Stakeholder Management</h2>
          <p className="text-slate-600 mt-1">Relationship intelligence and communication optimization</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Add Stakeholder</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-800">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 ml-2"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search stakeholders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64"
            />
          </div>
          
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={filterInfluence}
            onChange={(e) => setFilterInfluence(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value={0}>All Influence Levels</option>
            <option value={4}>High Influence (4+)</option>
            <option value={3}>Medium Influence (3+)</option>
          </select>

          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={() => setActiveView('list')}
              className={`p-2 rounded-lg ${activeView === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              <Users size={16} />
            </button>
            <button
              onClick={() => setActiveView('matrix')}
              className={`p-2 rounded-lg ${activeView === 'matrix' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              <TrendingUp size={16} />
            </button>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredStakeholders.length} of {stakeholders.length} stakeholders
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        {activeView === 'list' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStakeholders.map((stakeholder) => (
                <div key={stakeholder.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{stakeholder.name}</h3>
                      <p className="text-sm text-gray-600">{stakeholder.role}</p>
                      <p className="text-sm text-gray-500">{stakeholder.department}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getHealthIcon(stakeholder.relationship_health)}
                      <span className={`text-xs ${getHealthColor(stakeholder.relationship_health)}`}>
                        {Math.round(stakeholder.relationship_health * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <Mail size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{stakeholder.email}</span>
                  </div>

                  {stakeholder.phone && (
                    <div className="flex items-center space-x-2 mb-3">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{stakeholder.phone}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-gray-600 mb-3">
                    <span>Influence: {stakeholder.influence}/5</span>
                    <span>Interest: {stakeholder.interest}/5</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Last contact: {stakeholder.last_contact}</span>
                    <span className={`px-2 py-1 rounded ${
                      stakeholder.communication_frequency === 'daily' ? 'bg-green-100 text-green-800' :
                      stakeholder.communication_frequency === 'weekly' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {stakeholder.communication_frequency}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {stakeholder.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                    {stakeholder.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{stakeholder.tags.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleViewDetails(stakeholder)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Details
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(stakeholder)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteStakeholder(stakeholder)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredStakeholders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No stakeholders match your current filters.
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Influence & Interest Matrix</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <h4 className="font-medium text-red-900 mb-3 flex items-center">
                  <AlertCircle size={16} className="mr-2" />
                  Manage Closely (High Influence + High Interest)
                </h4>
                <div className="space-y-3">
                  {filteredStakeholders.filter(s => s.influence >= 4 && s.interest >= 4).map(stakeholder => (
                    <div key={stakeholder.id} className="bg-white p-3 rounded border border-red-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{stakeholder.name}</p>
                          <p className="text-xs text-gray-600">{stakeholder.role}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getHealthIcon(stakeholder.relationship_health)}
                          <span className={`text-xs ${getHealthColor(stakeholder.relationship_health)}`}>
                            {Math.round(stakeholder.relationship_health * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                <h4 className="font-medium text-yellow-900 mb-3 flex items-center">
                  <Star size={16} className="mr-2" />
                  Keep Satisfied (High Influence + Low Interest)
                </h4>
                <div className="space-y-3">
                  {filteredStakeholders.filter(s => s.influence >= 4 && s.interest < 4).map(stakeholder => (
                    <div key={stakeholder.id} className="bg-white p-3 rounded border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{stakeholder.name}</p>
                          <p className="text-xs text-gray-600">{stakeholder.role}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getHealthIcon(stakeholder.relationship_health)}
                          <span className={`text-xs ${getHealthColor(stakeholder.relationship_health)}`}>
                            {Math.round(stakeholder.relationship_health * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                  <MessageSquare size={16} className="mr-2" />
                  Keep Informed (Low Influence + High Interest)
                </h4>
                <div className="space-y-3">
                  {filteredStakeholders.filter(s => s.influence < 4 && s.interest >= 4).map(stakeholder => (
                    <div key={stakeholder.id} className="bg-white p-3 rounded border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{stakeholder.name}</p>
                          <p className="text-xs text-gray-600">{stakeholder.role}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getHealthIcon(stakeholder.relationship_health)}
                          <span className={`text-xs ${getHealthColor(stakeholder.relationship_health)}`}>
                            {Math.round(stakeholder.relationship_health * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Activity size={16} className="mr-2" />
                  Monitor (Low Influence + Low Interest)
                </h4>
                <div className="space-y-3">
                  {filteredStakeholders.filter(s => s.influence < 4 && s.interest < 4).map(stakeholder => (
                    <div key={stakeholder.id} className="bg-white p-3 rounded border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{stakeholder.name}</p>
                          <p className="text-xs text-gray-600">{stakeholder.role}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getHealthIcon(stakeholder.relationship_health)}
                          <span className={`text-xs ${getHealthColor(stakeholder.relationship_health)}`}>
                            {Math.round(stakeholder.relationship_health * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {editingStakeholder ? 'Edit Stakeholder' : 'Add New Stakeholder'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingStakeholder(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Influence (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.influence}
                    onChange={(e) => setFormData({...formData, influence: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interest (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.interest}
                    onChange={(e) => setFormData({...formData, interest: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Communication Frequency</label>
                  <select
                    value={formData.communicationFrequency}
                    onChange={(e) => setFormData({...formData, communicationFrequency: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Channel</label>
                  <select
                    value={formData.preferredChannel}
                    onChange={(e) => setFormData({...formData, preferredChannel: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="email">Email</option>
                    <option value="slack">Slack</option>
                    <option value="meeting">Meeting</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="decision-maker, technical, supportive"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes about this stakeholder..."
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingStakeholder(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={editingStakeholder ? () => handleUpdateStakeholder({...editingStakeholder, ...formData}) : handleCreateStakeholder}
                disabled={!formData.name || !formData.email || !formData.role || !formData.department}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingStakeholder ? 'Update Stakeholder' : 'Add Stakeholder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showStakeholderDetails && selectedStakeholder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedStakeholder.name}</h2>
                  <p className="text-gray-600">{selectedStakeholder.role} • {selectedStakeholder.department}</p>
                </div>
                <button
                  onClick={() => setShowStakeholderDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Contact Information</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail size={16} className="text-gray-400" />
                      <span className="text-gray-900">{selectedStakeholder.email}</span>
                    </div>
                    
                    {selectedStakeholder.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-gray-900">{selectedStakeholder.phone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      <Building size={16} className="text-gray-400" />
                      <span className="text-gray-900">{selectedStakeholder.company || 'Not specified'}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Relationship Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Influence:</span>
                        <span className="font-medium">{selectedStakeholder.influence}/5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Interest:</span>
                        <span className="font-medium">{selectedStakeholder.interest}/5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Relationship Health:</span>
                        <span className={`font-medium ${getHealthColor(selectedStakeholder.relationship_health)}`}>
                          {Math.round(selectedStakeholder.relationship_health * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Communication Preferences</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Frequency:</span>
                        <span className="font-medium capitalize">{selectedStakeholder.communication_frequency}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Preferred Channel:</span>
                        <span className="font-medium capitalize">{selectedStakeholder.preferred_channel}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Last Contact:</span>
                        <span className="font-medium">{selectedStakeholder.last_contact}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Recent Communications</h3>
                  
                  <div className="space-y-3">
                    {communications.length > 0 ? (
                      communications.map((comm) => (
                        <div key={comm.id} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{comm.subject}</span>
                            <span className={`px-2 py-1 text-xs rounded capitalize ${
                              comm.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                              comm.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {comm.sentiment}
                            </span>
                          </div>
                          {comm.summary && (
                            <p className="text-sm text-gray-600 mb-2">{comm.summary}</p>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="capitalize">{comm.type}</span>
                            <span>{comm.date}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No communication history recorded.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedStakeholder.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {selectedStakeholder.notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                      <p className="text-sm text-gray-600">{selectedStakeholder.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => startEdit(selectedStakeholder)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Edit Stakeholder
              </button>
              <button
                onClick={() => setShowStakeholderDetails(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StakeholderManager;