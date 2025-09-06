// src/services/settingsService.ts - Enhanced with real Supabase integration
import { supabase } from '../lib/supabase';

// Existing interfaces (keep your current ones)
export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  timezone: string;
  language: string;
  // NEW ROLE FIELDS
  role_id?: string;
  role_level?: string;
  role_selected_at?: string;
  role_customizations?: Record<string, any>;
}

export interface UserPreferences {
  compact_mode: boolean;
  auto_save: boolean;
  smart_suggestions: boolean;
  dashboard_layout: string;
  priority_view: string;
  items_per_page: number;
  theme: string;
  sidebar_collapsed: boolean;
  show_tooltips: boolean;
  date_format: string;
  time_format: string;
  default_priority_level: string;
  default_meeting_duration: number;
}

export interface UserIntegration {
  id?: string;
  integration_type: string;
  integration_name: string;
  connected: boolean;
  last_sync?: string;
}

export interface NotificationSetting {
  id?: string;
  setting_type: string;
  setting_name: string;
  description: string;
  email_enabled: boolean;
  push_enabled: boolean;
  slack_enabled: boolean;
}

export interface UserSession {
  id?: string;
  device_type?: string;
  browser?: string;
  location?: string;
  last_active: string;
  is_current: boolean;
}

export interface ActivityLog {
  id?: string;
  activity_description: string;
  created_at?: string;
}

// NEW ROLE INTERFACES
export interface AgileRole {
  id: string;
  name: string;
  category: string;
  level: string;
  description: string;
  terminology_mapping: Record<string, string>;
  navigation_config: Record<string, string>;
  dashboard_config: Record<string, any>;
  module_visibility: Record<string, any>;
}

export interface RoleTemplate {
  id?: string;
  role_id: string;
  template_type: string;
  template_name: string;
  template_content: Record<string, any>;
  is_default: boolean;
  usage_count: number;
}

export interface RoleChangeRequest {
  newRoleId: string;
  reason?: string;
  preserveData?: boolean;
}

// Get current user ID helper
async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
}

// Log activity helper
async function logActivity(action: string, details?: any): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    await supabase.from('user_activity_log').insert({
      user_id: userId,
      action,
      details: details || {},
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Failed to log activity:', error);
  }
}

export const settingsService = {
  // ==================== EXISTING METHODS (Enhanced with real Supabase) ====================
  
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const userId = await getCurrentUserId();
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is ok
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!data) {
        // Create default profile
        const { data: user } = await supabase.auth.getUser();
        const defaultProfile = {
          user_id: userId,
          name: user.user?.user_metadata?.full_name || '',
          email: user.user?.email || '',
          role: 'Product Owner',
          timezone: 'Europe/Brussels',
          language: 'English',
          role_id: 'product_owner',
          role_level: 'team',
          role_selected_at: new Date().toISOString(),
          role_customizations: {}
        };

        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(defaultProfile)
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          return null;
        }

        return newProfile;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  },

  async updateUserProfile(profile: Partial<UserProfile>): Promise<boolean> {
    try {
      const userId = await getCurrentUserId();
      
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ 
          user_id: userId, 
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating user profile:', error);
        return false;
      }

      await logActivity('profile_updated', { fields: Object.keys(profile) });
      return true;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return false;
    }
  },

  async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      const userId = await getCurrentUserId();
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user preferences:', error);
        return null;
      }

      if (!data) {
        // Create default preferences
        const defaultPrefs: UserPreferences = {
          compact_mode: false,
          auto_save: true,
          smart_suggestions: true,
          dashboard_layout: 'overview_first',
          priority_view: 'matrix_view',
          items_per_page: 25,
          theme: 'light',
          sidebar_collapsed: false,
          show_tooltips: true,
          date_format: 'MM/DD/YYYY',
          time_format: '24h',
          default_priority_level: 'medium',
          default_meeting_duration: 60
        };

        const { data: newPrefs, error: createError } = await supabase
          .from('user_preferences')
          .insert({ user_id: userId, ...defaultPrefs })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user preferences:', createError);
          return null;
        }

        return newPrefs;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      return null;
    }
  },

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<boolean> {
    try {
      const userId = await getCurrentUserId();
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert({ 
          user_id: userId, 
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating user preferences:', error);
        return false;
      }

      await logActivity('preferences_updated', { fields: Object.keys(preferences) });
      return true;
    } catch (error) {
      console.error('Error in updateUserPreferences:', error);
      return false;
    }
  },

  // Keep your existing mock methods for integrations, notifications, sessions for now
  // They can be gradually migrated to real Supabase tables

  async getUserIntegrations(): Promise<UserIntegration[]> {
    // TODO: Implement with real Supabase table
    // For now, return mock data from your existing implementation
    return [
      { id: '1', integration_type: 'slack', integration_name: 'Slack', connected: true, last_sync: new Date().toISOString() },
      { id: '2', integration_type: 'gmail', integration_name: 'Gmail', connected: false },
      { id: '3', integration_type: 'calendar', integration_name: 'Google Calendar', connected: true, last_sync: new Date().toISOString() },
    ];
  },

  async connectIntegration(integrationType: string): Promise<boolean> {
    await logActivity('integration_connected', { type: integrationType });
    return true; // Mock implementation
  },

  async disconnectIntegration(integrationType: string): Promise<boolean> {
    await logActivity('integration_disconnected', { type: integrationType });
    return true; // Mock implementation
  },

  async getNotificationSettings(): Promise<NotificationSetting[]> {
    // TODO: Implement with real Supabase table
    return [
      { id: '1', setting_type: 'priority_updates', setting_name: 'Priority Updates', description: 'Notifications about priority changes', email_enabled: true, push_enabled: true, slack_enabled: false },
      { id: '2', setting_type: 'meeting_reminders', setting_name: 'Meeting Reminders', description: 'Reminders for upcoming meetings', email_enabled: true, push_enabled: true, slack_enabled: true },
    ];
  },

  async updateNotificationSetting(settingType: string, updates: Partial<NotificationSetting>): Promise<boolean> {
    await logActivity('notification_setting_updated', { type: settingType, updates });
    return true; // Mock implementation
  },

  async getUserSessions(): Promise<UserSession[]> {
    // TODO: Implement with real Supabase table
    return [
      { id: '1', device_type: 'desktop', browser: 'Chrome', location: 'Brussels, Belgium', last_active: new Date().toISOString(), is_current: true },
    ];
  },

  async getActivityLog(limit: number = 10): Promise<ActivityLog[]> {
    try {
      const userId = await getCurrentUserId();
      
      const { data, error } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching activity log:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActivityLog:', error);
      return [];
    }
  },

  // ==================== NEW ROLE METHODS ====================

  async getAvailableRoles(): Promise<AgileRole[]> {
    try {
      const { data, error } = await supabase
        .from('agile_roles')
        .select('*')
        .order('level', { ascending: true });

      if (error) {
        console.error('Error fetching available roles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAvailableRoles:', error);
      return [];
    }
  },

  async getCurrentUserRole(): Promise<AgileRole | null> {
    try {
      const profile = await this.getUserProfile();
      if (!profile?.role_id) return null;

      const { data, error } = await supabase
        .from('agile_roles')
        .select('*')
        .eq('id', profile.role_id)
        .single();

      if (error) {
        console.error('Error fetching current user role:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCurrentUserRole:', error);
      return null;
    }
  },

  async updateUserRole({ newRoleId, reason, preserveData = true }: RoleChangeRequest): Promise<void> {
    try {
      const userId = await getCurrentUserId();
      const currentProfile = await this.getUserProfile();
      
      // Record role change in history
      if (currentProfile?.role_id && currentProfile.role_id !== newRoleId) {
        await supabase.from('user_role_history').insert({
          user_id: userId,
          previous_role_id: currentProfile.role_id,
          new_role_id: newRoleId,
          reason: reason || 'User initiated change',
          migration_data: { preserveData }
        });
      }

      // Get new role details
      const { data: newRole } = await supabase
        .from('agile_roles')
        .select('*')
        .eq('id', newRoleId)
        .single();

      // Update user profile
      await this.updateUserProfile({
        role_id: newRoleId,
        role_level: newRole?.level,
        role_selected_at: new Date().toISOString(),
        role: newRole?.name || 'Unknown Role'
      });

      await logActivity('role_changed', {
        from: currentProfile?.role_id || 'none',
        to: newRoleId,
        reason: reason
      });
    } catch (error) {
      console.error('Error in updateUserRole:', error);
      throw error;
    }
  },

  async getRoleTemplates(roleId: string, templateType?: string): Promise<RoleTemplate[]> {
    try {
      let query = supabase
        .from('role_templates')
        .select('*')
        .eq('role_id', roleId);

      if (templateType) {
        query = query.eq('template_type', templateType);
      }

      const { data, error } = await query.order('template_name');
      
      if (error) {
        console.error('Error fetching role templates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRoleTemplates:', error);
      return [];
    }
  },

  async incrementTemplateUsage(templateId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('role_templates')
        .update({ 
          usage_count: supabase.sql`usage_count + 1`,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId);

      if (error) {
        console.error('Error incrementing template usage:', error);
      }
    } catch (error) {
      console.error('Error in incrementTemplateUsage:', error);
    }
  },

  async getRoleHistory(): Promise<any[]> {
    try {
      const userId = await getCurrentUserId();
      
      const { data, error } = await supabase
        .from('user_role_history')
        .select(`
          *,
          previous_role:agile_roles!user_role_history_previous_role_id_fkey(*),
          new_role:agile_roles!user_role_history_new_role_id_fkey(*)
        `)
        .eq('user_id', userId)
        .order('changed_at', { ascending: false });

      if (error) {
        console.error('Error fetching role history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRoleHistory:', error);
      return [];
    }
  },

  // Apply role-specific terminology to text
  applyTerminology(text: string, terminology: Record<string, string>): string {
    let result = text;
    
    Object.entries(terminology).forEach(([standard, roleSpecific]) => {
      const regex = new RegExp(`\\b${standard}\\b`, 'gi');
      result = result.replace(regex, roleSpecific);
    });

    return result;
  },

  // Existing methods (unchanged)
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    // Implement with Supabase Auth
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Error changing password:', error);
        return false;
      }

      await logActivity('password_changed');
      return true;
    } catch (error) {
      console.error('Error in changePassword:', error);
      return false;
    }
  },

  async requestDataExport(): Promise<string | null> {
    try {
      const userId = await getCurrentUserId();
      
      // Gather all user data
      const [profile, preferences, roleHistory, activityLog] = await Promise.all([
        this.getUserProfile(),
        this.getUserPreferences(),
        this.getRoleHistory(),
        this.getActivityLog(100)
      ]);

      const exportData = {
        profile,
        preferences,
        roleHistory,
        activityLog,
        exportDate: new Date().toISOString(),
        userId
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      await logActivity('data_exported');
      return URL.createObjectURL(dataBlob);
    } catch (error) {
      console.error('Error in requestDataExport:', error);
      return null;
    }
  },

  async importData(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate and import data
      if (data.profile) {
        await this.updateUserProfile(data.profile);
      }
      if (data.preferences) {
        await this.updateUserPreferences(data.preferences);
      }
      
      await logActivity('data_imported', { fileName: file.name });
      return true;
    } catch (error) {
      console.error('Error in importData:', error);
      return false;
    }
  },

  async deleteAllUserData(): Promise<boolean> {
    try {
      const userId = await getCurrentUserId();
      
      // Delete user data from all tables
      const tables = [
        'user_activity_log',
        'user_role_history', 
        'user_preferences',
        'user_profiles',
        'priorities',
        'meetings',
        'emails',
        'stakeholders',
        'kb_documents',
        'daily_tasks'
      ];

      for (const table of tables) {
        await supabase.from(table).delete().eq('user_id', userId);
      }
      
      await logActivity('all_data_deleted');
      return true;
    } catch (error) {
      console.error('Error in deleteAllUserData:', error);
      return false;
    }
  },

  async revokeSession(sessionId: string): Promise<boolean> {
    await logActivity('session_revoked', { sessionId });
    return true; // Mock implementation
  },

  subscribeToSettingsChanges(callback: () => void): () => void {
    const userId = getCurrentUserId();
    
    const channel = supabase
      .channel('settings-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_profiles' },
        callback
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_preferences' },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};