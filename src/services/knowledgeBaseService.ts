// src/services/knowledgeBaseService.ts
import { supabase } from '../lib/supabase';

export interface KBFolder {
  id?: string;
  name: string;
  description?: string;
  folder_type: 'project' | 'feature' | 'user-story' | 'general';
  parent_id?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  // Computed fields
  children?: KBFolder[];
  document_count?: number;
  is_expanded?: boolean;
}

export interface KBDocument {
  id?: string;
  name: string;
  description?: string;
  file_type: 'pdf' | 'doc' | 'txt' | 'img' | 'video' | 'other';
  file_size: number; // in MB
  file_url?: string;
  version?: string;
  folder_id?: string;
  tags?: string[];
  starred?: boolean;
  content_text?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  // Computed fields
  uploaded_by?: string;
  last_modified?: string;
}

export interface KBChatMessage {
  id?: string;
  message_type: 'user' | 'assistant';
  content: string;
  related_documents?: string[];
  created_at?: string;
  user_id?: string;
}

export class KnowledgeBaseService {
  // ==================== FOLDER OPERATIONS ====================
  
  static async getAllFolders(): Promise<KBFolder[]> {
    const { data, error } = await supabase
      .from('kb_folders')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching folders:', error);
      throw new Error('Failed to fetch folders');
    }

    // Build folder tree with children and document counts
    const folders = await this.buildFolderTree(data || []);
    return folders;
  }

  static async createFolder(folder: Omit<KBFolder, 'id' | 'created_at' | 'updated_at'>): Promise<KBFolder> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('kb_folders')
      .insert([{ 
        ...folder, 
        user_id: user.user.id,
        color: folder.color || 'bg-gray-100'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating folder:', error);
      throw new Error('Failed to create folder');
    }

    return data;
  }

  static async updateFolder(id: string, updates: Partial<KBFolder>): Promise<KBFolder> {
    const { data, error } = await supabase
      .from('kb_folders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating folder:', error);
      throw new Error('Failed to update folder');
    }

    return data;
  }

  static async deleteFolder(id: string): Promise<void> {
    // Check if folder has documents or children
    const { data: documents } = await supabase
      .from('kb_documents')
      .select('id')
      .eq('folder_id', id);

    const { data: children } = await supabase
      .from('kb_folders')
      .select('id')
      .eq('parent_id', id);

    if ((documents && documents.length > 0) || (children && children.length > 0)) {
      throw new Error('Cannot delete folder that contains documents or subfolders');
    }

    const { error } = await supabase
      .from('kb_folders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting folder:', error);
      throw new Error('Failed to delete folder');
    }
  }

  private static async buildFolderTree(folders: KBFolder[]): Promise<KBFolder[]> {
    // Get document counts for each folder
    const { data: documentCounts } = await supabase
      .from('kb_documents')
      .select('folder_id')
      .then(result => {
        if (result.error) return { data: [] };
        const counts: { [key: string]: number } = {};
        result.data?.forEach(doc => {
          if (doc.folder_id) {
            counts[doc.folder_id] = (counts[doc.folder_id] || 0) + 1;
          }
        });
        return { data: Object.entries(counts).map(([folder_id, count]) => ({ folder_id, count })) };
      });

    const folderMap: { [key: string]: KBFolder } = {};
    const rootFolders: KBFolder[] = [];

    // Initialize folders with document counts
    folders.forEach(folder => {
      const documentCount = documentCounts?.find(dc => dc.folder_id === folder.id)?.count || 0;
      folderMap[folder.id!] = {
        ...folder,
        children: [],
        document_count: documentCount,
        is_expanded: false
      };
    });

    // Build tree structure
    folders.forEach(folder => {
      if (folder.parent_id && folderMap[folder.parent_id]) {
        folderMap[folder.parent_id].children!.push(folderMap[folder.id!]);
        // Add child document counts to parent
        folderMap[folder.parent_id].document_count! += folderMap[folder.id!].document_count || 0;
      } else {
        rootFolders.push(folderMap[folder.id!]);
      }
    });

    return rootFolders;
  }

  // ==================== DOCUMENT OPERATIONS ====================

  static async getAllDocuments(folderId?: string): Promise<KBDocument[]> {
    let query = supabase
      .from('kb_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (folderId) {
      query = query.eq('folder_id', folderId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching documents:', error);
      throw new Error('Failed to fetch documents');
    }

    // Transform data for compatibility with existing component
    return (data || []).map(doc => ({
      ...doc,
      uploaded_by: 'Current User', // Could be enhanced with user lookup
      last_modified: doc.updated_at
    }));
  }

  static async createDocument(document: Omit<KBDocument, 'id' | 'created_at' | 'updated_at'>): Promise<KBDocument> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('kb_documents')
      .insert([{ 
        ...document, 
        user_id: user.user.id,
        version: document.version || '1.0',
        tags: document.tags || [],
        starred: document.starred || false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating document:', error);
      throw new Error('Failed to create document');
    }

    return {
      ...data,
      uploaded_by: 'Current User',
      last_modified: data.updated_at
    };
  }

  static async updateDocument(id: string, updates: Partial<KBDocument>): Promise<KBDocument> {
    const { data, error } = await supabase
      .from('kb_documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating document:', error);
      throw new Error('Failed to update document');
    }

    return {
      ...data,
      uploaded_by: 'Current User',
      last_modified: data.updated_at
    };
  }

  static async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('kb_documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  }

  static async toggleDocumentStar(id: string, starred: boolean): Promise<KBDocument> {
    return this.updateDocument(id, { starred });
  }

  static async searchDocuments(query: string): Promise<KBDocument[]> {
    const { data, error } = await supabase
      .from('kb_documents')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,content_text.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching documents:', error);
      throw new Error('Failed to search documents');
    }

    return (data || []).map(doc => ({
      ...doc,
      uploaded_by: 'Current User',
      last_modified: doc.updated_at
    }));
  }

  static async getRecentDocuments(limit: number = 10): Promise<KBDocument[]> {
    const { data, error } = await supabase
      .from('kb_documents')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent documents:', error);
      throw new Error('Failed to fetch recent documents');
    }

    return (data || []).map(doc => ({
      ...doc,
      uploaded_by: 'Current User',
      last_modified: doc.updated_at
    }));
  }

  static async getStarredDocuments(): Promise<KBDocument[]> {
    const { data, error } = await supabase
      .from('kb_documents')
      .select('*')
      .eq('starred', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching starred documents:', error);
      throw new Error('Failed to fetch starred documents');
    }

    return (data || []).map(doc => ({
      ...doc,
      uploaded_by: 'Current User',
      last_modified: doc.updated_at
    }));
  }

  // ==================== FILE UPLOAD ====================

  static async uploadFile(file: File, folderId?: string): Promise<KBDocument> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.user.id}/${Date.now()}-${file.name}`;
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('knowledge-base')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw new Error('Failed to upload file');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('knowledge-base')
      .getPublicUrl(fileName);

    // Determine file type
    const fileType = this.getFileType(file.type, fileExt);
    
    // Extract text content if possible (for PDFs, docs, etc.)
    const contentText = await this.extractTextContent(file, fileType);

    // Create document record
    const document: Omit<KBDocument, 'id' | 'created_at' | 'updated_at'> = {
      name: file.name,
      file_type: fileType,
      file_size: Number((file.size / (1024 * 1024)).toFixed(2)), // Convert to MB
      file_url: urlData.publicUrl,
      folder_id: folderId,
      tags: [],
      starred: false,
      content_text: contentText,
      version: '1.0'
    };

    return this.createDocument(document);
  }

  private static getFileType(mimeType: string, extension?: string): KBDocument['file_type'] {
    if (mimeType.startsWith('image/')) return 'img';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('document') || mimeType.includes('doc') || mimeType.includes('docx')) return 'doc';
    if (mimeType.includes('text') || extension === 'txt') return 'txt';
    return 'other';
  }

  private static async extractTextContent(file: File, fileType: string): Promise<string | undefined> {
    // For now, only extract from text files
    // In the future, you could add PDF.js for PDF extraction, etc.
    if (fileType === 'txt') {
      try {
        const text = await file.text();
        return text.substring(0, 10000); // Limit to first 10k chars
      } catch (error) {
        console.warn('Failed to extract text content:', error);
      }
    }
    return undefined;
  }

  // ==================== CHAT OPERATIONS ====================

  static async getChatMessages(): Promise<KBChatMessage[]> {
    const { data, error } = await supabase
      .from('kb_chat_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat messages:', error);
      throw new Error('Failed to fetch chat messages');
    }

    return data || [];
  }

  static async createChatMessage(message: Omit<KBChatMessage, 'id' | 'created_at'>): Promise<KBChatMessage> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('kb_chat_messages')
      .insert([{ ...message, user_id: user.user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error creating chat message:', error);
      throw new Error('Failed to create chat message');
    }

    return data;
  }

  static async generateAIResponse(userQuery: string, documents: KBDocument[]): Promise<string> {
    // Simulate AI response based on query and available documents
    const query = userQuery.toLowerCase();
    let response = '';
    let relatedDocs: string[] = [];

    if (query.includes('payment')) {
      const paymentDocs = documents.filter(doc => 
        doc.name.toLowerCase().includes('payment') || 
        doc.tags?.some(tag => tag.toLowerCase().includes('payment'))
      );
      
      if (paymentDocs.length > 0) {
        response = `I found ${paymentDocs.length} document(s) related to payments. `;
        response += paymentDocs.length === 1 
          ? `The document "${paymentDocs[0].name}" contains information about payment systems.`
          : `Key documents include "${paymentDocs[0].name}" and others focusing on payment requirements and specifications.`;
        relatedDocs = paymentDocs.map(doc => doc.name);
      } else {
        response = 'I couldn\'t find specific documents about payments in your knowledge base. You might want to upload payment-related documentation.';
      }
    } else if (query.includes('user research') || query.includes('interview')) {
      const researchDocs = documents.filter(doc => 
        doc.name.toLowerCase().includes('research') || 
        doc.name.toLowerCase().includes('interview') ||
        doc.tags?.some(tag => ['research', 'interview', 'user'].includes(tag.toLowerCase()))
      );
      
      if (researchDocs.length > 0) {
        response = `Found ${researchDocs.length} user research document(s). These contain insights from user interviews and research sessions that can help inform product decisions.`;
        relatedDocs = researchDocs.map(doc => doc.name);
      } else {
        response = 'No user research documents found. Consider uploading interview transcripts and research findings.';
      }
    } else if (query.includes('wireframe') || query.includes('design')) {
      const designDocs = documents.filter(doc => 
        doc.name.toLowerCase().includes('wireframe') || 
        doc.name.toLowerCase().includes('design') ||
        doc.file_type === 'img' ||
        doc.tags?.some(tag => ['design', 'wireframe', 'ui'].includes(tag.toLowerCase()))
      );
      
      if (designDocs.length > 0) {
        response = `I found ${designDocs.length} design-related document(s) including wireframes and design specifications. These show the visual structure and user interface designs.`;
        relatedDocs = designDocs.map(doc => doc.name);
      } else {
        response = 'No design documents or wireframes found. Upload your design files and wireframes to make them searchable.';
      }
    } else if (query.includes('api') || query.includes('technical')) {
      const techDocs = documents.filter(doc => 
        doc.name.toLowerCase().includes('api') || 
        doc.name.toLowerCase().includes('technical') ||
        doc.tags?.some(tag => ['api', 'technical', 'backend'].includes(tag.toLowerCase()))
      );
      
      if (techDocs.length > 0) {
        response = `Found ${techDocs.length} technical document(s) covering API specifications and technical requirements.`;
        relatedDocs = techDocs.map(doc => doc.name);
      } else {
        response = 'No technical documentation found. Upload API specs and technical documents to get better answers.';
      }
    } else {
      // General search across all documents
      const matchingDocs = documents.filter(doc => 
        doc.name.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.content_text?.toLowerCase().includes(query) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(query))
      );

      if (matchingDocs.length > 0) {
        response = `I found ${matchingDocs.length} document(s) matching your query. Would you like me to provide more details about any specific document?`;
        relatedDocs = matchingDocs.slice(0, 5).map(doc => doc.name); // Limit to 5
      } else {
        response = `I searched through ${documents.length} documents but couldn't find specific matches for "${userQuery}". Try using different keywords or check if the relevant documents are uploaded.`;
      }
    }

    return response;
  }

  // ==================== ANALYTICS ====================

  static async getKBAnalytics() {
    const { data: folderCount } = await supabase
      .from('kb_folders')
      .select('id', { count: 'exact', head: true });

    const { data: documentCount } = await supabase
      .from('kb_documents')
      .select('id', { count: 'exact', head: true });

    const { data: recentUploads } = await supabase
      .from('kb_documents')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const { data: fileTypes } = await supabase
      .from('kb_documents')
      .select('file_type');

    // Count by file type
    const fileTypeCounts = fileTypes?.reduce((acc, doc) => {
      acc[doc.file_type] = (acc[doc.file_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      totalFolders: folderCount?.length || 0,
      totalDocuments: documentCount?.length || 0,
      recentUploads: recentUploads?.length || 0,
      fileTypes: fileTypeCounts
    };
  }
}