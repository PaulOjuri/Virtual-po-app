import { supabase } from '../lib/supabase';

export interface Note {
  id: string;
  title: string;
  content: string;
  notebook: string;
  section: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  todos: TodoItem[];
  linkedKnowledgeBase: string[]; // Knowledge Base article IDs
  reminders: Reminder[];
  isArchived: boolean;
  isFavorite: boolean;
  collaborators: string[];
  lastEditedBy: string;
}

export interface NoteSection {
  id: string;
  name: string;
  notebookId: string;
  createdAt: string;
  order: number;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  noteId: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  reminder?: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  tags: string[];
}

export interface Reminder {
  id: string;
  noteId?: string;
  todoId?: string;
  calendarEventId?: string;
  reminderTime: string;
  type: 'todo' | 'note' | 'calendar' | 'ceremony';
  message: string;
  isActive: boolean;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
  createdAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  browser: boolean;
  beforeTime: number; // minutes before
  categories: ('todos' | 'ceremonies' | 'meetings' | 'deadlines')[];
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  notebook: string;
  section: string;
  tags?: string[];
  todos?: Omit<TodoItem, 'id' | 'noteId' | 'createdAt' | 'updatedAt'>[];
  linkedKnowledgeBase?: string[];
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  tags?: string[];
  todos?: TodoItem[];
  linkedKnowledgeBase?: string[];
  isArchived?: boolean;
  isFavorite?: boolean;
}

export interface CreateTodoRequest {
  text: string;
  completed?: boolean;
  dueDate?: Date;
  reminder?: Date;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface CreateReminderRequest {
  noteId?: string;
  todoId?: string;
  calendarEventId?: string;
  reminderTime: Date;
  type: 'todo' | 'note' | 'calendar' | 'ceremony';
  message: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
}

export interface SearchFilters {
  query?: string;
  notebook?: string;
  section?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasReminders?: boolean;
  hasTodos?: boolean;
  isArchived?: boolean;
}

class NotesServiceClass {
  // Helper method to transform database row to Note interface
  private transformNoteFromDB(dbNote: any, todos: TodoItem[] = [], reminders: Reminder[] = []): Note {
    return {
      id: dbNote.id,
      title: dbNote.title,
      content: dbNote.content || '',
      notebook: dbNote.notebook_name || dbNote.notebook_id || '',
      section: dbNote.section_name || dbNote.section_id || '',
      tags: dbNote.tags || [],
      createdAt: dbNote.created_at,
      updatedAt: dbNote.updated_at,
      todos,
      linkedKnowledgeBase: dbNote.linked_knowledge_base || [],
      reminders,
      isArchived: dbNote.is_archived || false,
      isFavorite: dbNote.is_favorite || false,
      collaborators: dbNote.collaborators || [],
      lastEditedBy: dbNote.last_edited_by || ''
    };
  }

  // Notes CRUD operations
  async getNotes(filters?: SearchFilters): Promise<Note[]> {
    try {
      let query = supabase
        .from('notes')
        .select(`
          *,
          notebooks(name),
          sections(name)
        `);

      // Apply filters
      if (filters?.isArchived !== undefined) {
        query = query.eq('is_archived', filters.isArchived);
      }

      if (filters?.notebook) {
        query = query.eq('notebooks.name', filters.notebook);
      }

      if (filters?.section) {
        query = query.eq('sections.name', filters.section);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters?.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start.toISOString())
          .lte('created_at', filters.dateRange.end.toISOString());
      }

      const { data: notes, error } = await query.order('updated_at', { ascending: false });

      if (error) throw error;

      // Get todos and reminders for each note
      const notesWithTodos = await Promise.all(
        notes.map(async (note) => {
          const [todos, reminders] = await Promise.all([
            this.getTodos(note.id),
            this.getRemindersForNote(note.id)
          ]);

          return this.transformNoteFromDB({
            ...note,
            notebook_name: note.notebooks?.name,
            section_name: note.sections?.name
          }, todos, reminders);
        })
      );

      // Apply text search if provided
      if (filters?.query) {
        const searchTerm = filters.query.toLowerCase();
        return notesWithTodos.filter(note => 
          note.title.toLowerCase().includes(searchTerm) ||
          note.content.toLowerCase().includes(searchTerm) ||
          note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      return notesWithTodos;
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      // Fallback to mock data for development
      return this.getMockNotes();
    }
  }

  private async getRemindersForNote(noteId: string): Promise<Reminder[]> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('note_id', noteId)
        .eq('is_active', true);

      if (error) throw error;

      return data.map(reminder => ({
        id: reminder.id,
        noteId: reminder.note_id,
        todoId: reminder.todo_id,
        calendarEventId: reminder.calendar_event_id,
        reminderTime: reminder.reminder_time,
        type: reminder.type as 'todo' | 'note' | 'calendar' | 'ceremony',
        message: reminder.message,
        isActive: reminder.is_active,
        recurring: reminder.recurring_frequency ? {
          frequency: reminder.recurring_frequency as 'daily' | 'weekly' | 'monthly',
          interval: reminder.recurring_interval || 1,
          endDate: reminder.recurring_end_date
        } : undefined,
        createdAt: reminder.created_at
      }));
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
      return [];
    }
  }

  async getNote(id: string): Promise<Note> {
    try {
      const { data: note, error } = await supabase
        .from('notes')
        .select(`
          *,
          notebooks(name),
          sections(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!note) throw new Error('Note not found');

      const [todos, reminders] = await Promise.all([
        this.getTodos(note.id),
        this.getRemindersForNote(note.id)
      ]);

      return this.transformNoteFromDB({
        ...note,
        notebook_name: note.notebooks?.name,
        section_name: note.sections?.name
      }, todos, reminders);
    } catch (error) {
      console.error('Failed to fetch note:', error);
      throw new Error('Note not found');
    }
  }

  async createNote(request: CreateNoteRequest): Promise<Note> {
    try {
      // First, ensure notebook and section exist
      const { notebookId, sectionId } = await this.ensureNotebookAndSection(request.notebook, request.section);

      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.user) throw new Error('User not authenticated');

      const { data: newNote, error } = await supabase
        .from('notes')
        .insert({
          title: request.title,
          content: request.content,
          notebook_id: notebookId,
          section_id: sectionId,
          tags: request.tags || [],
          linked_knowledge_base: request.linkedKnowledgeBase || [],
          user_id: user.user.id,
          last_edited_by: user.user.id
        })
        .select(`
          *,
          notebooks(name),
          sections(name)
        `)
        .single();

      if (error) throw error;

      // Create todos if provided
      let todos: TodoItem[] = [];
      if (request.todos && request.todos.length > 0) {
        for (const todoData of request.todos) {
          const todo = await this.addTodoToNote(newNote.id, {
            text: todoData.text,
            completed: todoData.completed,
            dueDate: todoData.dueDate ? new Date(todoData.dueDate) : undefined,
            reminder: todoData.reminder ? new Date(todoData.reminder) : undefined,
            priority: todoData.priority,
            tags: todoData.tags
          });
          todos.push(todo);
        }
      }

      return this.transformNoteFromDB({
        ...newNote,
        notebook_name: newNote.notebooks?.name,
        section_name: newNote.sections?.name
      }, todos, []);
    } catch (error) {
      console.error('Failed to create note:', error);
      // Fallback to mock creation for development
      const newNote: Note = {
        id: `note-${Date.now()}`,
        title: request.title,
        content: request.content,
        notebook: request.notebook,
        section: request.section,
        tags: request.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        todos: [],
        linkedKnowledgeBase: request.linkedKnowledgeBase || [],
        reminders: [],
        isArchived: false,
        isFavorite: false,
        collaborators: [],
        lastEditedBy: 'current-user'
      };
      return newNote;
    }
  }

  private async ensureNotebookAndSection(notebookName: string, sectionName: string): Promise<{notebookId: string, sectionId: string}> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) throw new Error('User not authenticated');

    // Get or create notebook
    let { data: notebook, error: notebookError } = await supabase
      .from('notebooks')
      .select('id')
      .eq('name', notebookName)
      .eq('user_id', user.user.id)
      .single();

    if (notebookError && notebookError.code === 'PGRST116') {
      // Notebook doesn't exist, create it
      const { data: newNotebook, error: createError } = await supabase
        .from('notebooks')
        .insert({
          name: notebookName,
          user_id: user.user.id
        })
        .select('id')
        .single();

      if (createError) throw createError;
      notebook = newNotebook;
    } else if (notebookError) {
      throw notebookError;
    }

    // Get or create section
    let { data: section, error: sectionError } = await supabase
      .from('sections')
      .select('id')
      .eq('name', sectionName)
      .eq('notebook_id', notebook.id)
      .single();

    if (sectionError && sectionError.code === 'PGRST116') {
      // Section doesn't exist, create it
      const { data: newSection, error: createError } = await supabase
        .from('sections')
        .insert({
          name: sectionName,
          notebook_id: notebook.id
        })
        .select('id')
        .single();

      if (createError) throw createError;
      section = newSection;
    } else if (sectionError) {
      throw sectionError;
    }

    return {
      notebookId: notebook.id,
      sectionId: section.id
    };
  }

  async updateNote(id: string, request: UpdateNoteRequest): Promise<Note> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) throw new Error('User not authenticated');

      const { data: updatedNote, error } = await supabase
        .from('notes')
        .update({
          title: request.title,
          content: request.content,
          tags: request.tags,
          linked_knowledge_base: request.linkedKnowledgeBase,
          is_archived: request.isArchived,
          is_favorite: request.isFavorite,
          last_edited_by: user.user.id
        })
        .eq('id', id)
        .select(`
          *,
          notebooks(name),
          sections(name)
        `)
        .single();

      if (error) throw error;

      const [todos, reminders] = await Promise.all([
        this.getTodos(id),
        this.getRemindersForNote(id)
      ]);

      return this.transformNoteFromDB({
        ...updatedNote,
        notebook_name: updatedNote.notebooks?.name,
        section_name: updatedNote.sections?.name
      }, todos, reminders);
    } catch (error) {
      console.error('Failed to update note:', error);
      // Fallback to mock update for development
      const existingNote = await this.getNote(id);
      return {
        ...existingNote,
        ...request,
        updatedAt: new Date().toISOString()
      };
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete note:', error);
      console.log('Note deleted (mock)');
    }
  }

  // Todo operations
  async getTodos(noteId?: string): Promise<TodoItem[]> {
    try {
      let query = supabase.from('todos').select('*');
      
      if (noteId) {
        query = query.eq('note_id', noteId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(todo => ({
        id: todo.id,
        text: todo.text,
        completed: todo.completed || false,
        noteId: todo.note_id,
        createdAt: todo.created_at,
        updatedAt: todo.updated_at,
        dueDate: todo.due_date,
        reminder: todo.reminder_time,
        priority: (todo.priority as 'low' | 'medium' | 'high') || 'medium',
        assignedTo: todo.assigned_to,
        tags: todo.tags || []
      }));
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      return this.getMockTodos();
    }
  }

  async addTodoToNote(noteId: string, request: CreateTodoRequest): Promise<TodoItem> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) throw new Error('User not authenticated');

      const { data: newTodo, error } = await supabase
        .from('todos')
        .insert({
          text: request.text,
          completed: request.completed || false,
          note_id: noteId,
          due_date: request.dueDate?.toISOString(),
          reminder_time: request.reminder?.toISOString(),
          priority: request.priority || 'medium',
          tags: request.tags || [],
          user_id: user.user.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: newTodo.id,
        text: newTodo.text,
        completed: newTodo.completed || false,
        noteId: newTodo.note_id,
        createdAt: newTodo.created_at,
        updatedAt: newTodo.updated_at,
        dueDate: newTodo.due_date,
        reminder: newTodo.reminder_time,
        priority: (newTodo.priority as 'low' | 'medium' | 'high') || 'medium',
        assignedTo: newTodo.assigned_to,
        tags: newTodo.tags || []
      };
    } catch (error) {
      console.error('Failed to create todo:', error);
      // Mock todo creation
      const newTodo: TodoItem = {
        id: `todo-${Date.now()}`,
        text: request.text,
        completed: request.completed || false,
        noteId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: request.dueDate?.toISOString(),
        reminder: request.reminder?.toISOString(),
        priority: request.priority || 'medium',
        tags: request.tags || []
      };
      return newTodo;
    }
  }

  async toggleTodo(todoId: string): Promise<TodoItem> {
    try {
      // First get the current todo
      const { data: currentTodo, error: fetchError } = await supabase
        .from('todos')
        .select('*')
        .eq('id', todoId)
        .single();

      if (fetchError) throw fetchError;

      // Toggle the completed status
      const { data: updatedTodo, error: updateError } = await supabase
        .from('todos')
        .update({ completed: !currentTodo.completed })
        .eq('id', todoId)
        .select()
        .single();

      if (updateError) throw updateError;

      return {
        id: updatedTodo.id,
        text: updatedTodo.text,
        completed: updatedTodo.completed || false,
        noteId: updatedTodo.note_id,
        createdAt: updatedTodo.created_at,
        updatedAt: updatedTodo.updated_at,
        dueDate: updatedTodo.due_date,
        reminder: updatedTodo.reminder_time,
        priority: (updatedTodo.priority as 'low' | 'medium' | 'high') || 'medium',
        assignedTo: updatedTodo.assigned_to,
        tags: updatedTodo.tags || []
      };
    } catch (error) {
      console.error('Failed to toggle todo:', error);
      throw new Error('Failed to toggle todo');
    }
  }

  async deleteTodo(todoId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete todo:', error);
      console.log('Todo deleted (mock)');
    }
  }

  // Reminder operations
  async getReminders(activeOnly = true): Promise<Reminder[]> {
    try {
      let query = supabase.from('reminders').select('*');
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query.order('reminder_time', { ascending: true });

      if (error) throw error;

      return data.map(reminder => ({
        id: reminder.id,
        noteId: reminder.note_id,
        todoId: reminder.todo_id,
        calendarEventId: reminder.calendar_event_id,
        reminderTime: reminder.reminder_time,
        type: reminder.type as 'todo' | 'note' | 'calendar' | 'ceremony',
        message: reminder.message,
        isActive: reminder.is_active,
        recurring: reminder.recurring_frequency ? {
          frequency: reminder.recurring_frequency as 'daily' | 'weekly' | 'monthly',
          interval: reminder.recurring_interval || 1,
          endDate: reminder.recurring_end_date
        } : undefined,
        createdAt: reminder.created_at
      }));
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
      return this.getMockReminders();
    }
  }

  async createReminder(request: CreateReminderRequest): Promise<Reminder> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) throw new Error('User not authenticated');

      const { data: newReminder, error } = await supabase
        .from('reminders')
        .insert({
          note_id: request.noteId,
          todo_id: request.todoId,
          calendar_event_id: request.calendarEventId,
          reminder_time: request.reminderTime.toISOString(),
          type: request.type,
          message: request.message,
          recurring_frequency: request.recurring?.frequency,
          recurring_interval: request.recurring?.interval,
          recurring_end_date: request.recurring?.endDate?.toISOString(),
          user_id: user.user.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: newReminder.id,
        noteId: newReminder.note_id,
        todoId: newReminder.todo_id,
        calendarEventId: newReminder.calendar_event_id,
        reminderTime: newReminder.reminder_time,
        type: newReminder.type as 'todo' | 'note' | 'calendar' | 'ceremony',
        message: newReminder.message,
        isActive: newReminder.is_active,
        recurring: newReminder.recurring_frequency ? {
          frequency: newReminder.recurring_frequency as 'daily' | 'weekly' | 'monthly',
          interval: newReminder.recurring_interval || 1,
          endDate: newReminder.recurring_end_date
        } : undefined,
        createdAt: newReminder.created_at
      };
    } catch (error) {
      console.error('Failed to create reminder:', error);
      // Mock reminder creation
      const newReminder: Reminder = {
        id: `reminder-${Date.now()}`,
        noteId: request.noteId,
        todoId: request.todoId,
        calendarEventId: request.calendarEventId,
        reminderTime: request.reminderTime.toISOString(),
        type: request.type,
        message: request.message,
        isActive: true,
        recurring: request.recurring ? {
          ...request.recurring,
          endDate: request.recurring.endDate?.toISOString()
        } : undefined,
        createdAt: new Date().toISOString()
      };
      return newReminder;
    }
  }

  async deleteReminder(reminderId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete reminder:', error);
      console.log('Reminder deleted (mock)');
    }
  }

  // Knowledge Base integration
  async linkToKnowledgeBase(noteId: string, knowledgeBaseIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ linked_knowledge_base: knowledgeBaseIds })
        .eq('id', noteId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to link knowledge base:', error);
      console.log('Knowledge base linked (mock)');
    }
  }

  async searchKnowledgeBaseForNote(noteContent: string): Promise<any[]> {
    try {
      // Search knowledge base documents for relevant content
      const { data, error } = await supabase
        .from('kb_documents')
        .select('id, title, content, category')
        .textSearch('search_vector', noteContent.split(' ').slice(0, 5).join(' & '))
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to search knowledge base:', error);
      return [];
    }
  }

  // Search and filter
  async searchNotes(query: string, filters?: SearchFilters): Promise<Note[]> {
    const searchFilters = { ...filters, query };
    return this.getNotes(searchFilters);
  }

  // Notification preferences
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        // Create default preferences
        const defaultPrefs = {
          email: true,
          browser: true,
          beforeTime: 15,
          categories: ['todos', 'ceremonies', 'meetings', 'deadlines']
        };

        const { data: newPrefs, error: createError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.user.id,
            email_enabled: defaultPrefs.email,
            browser_enabled: defaultPrefs.browser,
            before_time_minutes: defaultPrefs.beforeTime,
            categories: defaultPrefs.categories
          })
          .select()
          .single();

        if (createError) throw createError;
        return defaultPrefs;
      }

      return {
        email: data.email_enabled,
        browser: data.browser_enabled,
        beforeTime: data.before_time_minutes,
        categories: data.categories as ('todos' | 'ceremonies' | 'meetings' | 'deadlines')[]
      };
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
      return {
        email: true,
        browser: true,
        beforeTime: 15,
        categories: ['todos', 'ceremonies', 'meetings', 'deadlines']
      };
    }
  }

  async updateNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.user.id,
          email_enabled: preferences.email,
          browser_enabled: preferences.browser,
          before_time_minutes: preferences.beforeTime,
          categories: preferences.categories
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      console.log('Notification preferences updated (mock)');
    }
  }

  // Notebook and section management
  async getNotebooks(): Promise<{id: string; name: string; description?: string; sections: {id: string; name: string}[]}[]> {
    try {
      const { data, error } = await supabase
        .from('notebooks')
        .select(`
          id,
          name,
          description,
          sections (
            id,
            name,
            sort_order
          )
        `)
        .order('name');

      if (error) throw error;

      return data.map(notebook => ({
        id: notebook.id,
        name: notebook.name,
        description: notebook.description,
        sections: (notebook.sections || []).sort((a: any, b: any) => a.sort_order - b.sort_order)
      }));
    } catch (error) {
      console.error('Failed to fetch notebooks:', error);
      return [];
    }
  }

  async createNotebook(name: string, description?: string): Promise<{id: string; name: string; description?: string}> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notebooks')
        .insert({
          name,
          description,
          user_id: user.user.id
        })
        .select()
        .single();

      if (error) throw error;
      return { id: data.id, name: data.name, description: data.description };
    } catch (error) {
      console.error('Failed to create notebook:', error);
      throw error;
    }
  }

  async createSection(notebookId: string, name: string): Promise<{id: string; name: string}> {
    try {
      const { data, error } = await supabase
        .from('sections')
        .insert({
          name,
          notebook_id: notebookId
        })
        .select()
        .single();

      if (error) throw error;
      return { id: data.id, name: data.name };
    } catch (error) {
      console.error('Failed to create section:', error);
      throw error;
    }
  }

  // Mock data for development
  private getMockNotes(): Note[] {
    return [
      {
        id: 'note-1',
        title: 'Sprint Planning Notes',
        content: `<h2>Sprint 23 Planning Session</h2>
        <p>Key decisions and action items from today's planning session.</p>
        <h3>Team Capacity</h3>
        <ul>
          <li>Total story points: 45</li>
          <li>Team velocity: 42 (average)</li>
          <li>Risk buffer: 3 points</li>
        </ul>
        <h3>Sprint Goal</h3>
        <p>Deliver user authentication feature and payment integration.</p>`,
        notebook: 'Sprint Management',
        section: 'Planning',
        tags: ['sprint', 'planning', 'capacity'],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T14:30:00Z',
        todos: [],
        linkedKnowledgeBase: ['kb-sprint-planning', 'kb-capacity-planning'],
        reminders: [],
        isArchived: false,
        isFavorite: true,
        collaborators: ['john.doe@example.com', 'jane.smith@example.com'],
        lastEditedBy: 'current-user'
      },
      {
        id: 'note-2',
        title: 'Stakeholder Feedback',
        content: `<h2>Customer Review Meeting</h2>
        <p>Feedback from key stakeholders on the Q1 roadmap.</p>
        <h3>Positive Feedback</h3>
        <ul>
          <li>API performance improvements</li>
          <li>New dashboard design</li>
        </ul>
        <h3>Concerns</h3>
        <ul>
          <li>Mobile responsiveness needs work</li>
          <li>Integration with legacy systems</li>
        </ul>`,
        notebook: 'Stakeholder Management',
        section: 'Feedback',
        tags: ['stakeholder', 'feedback', 'roadmap'],
        createdAt: '2024-01-14T09:00:00Z',
        updatedAt: '2024-01-14T16:00:00Z',
        todos: [],
        linkedKnowledgeBase: ['kb-stakeholder-management'],
        reminders: [],
        isArchived: false,
        isFavorite: false,
        collaborators: [],
        lastEditedBy: 'current-user'
      },
      {
        id: 'note-3',
        title: 'PI Planning Preparation',
        content: `<h2>Program Increment 2024.1 Planning</h2>
        <p>Preparation notes for the upcoming PI Planning event.</p>
        <h3>Agenda Items</h3>
        <ul>
          <li>Vision and context presentation</li>
          <li>Team breakouts</li>
          <li>Draft plan review</li>
          <li>Management review and problem solving</li>
        </ul>`,
        notebook: 'Program Management',
        section: 'PI Planning',
        tags: ['pi-planning', 'safe', 'program'],
        createdAt: '2024-01-13T08:00:00Z',
        updatedAt: '2024-01-13T17:00:00Z',
        todos: [],
        linkedKnowledgeBase: ['kb-pi-planning', 'kb-safe-ceremonies'],
        reminders: [],
        isArchived: false,
        isFavorite: true,
        collaborators: ['rte@example.com'],
        lastEditedBy: 'current-user'
      }
    ];
  }

  private getMockTodos(): TodoItem[] {
    return [
      {
        id: 'todo-1',
        text: 'Review sprint backlog items',
        completed: false,
        noteId: 'note-1',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        dueDate: '2024-01-16T09:00:00Z',
        reminder: '2024-01-16T08:00:00Z',
        priority: 'high',
        tags: ['sprint', 'backlog']
      },
      {
        id: 'todo-2',
        text: 'Follow up on stakeholder concerns',
        completed: false,
        noteId: 'note-2',
        createdAt: '2024-01-14T16:00:00Z',
        updatedAt: '2024-01-14T16:00:00Z',
        dueDate: '2024-01-17T17:00:00Z',
        priority: 'medium',
        tags: ['stakeholder', 'follow-up']
      },
      {
        id: 'todo-3',
        text: 'Prepare PI objectives presentation',
        completed: true,
        noteId: 'note-3',
        createdAt: '2024-01-13T08:30:00Z',
        updatedAt: '2024-01-15T12:00:00Z',
        priority: 'high',
        tags: ['pi-planning', 'presentation']
      }
    ];
  }

  private getMockReminders(): Reminder[] {
    return [
      {
        id: 'reminder-1',
        todoId: 'todo-1',
        reminderTime: '2024-01-16T08:00:00Z',
        type: 'todo',
        message: 'Review sprint backlog items',
        isActive: true,
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'reminder-2',
        calendarEventId: 'calendar-event-1',
        reminderTime: '2024-01-20T08:30:00Z',
        type: 'ceremony',
        message: 'Sprint Review ceremony starting in 30 minutes',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z'
      }
    ];
  }

  // AI Chat Integration - Search functionality
  async searchNotes(query: string): Promise<Note[]> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          notebooks(name),
          sections(name)
        `)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`)
        .eq('is_archived', false)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error searching notes:', error);
        // Fallback to mock search for development
        return this.getMockNotes().filter(note => 
          note.title.toLowerCase().includes(query.toLowerCase()) ||
          note.content.toLowerCase().includes(query.toLowerCase()) ||
          note.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
      }

      const notes = await Promise.all(
        data.map(async (noteData: any) => {
          const todos = await this.getTodosForNote(noteData.id);
          const reminders = await this.getRemindersForNote(noteData.id);
          return this.transformNoteFromDB({
            ...noteData,
            notebook_name: noteData.notebooks?.name,
            section_name: noteData.sections?.name
          }, todos, reminders);
        })
      );

      return notes;
    } catch (error) {
      console.error('Error in searchNotes:', error);
      // Fallback to mock search
      return this.getMockNotes().filter(note => 
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }
  }

  // Get mock notes for fallback
  private getMockNotes(): Note[] {
    return [
      {
        id: 'note-1',
        title: 'Sprint Planning Notes - User Authentication',
        content: 'Discussed implementation of user authentication system. Key requirements: OAuth integration, multi-factor authentication, password policies.',
        notebook: 'Sprint Planning',
        section: 'Technical',
        tags: ['authentication', 'security', 'oauth'],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T14:30:00Z',
        todos: [],
        linkedKnowledgeBase: [],
        reminders: [],
        isArchived: false,
        isFavorite: true,
        collaborators: ['user1', 'user2'],
        lastEditedBy: 'current-user'
      },
      {
        id: 'note-2',
        title: 'Stakeholder Feedback - Mobile App UI',
        content: 'Feedback from stakeholder meeting: Need to improve mobile app navigation, consider dark mode, optimize for accessibility.',
        notebook: 'Stakeholder Meetings',
        section: 'Feedback',
        tags: ['mobile', 'ui', 'stakeholder', 'accessibility'],
        createdAt: '2024-01-14T09:15:00Z',
        updatedAt: '2024-01-14T16:45:00Z',
        todos: [],
        linkedKnowledgeBase: [],
        reminders: [],
        isArchived: false,
        isFavorite: false,
        collaborators: [],
        lastEditedBy: 'current-user'
      },
      {
        id: 'note-3',
        title: 'API Integration Documentation',
        content: 'Documentation for external API integrations: Payment gateway, notification service, analytics platform. Include error handling and retry logic.',
        notebook: 'Technical Documentation',
        section: 'APIs',
        tags: ['api', 'integration', 'documentation', 'payments'],
        createdAt: '2024-01-13T11:20:00Z',
        updatedAt: '2024-01-13T15:10:00Z',
        todos: [],
        linkedKnowledgeBase: [],
        reminders: [],
        isArchived: false,
        isFavorite: false,
        collaborators: ['developer1'],
        lastEditedBy: 'current-user'
      }
    ];
  }
}

export const NotesService = new NotesServiceClass();