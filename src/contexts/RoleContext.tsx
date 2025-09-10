// src/contexts/RoleContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { settingsService, AgileRole, RoleTemplate, RoleChangeRequest } from '../services/settingsService';

interface RoleContextType {
  currentRole: AgileRole | null;
  loading: boolean;
  terminology: Record<string, string>;
  navigation: Record<string, string>;
  dashboardConfig: Record<string, any>;
  moduleVisibility: Record<string, any>;
  templates: RoleTemplate[];
  
  // Methods
  switchRole: (roleId: string, options?: { reason?: string }) => Promise<void>;
  applyTerminology: (text: string) => string;
  getRoleSpecificTemplates: (type: string) => RoleTemplate[];
  isRoleLevel: (level: 'team' | 'program' | 'solution' | 'portfolio') => boolean;
  
  // UI customizations
  getModuleTitle: (module: string) => string;
  getActionLabel: (action: string) => string;
  shouldShowModule: (module: string) => boolean;
  shouldEmphasizeModule: (module: string) => boolean;
  getQuickActions: () => Array<{ label: string; action: string; type?: string }>;
}

const RoleContext = createContext<RoleContextType | null>(null);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within RoleProvider');
  }
  return context;
};

// Role-specific module visibility and configuration
const MODULE_VISIBILITY_DEFAULTS = {
  product_owner: {
    show: ['dashboard', 'unified', 'priorities', 'meetings', 'stakeholders', 'planning', 'knowledge', 'analytics', 'notes', 'calendar', 'emails', 'settings'],
    hide: ['market'],
    emphasize: ['priorities', 'stakeholders', 'notes']
  },
  scrum_master: {
    show: ['dashboard', 'unified', 'priorities', 'meetings', 'stakeholders', 'planning', 'knowledge', 'analytics', 'notes', 'calendar', 'settings'],
    hide: ['emails', 'market'],
    emphasize: ['meetings', 'planning', 'calendar']
  },
  business_analyst: {
    show: ['dashboard', 'unified', 'priorities', 'meetings', 'stakeholders', 'knowledge', 'analytics', 'notes', 'emails', 'settings'],
    hide: ['market', 'planning'],
    emphasize: ['knowledge', 'stakeholders', 'notes']
  },
  release_train_engineer: {
    show: ['dashboard', 'unified', 'priorities', 'meetings', 'stakeholders', 'planning', 'analytics', 'calendar', 'notes', 'settings'],
    hide: ['emails'],
    emphasize: ['meetings', 'analytics', 'calendar']
  },
  product_manager: {
    show: ['dashboard', 'unified', 'priorities', 'stakeholders', 'analytics', 'market', 'notes', 'calendar', 'emails', 'knowledge', 'settings'],
    hide: [],
    emphasize: ['analytics', 'market', 'notes']
  },
  epic_owner: {
    show: ['dashboard', 'unified', 'priorities', 'stakeholders', 'analytics', 'market', 'notes', 'knowledge', 'settings'],
    hide: ['planning'],
    emphasize: ['analytics', 'stakeholders', 'notes']
  }
};

// Role-specific action labels
const ACTION_LABELS = {
  product_owner: {
    'create_priority': 'Create User Story',
    'schedule_meeting': 'Schedule Ceremony',
    'add_task': 'Add Backlog Item'
  },
  scrum_master: {
    'create_priority': 'Log Impediment',
    'schedule_meeting': 'Schedule Team Event',
    'add_task': 'Add Action Item'
  },
  business_analyst: {
    'create_priority': 'Capture Requirement',
    'schedule_meeting': 'Schedule Session',
    'add_task': 'Add Analysis Task'
  },
  release_train_engineer: {
    'create_priority': 'Create PI Objective',
    'schedule_meeting': 'Schedule ART Event',
    'add_task': 'Add Coordination Item'
  },
  product_manager: {
    'create_priority': 'Create Feature',
    'schedule_meeting': 'Schedule Customer Session',
    'add_task': 'Add Product Task'
  },
  epic_owner: {
    'create_priority': 'Create Epic',
    'schedule_meeting': 'Schedule Portfolio Review',
    'add_task': 'Add Epic Task'
  }
};

// Role-specific quick actions
const QUICK_ACTIONS = {
  product_owner: [
    { label: 'Create User Story', action: 'create_priority', type: 'user_story' },
    { label: 'Schedule Sprint Ceremony', action: 'create_meeting', type: 'ceremony' },
    { label: 'Review Product Metrics', action: 'view_analytics', type: 'product' }
  ],
  scrum_master: [
    { label: 'Log Team Impediment', action: 'create_priority', type: 'impediment' },
    { label: 'Schedule Team Event', action: 'create_meeting', type: 'team_event' },
    { label: 'Check Team Health', action: 'view_analytics', type: 'team' }
  ],
  business_analyst: [
    { label: 'Capture Requirement', action: 'create_priority', type: 'requirement' },
    { label: 'Schedule Stakeholder Session', action: 'create_meeting', type: 'session' },
    { label: 'Review Requirements', action: 'view_analytics', type: 'requirements' }
  ],
  release_train_engineer: [
    { label: 'Create PI Objective', action: 'create_priority', type: 'pi_objective' },
    { label: 'Schedule ART Event', action: 'create_meeting', type: 'art_event' },
    { label: 'View ART Metrics', action: 'view_analytics', type: 'art' }
  ],
  product_manager: [
    { label: 'Create Feature', action: 'create_priority', type: 'feature' },
    { label: 'Analyze Market Data', action: 'view_market', type: 'analysis' },
    { label: 'Review Product Analytics', action: 'view_analytics', type: 'product' }
  ],
  epic_owner: [
    { label: 'Create Portfolio Epic', action: 'create_priority', type: 'epic' },
    { label: 'Review Investment', action: 'view_analytics', type: 'portfolio' },
    { label: 'Strategic Analysis', action: 'view_market', type: 'strategic' }
  ]
};

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<AgileRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<RoleTemplate[]>([]);

  useEffect(() => {
    loadCurrentRole();
  }, []);

  const loadCurrentRole = async () => {
    try {
      const role = await settingsService.getCurrentUserRole();
      setCurrentRole(role);
      
      if (role) {
        const roleTemplates = await settingsService.getRoleTemplates(role.id);
        setTemplates(roleTemplates);
      }
    } catch (error) {
      console.error('Failed to load role:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (roleId: string, options?: { reason?: string }) => {
    try {
      await settingsService.updateUserRole({
        newRoleId: roleId,
        reason: options?.reason,
        preserveData: true
      });
      
      await loadCurrentRole(); // Reload role data
    } catch (error) {
      console.error('Failed to switch role:', error);
      throw error;
    }
  };

  const applyTerminology = (text: string): string => {
    if (!currentRole) return text;
    
    return settingsService.applyTerminology(text, currentRole.terminology_mapping);
  };

  const getRoleSpecificTemplates = (type: string) => {
    return templates.filter(t => t.template_type === type);
  };

  const isRoleLevel = (level: 'team' | 'program' | 'solution' | 'portfolio'): boolean => {
    return currentRole?.level === level;
  };

  const getModuleTitle = (module: string): string => {
    if (!currentRole) {
      // Default titles when no role is set
      const defaultTitles: Record<string, string> = {
        dashboard: 'Dashboard',
        unified: 'AI command center',
        priorities: 'Priorities',
        notes: 'Notes',
        calendar: 'SAFe calendar',
        emails: 'Email intelligence',
        meetings: 'Meetings',
        stakeholders: 'Stakeholders',
        knowledge: 'Knowledge base',
        market: 'Market intelligence',
        planning: 'Daily planning',
        analytics: 'Analytics',
        settings: 'Settings'
      };
      return defaultTitles[module] || module;
    }
    
    // Use role's navigation config if available, otherwise fall back to defaults
    const defaultTitles: Record<string, string> = {
      dashboard: 'Dashboard',
      unified: 'AI command center',
      priorities: 'Priorities',
      notes: 'Notes',
      calendar: 'SAFe calendar',
      emails: 'Email intelligence',
      meetings: 'Meetings',
      stakeholders: 'Stakeholders',
      knowledge: 'Knowledge base',
      market: 'Market intelligence',
      planning: 'Daily planning',
      analytics: 'Analytics',
      settings: 'Settings'
    };
    
    return currentRole.navigation_config?.[module] || defaultTitles[module] || module;
  };

  const getActionLabel = (action: string): string => {
    if (!currentRole) return action;
    
    const roleActions = ACTION_LABELS[currentRole.id as keyof typeof ACTION_LABELS];
    return roleActions?.[action as keyof typeof roleActions] || action;
  };

  const shouldShowModule = (module: string): boolean => {
    return true;
    
    // TODO: Re-enable role-based filtering later
    /*
    if (!currentRole) {
      console.log(`📱 No role loaded, showing module: ${module}`);
      return true;
    }
    
    // Use role's module visibility if available, otherwise fall back to defaults
    const visibility = currentRole.module_visibility || MODULE_VISIBILITY_DEFAULTS[currentRole.id as keyof typeof MODULE_VISIBILITY_DEFAULTS];
    
    // If no visibility config, show all modules
    if (!visibility) {
      console.log(`📱 No visibility config for ${currentRole.id}, showing module: ${module}`);
      return true;
    }
    
    // If module is in hide list, don't show it
    if (visibility.hide?.includes(module)) {
      console.log(`📱 Module ${module} is in hide list for role ${currentRole.id}`);
      return false;
    }
    
    // If show list exists and module is not in it, don't show it
    if (visibility.show?.length > 0) {
      const shouldShow = visibility.show.includes(module);
      console.log(`📱 Module ${module} ${shouldShow ? 'IS' : 'IS NOT'} in show list for role ${currentRole.id}:`, visibility.show);
      return shouldShow;
    }
    
    // Default to showing the module
    console.log(`📱 Defaulting to show module: ${module}`);
    return true;
    */
  };

  const shouldEmphasizeModule = (module: string): boolean => {
    if (!currentRole) return false;
    
    const visibility = currentRole.module_visibility || MODULE_VISIBILITY_DEFAULTS[currentRole.id as keyof typeof MODULE_VISIBILITY_DEFAULTS];
    return visibility?.emphasize?.includes(module) || false;
  };

  const getQuickActions = () => {
    if (!currentRole) return [];
    
    return QUICK_ACTIONS[currentRole.id as keyof typeof QUICK_ACTIONS] || [];
  };

  const value: RoleContextType = {
    currentRole,
    loading,
    terminology: currentRole?.terminology_mapping || {},
    navigation: currentRole?.navigation_config || {},
    dashboardConfig: currentRole?.dashboard_config || {},
    moduleVisibility: currentRole?.module_visibility || {},
    templates,
    
    switchRole,
    applyTerminology,
    getRoleSpecificTemplates,
    isRoleLevel,
    getModuleTitle,
    getActionLabel,
    shouldShowModule,
    shouldEmphasizeModule,
    getQuickActions
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

// Higher-order component for role-specific rendering
export const withRoleCustomization = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => {
    const role = useRole();
    
    return (
      <Component 
        {...props} 
        roleCustomization={role}
      />
    );
  };
};

// Hook for role-specific navigation
export const useRoleNavigation = () => {
  const { shouldShowModule, shouldEmphasizeModule, getModuleTitle } = useRole();
  
  const getFilteredNavigation = (baseNavigation: any[]) => {
    return baseNavigation
      .filter(item => shouldShowModule(item.id))
      .map(item => ({
        ...item,
        label: getModuleTitle(item.id),
        emphasized: shouldEmphasizeModule(item.id)
      }));
  };
  
  return { getFilteredNavigation };
};