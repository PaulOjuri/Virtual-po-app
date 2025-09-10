import { supabase } from '../lib/supabase';
import { NotesService } from './notesService';
import { CalendarService } from './calendarService';
import { PriorityService } from './priorityService';
import { EmailService } from './emailService';
import { MeetingService } from './meetingService';
import { DailyPlanningService } from './dailyPlanningService';
import { MarketIntelligenceService } from './marketIntelligenceService';
import { StakeholderService } from './stakeholderService';
import { WebScrapingService } from './webScrapingService';

// Types for AI Chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  context?: ChatContext;
  sources?: DataSource[];
  metadata?: any;
}

export interface ChatContext {
  segment?: 'notes' | 'calendar' | 'priorities' | 'emails' | 'meetings' | 'planning' | 'market' | 'stakeholders' | 'knowledge-base' | 'general';
  entityId?: string;
  entityType?: string;
  userRole?: string;
  userQuery?: string;
  relevantData?: any[];
  knowledgeBase?: {
    documents?: any[];
    folders?: any[];
    recentSearches?: string[];
  };
  webSearch?: {
    query: string;
    results?: any[];
    instructions?: string;
  };
}

export interface DataSource {
  type: 'note' | 'priority' | 'meeting' | 'email' | 'calendar' | 'stakeholder' | 'market_trend' | 'document' | 'web_result';
  id: string;
  title: string;
  relevanceScore: number;
  snippet?: string;
  url?: string;
}

export interface ExternalAPIConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  isFree: boolean;
  rateLimit?: {
    requests: number;
    period: 'minute' | 'hour' | 'day';
  };
}

// Free External APIs Configuration
const EXTERNAL_APIS: ExternalAPIConfig[] = [
  {
    name: 'OpenAI GPT-3.5 Turbo',
    baseUrl: 'https://api.openai.com/v1',
    isFree: false, // Has free tier with limits
    rateLimit: { requests: 3, period: 'minute' }
  },
  {
    name: 'Hugging Face Inference API',
    baseUrl: 'https://api-inference.huggingface.co',
    isFree: true,
    rateLimit: { requests: 1000, period: 'hour' }
  },
  {
    name: 'Cohere Generate',
    baseUrl: 'https://api.cohere.ai/v1',
    isFree: true, // Free tier available
    rateLimit: { requests: 5, period: 'minute' }
  },
  {
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    isFree: true, // Free tier available
    rateLimit: { requests: 15, period: 'minute' }
  },
  {
    name: 'Anthropic Claude (Haiku)',
    baseUrl: 'https://api.anthropic.com/v1',
    isFree: false, // Has free tier
    rateLimit: { requests: 5, period: 'minute' }
  }
];

export class AIService {
  private static conversationHistory: ChatMessage[] = [];
  private static contextCache: Map<string, any> = new Map();

  // ================== MAIN AI CHAT METHODS ==================

  static async generateResponse(
    userMessage: string, 
    context?: ChatContext,
    conversationId?: string
  ): Promise<ChatMessage> {
    try {
      // Gather relevant context from all platform segments
      const enrichedContext = await this.gatherPlatformContext(userMessage, context);
      
      // Find relevant data sources
      const dataSources = await this.findRelevantDataSources(userMessage, enrichedContext);
      
      // Generate AI response using best available API
      const aiResponse = await this.callBestAvailableAI(userMessage, enrichedContext, dataSources);
      
      // Create response message
      const responseMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        context: enrichedContext,
        sources: dataSources,
        metadata: {
          conversationId,
          responseTime: Date.now(),
          apiUsed: this.getLastUsedAPI()
        }
      };

      // Save to conversation history
      await this.saveMessageToHistory(responseMessage, conversationId);
      
      return responseMessage;
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback response
      return {
        id: `msg-${Date.now()}-fallback`,
        role: 'assistant',
        content: "I'm having trouble connecting to the AI service right now. However, I can still help you navigate the platform and find information in your data. What specific information are you looking for?",
        timestamp: new Date().toISOString(),
        context,
        sources: [],
        metadata: { error: true, fallback: true }
      };
    }
  }

  // ================== CONTEXT GATHERING ==================

  static async gatherPlatformContext(userMessage: string, initialContext?: ChatContext): Promise<ChatContext> {
    const context: ChatContext = {
      segment: initialContext?.segment || 'general',
      entityId: initialContext?.entityId,
      entityType: initialContext?.entityType,
      userRole: initialContext?.userRole,
      userQuery: userMessage,
      relevantData: [],
      knowledgeBase: initialContext?.knowledgeBase,
      webSearch: initialContext?.webSearch
    };

    try {
      // Determine which segments are relevant based on user message
      const relevantSegments = this.detectRelevantSegments(userMessage);
      
      // Gather data from each relevant segment
      const contextData = await Promise.allSettled([
        relevantSegments.includes('notes') ? this.gatherNotesContext(userMessage) : Promise.resolve(null),
        relevantSegments.includes('priorities') ? this.gatherPrioritiesContext(userMessage) : Promise.resolve(null),
        relevantSegments.includes('calendar') ? this.gatherCalendarContext(userMessage) : Promise.resolve(null),
        relevantSegments.includes('meetings') ? this.gatherMeetingsContext(userMessage) : Promise.resolve(null),
        relevantSegments.includes('emails') ? this.gatherEmailsContext(userMessage) : Promise.resolve(null),
        relevantSegments.includes('stakeholders') ? this.gatherStakeholdersContext(userMessage) : Promise.resolve(null),
        relevantSegments.includes('market') ? this.gatherMarketContext(userMessage) : Promise.resolve(null),
        relevantSegments.includes('planning') ? this.gatherPlanningContext(userMessage) : Promise.resolve(null),
        this.gatherWebSearchContext(userMessage, context) // Always include web search capability
      ]);

      // Combine successful results
      context.relevantData = contextData
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => (result as PromiseFulfilledResult<any>).value)
        .filter(Boolean);

      return context;
    } catch (error) {
      console.error('Error gathering platform context:', error);
      return context;
    }
  }

  private static detectRelevantSegments(userMessage: string): string[] {
    const message = userMessage.toLowerCase();
    const segments: string[] = [];

    // Keywords mapping to segments
    const segmentKeywords = {
      notes: ['note', 'notebook', 'write', 'document', 'todo', 'task', 'reminder'],
      priorities: ['priority', 'backlog', 'urgent', 'important', 'epic', 'story', 'feature'],
      calendar: ['calendar', 'event', 'ceremony', 'sprint', 'meeting', 'schedule', 'time'],
      meetings: ['meeting', 'standup', 'retrospective', 'review', 'planning', 'attendee'],
      emails: ['email', 'message', 'communication', 'inbox', 'sent', 'reply'],
      stakeholders: ['stakeholder', 'people', 'team', 'customer', 'client', 'user'],
      market: ['market', 'competition', 'trend', 'competitor', 'industry', 'analysis'],
      planning: ['plan', 'daily', 'productivity', 'goal', 'achievement', 'focus'],
      'knowledge-base': ['knowledge', 'document', 'search', 'file', 'information', 'research']
    };

    // Check each segment's keywords
    Object.entries(segmentKeywords).forEach(([segment, keywords]) => {
      if (keywords.some(keyword => message.includes(keyword))) {
        segments.push(segment);
      }
    });

    // If no specific segments detected, include all for broad queries
    if (segments.length === 0) {
      return ['notes', 'priorities', 'calendar', 'meetings'];
    }

    return segments;
  }

  // ================== SEGMENT-SPECIFIC CONTEXT GATHERING ==================

  private static async gatherNotesContext(userMessage: string): Promise<any> {
    try {
      const notes = await NotesService.searchNotes(userMessage, { query: userMessage });
      return {
        type: 'notes',
        count: notes.length,
        items: notes.slice(0, 5).map(note => ({
          id: note.id,
          title: note.title,
          content: note.content.substring(0, 200),
          tags: note.tags,
          notebook: note.notebook,
          section: note.section
        }))
      };
    } catch (error) {
      console.error('Error gathering notes context:', error);
      return null;
    }
  }

  private static async gatherPrioritiesContext(userMessage: string): Promise<any> {
    try {
      const priorities = await PriorityService.getAllPriorities();
      const relevantPriorities = priorities.filter(p => 
        p.title.toLowerCase().includes(userMessage.toLowerCase()) ||
        p.description?.toLowerCase().includes(userMessage.toLowerCase())
      );

      return {
        type: 'priorities',
        count: relevantPriorities.length,
        items: relevantPriorities.slice(0, 5).map(priority => ({
          id: priority.id,
          title: priority.title,
          description: priority.description,
          priority_level: priority.priority_level,
          status: priority.status,
          tags: priority.tags
        }))
      };
    } catch (error) {
      console.error('Error gathering priorities context:', error);
      return null;
    }
  }

  private static async gatherCalendarContext(userMessage: string): Promise<any> {
    try {
      const events = await CalendarService.getEvents({
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
      });

      return {
        type: 'calendar',
        count: events.length,
        items: events.slice(0, 5).map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          type: event.type,
          startTime: event.startTime,
          status: event.status
        }))
      };
    } catch (error) {
      console.error('Error gathering calendar context:', error);
      return null;
    }
  }

  private static async gatherMeetingsContext(userMessage: string): Promise<any> {
    try {
      const meetings = await MeetingService.getAllMeetings();
      const recentMeetings = meetings.slice(0, 5);

      return {
        type: 'meetings',
        count: meetings.length,
        items: recentMeetings.map(meeting => ({
          id: meeting.id,
          title: meeting.title,
          description: meeting.description,
          meeting_type: meeting.meeting_type,
          status: meeting.status,
          date: meeting.date,
          attendees: meeting.attendees?.length || 0
        }))
      };
    } catch (error) {
      console.error('Error gathering meetings context:', error);
      return null;
    }
  }

  private static async gatherEmailsContext(userMessage: string): Promise<any> {
    try {
      const emails = await EmailService.getAllEmails({ search: userMessage });
      
      return {
        type: 'emails',
        count: emails.length,
        items: emails.slice(0, 3).map(email => ({
          id: email.id,
          subject: email.subject,
          from_name: email.from_name,
          priority: email.priority,
          sentiment: email.sentiment,
          ai_summary: email.ai_summary
        }))
      };
    } catch (error) {
      console.error('Error gathering emails context:', error);
      return null;
    }
  }

  private static async gatherStakeholdersContext(userMessage: string): Promise<any> {
    try {
      const stakeholders = await StakeholderService.getAllStakeholders();
      
      return {
        type: 'stakeholders',
        count: stakeholders.length,
        items: stakeholders.slice(0, 5).map(stakeholder => ({
          id: stakeholder.id,
          name: stakeholder.name,
          role: stakeholder.role,
          department: stakeholder.department,
          influence: stakeholder.influence,
          interest: stakeholder.interest
        }))
      };
    } catch (error) {
      console.error('Error gathering stakeholders context:', error);
      return null;
    }
  }

  private static async gatherMarketContext(userMessage: string): Promise<any> {
    try {
      const trends = await MarketIntelligenceService.getAllTrends();
      
      return {
        type: 'market',
        count: trends.length,
        items: trends.slice(0, 3).map(trend => ({
          id: trend.id,
          trend_name: trend.trend_name,
          trend_category: trend.trend_category,
          impact_level: trend.impact_level,
          confidence_score: trend.confidence_score
        }))
      };
    } catch (error) {
      console.error('Error gathering market context:', error);
      return null;
    }
  }

  private static async gatherPlanningContext(userMessage: string): Promise<any> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const tasks = await DailyPlanningService.getAllTasks(today);
      
      return {
        type: 'planning',
        count: tasks.length,
        items: tasks.slice(0, 5).map(task => ({
          id: task.id,
          title: task.title,
          task_type: task.task_type,
          priority: task.priority,
          status: task.status
        }))
      };
    } catch (error) {
      console.error('Error gathering planning context:', error);
      return null;
    }
  }

  // ================== DATA SOURCE FINDING ==================

  private static async findRelevantDataSources(userMessage: string, context: ChatContext): Promise<DataSource[]> {
    const sources: DataSource[] = [];

    if (!context.relevantData) return sources;

    // Process each type of relevant data
    context.relevantData.forEach(dataGroup => {
      if (!dataGroup || !dataGroup.items) return;

      dataGroup.items.forEach((item: any) => {
        const relevanceScore = this.calculateRelevanceScore(userMessage, item, dataGroup.type);
        
        if (relevanceScore > 0.3) { // Threshold for relevance
          sources.push({
            type: dataGroup.type,
            id: item.id,
            title: item.title || item.name || item.subject || 'Untitled',
            relevanceScore,
            snippet: this.generateSnippet(item, dataGroup.type),
            url: item.url // Include URL for web results
          });
        }
      });
    });

    // Sort by relevance and return top sources
    return sources
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);
  }

  private static calculateRelevanceScore(query: string, item: any, type: string): number {
    const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 2);
    let score = 0;
    let maxScore = queryWords.length;

    const searchableText = [
      item.title,
      item.name,
      item.subject,
      item.description,
      item.content,
      ...(item.tags || [])
    ].filter(Boolean).join(' ').toLowerCase();

    // Check word matches
    queryWords.forEach(word => {
      if (searchableText.includes(word)) {
        score += 1;
      }
    });

    // Boost for exact phrase matches
    if (searchableText.includes(query.toLowerCase())) {
      score += 0.5;
    }

    // Type-specific boosts
    const typeBoosts = {
      'notes': 1.2,
      'priorities': 1.1,
      'meetings': 1.0,
      'calendar': 1.0,
      'emails': 0.9
    };

    return (score / maxScore) * (typeBoosts[type as keyof typeof typeBoosts] || 1.0);
  }

  private static generateSnippet(item: any, type: string): string {
    const content = item.content || item.description || item.ai_summary || '';
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  }

  // ================== AI API INTEGRATION ==================

  private static lastUsedAPI: string = '';

  private static getLastUsedAPI(): string {
    return this.lastUsedAPI;
  }

  private static async callBestAvailableAI(
    userMessage: string, 
    context: ChatContext, 
    sources: DataSource[]
  ): Promise<string> {
    // Try APIs in order of preference (free first)
    const apiPriority = [
      'huggingface',
      'google-gemini', 
      'cohere',
      'openai',
      'anthropic'
    ];

    for (const apiName of apiPriority) {
      try {
        const response = await this.callSpecificAPI(apiName, userMessage, context, sources);
        if (response) {
          this.lastUsedAPI = apiName;
          return response;
        }
      } catch (error) {
        console.warn(`API ${apiName} failed:`, error);
        continue;
      }
    }

    // Fallback to local processing
    return this.generateLocalResponse(userMessage, context, sources);
  }

  private static async callSpecificAPI(
    apiName: string,
    userMessage: string,
    context: ChatContext,
    sources: DataSource[]
  ): Promise<string | null> {
    const prompt = this.buildComprehensivePrompt(userMessage, context, sources);

    switch (apiName) {
      case 'huggingface':
        return this.callHuggingFaceAPI(prompt);
      case 'google-gemini':
        return this.callGoogleGeminiAPI(prompt);
      case 'cohere':
        return this.callCohereAPI(prompt);
      case 'openai':
        return this.callOpenAIAPI(prompt);
      case 'anthropic':
        return this.callAnthropicAPI(prompt);
      default:
        return null;
    }
  }

  // ================== SPECIFIC API IMPLEMENTATIONS ==================

  private static async callHuggingFaceAPI(prompt: string): Promise<string | null> {
    try {
      const apiKey = process.env.REACT_APP_HUGGINGFACE_API_KEY || 'hf_demo'; // Free tier
      
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 512,
            temperature: 0.7,
            return_full_text: false
          }
        })
      });

      if (!response.ok) throw new Error('Hugging Face API failed');

      const result = await response.json();
      return result[0]?.generated_text || null;
    } catch (error) {
      console.error('Hugging Face API error:', error);
      return null;
    }
  }

  private static async callGoogleGeminiAPI(prompt: string): Promise<string | null> {
    try {
      const apiKey = process.env.REACT_APP_GOOGLE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Google Gemini API key not configured');

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512
          }
        })
      });

      if (!response.ok) throw new Error('Google Gemini API failed');

      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (error) {
      console.error('Google Gemini API error:', error);
      return null;
    }
  }

  private static async callCohereAPI(prompt: string): Promise<string | null> {
    try {
      const apiKey = process.env.REACT_APP_COHERE_API_KEY;
      if (!apiKey) throw new Error('Cohere API key not configured');

      const response = await fetch('https://api.cohere.ai/v1/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'command',
          prompt: prompt,
          max_tokens: 512,
          temperature: 0.7,
          stop_sequences: ['Human:', 'User:']
        })
      });

      if (!response.ok) throw new Error('Cohere API failed');

      const result = await response.json();
      return result.generations?.[0]?.text || null;
    } catch (error) {
      console.error('Cohere API error:', error);
      return null;
    }
  }

  private static async callOpenAIAPI(prompt: string): Promise<string | null> {
    try {
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
      if (!apiKey) throw new Error('OpenAI API key not configured');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant for an agile project management platform.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 512,
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error('OpenAI API failed');

      const result = await response.json();
      return result.choices?.[0]?.message?.content || null;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return null;
    }
  }

  private static async callAnthropicAPI(prompt: string): Promise<string | null> {
    try {
      const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error('Anthropic API key not configured');

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 512,
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.ok) throw new Error('Anthropic API failed');

      const result = await response.json();
      return result.content?.[0]?.text || null;
    } catch (error) {
      console.error('Anthropic API error:', error);
      return null;
    }
  }

  // ================== WEB SEARCH CONTEXT ==================

  private static async gatherWebSearchContext(userMessage: string, context: ChatContext): Promise<any> {
    try {
      // Check if the query requires web search
      const webSearchKeywords = ['search', 'find', 'look up', 'what is', 'who is', 'how to', 'latest', 'recent', 'current'];
      const requiresWebSearch = webSearchKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword)
      );

      if (requiresWebSearch || context.webSearch?.query) {
        const searchQuery = context.webSearch?.query || userMessage;
        const webResults = await WebScrapingService.searchWeb(searchQuery, { maxResults: 5 });
        
        return {
          type: 'web_search',
          query: searchQuery,
          count: webResults.length,
          items: webResults.map(result => ({
            id: result.url || `web-${Date.now()}`,
            title: result.title,
            content: result.content,
            url: result.url,
            summary: result.summary
          }))
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error gathering web search context:', error);
      return null;
    }
  }

  // ================== PROMPT BUILDING ==================

  private static buildComprehensivePrompt(
    userMessage: string, 
    context: ChatContext, 
    sources: DataSource[]
  ): string {
    let prompt = `You are an AI assistant for a comprehensive agile project management platform. You have access to the user's complete project data across multiple segments.

USER QUESTION: ${userMessage}

CONTEXT:
- User Role: ${context.userRole || 'Product Owner'}
- Current Segment: ${context.segment || 'general'}
- Platform Data Available: ${context.relevantData?.length || 0} segments

RELEVANT DATA SOURCES:`;

    // Add data sources information
    if (sources.length > 0) {
      sources.forEach((source, index) => {
        prompt += `\n${index + 1}. [${source.type.toUpperCase()}] ${source.title}`;
        if (source.snippet) {
          prompt += `\n   Summary: ${source.snippet}`;
        }
        if (source.url) {
          prompt += `\n   URL: ${source.url}`;
        }
        prompt += `\n   Relevance: ${(source.relevanceScore * 100).toFixed(1)}%`;
      });
    } else {
      prompt += '\n- No specific data sources found matching the query';
    }

    // Add context data summary
    if (context.relevantData && context.relevantData.length > 0) {
      prompt += '\n\nPLATFORM DATA SUMMARY:';
      context.relevantData.forEach(dataGroup => {
        if (dataGroup && dataGroup.type && dataGroup.count > 0) {
          prompt += `\n- ${dataGroup.type}: ${dataGroup.count} items available`;
        }
      });
    }

    prompt += `\n\nINSTRUCTIONS:
1. Provide a helpful, contextual response based on the available data
2. Reference specific data sources when relevant (mention titles/names)
3. If no relevant data is found, provide general guidance for the platform
4. Be concise but thorough
5. Suggest actionable next steps when appropriate
6. Use agile terminology appropriate for the user's role

RESPONSE:`;

    return prompt;
  }

  // ================== FALLBACK RESPONSE ==================

  private static generateLocalResponse(
    userMessage: string, 
    context: ChatContext, 
    sources: DataSource[]
  ): string {
    const message = userMessage.toLowerCase();
    
    // Pattern-based responses for common queries
    if (message.includes('priority') || message.includes('backlog')) {
      return this.generatePriorityResponse(sources);
    }
    
    if (message.includes('meeting') || message.includes('standup') || message.includes('ceremony')) {
      return this.generateMeetingResponse(sources);
    }
    
    if (message.includes('note') || message.includes('document')) {
      return this.generateNotesResponse(sources);
    }
    
    if (message.includes('calendar') || message.includes('schedule')) {
      return this.generateCalendarResponse(sources);
    }

    if (message.includes('stakeholder') || message.includes('people')) {
      return this.generateStakeholderResponse(sources);
    }

    // Generic helpful response
    return this.generateGenericResponse(sources, context);
  }

  private static generatePriorityResponse(sources: DataSource[]): string {
    const prioritySources = sources.filter(s => s.type === 'priority');
    if (prioritySources.length > 0) {
      return `I found ${prioritySources.length} relevant priorities in your backlog. Here are the key items:\n\n${prioritySources.slice(0, 3).map(s => `• ${s.title}`).join('\n')}\n\nWould you like me to help you analyze these priorities or create new ones?`;
    }
    return "I can help you manage your priorities and backlog. You can create new priorities, update existing ones, or analyze your current workload. What specific aspect of priority management would you like assistance with?";
  }

  private static generateMeetingResponse(sources: DataSource[]): string {
    const meetingSources = sources.filter(s => s.type === 'meeting' || s.type === 'calendar');
    if (meetingSources.length > 0) {
      return `I found ${meetingSources.length} relevant meetings or events. Here's what's coming up:\n\n${meetingSources.slice(0, 3).map(s => `• ${s.title}`).join('\n')}\n\nWould you like me to help you prepare for these meetings or schedule new ones?`;
    }
    return "I can help you manage your meetings and ceremonies. You can schedule new meetings, view upcoming events, or get insights about your meeting patterns. What would you like to do?";
  }

  private static generateNotesResponse(sources: DataSource[]): string {
    const noteSources = sources.filter(s => s.type === 'note');
    if (noteSources.length > 0) {
      return `I found ${noteSources.length} relevant notes in your notebooks:\n\n${noteSources.slice(0, 3).map(s => `• ${s.title}`).join('\n')}\n\nWould you like me to help you organize these notes or create new ones?`;
    }
    return "I can help you manage your notes and documentation. You can create new notes, organize them into notebooks, set reminders, or search through existing content. What would you like to work on?";
  }

  private static generateCalendarResponse(sources: DataSource[]): string {
    const calendarSources = sources.filter(s => s.type === 'calendar');
    if (calendarSources.length > 0) {
      return `I found ${calendarSources.length} relevant calendar events:\n\n${calendarSources.slice(0, 3).map(s => `• ${s.title}`).join('\n')}\n\nWould you like me to help you manage these events or plan new ceremonies?`;
    }
    return "I can help you manage your SAFe calendar and ceremonies. You can schedule sprint ceremonies, PI planning events, or other agile events. What would you like to schedule?";
  }

  private static generateStakeholderResponse(sources: DataSource[]): string {
    const stakeholderSources = sources.filter(s => s.type === 'stakeholder');
    if (stakeholderSources.length > 0) {
      return `I found ${stakeholderSources.length} relevant stakeholders:\n\n${stakeholderSources.slice(0, 3).map(s => `• ${s.title}`).join('\n')}\n\nWould you like me to help you analyze stakeholder relationships or plan communication strategies?`;
    }
    return "I can help you manage your stakeholder relationships. You can add new stakeholders, update their information, or analyze your stakeholder matrix. What would you like to focus on?";
  }

  private static generateGenericResponse(sources: DataSource[], context: ChatContext): string {
    if (sources.length > 0) {
      return `I found ${sources.length} relevant items across your platform data. Based on your question, here are the most relevant resources:\n\n${sources.slice(0, 3).map(s => `• [${s.type.toUpperCase()}] ${s.title}`).join('\n')}\n\nHow can I help you work with this information?`;
    }
    
    return `I'm here to help you navigate your agile project management platform. I can assist with:

• Managing priorities and backlog items
• Scheduling and organizing meetings
• Creating and organizing notes
• Analyzing stakeholder relationships  
• Planning your daily activities
• Understanding market trends
• Coordinating calendar events

What would you like to work on today?`;
  }

  // ================== CONVERSATION MANAGEMENT ==================

  static async saveMessageToHistory(message: ChatMessage, conversationId?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('chat_messages').insert({
        id: message.id,
        conversation_id: conversationId || 'default',
        role: message.role,
        content: message.content,
        context: message.context,
        sources: message.sources,
        metadata: message.metadata,
        user_id: user.id,
        timestamp: message.timestamp
      });
    } catch (error) {
      console.error('Error saving message to history:', error);
    }
  }

  static async getConversationHistory(conversationId?: string): Promise<ChatMessage[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId || 'default')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true })
        .limit(50);

      if (error) throw error;

      return data?.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        context: msg.context,
        sources: msg.sources,
        metadata: msg.metadata
      })) || [];
    } catch (error) {
      console.error('Error loading conversation history:', error);
      return [];
    }
  }

  // ================== UTILITY METHODS ==================

  static async analyzeQuery(query: string): Promise<{
    intent: string;
    entities: string[];
    segments: string[];
    confidence: number;
  }> {
    // Simple query analysis - could be enhanced with ML
    const intents = {
      'create': ['create', 'add', 'new', 'make'],
      'search': ['find', 'search', 'show', 'get', 'list'],
      'update': ['update', 'change', 'modify', 'edit'],
      'delete': ['delete', 'remove', 'cancel'],
      'analyze': ['analyze', 'report', 'summary', 'stats']
    };

    const query_lower = query.toLowerCase();
    let detected_intent = 'search'; // default
    let max_confidence = 0;

    Object.entries(intents).forEach(([intent, keywords]) => {
      const matches = keywords.filter(keyword => query_lower.includes(keyword));
      const confidence = matches.length / keywords.length;
      if (confidence > max_confidence) {
        max_confidence = confidence;
        detected_intent = intent;
      }
    });

    return {
      intent: detected_intent,
      entities: [], // Could extract with NER
      segments: this.detectRelevantSegments(query),
      confidence: max_confidence
    };
  }

  // ================== EXTERNAL API MANAGEMENT ==================

  static getAvailableAPIs(): ExternalAPIConfig[] {
    return EXTERNAL_APIS;
  }

  static async testAPIConnection(apiName: string): Promise<boolean> {
    try {
      const testPrompt = "Hello, this is a test message.";
      const response = await this.callSpecificAPI(apiName, testPrompt, {}, []);
      return !!response;
    } catch (error) {
      return false;
    }
  }
}