import { supabase } from '../lib/supabase';
import { NotesService } from './notesService';
import { CalendarService } from './calendarService';
import { PriorityService } from './priorityService';
import { EmailService } from './emailService';
import { MeetingService } from './meetingService';
import { KnowledgeBaseService } from './knowledgeBaseService';
import { StakeholderService } from './stakeholderService';
import { MarketIntelligenceService } from './marketIntelligenceService';
import { DailyPlanningService } from './dailyPlanningService';

// Enhanced Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  context?: ChatContext;
  sources?: DataSource[];
  metadata?: ChatMetadata;
  isStreaming?: boolean;
}

export interface ChatContext {
  segment?: 'notes' | 'calendar' | 'priorities' | 'emails' | 'meetings' | 'planning' | 'market' | 'stakeholders' | 'knowledge' | 'general';
  entityId?: string;
  entityType?: string;
  userRole?: string;
  relevantData?: any[];
  searchQuery?: string;
  filters?: DataFilter;
}

export interface ChatMetadata {
  processingTime?: number;
  confidence?: number;
  searchResults?: number;
  tokensUsed?: number;
  model?: string;
}

export interface DataSource {
  type: 'note' | 'priority' | 'meeting' | 'email' | 'calendar' | 'stakeholder' | 'market_trend' | 'document' | 'knowledge_base' | 'planning';
  id: string;
  title: string;
  relevanceScore: number;
  snippet?: string;
  url?: string;
  createdAt?: string;
  author?: string;
}

export interface DataFilter {
  types?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  priority?: string;
  author?: string;
}

export interface SearchResult {
  results: DataSource[];
  totalResults: number;
  searchTime: number;
  suggestions?: string[];
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  context?: ChatContext;
  isActive: boolean;
}

class AIChatService {
  private notesService: typeof NotesService;
  private calendarService: typeof CalendarService;
  private priorityService: typeof PriorityService;
  private emailService: typeof EmailService;
  private meetingService: typeof MeetingService;
  private knowledgeBaseService: typeof KnowledgeBaseService;
  private stakeholderService: typeof StakeholderService;
  private marketService: typeof MarketIntelligenceService;
  private planningService: typeof DailyPlanningService;

  constructor() {
    // Services that are instances (exported as const)
    this.notesService = NotesService;
    this.calendarService = CalendarService;
    
    // Services that are classes (exported as class)
    this.priorityService = PriorityService;
    this.emailService = EmailService;
    this.meetingService = MeetingService;
    this.knowledgeBaseService = KnowledgeBaseService;
    this.stakeholderService = StakeholderService;
    this.marketService = MarketIntelligenceService;
    this.planningService = DailyPlanningService;
  }

  // Chat Session Management
  async createChatSession(userId: string, title?: string): Promise<ChatSession> {
    const session: ChatSession = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      title: title || `Chat ${new Date().toLocaleDateString()}`,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    // Store in Supabase
    const { error } = await supabase
      .from('ai_chat_sessions')
      .insert([session]);

    if (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }

    return session;
  }

  async getChatSessions(userId: string): Promise<ChatSession[]> {
    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching chat sessions:', error);
      return [];
    }

    return data || [];
  }

  async getChatSession(sessionId: string): Promise<ChatSession | null> {
    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching chat session:', error);
      return null;
    }

    return data;
  }

  // Knowledge Base Search and Access
  async searchKnowledgeBase(query: string, filters?: DataFilter): Promise<SearchResult> {
    const startTime = Date.now();
    const results: DataSource[] = [];

    try {
      // Search Notes (instance method)
      const notes = await this.notesService.searchNotes(query);
      notes.forEach(note => {
        results.push({
          type: 'note',
          id: note.id,
          title: note.title,
          relevanceScore: this.calculateRelevance(query, note.title + ' ' + note.content),
          snippet: this.extractSnippet(note.content, query),
          createdAt: note.createdAt,
          author: note.lastEditedBy
        });
      });

      // Search Knowledge Base Documents (static method)
      const documents = await this.knowledgeBaseService.searchDocuments(query);
      documents.forEach(doc => {
        results.push({
          type: 'knowledge_base',
          id: doc.id!,
          title: doc.name,
          relevanceScore: this.calculateRelevance(query, doc.name + ' ' + (doc.description || '')),
          snippet: this.extractSnippet(doc.description || '', query),
          createdAt: doc.created_at,
          url: doc.file_url
        });
      });

      // Search Meetings (static method)
      const meetings = await this.meetingService.searchMeetings(query);
      meetings.forEach(meeting => {
        results.push({
          type: 'meeting',
          id: meeting.id!,
          title: meeting.title,
          relevanceScore: this.calculateRelevance(query, meeting.title + ' ' + (meeting.meeting_notes || '')),
          snippet: this.extractSnippet(meeting.meeting_notes || meeting.description || '', query),
          createdAt: meeting.created_at
        });
      });

      // Search Priorities (static method)
      const priorities = await this.priorityService.searchPriorities(query);
      priorities.forEach(priority => {
        results.push({
          type: 'priority',
          id: priority.id!,
          title: priority.title,
          relevanceScore: this.calculateRelevance(query, priority.title + ' ' + (priority.description || '')),
          snippet: this.extractSnippet(priority.description || '', query),
          createdAt: priority.created_at
        });
      });

      // Search Stakeholders (static method)
      const stakeholders = await this.stakeholderService.searchStakeholders(query);
      stakeholders.forEach(stakeholder => {
        results.push({
          type: 'stakeholder',
          id: stakeholder.id!,
          title: stakeholder.name,
          relevanceScore: this.calculateRelevance(query, stakeholder.name + ' ' + (stakeholder.notes || '')),
          snippet: this.extractSnippet(stakeholder.notes || '', query),
          createdAt: stakeholder.created_at
        });
      });

      // Search Calendar Events (instance method - if available)
      try {
        const events = await this.calendarService.getEvents({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)    // Next 30 days
        });
        
        const filteredEvents = events.filter(event => 
          event.title.toLowerCase().includes(query.toLowerCase()) ||
          (event.description && event.description.toLowerCase().includes(query.toLowerCase()))
        );
        
        filteredEvents.forEach(event => {
          results.push({
            type: 'calendar',
            id: event.id,
            title: event.title,
            relevanceScore: this.calculateRelevance(query, event.title + ' ' + (event.description || '')),
            snippet: this.extractSnippet(event.description || '', query),
            createdAt: event.createdAt
          });
        });
      } catch (error) {
        console.log('Calendar search not available:', error);
      }

    } catch (error) {
      console.error('Error searching knowledge base:', error);
    }

    // Sort by relevance and apply filters
    const sortedResults = results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20); // Limit to top 20 results

    const searchTime = Date.now() - startTime;

    return {
      results: sortedResults,
      totalResults: results.length,
      searchTime,
      suggestions: this.generateSearchSuggestions(query, sortedResults)
    };
  }

  // AI Chat Response Generation
  async generateResponse(
    message: string, 
    sessionId: string, 
    context?: ChatContext
  ): Promise<ChatMessage> {
    const startTime = Date.now();

    // Search relevant knowledge base content
    const searchResults = await this.searchKnowledgeBase(message);
    
    // Prepare context data
    const relevantData = await this.gatherRelevantData(message, context);
    
    // Generate AI response (simulated - replace with actual AI service)
    const aiResponse = await this.callAIService(message, relevantData, searchResults);

    // Create response message
    const responseMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        relevantData: relevantData.slice(0, 5) // Include top 5 relevant items
      },
      sources: searchResults.results.slice(0, 10), // Include top 10 sources
      metadata: {
        processingTime: Date.now() - startTime,
        confidence: aiResponse.confidence,
        searchResults: searchResults.totalResults,
        tokensUsed: aiResponse.tokensUsed,
        model: 'gpt-4-turbo'
      }
    };

    // Store message in session
    await this.addMessageToSession(sessionId, responseMessage);

    return responseMessage;
  }

  // Gather relevant contextual data with enhanced context awareness
  private async gatherRelevantData(query: string, context?: ChatContext): Promise<any[]> {
    const relevantData: any[] = [];

    try {
      // Context-aware data gathering based on query intent and context
      const queryIntent = this.analyzeQueryIntent(query);
      const contextFilters = this.buildContextFilters(context, queryIntent);

      // Get recent notes with context filtering (instance method)
      const recentNotes = await this.notesService.getAllNotes();
      const contextualNotes = this.filterByContext(recentNotes, contextFilters, queryIntent);
      relevantData.push(...contextualNotes.slice(0, 5));

      // Get meetings based on context (static methods)
      if (queryIntent.includes('planning') || queryIntent.includes('upcoming')) {
        const upcomingMeetings = await this.meetingService.getAllMeetings({ 
          date_from: new Date().toISOString().split('T')[0],
          status: 'scheduled' 
        });
        relevantData.push(...upcomingMeetings.slice(0, 5));
      } else {
        const recentMeetings = await this.meetingService.getAllMeetings({ 
          status: 'completed',
          date_from: this.getDateDaysAgo(7) 
        });
        relevantData.push(...recentMeetings.slice(0, 3));
      }

      // Get priorities with context-aware filtering (static methods)
      const priorities = await this.priorityService.getAllPriorities();
      let filteredPriorities = priorities;

      if (queryIntent.includes('urgent') || queryIntent.includes('critical')) {
        filteredPriorities = priorities.filter(p => p.priority_level === 'critical' || p.urgency >= 8);
      } else if (queryIntent.includes('planning') || queryIntent.includes('backlog')) {
        filteredPriorities = priorities.filter(p => p.status === 'backlog' || p.status === 'in-progress');
      }

      relevantData.push(...filteredPriorities.slice(0, 5));

      // Get calendar events with time-based context (instance methods)
      try {
        if (queryIntent.includes('today') || queryIntent.includes('schedule')) {
          const todayEvents = await this.calendarService.getEvents({
            startDate: new Date(),
            endDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next 24 hours
          });
          relevantData.push(...todayEvents.slice(0, 3));
        } else {
          const recentEvents = await this.calendarService.getEvents({
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
          });
          relevantData.push(...recentEvents.slice(0, 3));
        }
      } catch (error) {
        console.log('Calendar events not available:', error);
      }

      // Get stakeholders with role-based context (static methods)
      const stakeholders = await this.stakeholderService.getAllStakeholders();
      const contextualStakeholders = this.filterStakeholdersByContext(stakeholders, queryIntent, context);
      relevantData.push(...contextualStakeholders.slice(0, 3));

      // Add conversation memory for better context continuity
      if (context?.segment) {
        const segmentData = await this.getSegmentSpecificData(context.segment, queryIntent);
        relevantData.push(...segmentData);
      }

    } catch (error) {
      console.error('Error gathering relevant data:', error);
    }

    // Sort by relevance and recency
    return this.rankDataByRelevance(relevantData, query, context);
  }

  // AI Service Integration (simulated)
  private async callAIService(
    query: string, 
    relevantData: any[], 
    searchResults: SearchResult
  ): Promise<{ content: string; confidence: number; tokensUsed: number }> {
    
    // Build context for AI
    const context = this.buildAIContext(query, relevantData, searchResults);
    
    // Simulate AI response generation
    // In production, replace this with actual AI service call (OpenAI, Anthropic, etc.)
    const response = await this.simulateAIResponse(query, context);
    
    return response;
  }

  private buildAIContext(query: string, relevantData: any[], searchResults: SearchResult): string {
    let context = `You are an AI assistant for a Virtual Product Owner platform. You have access to comprehensive data about notes, meetings, priorities, calendar events, stakeholders, and knowledge base documents.

Current user query: "${query}"

Relevant data from the knowledge base:
`;

    // Add search results context
    if (searchResults.results.length > 0) {
      context += "\nMost relevant search results:\n";
      searchResults.results.slice(0, 5).forEach((result, index) => {
        context += `${index + 1}. [${result.type.toUpperCase()}] ${result.title}\n`;
        if (result.snippet) {
          context += `   Snippet: ${result.snippet}\n`;
        }
      });
    }

    // Add relevant data context
    if (relevantData.length > 0) {
      context += "\nRecent/relevant data:\n";
      relevantData.slice(0, 5).forEach((item, index) => {
        context += `${index + 1}. ${item.title || item.name || 'Untitled'}\n`;
        if (item.description || item.content) {
          context += `   Description: ${(item.description || item.content || '').substring(0, 100)}...\n`;
        }
      });
    }

    context += `\nPlease provide a helpful, contextual response based on the available data. If you reference specific items, mention which data sources you're using.`;

    return context;
  }

  private async simulateAIResponse(
    query: string, 
    context: string
  ): Promise<{ content: string; confidence: number; tokensUsed: number }> {
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Extract search results from context for more intelligent responses
    const contextLines = context.split('\n');
    const searchResultsSection = contextLines.findIndex(line => line.includes('Most relevant search results:'));
    const relevantDataSection = contextLines.findIndex(line => line.includes('Recent/relevant data:'));
    
    const hasSearchResults = searchResultsSection !== -1;
    const hasRelevantData = relevantDataSection !== -1;

    // Analyze context for intelligent response generation
    const queryIntent = this.analyzeQueryIntent(query);
    let response = "";
    let confidence = 0.8;

    // Context-aware response generation
    if (queryIntent.includes('meetings') || query.toLowerCase().includes('meeting')) {
      if (hasSearchResults && context.includes('[MEETING]')) {
        response = this.generateMeetingResponse(context, queryIntent);
        confidence = 0.9;
      } else {
        response = "I found several relevant meetings in your knowledge base. Based on your recent meeting notes and upcoming scheduled meetings, here are the key insights:\n\n• Your upcoming sprint planning meeting is scheduled for this week\n• Recent retrospective highlighted velocity improvements\n• Action items from stakeholder meetings need follow-up\n\nWould you like me to provide more details about any specific meeting or help you prepare for an upcoming one?";
      }
    } else if (queryIntent.includes('notes') || query.toLowerCase().includes('note') || query.toLowerCase().includes('document')) {
      if (hasSearchResults && context.includes('[NOTE]')) {
        response = this.generateNotesResponse(context, queryIntent);
        confidence = 0.9;
      } else {
        response = "I've searched through your notes and knowledge base documents. Here's what I found:\n\n• Recent notes show focus on user story refinement\n• Documentation includes several feature specifications\n• Knowledge base contains relevant SAFe framework resources\n\nI can help you find specific notes, create summaries, or organize your documentation. What specific information are you looking for?";
      }
    } else if (queryIntent.includes('priorities') || query.toLowerCase().includes('priority') || query.toLowerCase().includes('task')) {
      if (hasSearchResults && context.includes('[PRIORITY]')) {
        response = this.generatePriorityResponse(context, queryIntent);
        confidence = 0.9;
      } else {
        response = "Based on your current priorities and tasks:\n\n• You have 3 high-priority items requiring attention this week\n• Several tasks are approaching their deadlines\n• Stakeholder feedback indicates shifting priorities on key features\n\nI can help you reorganize priorities, update task status, or create action plans. What would be most helpful?";
      }
    } else if (queryIntent.includes('stakeholders') || query.toLowerCase().includes('stakeholder')) {
      if (hasSearchResults && context.includes('[STAKEHOLDER]')) {
        response = this.generateStakeholderResponse(context, queryIntent);
        confidence = 0.9;
      } else {
        response = "Here's a summary of your stakeholder information:\n\n• Key stakeholders have been mapped with their interests and influence levels\n• Recent communications show active engagement from product marketing\n• Several stakeholders are awaiting project updates\n\nI can help you track stakeholder communications, prepare updates, or analyze stakeholder feedback. What specific stakeholder information do you need?";
      }
    } else if (queryIntent.includes('current') || queryIntent.includes('today')) {
      response = this.generateCurrentStatusResponse(context, queryIntent);
      confidence = 0.85;
    } else if (queryIntent.includes('planning') || queryIntent.includes('upcoming')) {
      response = this.generatePlanningResponse(context, queryIntent);
      confidence = 0.85;
    } else if (queryIntent.includes('review') || queryIntent.includes('summary')) {
      response = this.generateReviewResponse(context, queryIntent);
      confidence = 0.85;
    } else {
      // General response with context awareness
      response = this.generateGeneralResponse(context, queryIntent, hasSearchResults, hasRelevantData);
    }

    return {
      content: response,
      confidence,
      tokensUsed: Math.floor(response.length / 4) // Rough token estimation
    };
  }

  private generateMeetingResponse(context: string, intents: string[]): string {
    if (intents.includes('upcoming') || intents.includes('planning')) {
      return `Based on your upcoming meetings and recent context:

• **Sprint Planning Meeting** - Scheduled for this week with key stakeholders
• **Stakeholder Review** - Quarterly review with high-influence stakeholders  
• **Team Retrospective** - Focus on velocity improvements and process optimization

**Key Preparation Items:**
• Review current sprint velocity and capacity
• Prepare stakeholder updates on priority features
• Gather feedback from recent user story refinements

Would you like me to help you prepare specific agenda items or review action items from recent meetings?`;
    } else if (intents.includes('recent') || intents.includes('review')) {
      return `Here's a summary of your recent meetings and key outcomes:

• **Recent Retrospective** - Team identified velocity improvements and process bottlenecks
• **Stakeholder Check-ins** - Product marketing provided valuable feature feedback
• **Daily Standups** - Consistent progress on authentication and mobile optimization

**Outstanding Action Items:**
• Follow up on stakeholder feedback for feature prioritization
• Schedule technical review for API documentation updates
• Coordinate with customer success on user experience improvements

What specific meeting outcomes or follow-ups would you like me to help you with?`;
    }
    
    return "I can help you with meeting planning, review recent meeting outcomes, or prepare for upcoming discussions. What specific meeting information do you need?";
  }

  private generateNotesResponse(context: string, intents: string[]): string {
    if (intents.includes('recent')) {
      return `Here are insights from your recent notes and documentation:

• **User Story Refinement** - Recent notes show progress on authentication flows and mobile UX
• **Feature Specifications** - Detailed documentation on priority features and technical requirements
• **SAFe Framework Resources** - Knowledge base contains agile methodology and process documentation

**Key Themes Identified:**
• Focus on user authentication and security improvements
• Mobile application performance optimization
• API documentation and technical specification updates

I can help you organize these notes, create summaries, or find specific information. What would be most helpful?`;
    } else if (intents.includes('create') || intents.includes('planning')) {
      return `I can help you create new notes or documentation based on your existing knowledge base:

**Suggested Note Templates:**
• **Sprint Planning Notes** - Based on your current priority structure
• **Stakeholder Meeting Minutes** - Using your stakeholder communication patterns
• **Feature Specification Documents** - Following your existing documentation format

**Content I Can Help Generate:**
• Meeting summaries and action items
• Feature requirement documentation
• User story definitions and acceptance criteria

What type of note or document would you like me to help you create?`;
    }
    
    return "I can help you find, organize, or create notes and documentation. What specific information are you looking for?";
  }

  private generatePriorityResponse(context: string, intents: string[]): string {
    if (intents.includes('urgent') || intents.includes('critical')) {
      return `Here are your most critical priorities requiring immediate attention:

🔥 **Critical Items:**
• **User Authentication Implementation** - High impact, due this week
• **Mobile App Performance Optimization** - Stakeholder feedback indicates urgency
• **Security Vulnerability Patches** - Recently identified, needs immediate action

⚡ **High Priority Follow-ups:**
• API documentation updates (blocking other teams)
• Stakeholder communication on feature delays
• Sprint velocity analysis for capacity planning

**Recommended Actions:**
1. Focus development resources on authentication implementation
2. Schedule emergency meeting for mobile performance issues
3. Communicate timeline updates to stakeholders

Would you like me to help you reorganize these priorities or create action plans?`;
    } else if (intents.includes('planning') || intents.includes('backlog')) {
      return `Here's an analysis of your backlog and planning priorities:

📋 **Sprint Planning Focus:**
• **In Progress:** User authentication (80% complete)
• **Ready for Development:** Mobile optimization features
• **Backlog Refinement:** API documentation improvements

🎯 **Strategic Priorities:**
• Customer feedback integration (high business value)
• Performance monitoring implementation
• Technical debt reduction initiatives

**Capacity Planning:**
• Current sprint at 85% capacity
• 3 high-priority items can fit in next sprint
• Consider stakeholder feedback on feature prioritization

I can help you refine the backlog, estimate effort, or prioritize based on business value. What planning assistance do you need?`;
    }
    
    return "I can help you analyze priorities, plan sprints, or reorganize your backlog. What specific priority management do you need assistance with?";
  }

  private generateStakeholderResponse(context: string, intents: string[]): string {
    if (intents.includes('current') || intents.includes('recent')) {
      return `Here's your current stakeholder landscape and recent interactions:

👥 **Key Active Stakeholders:**
• **Sarah Johnson** (Product Marketing) - High influence, weekly communication, awaiting feature updates
• **Mike Chen** (Engineering Director) - Technical stakeholder, focused on architecture decisions
• **Lisa Park** (Customer Success) - Voice of customer, provides valuable UX feedback

📞 **Recent Communication Summary:**
• Product marketing needs go-to-market strategy updates
• Engineering requires technical specifications for API changes
• Customer success has priority feedback on user experience improvements

🎯 **Engagement Priorities:**
• Schedule update meeting with high-influence stakeholders
• Prepare technical documentation for engineering review
• Gather additional customer feedback through CS channels

Would you like me to help you prepare stakeholder updates or plan communication strategies?`;
    } else if (intents.includes('planning') || intents.includes('upcoming')) {
      return `Strategic stakeholder planning and engagement recommendations:

🎯 **Stakeholder Mapping:**
• **High Influence/High Interest:** Focus on regular updates and involvement
• **High Influence/Low Interest:** Keep informed but don't overwhelm
• **Low Influence/High Interest:** Leverage for detailed feedback and advocacy

📅 **Engagement Strategy:**
• Weekly updates for product marketing and customer success
• Bi-weekly technical reviews with engineering leadership
• Monthly strategic reviews with executive stakeholders

🤝 **Communication Preferences:**
• Email updates for detailed information and documentation
• Slack for quick updates and informal communication
• Meetings for strategic discussions and decision-making

I can help you create stakeholder communication plans or prepare updates for specific audiences. What would be most helpful?`;
    }
    
    return "I can help you track stakeholder communications, prepare updates, or analyze stakeholder feedback. What specific stakeholder information do you need?";
  }

  private generateCurrentStatusResponse(context: string, intents: string[]): string {
    return `Here's your current status across all key areas:

📊 **Today's Focus Areas:**
• **Active Priorities:** User authentication (in progress), mobile optimization (planning)
• **Scheduled Meetings:** Sprint planning at 2 PM, stakeholder check-in at 4 PM
• **Key Stakeholders:** Sarah Johnson (awaiting marketing updates), Mike Chen (technical review)

⚡ **Current Blockers & Actions Needed:**
• API documentation review (blocking mobile team)
• Stakeholder feedback integration (affects sprint planning)
• Security vulnerability assessment (critical priority)

📈 **Progress Summary:**
• Sprint velocity on track (85% capacity utilized)
• High-priority features advancing as planned
• Stakeholder engagement levels healthy

🎯 **Today's Recommended Actions:**
1. Complete authentication feature testing
2. Prepare stakeholder update materials
3. Review and respond to customer feedback

What specific area would you like me to dive deeper into?`;
  }

  private generatePlanningResponse(context: string, intents: string[]): string {
    return `Here's your strategic planning overview and upcoming focus areas:

🚀 **Upcoming Sprint Planning:**
• **Capacity:** Team available for 3-4 major features
• **Priorities:** Mobile optimization, API improvements, documentation updates
• **Dependencies:** Authentication completion, stakeholder feedback integration

📅 **Next 2 Weeks Roadmap:**
• **Week 1:** Complete authentication, begin mobile optimization
• **Week 2:** API documentation updates, stakeholder review preparation

🎯 **Strategic Focus Areas:**
• **Customer Experience:** Based on success team feedback
• **Technical Excellence:** Architecture improvements and performance
• **Market Readiness:** Marketing alignment and go-to-market preparation

💡 **Planning Recommendations:**
• Prioritize based on stakeholder influence and business value
• Consider technical dependencies in sprint sequencing  
• Build buffer time for unexpected high-priority items

I can help you refine the roadmap, estimate effort, or prepare planning materials. What planning assistance do you need?`;
  }

  private generateReviewResponse(context: string, intents: string[]): string {
    return `Here's a comprehensive review of your recent activities and outcomes:

📈 **Recent Achievements:**
• **Development Progress:** Authentication implementation 80% complete
• **Stakeholder Engagement:** Strong feedback from marketing and customer success
• **Process Improvements:** Team velocity increased by 15% after retrospective

🔍 **Key Insights from Analysis:**
• **Priority Alignment:** Current work aligns well with stakeholder expectations
• **Resource Utilization:** Team capacity well-balanced across features
• **Communication Effectiveness:** Regular stakeholder updates improving collaboration

⚠️ **Areas for Improvement:**
• **Documentation:** API docs need updates for mobile team productivity
• **Risk Management:** Security vulnerabilities require faster response
• **Capacity Planning:** Consider increasing buffer for urgent requests

📊 **Performance Metrics:**
• Sprint completion rate: 85%
• Stakeholder satisfaction: High engagement levels
• Technical debt: Manageable, but monitor closely

Would you like me to create detailed reports on any specific area or help you prepare review materials for stakeholders?`;
  }

  private generateGeneralResponse(context: string, intents: string[], hasSearchResults: boolean, hasRelevantData: boolean): string {
    let response = `I've analyzed your knowledge base and can provide insights across all your data sources.`;

    if (hasSearchResults || hasRelevantData) {
      response += ` Based on the available information, here's what I can help you with:\n\n`;
    } else {
      response += ` Here are some ways I can assist you:\n\n`;
    }

    response += `• **🔍 Search & Analysis**: Find specific information across notes, meetings, priorities, and documents
• **📋 Planning & Organization**: Help with sprint planning, priority management, and task organization  
• **📊 Insights & Reporting**: Provide analysis based on your historical data and patterns
• **👥 Stakeholder Management**: Track communications, prepare updates, and analyze feedback
• **📝 Documentation**: Create summaries, organize notes, and manage knowledge base content

**Context-Aware Assistance:**
• Real-time access to your current priorities and deadlines
• Integration with your meeting schedules and action items
• Stakeholder communication history and preferences
• Historical performance data and trends

What specific information or assistance would you like me to provide?`;

    return response;
  }

  // Helper methods
  private calculateRelevance(query: string, text: string): number {
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    let score = 0;
    const queryWords = queryLower.split(' ');
    
    // Exact match bonus
    if (textLower.includes(queryLower)) {
      score += 10;
    }
    
    // Word match scoring
    queryWords.forEach(word => {
      if (textLower.includes(word)) {
        score += 2;
      }
    });
    
    // Length penalty for very long texts
    if (text.length > 1000) {
      score *= 0.8;
    }
    
    return Math.min(score, 10); // Cap at 10
  }

  private extractSnippet(text: string, query: string, maxLength: number = 150): string {
    if (!text || text.length <= maxLength) return text;
    
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Find the best match position
    let bestPos = textLower.indexOf(queryLower);
    if (bestPos === -1) {
      // If no exact match, find first query word
      const queryWords = queryLower.split(' ');
      for (const word of queryWords) {
        bestPos = textLower.indexOf(word);
        if (bestPos !== -1) break;
      }
    }
    
    if (bestPos === -1) {
      return text.substring(0, maxLength) + '...';
    }
    
    // Extract snippet around the match
    const start = Math.max(0, bestPos - 50);
    const end = Math.min(text.length, start + maxLength);
    
    let snippet = text.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    
    return snippet;
  }

  private generateSearchSuggestions(query: string, results: DataSource[]): string[] {
    const suggestions: string[] = [];
    
    // Extract common words from successful results
    const commonTerms = new Map<string, number>();
    results.forEach(result => {
      const words = (result.title + ' ' + (result.snippet || '')).toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3 && !query.toLowerCase().includes(word)) {
          commonTerms.set(word, (commonTerms.get(word) || 0) + 1);
        }
      });
    });
    
    // Get top suggestions
    Array.from(commonTerms.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .forEach(([term]) => {
        suggestions.push(`${query} ${term}`);
      });
    
    return suggestions;
  }

  async addMessageToSession(sessionId: string, message: ChatMessage): Promise<void> {
    try {
      const session = await this.getChatSession(sessionId);
      if (session) {
        session.messages.push(message);
        session.updatedAt = new Date().toISOString();
        
        const { error } = await supabase
          .from('ai_chat_sessions')
          .update({ 
            messages: session.messages,
            updated_at: session.updatedAt 
          })
          .eq('id', sessionId);
        
        if (error) {
          console.error('Error updating chat session:', error);
        }
      }
    } catch (error) {
      console.error('Error adding message to session:', error);
    }
  }

  async clearChatSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_chat_sessions')
        .update({ 
          messages: [],
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      if (error) {
        console.error('Error clearing chat session:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error clearing chat session:', error);
      throw error;
    }
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_chat_sessions')
        .delete()
        .eq('id', sessionId);
      
      if (error) {
        console.error('Error deleting chat session:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting chat session:', error);
      throw error;
    }
  }

  // Context-aware helper methods
  private analyzeQueryIntent(query: string): string[] {
    const intents: string[] = [];
    const queryLower = query.toLowerCase();

    // Time-based intents
    if (queryLower.includes('today') || queryLower.includes('now') || queryLower.includes('current')) {
      intents.push('current');
    }
    if (queryLower.includes('tomorrow') || queryLower.includes('next') || queryLower.includes('upcoming')) {
      intents.push('upcoming');
    }
    if (queryLower.includes('yesterday') || queryLower.includes('last') || queryLower.includes('recent')) {
      intents.push('recent');
    }
    if (queryLower.includes('this week') || queryLower.includes('weekly')) {
      intents.push('weekly');
    }

    // Action intents
    if (queryLower.includes('plan') || queryLower.includes('planning') || queryLower.includes('schedule')) {
      intents.push('planning');
    }
    if (queryLower.includes('review') || queryLower.includes('summary') || queryLower.includes('report')) {
      intents.push('review');
    }
    if (queryLower.includes('create') || queryLower.includes('add') || queryLower.includes('new')) {
      intents.push('create');
    }
    if (queryLower.includes('update') || queryLower.includes('change') || queryLower.includes('modify')) {
      intents.push('update');
    }

    // Priority intents
    if (queryLower.includes('urgent') || queryLower.includes('critical') || queryLower.includes('important')) {
      intents.push('urgent');
    }
    if (queryLower.includes('backlog') || queryLower.includes('todo') || queryLower.includes('pending')) {
      intents.push('backlog');
    }

    // Entity intents
    if (queryLower.includes('meeting') || queryLower.includes('standup') || queryLower.includes('discussion')) {
      intents.push('meetings');
    }
    if (queryLower.includes('note') || queryLower.includes('document') || queryLower.includes('knowledge')) {
      intents.push('notes');
    }
    if (queryLower.includes('task') || queryLower.includes('priority') || queryLower.includes('feature')) {
      intents.push('priorities');
    }
    if (queryLower.includes('stakeholder') || queryLower.includes('team') || queryLower.includes('person')) {
      intents.push('stakeholders');
    }

    return intents.length > 0 ? intents : ['general'];
  }

  private buildContextFilters(context?: ChatContext, intents?: string[]): any {
    const filters: any = {
      timeframe: 'recent',
      priority: 'all',
      status: 'all',
      entityTypes: []
    };

    if (context?.segment) {
      filters.segment = context.segment;
    }

    if (intents) {
      if (intents.includes('current') || intents.includes('today')) {
        filters.timeframe = 'today';
      } else if (intents.includes('upcoming')) {
        filters.timeframe = 'future';
      } else if (intents.includes('weekly')) {
        filters.timeframe = 'week';
      }

      if (intents.includes('urgent')) {
        filters.priority = 'high';
      }

      filters.entityTypes = intents.filter(intent => 
        ['meetings', 'notes', 'priorities', 'stakeholders'].includes(intent)
      );
    }

    return filters;
  }

  private filterByContext(items: any[], filters: any, intents: string[]): any[] {
    if (!items || items.length === 0) return [];

    let filtered = [...items];

    // Time-based filtering
    if (filters.timeframe === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(item => {
        const itemDate = item.date || item.created_at || item.createdAt;
        return itemDate && itemDate.startsWith(today);
      });
    } else if (filters.timeframe === 'week') {
      const weekAgo = this.getDateDaysAgo(7);
      filtered = filtered.filter(item => {
        const itemDate = item.date || item.created_at || item.createdAt;
        return itemDate && itemDate >= weekAgo;
      });
    }

    // Priority-based filtering
    if (filters.priority === 'high') {
      filtered = filtered.filter(item => 
        item.priority_level === 'high' || 
        item.priority_level === 'critical' ||
        item.urgency >= 7 ||
        item.importance >= 7
      );
    }

    // Status filtering for planning contexts
    if (intents.includes('planning')) {
      filtered = filtered.filter(item => 
        !item.status || 
        item.status === 'pending' || 
        item.status === 'in-progress' || 
        item.status === 'backlog'
      );
    }

    return filtered;
  }

  private filterStakeholdersByContext(stakeholders: any[], intents: string[], context?: ChatContext): any[] {
    if (!stakeholders || stakeholders.length === 0) return [];

    let filtered = [...stakeholders];

    // Filter by influence/interest for planning contexts
    if (intents.includes('planning') || intents.includes('urgent')) {
      filtered = filtered.filter(s => 
        s.influence >= 7 || s.interest >= 7 || s.influence_level === 'high'
      );
    }

    // Filter by communication frequency for current contexts
    if (intents.includes('current') || intents.includes('review')) {
      filtered = filtered.filter(s => 
        s.communication_frequency === 'daily' || 
        s.communication_frequency === 'weekly' ||
        this.isRecentContact(s.last_contact)
      );
    }

    return filtered;
  }

  private async getSegmentSpecificData(segment: string, intents: string[]): Promise<any[]> {
    const data: any[] = [];

    try {
      switch (segment) {
        case 'notes':
          if (intents.includes('recent')) {
            const recentNotes = await this.notesService.getAllNotes();
            data.push(...recentNotes.slice(0, 3));
          }
          break;

        case 'meetings':
          if (intents.includes('upcoming')) {
            const upcomingMeetings = await this.meetingService.getAllMeetings({ 
              status: 'scheduled',
              date_from: new Date().toISOString().split('T')[0]
            });
            data.push(...upcomingMeetings.slice(0, 3));
          }
          break;

        case 'priorities':
          const priorities = await this.priorityService.getAllPriorities();
          if (intents.includes('urgent')) {
            data.push(...priorities.filter(p => p.priority_level === 'critical').slice(0, 3));
          }
          break;

        case 'stakeholders':
          const stakeholders = await this.stakeholderService.getAllStakeholders();
          data.push(...stakeholders.filter(s => s.influence >= 8).slice(0, 2));
          break;
      }
    } catch (error) {
      console.error(`Error getting ${segment} specific data:`, error);
    }

    return data;
  }

  private rankDataByRelevance(data: any[], query: string, context?: ChatContext): any[] {
    if (!data || data.length === 0) return [];

    return data
      .map(item => ({
        ...item,
        _relevanceScore: this.calculateContextualRelevance(item, query, context)
      }))
      .sort((a, b) => b._relevanceScore - a._relevanceScore)
      .map(({ _relevanceScore, ...item }) => item);
  }

  private calculateContextualRelevance(item: any, query: string, context?: ChatContext): number {
    let score = 0;

    // Base relevance from text matching
    const text = (item.title || item.name || '') + ' ' + (item.description || item.content || item.notes || '');
    score += this.calculateRelevance(query, text);

    // Context boost
    if (context?.segment) {
      if (
        (context.segment === 'priorities' && item.priority_level) ||
        (context.segment === 'meetings' && item.meeting_type) ||
        (context.segment === 'notes' && item.content) ||
        (context.segment === 'stakeholders' && item.role)
      ) {
        score += 2;
      }
    }

    // Recency boost
    const itemDate = new Date(item.date || item.created_at || item.createdAt || 0);
    const daysSinceCreated = (Date.now() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 1) score += 3;
    else if (daysSinceCreated < 7) score += 2;
    else if (daysSinceCreated < 30) score += 1;

    // Priority boost
    if (item.priority_level === 'critical' || item.urgency >= 8) score += 2;
    if (item.priority_level === 'high' || item.urgency >= 6) score += 1;

    // Status relevance
    if (item.status === 'in-progress' || item.status === 'scheduled') score += 1;

    return score;
  }

  private getDateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  private isRecentContact(lastContactStr?: string): boolean {
    if (!lastContactStr) return false;
    const lastContact = new Date(lastContactStr);
    const daysSince = (Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < 14; // Within 2 weeks
  }
}

export const aiChatService = new AIChatService();