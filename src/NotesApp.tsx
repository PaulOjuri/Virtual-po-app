import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useRole } from './contexts/RoleContext';
import { 
  FileText, Plus, Search, Filter, Edit3, Trash2, Save, X, Clock, 
  CheckSquare, AlertCircle, Tag, Calendar, Link, Folder, FolderOpen,
  Bell, BellOff, Star, MoreHorizontal, Copy, Share2, Archive,
  BookOpen, PenTool, Type, Bold, Italic, Underline, List, ListTodo,
  Image, Paperclip, Hash, Quote, Code, AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, Maximize2, Minimize2, ChevronRight, ChevronDown
} from 'lucide-react';
import { SimpleNotesService, SimpleNote, CreateSimpleNoteRequest, UpdateSimpleNoteRequest } from './services/simpleNotesService';
import { NotesService, Note, NoteSection, TodoItem, Reminder } from './services/notesService';
import AIChat from './components/AIChat';

interface NotebookTreeNode {
  id: string;
  name: string;
  type: 'notebook' | 'section' | 'page';
  children?: NotebookTreeNode[];
  isExpanded?: boolean;
  parentId?: string;
}

const NotesApp: React.FC = () => {
  const { user } = useAuth();
  const { applyTerminology, getActionLabel } = useRole();

  // Core state
  const [notebooks, setNotebooks] = useState<NotebookTreeNode[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [simpleNotes, setSimpleNotes] = useState<SimpleNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedSimpleNote, setSelectedSimpleNote] = useState<SimpleNote | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // UI state
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeView, setActiveView] = useState<'notes' | 'todos' | 'search'>('notes');
  
  // Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [editorTitle, setEditorTitle] = useState('');
  const [showFormatting, setShowFormatting] = useState(true);
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');
  
  // Todo state
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [showCompletedTodos, setShowCompletedTodos] = useState(false);
  
  // Reminders
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showReminderForm, setShowReminderForm] = useState(false);

  // Forms
  const [showNewNotebook, setShowNewNotebook] = useState(false);
  const [showNewSection, setShowNewSection] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [selectedNotebook, setSelectedNotebook] = useState<string>('');
  const [newTodoText, setNewTodoText] = useState('');
  const [showNewTodoForm, setShowNewTodoForm] = useState(false);
  const [notebooksCollapsed, setNotebooksCollapsed] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Try simple notes service first
      const simpleNotesData = await SimpleNotesService.getNotes();
      setSimpleNotes(simpleNotesData);
      
      // Fallback to complex service for other data
      try {
        const [todosData, remindersData] = await Promise.all([
          NotesService.getTodos(),
          NotesService.getReminders()
        ]);
        
        setTodos(todosData);
        setReminders(remindersData);
      } catch (err) {
        console.log('Complex service unavailable, using simple notes only');
        setTodos([]);
        setReminders([]);
      }
      
      // Build simple notebook tree from simple notes
      buildSimpleNotebookTree(simpleNotesData);
    } catch (err) {
      setError('Failed to load notes data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const buildSimpleNotebookTree = (notes: SimpleNote[]) => {
    const tree: NotebookTreeNode[] = [];
    const notebookMap = new Map<string, NotebookTreeNode>();
    
    // Group notes by notebook and section
    notes.forEach(note => {
      const notebookName = note.notebook_name || 'General';
      const sectionName = note.section_name || 'Notes';
      
      if (!notebookMap.has(notebookName)) {
        const notebook: NotebookTreeNode = {
          id: `notebook-${notebookName}`,
          name: notebookName,
          type: 'notebook',
          children: [],
          isExpanded: true
        };
        notebookMap.set(notebookName, notebook);
        tree.push(notebook);
      }
      
      const notebook = notebookMap.get(notebookName)!;
      let section = notebook.children?.find(child => child.name === sectionName);
      
      if (!section) {
        section = {
          id: `section-${notebookName}-${sectionName}`,
          name: sectionName,
          type: 'section',
          children: [],
          parentId: notebook.id,
          isExpanded: true
        };
        notebook.children?.push(section);
      }
      
      section.children?.push({
        id: note.id,
        name: note.title,
        type: 'page',
        parentId: section.id
      });
    });
    
    setNotebooks(tree);
  };

  const buildNotebookTree = (notes: Note[]) => {
    const tree: NotebookTreeNode[] = [];
    const notebookMap = new Map<string, NotebookTreeNode>();
    
    // Group notes by notebook and section
    notes.forEach(note => {
      if (!notebookMap.has(note.notebook)) {
        const notebook: NotebookTreeNode = {
          id: note.notebook,
          name: note.notebook,
          type: 'notebook',
          children: [],
          isExpanded: true
        };
        notebookMap.set(note.notebook, notebook);
        tree.push(notebook);
      }
      
      const notebook = notebookMap.get(note.notebook)!;
      const sectionId = `${note.notebook}-${note.section}`;
      
      let section = notebook.children?.find(s => s.id === sectionId);
      if (!section) {
        section = {
          id: sectionId,
          name: note.section,
          type: 'section',
          children: [],
          parentId: note.notebook,
          isExpanded: true
        };
        notebook.children?.push(section);
      }
      
      section.children?.push({
        id: note.id,
        name: note.title,
        type: 'page',
        parentId: sectionId
      });
    });
    
    setNotebooks(tree);
  };

  const createNewNote = async () => {
    try {
      const newSimpleNote = await SimpleNotesService.createNote({
        title: 'Untitled Note',
        content: '',
        notebook_name: selectedNotebook || 'General',
        section_name: 'Notes',
        tags: []
      });
      
      if (newSimpleNote) {
        setSimpleNotes(prev => [newSimpleNote, ...prev]);
        setSelectedSimpleNote(newSimpleNote);
        setIsEditing(true);
        setEditorTitle(newSimpleNote.title);
        setEditorContent(newSimpleNote.content);
        buildSimpleNotebookTree([newSimpleNote, ...simpleNotes]);
      }
    } catch (err) {
      setError('Failed to create new note');
    }
  };

  const createNewNotebook = async () => {
    if (!newNotebookName.trim()) return;
    
    try {
      // Create a new note in the new notebook to establish it
      const newSimpleNote = await SimpleNotesService.createNote({
        title: 'Welcome to ' + newNotebookName,
        content: `This is your new notebook: ${newNotebookName}\n\nStart taking notes here!`,
        notebook_name: newNotebookName,
        section_name: 'Notes',
        tags: []
      });
      
      if (newSimpleNote) {
        setSimpleNotes(prev => [newSimpleNote, ...prev]);
        setSelectedNotebook(newNotebookName);
        buildSimpleNotebookTree([newSimpleNote, ...simpleNotes]);
        setShowNewNotebook(false);
        setNewNotebookName('');
      }
    } catch (err) {
      setError('Failed to create new notebook');
    }
  };

  const createNewTodo = async () => {
    if (!newTodoText.trim()) return;
    
    try {
      const newTodo = await NotesService.addTodoToNote('general', {
        text: newTodoText.trim(),
        dueDate: undefined,
        reminder: undefined
      });
      
      if (newTodo) {
        setTodos(prev => [newTodo, ...prev]);
        setNewTodoText('');
        setShowNewTodoForm(false);
      }
    } catch (err) {
      setError('Failed to create new todo');
    }
  };

  const saveNote = async () => {
    if (!selectedSimpleNote) return;
    
    try {
      setSaving(true);
      const updatedNote = await SimpleNotesService.updateNote(selectedSimpleNote.id, {
        title: editorTitle,
        content: editorContent,
        tags: selectedSimpleNote.tags
      });
      
      if (updatedNote) {
        setSimpleNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
        setSelectedSimpleNote(updatedNote);
        setIsEditing(false);
      }
    } catch (err) {
      setError('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const addTodoToNote = async (noteId: string, todoText: string, reminder?: Date) => {
    try {
      const todo = await NotesService.addTodoToNote(noteId, {
        text: todoText,
        completed: false,
        reminder,
        priority: 'medium',
        dueDate: reminder
      });
      
      setTodos(prev => [todo, ...prev]);
      
      if (reminder) {
        const reminderObj = await NotesService.createReminder({
          todoId: todo.id,
          noteId,
          reminderTime: reminder,
          type: 'todo',
          message: `Todo reminder: ${todoText}`
        });
        setReminders(prev => [reminderObj, ...prev]);
      }
    } catch (err) {
      setError('Failed to add todo');
    }
  };

  const filteredNotes = simpleNotes.filter(note => {
    if (searchTerm && !note.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !note.content.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterTag !== 'all') {
      const noteTags = Array.isArray(note.tags) ? note.tags : [];
      if (!noteTags.includes(filterTag)) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'title': return a.title.localeCompare(b.title);
      case 'created': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default: return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
  });

  const activeTodos = (todos || []).filter(t => !t.completed);
  const completedTodos = (todos || []).filter(t => t.completed);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading notes...</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50' : 'h-[calc(100vh-2rem)]'}`}>
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="mr-2" size={20} />
            {applyTerminology('Notes')}
          </h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveView('notes')}
              className={`px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 ${
                activeView === 'notes' ? 'bg-green-600 text-white border-green-600' : ''
              }`}
            >
              <FileText size={16} className="mr-1 inline" />
              Notes
            </button>
            <button
              onClick={() => setActiveView('todos')}
              className={`px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 ${
                activeView === 'todos' ? 'bg-green-600 text-white border-green-600' : ''
              }`}
            >
              <CheckSquare size={16} className="mr-1 inline" />
              Todos ({activeTodos.length})
            </button>
          </div>
        </div>

        {/* Center: Search and New Note */}
        <div className="flex items-center justify-center gap-3 flex-1">
          <div className="relative w-64 h-10 bg-white border border-gray-300 rounded-lg shadow-sm flex items-center">
            <Search size={16} className="absolute left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 h-full w-full bg-transparent border-0 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-400"
            />
          </div>
          
          <button
            onClick={createNewNote}
            className="w-64 h-10 px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus size={16} />
            <span>New Note</span>
          </button>
        </div>

        {/* Right: Fullscreen toggle */}
        <div className="flex items-center">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div 
          className="bg-white border-r border-gray-200 flex flex-col"
          style={{ width: `${sidebarWidth}px` }}
        >
          {/* Notebook Tree */}
          <div className="border-b border-gray-200">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setNotebooksCollapsed(!notebooksCollapsed)}>
                <span className="text-sm font-medium text-gray-700">Notebooks</span>
                <button className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2">
                  {notebooksCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
              
              {!notebooksCollapsed && (
                <>
                  <button
                    onClick={() => setShowNewNotebook(true)}
                    className="w-full px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center justify-center space-x-2 mb-3"
                  >
                    <Plus size={16} />
                    <span>Add New Notebook</span>
                  </button>
                  
                  <div className="space-y-1">
                    {notebooks.map(notebook => (
                      <NotebookTreeItem
                        key={notebook.id}
                        node={notebook}
                        level={0}
                        selectedNoteId={selectedSimpleNote?.id}
                        onSelectNote={setSelectedSimpleNote}
                        notes={simpleNotes}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto">
            {activeView === 'notes' && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Recent Notes</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="updated">Last Modified</option>
                    <option value="created">Date Created</option>
                    <option value="title">Title</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  {(filteredNotes || []).map(note => (
                    <div
                      key={note.id}
                      onClick={() => {
                        setSelectedSimpleNote(note);
                        setEditorTitle(note.title);
                        setEditorContent(note.content);
                        setIsEditing(false);
                      }}
                      className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                        selectedSimpleNote?.id === note.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <h4 className="font-medium text-sm text-gray-900 truncate">{note.title}</h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {note.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(note.updated_at).toLocaleDateString()}
                        </span>
                        {/* Simple notes don't have todos - remove this for now */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'todos' && (
              <div className="p-4">
                <div className="space-y-4">
                  {/* New Todo Form */}
                  <div className="border-b border-gray-200 pb-4">
                    {showNewTodoForm ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="What needs to be done?"
                          value={newTodoText}
                          onChange={(e) => setNewTodoText(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                          autoFocus
                          onKeyPress={(e) => e.key === 'Enter' && createNewTodo()}
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setShowNewTodoForm(false);
                              setNewTodoText('');
                            }}
                            className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={createNewTodo}
                            disabled={!newTodoText.trim()}
                            className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Add Todo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowNewTodoForm(true)}
                        className="w-full px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Plus size={16} />
                        <span>Add New Todo</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Active Todos</span>
                      <span className="text-xs text-gray-500">{activeTodos.length}</span>
                    </div>
                    <div className="space-y-2">
                      {activeTodos.map(todo => (
                        <TodoItemComponent
                          key={todo.id}
                          todo={todo}
                          onToggle={(id) => NotesService.toggleTodo(id)}
                          onDelete={(id) => NotesService.deleteTodo(id)}
                        />
                      ))}
                    </div>
                  </div>

                  {showCompletedTodos && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Completed Todos</span>
                        <span className="text-xs text-gray-500">{completedTodos.length}</span>
                      </div>
                      <div className="space-y-2">
                        {completedTodos.map(todo => (
                          <TodoItemComponent
                            key={todo.id}
                            todo={todo}
                            onToggle={(id) => NotesService.toggleTodo(id)}
                            onDelete={(id) => NotesService.deleteTodo(id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setShowCompletedTodos(!showCompletedTodos)}
                    className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                  >
                    {showCompletedTodos ? 'Hide' : 'Show'} completed todos ({completedTodos.length})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedSimpleNote ? (
            <>
              {/* Editor Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editorTitle}
                        onChange={(e) => setEditorTitle(e.target.value)}
                        className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none w-full"
                        placeholder="Note title..."
                      />
                    ) : (
                      <h1 className="text-2xl font-bold text-gray-900">{selectedSimpleNote?.title}</h1>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Last modified: {selectedSimpleNote && new Date(selectedSimpleNote.updated_at).toLocaleString()}</span>
                      <span>•</span>
                      <span>{selectedSimpleNote?.notebook_name} / {selectedSimpleNote?.section_name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveNote}
                          disabled={saving}
                          className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
                        >
                          <Save size={16} />
                          <span>{saving ? 'Saving...' : 'Save'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditorTitle(selectedSimpleNote?.title || '');
                            setEditorContent(selectedSimpleNote?.content || '');
                          }}
                          className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                      >
                        <Edit3 size={16} />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Formatting Toolbar */}
              {isEditing && showFormatting && (
                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-1">
                    <button className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2" title="Bold">
                      <Bold size={16} />
                    </button>
                    <button className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2" title="Italic">
                      <Italic size={16} />
                    </button>
                    <button className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2" title="Underline">
                      <Underline size={16} />
                    </button>
                    <div className="w-px h-6 bg-gray-300 mx-2"></div>
                    <button className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2" title="Bullet List">
                      <List size={16} />
                    </button>
                    <button className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2" title="Todo List">
                      <ListTodo size={16} />
                    </button>
                    <div className="w-px h-6 bg-gray-300 mx-2"></div>
                    <button className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2" title="Insert Link">
                      <Link size={16} />
                    </button>
                    <button className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2" title="Insert Image">
                      <Image size={16} />
                    </button>
                    <button className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2" title="Attach File">
                      <Paperclip size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Editor Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {isEditing ? (
                  <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    className="w-full h-full resize-none outline-none text-gray-900 leading-relaxed"
                    placeholder="Start writing your note..."
                  />
                ) : (
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedSimpleNote?.content || '' }}
                  />
                )}
              </div>

              {/* Note Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {selectedSimpleNote && Array.isArray(selectedSimpleNote.tags) && selectedSimpleNote.tags.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Tag size={16} className="text-gray-400" />
                        <div className="flex space-x-1">
                          {selectedSimpleNote.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{selectedSimpleNote?.content.length || 0} characters</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a note to view</h3>
                <p className="text-gray-500 mb-4">Choose a note from the sidebar or create a new one</p>
                <button
                  onClick={createNewNote}
                  className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors inline-flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Create New Note</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="absolute top-4 right-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertCircle size={16} className="mr-2" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* AI Chat Assistant */}
      <AIChat 
        currentContext="notes"
        contextData={{
          notebooks: notebooks,
          selectedNotebook: selectedNotebook,
          selectedSection: selectedSection,
          selectedNote: selectedSimpleNote
        }}
        position="bottom-left"
      />

      {/* New Notebook Modal */}
      {showNewNotebook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Notebook</h3>
            <input
              type="text"
              placeholder="Notebook name..."
              value={newNotebookName}
              onChange={(e) => setNewNotebookName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowNewNotebook(false);
                  setNewNotebookName('');
                }}
                className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
              >
                Cancel
              </button>
              <button
                onClick={createNewNotebook}
                disabled={!newNotebookName.trim()}
                className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const NotebookTreeItem: React.FC<{
  node: NotebookTreeNode;
  level: number;
  selectedNoteId?: string;
  onSelectNote: (note: SimpleNote) => void;
  notes: SimpleNote[];
}> = ({ node, level, selectedNoteId, onSelectNote, notes }) => {
  const [isExpanded, setIsExpanded] = useState(node.isExpanded ?? true);
  
  const handleClick = () => {
    if (node.type === 'page') {
      const note = notes.find(n => n.id === node.id);
      if (note) onSelectNote(note);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const getIcon = () => {
    switch (node.type) {
      case 'notebook': return isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />;
      case 'section': return <BookOpen size={16} />;
      case 'page': return <FileText size={16} />;
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`flex items-center space-x-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-100 ${
          node.type === 'page' && selectedNoteId === node.id ? 'bg-blue-50 text-blue-700' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <span className="text-gray-500">{getIcon()}</span>
        <span className="text-sm truncate flex-1">{node.name}</span>
      </div>
      
      {isExpanded && node.children?.map(child => (
        <NotebookTreeItem
          key={child.id}
          node={child}
          level={level + 1}
          selectedNoteId={selectedNoteId}
          onSelectNote={onSelectNote}
          notes={notes}
        />
      ))}
    </div>
  );
};

const TodoItemComponent: React.FC<{
  todo: TodoItem;
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}> = ({ todo, onToggle, onDelete }) => {
  return (
    <div className={`flex items-center space-x-3 p-2 rounded-lg border ${
      todo.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
    }`}>
      <button
        onClick={() => onToggle(todo.id)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
          todo.completed 
            ? 'bg-green-500 border-green-500 text-white' 
            : 'border-gray-300 hover:border-blue-500'
        }`}
      >
        {todo.completed && <CheckSquare size={12} />}
      </button>
      
      <div className="flex-1">
        <span className={`text-sm ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
          {todo.text}
        </span>
        {todo.dueDate && (
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <Calendar size={12} className="mr-1" />
            {new Date(todo.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
      
      {todo.reminder && (
        <Bell size={14} className="text-amber-500" />
      )}
      
      <button
        onClick={() => onDelete(todo.id)}
        className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default NotesApp;