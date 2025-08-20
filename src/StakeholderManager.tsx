import React, { useState } from 'react';
import { Users, User, Network, MessageSquare, BarChart3, AlertCircle, CheckCircle, Activity, Heart, Target, Brain, Calendar } from 'lucide-react';

interface Stakeholder {
  id: number;
  name: string;
  role: string;
  department: string;
  influence: number;
  interest: number;
  relationshipHealth: number;
  lastContact: string;
  communicationFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  preferredChannel: 'email' | 'slack' | 'meeting' | 'phone';
  tags: string[];
  notes?: string;
}

const StakeholderManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'network' | 'communication' | 'analytics'>('overview');
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);

  const [stakeholders] = useState<Stakeholder[]>([
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Engineering Manager',
      department: 'Technology',
      influence: 5,
      interest: 4,
      relationshipHealth: 0.9,
      lastContact: '2025-08-15',
      communicationFrequency: 'weekly',
      preferredChannel: 'email',
      tags: ['decision-maker', 'technical', 'supportive'],
      notes: 'Key technical decision maker. Very supportive of product initiatives.',
    },
    {
      id: 2,
      name: 'Mark Peters',
      role: 'Business Analyst',
      department: 'Business',
      influence: 3,
      interest: 5,
      relationshipHealth: 0.75,
      lastContact: '2025-08-12',
      communicationFrequency: 'daily',
      preferredChannel: 'slack',
      tags: ['requirements', 'detail-oriented', 'process-focused'],
      notes: 'Requires detailed documentation and regular updates.',
    },
    {
      id: 3,
      name: 'Lisa Chen',
      role: 'Executive Sponsor',
      department: 'Leadership',
      influence: 5,
      interest: 3,
      relationshipHealth: 0.8,
      lastContact: '2025-08-10',
      communicationFrequency: 'monthly',
      preferredChannel: 'meeting',
      tags: ['executive', 'strategic', 'results-focused'],
      notes: 'Focus on business outcomes and ROI. Prefers high-level updates.',
    },
  ]);

  const getInfluenceInterestQuadrant = (influence: number, interest: number) => {
    if (influence >= 4 && interest >= 4) return { label: 'Manage Closely', color: 'bg-red-100 text-red-800' };
    if (influence >= 4 && interest < 4) return { label: 'Keep Satisfied', color: 'bg-yellow-100 text-yellow-800' };
    if (influence < 4 && interest >= 4) return { label: 'Keep Informed', color: 'bg-blue-100 text-blue-800' };
    return { label: 'Monitor', color: 'bg-gray-100 text-gray-800' };
  };

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

  const getCommunicationInsights = () => {
    const totalStakeholders = stakeholders.length;
    const highInfluence = stakeholders.filter(s => s.influence >= 4).length;
    const needsAttention = stakeholders.filter(s => s.relationshipHealth < 0.7).length;
    const avgHealth = stakeholders.reduce((sum, s) => sum + s.relationshipHealth, 0) / totalStakeholders;

    return {
      totalStakeholders,
      highInfluence,
      needsAttention,
      avgHealth: Math.round(avgHealth * 100),
      recommendations: [
        'Schedule 1:1 with Mark Peters - relationship needs attention',
        'Prepare executive summary for Lisa Chen\'s monthly update',
        'Send technical update to Sarah Johnson this week',
      ],
    };
  };

  const insights = getCommunicationInsights();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Stakeholder Management</h2>
          <p className="text-slate-600 mt-1">Relationship intelligence and communication optimization</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <User size={20} />
            <span>Add Stakeholder</span>
          </button>
          <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Network size={20} />
            <span>Map Relationships</span>
          </button>
        </div>
      </div>

      {/* AI Relationship Insights */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="text-green-600" size={24} />
          <h3 className="text-lg font-semibold text-green-900">AI Relationship Insights</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {insights.recommendations.map((recommendation, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="text-blue-500" size={16} />
                <span className="font-medium text-gray-900">Smart Suggestion</span>
              </div>
              <p className="text-sm text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Stakeholder Overview', icon: Users },
            { id: 'network', label: 'Relationship Network', icon: Network },
            { id: 'communication', label: 'Communication Tracking', icon: MessageSquare },
            { id: 'analytics', label: 'Relationship Analytics', icon: BarChart3 },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4">Influence & Interest Matrix</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h4 className="font-medium text-red-900 mb-3 flex items-center">
                    <AlertCircle size={16} className="mr-2" />
                    Manage Closely (High Influence + High Interest)
                  </h4>
                  <div className="space-y-3">
                    {stakeholders
                      .filter(s => s.influence >= 4 && s.interest >= 4)
                      .map(stakeholder => (
                        <div
                          key={stakeholder.id}
                          className="bg-white p-3 rounded border border-red-200 cursor-pointer"
                          onClick={() => setSelectedStakeholder(stakeholder)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{stakeholder.name}</p>
                              <p className="text-xs text-gray-600">{stakeholder.role}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getHealthIcon(stakeholder.relationshipHealth)}
                              <span className={`text-xs ${getHealthColor(stakeholder.relationshipHealth)}`}>
                                {Math.round(stakeholder.relationshipHealth * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                  <h4 className="font-medium text-yellow-900 mb-3 flex items-center">
                    <Heart size={16} className="mr-2" />
                    Keep Satisfied (High Influence + Low Interest)
                  </h4>
                  <div className="space-y-3">
                    {stakeholders
                      .filter(s => s.influence >= 4 && s.interest < 4)
                      .map(stakeholder => (
                        <div
                          key={stakeholder.id}
                          className="bg-white p-3 rounded border border-yellow-200 cursor-pointer"
                          onClick={() => setSelectedStakeholder(stakeholder)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{stakeholder.name}</p>
                              <p className="text-xs text-gray-600">{stakeholder.role}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getHealthIcon(stakeholder.relationshipHealth)}
                              <span className={`text-xs ${getHealthColor(stakeholder.relationshipHealth)}`}>
                                {Math.round(stakeholder.relationshipHealth * 100)}%
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
                    {stakeholders
                      .filter(s => s.influence < 4 && s.interest >= 4)
                      .map(stakeholder => (
                        <div
                          key={stakeholder.id}
                          className="bg-white p-3 rounded border border-blue-200 cursor-pointer"
                          onClick={() => setSelectedStakeholder(stakeholder)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{stakeholder.name}</p>
                              <p className="text-xs text-gray-600">{stakeholder.role}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getHealthIcon(stakeholder.relationshipHealth)}
                              <span className={`text-xs ${getHealthColor(stakeholder.relationshipHealth)}`}>
                                {Math.round(stakeholder.relationshipHealth * 100)}%
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
                    {stakeholders
                      .filter(s => s.influence < 4 && s.interest < 4)
                      .map(stakeholder => (
                        <div
                          key={stakeholder.id}
                          className="bg-white p-3 rounded border border-gray-200 cursor-pointer"
                          onClick={() => setSelectedStakeholder(stakeholder)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{stakeholder.name}</p>
                              <p className="text-xs text-gray-600">{stakeholder.role}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getHealthIcon(stakeholder.relationshipHealth)}
                              <span className={`text-xs ${getHealthColor(stakeholder.relationshipHealth)}`}>
                                {Math.round(stakeholder.relationshipHealth * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4">Relationship Health</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Overall Health</p>
                  <p className={`text-2xl font-bold ${getHealthColor(insights.avgHealth / 100)}`}>
                    {insights.avgHealth}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">High Influence Stakeholders</p>
                  <p className="text-2xl font-bold text-blue-600">{insights.highInfluence}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Need Attention</p>
                  <p className="text-2xl font-bold text-red-600">{insights.needsAttention}</p>
                </div>
              </div>
            </div>

            {selectedStakeholder && (
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-semibold mb-4">Stakeholder Details</h3>
                <div className="space-y-3 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedStakeholder.name}</p>
                  <p><span className="font-medium">Role:</span> {selectedStakeholder.role}</p>
                  <p><span className="font-medium">Department:</span> {selectedStakeholder.department}</p>
                  <p><span className="font-medium">Last Contact:</span> {selectedStakeholder.lastContact}</p>
                  <p><span className="font-medium">Preferred Channel:</span> {selectedStakeholder.preferredChannel}</p>
                  <p><span className="font-medium">Notes:</span> {selectedStakeholder.notes || 'None'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'network' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Relationship Network Map</h3>
          <div className="text-center py-12">
            <Network className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Network Visualization</h3>
            <p className="text-gray-600 mb-4">Visual representation of stakeholder relationships and influence patterns</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Generate Network Map
            </button>
          </div>
        </div>
      )}

      {activeTab === 'communication' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-semibold mb-4">Recent Communications</h3>
            <div className="space-y-4">
              {stakeholders.map(stakeholder => (
                <div key={stakeholder.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{stakeholder.name}</h4>
                      <p className="text-sm text-gray-600">Last contact: {stakeholder.lastContact}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        stakeholder.communicationFrequency === 'daily'
                          ? 'bg-green-100 text-green-800'
                          : stakeholder.communicationFrequency === 'weekly'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {stakeholder.communicationFrequency}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Preferred: {stakeholder.preferredChannel}</span>
                    <span>•</span>
                    <span className={getHealthColor(stakeholder.relationshipHealth)}>
                      Health: {Math.round(stakeholder.relationshipHealth * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-semibold mb-4">Communication Calendar</h3>
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Upcoming stakeholder touchpoints and scheduled communications</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Stakeholders</p>
                <p className="text-2xl font-bold text-gray-900">{insights.totalStakeholders}</p>
              </div>
              <Users className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Influence</p>
                <p className="text-2xl font-bold text-red-600">{insights.highInfluence}</p>
              </div>
              <Target className="text-red-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Health</p>
                <p className={`text-2xl font-bold ${getHealthColor(insights.avgHealth / 100)}`}>
                  {insights.avgHealth}%
                </p>
              </div>
              <Heart className="text-green-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Need Attention</p>
                <p className="text-2xl font-bold text-orange-600">{insights.needsAttention}</p>
              </div>
              <AlertCircle className="text-orange-600" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Stakeholder Details Modal */}
      {selectedStakeholder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Stakeholder Details</h3>
            <div className="space-y-3 text-sm">
              <p><span className="font-medium">Name:</span> {selectedStakeholder.name}</p>
              <p><span className="font-medium">Role:</span> {selectedStakeholder.role}</p>
              <p><span className="font-medium">Department:</span> {selectedStakeholder.department}</p>
              <p><span className="font-medium">Influence:</span> {selectedStakeholder.influence}/5</p>
              <p><span className="font-medium">Interest:</span> {selectedStakeholder.interest}/5</p>
              <p>
                <span className="font-medium">Relationship Health:</span>{' '}
                <span className={getHealthColor(selectedStakeholder.relationshipHealth)}>
                  {Math.round(selectedStakeholder.relationshipHealth * 100)}%
                </span>
              </p>
              <p><span className="font-medium">Last Contact:</span> {selectedStakeholder.lastContact}</p>
              <p><span className="font-medium">Preferred Channel:</span> {selectedStakeholder.preferredChannel}</p>
              <p><span className="font-medium">Tags:</span> {selectedStakeholder.tags.join(', ')}</p>
              <p><span className="font-medium">Notes:</span> {selectedStakeholder.notes || 'None'}</p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                onClick={() => setSelectedStakeholder(null)}
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