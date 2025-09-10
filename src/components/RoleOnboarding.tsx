import React, { useState } from 'react';
import { Users, Target, Zap, Settings, ChevronRight, Check, ArrowLeft, Sparkles } from 'lucide-react';
import { settingsService } from '../services/settingsService';

const ROLE_OPTIONS = [
  {
    category: 'Team Level',
    roles: [
      {
        id: 'product_owner',
        name: 'Product Owner',
        description: 'Own team backlog, define user stories, prioritize work',
        icon: Target,
        preview: {
          navigation: ['User Stories & Backlog', 'Sprint Events', 'Product Metrics'],
          terminology: { priority: 'user story', task: 'backlog item', meeting: 'ceremony' },
          quickActions: ['Create User Story', 'Schedule Sprint Ceremony', 'Review Product Metrics']
        }
      },
      {
        id: 'scrum_master',
        name: 'Scrum Master / Team Coach',
        description: 'Facilitate team events, remove impediments, foster agile practices',
        icon: Users,
        preview: {
          navigation: ['Team Impediments', 'Scrum Events', 'Team Health Metrics'],
          terminology: { priority: 'impediment', task: 'action item', meeting: 'ceremony' },
          quickActions: ['Log Team Impediment', 'Schedule Team Event', 'Check Team Health']
        }
      },
      {
        id: 'business_analyst',
        name: 'Business Analyst',
        description: 'Clarify requirements, bridge business and tech',
        icon: Settings,
        preview: {
          navigation: ['Requirements', 'Stakeholder Sessions', 'Requirements Metrics'],
          terminology: { priority: 'requirement', task: 'analysis task', meeting: 'session' },
          quickActions: ['Capture Requirement', 'Schedule Stakeholder Session', 'Review Requirements']
        }
      },
      {
        id: 'qa_analyst',
        name: 'Tester / QA Analyst',
        description: 'Quality assurance, testing strategy, defect management',
        icon: Check,
        preview: {
          navigation: ['Test Scenarios', 'Quality Sessions', 'Quality Metrics'],
          terminology: { priority: 'test case', task: 'testing task', meeting: 'review' },
          quickActions: ['Create Test Scenario', 'Schedule Quality Review', 'Track Quality Metrics']
        }
      }
    ]
  },
  {
    category: 'Program Level (ART)',
    roles: [
      {
        id: 'release_train_engineer',
        name: 'Release Train Engineer (RTE)',
        description: 'Facilitate PI Planning, coordinate ART, sync teams',
        icon: Zap,
        preview: {
          navigation: ['PI Objectives', 'ART Events', 'ART Metrics'],
          terminology: { priority: 'PI objective', task: 'coordination item', meeting: 'ART event' },
          quickActions: ['Create PI Objective', 'Schedule ART Event', 'View ART Metrics']
        }
      },
      {
        id: 'product_manager',
        name: 'Product Manager',
        description: 'Own program backlog, prioritize features, represent customer needs',
        icon: Target,
        preview: {
          navigation: ['Feature Backlog', 'Customer Sessions', 'Product Analytics'],
          terminology: { priority: 'feature', task: 'product task', meeting: 'customer session' },
          quickActions: ['Create Feature', 'Analyze Market Data', 'Review Product Analytics']
        }
      },
      {
        id: 'system_architect',
        name: 'System Architect / Engineer',
        description: 'Define technical vision and enablers',
        icon: Settings,
        preview: {
          navigation: ['Technical Enablers', 'Architecture Reviews', 'Technical Metrics'],
          terminology: { priority: 'enabler', task: 'architecture task', meeting: 'design review' },
          quickActions: ['Create Technical Enabler', 'Schedule Architecture Review', 'Track Technical Debt']
        }
      }
    ]
  },
  {
    category: 'Solution Level',
    roles: [
      {
        id: 'solution_train_engineer',
        name: 'Solution Train Engineer (STE)',
        description: 'Coordinate multiple ARTs, facilitate solution planning',
        icon: Zap,
        preview: {
          navigation: ['Solution Objectives', 'Multi-ART Events', 'Solution Metrics'],
          terminology: { priority: 'capability', task: 'solution task', meeting: 'solution event' },
          quickActions: ['Create Solution Capability', 'Coordinate ARTs', 'Track Solution Progress']
        }
      },
      {
        id: 'solution_manager',
        name: 'Solution Management',
        description: 'Manage solution backlog, ensure customer alignment',
        icon: Target,
        preview: {
          navigation: ['Solution Backlog', 'Customer Collaboration', 'Solution Analytics'],
          terminology: { priority: 'capability', task: 'solution item', meeting: 'customer review' },
          quickActions: ['Prioritize Solution Backlog', 'Engage Customers', 'Review Solution Metrics']
        }
      }
    ]
  },
  {
    category: 'Portfolio Level',
    roles: [
      {
        id: 'epic_owner',
        name: 'Epic Owner',
        description: 'Drive portfolio epics through Lean Portfolio Management',
        icon: Target,
        preview: {
          navigation: ['Portfolio Epics', 'Business Cases', 'Epic Metrics'],
          terminology: { priority: 'epic', task: 'epic task', meeting: 'portfolio review' },
          quickActions: ['Create Portfolio Epic', 'Review Investment', 'Strategic Analysis']
        }
      },
      {
        id: 'portfolio_manager',
        name: 'Portfolio Manager',
        description: 'Lean Portfolio Management, investment decisions',
        icon: Settings,
        preview: {
          navigation: ['Investment Portfolio', 'Strategic Reviews', 'Portfolio Metrics'],
          terminology: { priority: 'investment theme', task: 'portfolio task', meeting: 'investment review' },
          quickActions: ['Review Investment Themes', 'Strategic Planning', 'Portfolio Governance']
        }
      }
    ]
  }
];

interface RoleOnboardingProps {
  onComplete: () => void;
  onBack: () => void;
}

const RoleOnboarding: React.FC<RoleOnboardingProps> = ({ onComplete, onBack }) => {
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: any) => {
    setSelectedRole(role);
    setCurrentStep(2);
  };

  const handleConfirm = async () => {
    if (!selectedRole) return;
    
    setIsLoading(true);
    try {
      // Save the user's role to the database
      await settingsService.updateUserRole({
        newRoleId: selectedRole.id,
        reason: 'Initial onboarding setup',
        preserveData: false
      });
      
      // Complete onboarding
      onComplete();
    } catch (error) {
      console.error('Failed to save role:', error);
      // Still complete onboarding even if role save fails
      onComplete();
    } finally {
      setIsLoading(false);
    }
  };

  const getTemplatesForRole = (roleId: string) => {
    const templates = {
      product_owner: [
        { name: 'User Story Template', desc: 'As a [user], I want [goal] so that [benefit]' },
        { name: 'Acceptance Criteria', desc: 'Given [context] When [action] Then [outcome]' },
        { name: 'Sprint Goal', desc: 'In this sprint we will achieve [goal]' }
      ],
      scrum_master: [
        { name: 'Impediment Log', desc: 'Issue: [problem] Impact: [effect] Owner: [person]' },
        { name: 'Retrospective', desc: 'What went well? What could improve? Actions?' },
        { name: 'Team Agreement', desc: 'We agree to [behavior] because [reason]' }
      ],
      business_analyst: [
        { name: 'Functional Requirement', desc: 'The system shall [requirement statement]' },
        { name: 'Business Rule', desc: 'Rule: [rule] Rationale: [reason]' },
        { name: 'Acceptance Criteria', desc: 'Criteria for requirement completion' }
      ],
      release_train_engineer: [
        { name: 'PI Objective', desc: 'Objective: [goal] Business Value: [value]' },
        { name: 'ART Risk Register', desc: 'Risk: [risk] Impact: [impact] Mitigation: [plan]' },
        { name: 'Team Sync Agenda', desc: 'Updates, blockers, and coordination items' }
      ],
      product_manager: [
        { name: 'Feature Epic', desc: 'Epic: [name] Value: [benefit] Acceptance: [criteria]' },
        { name: 'Market Research', desc: 'Insight: [finding] Impact: [effect] Action: [next step]' },
        { name: 'Roadmap Item', desc: 'Feature: [name] Timeline: [when] Rationale: [why]' }
      ]
    };
    
    return templates[roleId as keyof typeof templates] || [
      { name: 'Generic Template', desc: 'Customized templates for your role' },
      { name: 'Meeting Notes', desc: 'Structured notes for your meetings' },
      { name: 'Action Items', desc: 'Track follow-up actions and owners' }
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
          </div>
          <button
            onClick={onBack}
            className="absolute top-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to landing</span>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full bg-blue-600 transition-all duration-500 ${
                currentStep >= 2 ? 'w-full' : 'w-0'
              }`}></div>
            </div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full bg-blue-600 transition-all duration-500 ${
                currentStep >= 3 ? 'w-full' : 'w-0'
              }`}></div>
            </div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold ${
              currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Step 1: Role Selection */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What's your role in the SAFe framework?
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                We'll customize the entire platform to match your specific responsibilities, 
                terminology, and workflows. This ensures you get the most relevant experience.
              </p>
            </div>

            <div className="space-y-8">
              {ROLE_OPTIONS.map((category) => (
                <div key={category.category} className="border border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-100">
                    {category.category}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.roles.map((role) => {
                      const Icon = role.icon;
                      return (
                        <button
                          key={role.id}
                          onClick={() => handleRoleSelect(role)}
                          className="p-5 rounded-lg border-2 border-gray-200 text-left transition-all hover:border-blue-500 hover:shadow-md hover:bg-blue-50/50 group"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="p-3 rounded-lg bg-gray-100 group-hover:bg-blue-600 transition-colors">
                              <Icon className="text-gray-600 group-hover:text-white transition-colors" size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-900">
                                {role.name}
                              </h3>
                              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                {role.description}
                              </p>
                              <div className="flex items-center text-blue-600 text-sm font-medium">
                                <span>Customize for this role</span>
                                <ChevronRight className="ml-1 transition-transform group-hover:translate-x-1" size={16} />
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Preview Customizations */}
        {currentStep === 2 && selectedRole && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Here's your personalized experience
              </h1>
              <p className="text-lg text-gray-600">
                As a <span className="font-semibold text-blue-600">{selectedRole.name}</span>, 
                the platform adapts to your specific workflow and terminology.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* Navigation Preview */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Personalized Navigation</h3>
                <div className="space-y-3">
                  {selectedRole.preview.navigation.map((item: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-white/70 backdrop-blur-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-800 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terminology Preview */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Role-Specific Language</h3>
                <div className="space-y-3">
                  {Object.entries(selectedRole.preview.terminology).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-white/70 backdrop-blur-sm">
                      <span className="text-gray-600 capitalize">{key}s →</span>
                      <span className="font-semibold text-purple-700 capitalize">{value}s</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions Preview */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-10">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedRole.preview.quickActions.map((action: string, index: number) => (
                  <div key={index} className="p-4 rounded-lg bg-white/70 backdrop-blur-sm border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <Zap className="text-white" size={16} />
                      </div>
                      <span className="font-medium text-gray-800">{action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Templates Preview */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready-to-Use Templates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getTemplatesForRole(selectedRole.id).map((template, index) => (
                  <div key={index} className="p-4 rounded-lg bg-white border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{template.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Choose Different Role
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                This looks perfect!
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && selectedRole && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="text-white" size={40} />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              You're all set!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Your platform is now customized for a{' '}
              <span className="font-semibold text-blue-600">{selectedRole.name}</span>
            </p>

            <div className="bg-blue-50 rounded-xl p-8 max-w-2xl mx-auto mb-10">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">What happens next?</h3>
              <div className="space-y-3">
                {[
                  'Navigation and terminology updated for your role',
                  'Role-specific templates and workflows ready',
                  'Dashboard customized with relevant metrics',
                  'AI assistant trained to help with your specific role',
                  'Quick actions personalized to your daily tasks'
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="text-blue-600 flex-shrink-0" size={16} />
                    <span className="text-blue-800 text-left">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full max-w-md mx-auto block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Setting up your platform...</span>
                </div>
              ) : (
                'Start Using Your Customized Platform'
              )}
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              You can always change your role later in Settings if your responsibilities change.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleOnboarding;