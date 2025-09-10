import { supabase } from '../lib/supabase';

export interface SimpleNote {
  id: string;
  title: string;
  content: string;
  notebook_name: string;
  section_name: string;
  tags: string[] | string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSimpleNoteRequest {
  title: string;
  content: string;
  notebook_name?: string;
  section_name?: string;
  tags?: string[];
}

export interface UpdateSimpleNoteRequest {
  title?: string;
  content?: string;
  tags?: string[];
}

class SimpleNotesServiceClass {
  async getNotes(): Promise<SimpleNote[]> {
    try {
      const { data, error } = await supabase
        .from('simple_notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Parse tags if they're stored as strings
      const notes = (data || []).map(note => {
        if (typeof note.tags === 'string') {
          try {
            note.tags = JSON.parse(note.tags);
          } catch (e) {
            note.tags = [];
          }
        }
        return note;
      });
      
      return notes;
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      return [];
    }
  }

  async getNote(id: string): Promise<SimpleNote | null> {
    try {
      const { data, error } = await supabase
        .from('simple_notes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch note:', error);
      return null;
    }
  }

  async createNote(request: CreateSimpleNoteRequest): Promise<SimpleNote | null> {
    try {
      const { data, error } = await supabase
        .from('simple_notes')
        .insert({
          title: request.title,
          content: request.content,
          notebook_name: request.notebook_name || 'General',
          section_name: request.section_name || 'Notes',
          tags: JSON.stringify(request.tags || [])
        })
        .select()
        .single();

      if (error) throw error;
      
      // Parse tags if they're stored as string
      if (data && typeof data.tags === 'string') {
        try {
          data.tags = JSON.parse(data.tags);
        } catch (e) {
          data.tags = [];
        }
      }
      
      return data;
    } catch (error) {
      console.error('Failed to create note:', error);
      return null;
    }
  }

  async updateNote(id: string, request: UpdateSimpleNoteRequest): Promise<SimpleNote | null> {
    try {
      const { data, error } = await supabase
        .from('simple_notes')
        .update({
          title: request.title,
          content: request.content,
          tags: request.tags ? JSON.stringify(request.tags) : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Parse tags if they're stored as string
      if (data && typeof data.tags === 'string') {
        try {
          data.tags = JSON.parse(data.tags);
        } catch (e) {
          data.tags = [];
        }
      }
      
      return data;
    } catch (error) {
      console.error('Failed to update note:', error);
      return null;
    }
  }

  async deleteNote(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('simple_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to delete note:', error);
      return false;
    }
  }
}

export const SimpleNotesService = new SimpleNotesServiceClass();