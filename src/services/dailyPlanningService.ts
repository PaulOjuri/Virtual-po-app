import { supabase } from '../lib/supabase';

export interface DailyTask {
  id?: string;
  title: string;
  description?: string;
  task_type: 'meeting' | 'work' | 'review' | 'planning' | 'communication' | 'admin';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  estimated_duration?: number; // in minutes
  actual_duration?: number; // in minutes
  scheduled_start?: string;
  scheduled_end?: string;
  completed_at?: string;
  tags?: string[];
  notes?: string;
  related_priority_id?: string;
  related_meeting_id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DailyPlan {
  id?: string;
  plan_date: string;
  total_tasks: number;
  completed_tasks: number;
  total_estimated_time: number;
  actual_time_spent: number;
  focus_areas: string[];
  achievements: string[];
  challenges: string[];
  next_day_prep: string[];
  energy_level: 'low' | 'medium' | 'high';
  productivity_rating: number; // 1-5
  notes?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export class DailyPlanningService {
  // Daily Tasks CRUD operations
  static async getAllTasks(date?: string): Promise<DailyTask[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_start', { ascending: true });

      if (date) {
        const startOfDay = `${date}T00:00:00`;
        const endOfDay = `${date}T23:59:59`;
        query = query
          .gte('scheduled_start', startOfDay)
          .lte('scheduled_start', endOfDay);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching daily tasks:', error);
      throw error;
    }
  }

  static async createTask(taskData: Omit<DailyTask, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<DailyTask> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('daily_tasks')
        .insert([{ ...taskData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating daily task:', error);
      throw error;
    }
  }

  static async updateTask(id: string, taskData: Partial<DailyTask>): Promise<DailyTask> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('daily_tasks')
        .update(taskData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating daily task:', error);
      throw error;
    }
  }

  static async deleteTask(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('daily_tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting daily task:', error);
      throw error;
    }
  }

  static async completeTask(id: string): Promise<DailyTask> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('daily_tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error completing daily task:', error);
      throw error;
    }
  }

  // Daily Plan operations
  static async getDailyPlan(date: string): Promise<DailyPlan | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('daily_plans')
        .select('*')
        .eq('plan_date', date)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data || null;
    } catch (error) {
      console.error('Error fetching daily plan:', error);
      throw error;
    }
  }

  static async createOrUpdateDailyPlan(planData: Omit<DailyPlan, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<DailyPlan> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('daily_plans')
        .upsert(
          { ...planData, user_id: user.id },
          { 
            onConflict: 'plan_date,user_id',
            ignoreDuplicates: false 
          }
        )
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating/updating daily plan:', error);
      throw error;
    }
  }

  // Analytics
  static async getTaskAnalytics(startDate: string, endDate: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    avgTaskDuration: number;
    tasksByType: { [key: string]: number };
    tasksByPriority: { [key: string]: number };
    productivityTrend: Array<{ date: string; completed: number; total: number }>;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: tasks, error } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      const tasksByType = tasks?.reduce((acc: any, task) => {
        acc[task.task_type] = (acc[task.task_type] || 0) + 1;
        return acc;
      }, {}) || {};

      const tasksByPriority = tasks?.reduce((acc: any, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {}) || {};

      const avgTaskDuration = tasks?.length > 0 
        ? tasks.reduce((sum, task) => sum + (task.actual_duration || task.estimated_duration || 0), 0) / tasks.length
        : 0;

      return {
        totalTasks,
        completedTasks,
        completionRate,
        avgTaskDuration,
        tasksByType,
        tasksByPriority,
        productivityTrend: [] // Would need more complex aggregation for trend data
      };
    } catch (error) {
      console.error('Error fetching task analytics:', error);
      throw error;
    }
  }
}