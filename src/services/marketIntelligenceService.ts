// src/services/marketIntelligenceService.ts
import { supabase } from '../lib/supabase';

export interface MarketTrend {
  id?: string;
  trend_name: string;
  trend_category: 'technology' | 'industry' | 'consumer' | 'economic';
  description?: string;
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  trend_direction: 'declining' | 'stable' | 'growing' | 'emerging';
  confidence_score: number; // 0-1
  data_sources?: string[];
  last_validated?: string;
  validation_notes?: string;
  relevance_to_product: number; // 0-1
  potential_impact_score: number; // 0-1
  opportunity_threat: 'threat' | 'neutral' | 'opportunity';
  identified_date?: string;
  projected_timeline?: string;
  ai_generated?: boolean;
  ai_confidence?: number;
  auto_updated?: boolean;
  tags?: string[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface CompetitiveIntelligence {
  id?: string;
  competitor_name: string;
  competitor_type: 'direct' | 'indirect' | 'substitute' | 'emerging';
  market_position: 'leader' | 'challenger' | 'follower' | 'niche' | 'unknown';
  company_size?: string;
  headquarters?: string;
  founded_year?: number;
  website_url?: string;
  estimated_revenue?: number;
  estimated_users?: number;
  market_share_percentage?: number;
  growth_rate_percentage?: number;
  key_products?: string[];
  pricing_strategy?: string;
  target_market?: string[];
  unique_value_proposition?: string;
  strengths?: string[];
  weaknesses?: string[];
  opportunities?: string[];
  threats?: string[];
  competitive_advantages?: string[];
  competitive_disadvantages?: string[];
  differentiation_factors?: string[];
  last_analysis_date?: string;
  intelligence_sources?: string[];
  monitoring_frequency: 'weekly' | 'monthly' | 'quarterly';
  ai_generated_insights?: string;
  threat_level_score: number; // 0-1
  tags?: string[];
  notes?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface MarketNews {
  id?: string;
  headline: string;
  summary?: string;
  full_content?: string;
  source_name: string;
  source_url?: string;
  author?: string;
  published_date?: string;
  news_category: string;
  industry_tags?: string[];
  mentioned_companies?: string[];
  mentioned_technologies?: string[];
  relevance_score: number; // 0-1
  impact_assessment: 'negative' | 'neutral' | 'positive';
  business_implications?: string;
  ai_summary?: string;
  ai_sentiment_score?: number; // -1 to 1
  key_topics_extracted?: string[];
  is_read?: boolean;
  is_bookmarked?: boolean;
  user_rating?: number; // 1-5
  user_notes?: string;
  is_verified?: boolean;
  verification_date?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface MarketResearchReport {
  id?: string;
  report_title: string;
  research_firm?: string;
  publication_date?: string;
  report_type?: string;
  executive_summary?: string;
  key_findings?: string[];
  methodology_notes?: string;
  sample_size?: number;
  geographic_scope?: string;
  market_size_value?: number;
  market_size_currency?: string;
  projected_growth_rate?: number;
  forecast_period?: string;
  report_url?: string;
  access_type: 'public' | 'premium' | 'internal' | 'purchased';
  cost_usd?: number;
  business_relevance_score: number; // 0-1
  action_items?: string[];
  strategic_implications?: string;
  document_url?: string;
  file_size_mb?: number;
  tags?: string[];
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface MarketAlert {
  id?: string;
  alert_name: string;
  alert_type: 'keyword' | 'competitor' | 'trend' | 'news-category' | 'market-metric';
  keywords?: string[];
  monitored_sources?: string[];
  trigger_conditions?: any;
  alert_frequency: 'real-time' | 'hourly' | 'daily' | 'weekly';
  is_active?: boolean;
  last_triggered?: string;
  trigger_count?: number;
  notification_email?: boolean;
  notification_in_app?: boolean;
  priority_level: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface MarketIntelligenceAnalytics {
  totalTrendsTracked: number;
  growingTrends: number;
  opportunitiesIdentified: number;
  competitorsTracked: number;
  highThreatCompetitors: number;
  newsArticlesTracked: number;
  bookmarkedArticles: number;
  researchReports: number;
  activeAlerts: number;
  trendsByCategory: { [key: string]: number };
  competitorsByType: { [key: string]: number };
  newsByCategory: { [key: string]: number };
  threatLevelDistribution: { low: number; medium: number; high: number };
}

export class MarketIntelligenceService {
  // ==================== MARKET TRENDS ====================

  static async getAllMarketTrends(): Promise<MarketTrend[]> {
    const { data, error } = await supabase
      .from('market_trends')
      .select('*')
      .order('relevance_to_product', { ascending: false });

    if (error) {
      console.error('Error fetching market trends:', error);
      throw new Error('Failed to fetch market trends');
    }

    return data || [];
  }

  static async createMarketTrend(trend: Omit<MarketTrend, 'id' | 'created_at' | 'updated_at'>): Promise<MarketTrend> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    if (!trend.trend_name) {
      throw new Error('Trend name is required');
    }

    const { data, error } = await supabase
      .from('market_trends')
      .insert([{ 
        ...trend, 
        user_id: user.user.id,
        tags: trend.tags || [],
        data_sources: trend.data_sources || [],
        confidence_score: trend.confidence_score || 0.5,
        relevance_to_product: trend.relevance_to_product || 0.5,
        potential_impact_score: trend.potential_impact_score || 0.5,
        identified_date: trend.identified_date || new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating market trend:', error);
      throw new Error('Failed to create market trend');
    }

    return data;
  }

  static async updateMarketTrend(id: string, updates: Partial<MarketTrend>): Promise<MarketTrend> {
    const { data, error } = await supabase
      .from('market_trends')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating market trend:', error);
      throw new Error('Failed to update market trend');
    }

    return data;
  }

  static async deleteMarketTrend(id: string): Promise<void> {
    const { error } = await supabase
      .from('market_trends')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting market trend:', error);
      throw new Error('Failed to delete market trend');
    }
  }

  static async getTrendsByCategory(category: string): Promise<MarketTrend[]> {
    const { data, error } = await supabase
      .from('market_trends')
      .select('*')
      .eq('trend_category', category)
      .order('relevance_to_product', { ascending: false });

    if (error) {
      console.error('Error fetching trends by category:', error);
      throw new Error('Failed to fetch trends by category');
    }

    return data || [];
  }

  static async searchTrends(query: string): Promise<MarketTrend[]> {
    const { data, error } = await supabase
      .from('market_trends')
      .select('*')
      .or(`trend_name.ilike.%${query}%,description.ilike.%${query}%,notes.ilike.%${query}%`)
      .order('relevance_to_product', { ascending: false });

    if (error) {
      console.error('Error searching market trends:', error);
      throw new Error('Failed to search market trends');
    }

    return data || [];
  }

  // ==================== COMPETITIVE INTELLIGENCE ====================

  static async getAllCompetitors(): Promise<CompetitiveIntelligence[]> {
    const { data, error } = await supabase
      .from('competitive_intelligence')
      .select('*')
      .eq('is_active', true)
      .order('threat_level_score', { ascending: false });

    if (error) {
      console.error('Error fetching competitors:', error);
      throw new Error('Failed to fetch competitors');
    }

    return data || [];
  }

  static async createCompetitor(competitor: Omit<CompetitiveIntelligence, 'id' | 'created_at' | 'updated_at'>): Promise<CompetitiveIntelligence> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    if (!competitor.competitor_name) {
      throw new Error('Competitor name is required');
    }

    const { data, error } = await supabase
      .from('competitive_intelligence')
      .insert([{ 
        ...competitor, 
        user_id: user.user.id,
        tags: competitor.tags || [],
        key_products: competitor.key_products || [],
        target_market: competitor.target_market || [],
        strengths: competitor.strengths || [],
        weaknesses: competitor.weaknesses || [],
        opportunities: competitor.opportunities || [],
        threats: competitor.threats || [],
        competitive_advantages: competitor.competitive_advantages || [],
        competitive_disadvantages: competitor.competitive_disadvantages || [],
        differentiation_factors: competitor.differentiation_factors || [],
        intelligence_sources: competitor.intelligence_sources || [],
        is_active: competitor.is_active !== false,
        threat_level_score: competitor.threat_level_score || 0.5
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating competitor:', error);
      throw new Error('Failed to create competitor');
    }

    return data;
  }

  static async updateCompetitor(id: string, updates: Partial<CompetitiveIntelligence>): Promise<CompetitiveIntelligence> {
    const { data, error } = await supabase
      .from('competitive_intelligence')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating competitor:', error);
      throw new Error('Failed to update competitor');
    }

    return data;
  }

  static async deleteCompetitor(id: string): Promise<void> {
    const { error } = await supabase
      .from('competitive_intelligence')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting competitor:', error);
      throw new Error('Failed to delete competitor');
    }
  }

  static async getCompetitorsByType(type: string): Promise<CompetitiveIntelligence[]> {
    const { data, error } = await supabase
      .from('competitive_intelligence')
      .select('*')
      .eq('competitor_type', type)
      .eq('is_active', true)
      .order('threat_level_score', { ascending: false });

    if (error) {
      console.error('Error fetching competitors by type:', error);
      throw new Error('Failed to fetch competitors by type');
    }

    return data || [];
  }

  // ==================== MARKET NEWS ====================

  static async getAllMarketNews(): Promise<MarketNews[]> {
    const { data, error } = await supabase
      .from('market_news')
      .select('*')
      .order('published_date', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching market news:', error);
      throw new Error('Failed to fetch market news');
    }

    return data || [];
  }

  static async createMarketNews(news: Omit<MarketNews, 'id' | 'created_at' | 'updated_at'>): Promise<MarketNews> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    if (!news.headline || !news.source_name) {
      throw new Error('Headline and source name are required');
    }

    const { data, error } = await supabase
      .from('market_news')
      .insert([{ 
        ...news, 
        user_id: user.user.id,
        industry_tags: news.industry_tags || [],
        mentioned_companies: news.mentioned_companies || [],
        mentioned_technologies: news.mentioned_technologies || [],
        key_topics_extracted: news.key_topics_extracted || [],
        relevance_score: news.relevance_score || 0.5,
        ai_sentiment_score: news.ai_sentiment_score || 0.0,
        is_read: news.is_read || false,
        is_bookmarked: news.is_bookmarked || false,
        is_verified: news.is_verified || false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating market news:', error);
      throw new Error('Failed to create market news');
    }

    return data;
  }

  static async updateMarketNews(id: string, updates: Partial<MarketNews>): Promise<MarketNews> {
    const { data, error } = await supabase
      .from('market_news')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating market news:', error);
      throw new Error('Failed to update market news');
    }

    return data;
  }

  static async deleteMarketNews(id: string): Promise<void> {
    const { error } = await supabase
      .from('market_news')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting market news:', error);
      throw new Error('Failed to delete market news');
    }
  }

  static async getBookmarkedNews(): Promise<MarketNews[]> {
    const { data, error } = await supabase
      .from('market_news')
      .select('*')
      .eq('is_bookmarked', true)
      .order('published_date', { ascending: false });

    if (error) {
      console.error('Error fetching bookmarked news:', error);
      throw new Error('Failed to fetch bookmarked news');
    }

    return data || [];
  }

  static async markNewsAsRead(id: string): Promise<void> {
    await this.updateMarketNews(id, { is_read: true });
  }

  static async toggleBookmark(id: string, bookmarked: boolean): Promise<MarketNews> {
    return this.updateMarketNews(id, { is_bookmarked: bookmarked });
  }

  static async searchNews(query: string): Promise<MarketNews[]> {
    const { data, error } = await supabase
      .from('market_news')
      .select('*')
      .or(`headline.ilike.%${query}%,summary.ilike.%${query}%,full_content.ilike.%${query}%`)
      .order('published_date', { ascending: false });

    if (error) {
      console.error('Error searching market news:', error);
      throw new Error('Failed to search market news');
    }

    return data || [];
  }

  // ==================== MARKET RESEARCH REPORTS ====================

  static async getAllMarketResearchReports(): Promise<MarketResearchReport[]> {
    const { data, error } = await supabase
      .from('market_research_reports')
      .select('*')
      .order('publication_date', { ascending: false });

    if (error) {
      console.error('Error fetching market research reports:', error);
      throw new Error('Failed to fetch market research reports');
    }

    return data || [];
  }

  static async createMarketResearchReport(report: Omit<MarketResearchReport, 'id' | 'created_at' | 'updated_at'>): Promise<MarketResearchReport> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    if (!report.report_title) {
      throw new Error('Report title is required');
    }

    const { data, error } = await supabase
      .from('market_research_reports')
      .insert([{ 
        ...report, 
        user_id: user.user.id,
        key_findings: report.key_findings || [],
        action_items: report.action_items || [],
        tags: report.tags || [],
        business_relevance_score: report.business_relevance_score || 0.5,
        is_featured: report.is_featured || false,
        market_size_currency: report.market_size_currency || 'USD'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating market research report:', error);
      throw new Error('Failed to create market research report');
    }

    return data;
  }

  static async updateMarketResearchReport(id: string, updates: Partial<MarketResearchReport>): Promise<MarketResearchReport> {
    const { data, error } = await supabase
      .from('market_research_reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating market research report:', error);
      throw new Error('Failed to update market research report');
    }

    return data;
  }

  static async deleteMarketResearchReport(id: string): Promise<void> {
    const { error } = await supabase
      .from('market_research_reports')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting market research report:', error);
      throw new Error('Failed to delete market research report');
    }
  }

  static async getFeaturedReports(): Promise<MarketResearchReport[]> {
    const { data, error } = await supabase
      .from('market_research_reports')
      .select('*')
      .eq('is_featured', true)
      .order('business_relevance_score', { ascending: false });

    if (error) {
      console.error('Error fetching featured reports:', error);
      throw new Error('Failed to fetch featured reports');
    }

    return data || [];
  }

  // ==================== MARKET ALERTS ====================

  static async getAllMarketAlerts(): Promise<MarketAlert[]> {
    const { data, error } = await supabase
      .from('market_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching market alerts:', error);
      throw new Error('Failed to fetch market alerts');
    }

    return data || [];
  }

  static async createMarketAlert(alert: Omit<MarketAlert, 'id' | 'created_at' | 'updated_at'>): Promise<MarketAlert> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    if (!alert.alert_name) {
      throw new Error('Alert name is required');
    }

    const { data, error } = await supabase
      .from('market_alerts')
      .insert([{ 
        ...alert, 
        user_id: user.user.id,
        keywords: alert.keywords || [],
        monitored_sources: alert.monitored_sources || [],
        is_active: alert.is_active !== false,
        trigger_count: 0,
        notification_email: alert.notification_email !== false,
        notification_in_app: alert.notification_in_app !== false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating market alert:', error);
      throw new Error('Failed to create market alert');
    }

    return data;
  }

  static async updateMarketAlert(id: string, updates: Partial<MarketAlert>): Promise<MarketAlert> {
    const { data, error } = await supabase
      .from('market_alerts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating market alert:', error);
      throw new Error('Failed to update market alert');
    }

    return data;
  }

  static async deleteMarketAlert(id: string): Promise<void> {
    const { error } = await supabase
      .from('market_alerts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting market alert:', error);
      throw new Error('Failed to delete market alert');
    }
  }

  static async getActiveAlerts(): Promise<MarketAlert[]> {
    const { data, error } = await supabase
      .from('market_alerts')
      .select('*')
      .eq('is_active', true)
      .order('priority_level', { ascending: false });

    if (error) {
      console.error('Error fetching active alerts:', error);
      throw new Error('Failed to fetch active alerts');
    }

    return data || [];
  }

  // ==================== AI-POWERED ANALYSIS ====================

  static async generateMarketInsights(): Promise<{
    trendAnalysis: string;
    competitiveThreats: string;
    marketOpportunities: string;
    recommendations: string[];
  }> {
    const [trends, competitors, news] = await Promise.all([
      this.getAllMarketTrends(),
      this.getAllCompetitors(),
      this.getAllMarketNews()
    ]);

    let trendAnalysis = '';
    let competitiveThreats = '';
    let marketOpportunities = '';
    const recommendations: string[] = [];

    // Trend Analysis
    const growingTrends = trends.filter(t => t.trend_direction === 'growing').length;
    const emergingTrends = trends.filter(t => t.trend_direction === 'emerging').length;
    const opportunities = trends.filter(t => t.opportunity_threat === 'opportunity').length;
    
    if (growingTrends > 0) {
      trendAnalysis = `${growingTrends} growing trend${growingTrends !== 1 ? 's' : ''} identified, with ${emergingTrends} emerging trend${emergingTrends !== 1 ? 's' : ''}. ${opportunities} of these present clear opportunities for product development.`;
    } else {
      trendAnalysis = 'Limited trend data available. Consider expanding market research efforts.';
    }

    // Competitive Analysis
    const highThreatCompetitors = competitors.filter(c => c.threat_level_score > 0.7).length;
    const directCompetitors = competitors.filter(c => c.competitor_type === 'direct').length;
    
    if (highThreatCompetitors > 0) {
      competitiveThreats = `${highThreatCompetitors} competitor${highThreatCompetitors !== 1 ? 's' : ''} pose${highThreatCompetitors === 1 ? 's' : ''} high threat levels. ${directCompetitors} direct competitor${directCompetitors !== 1 ? 's' : ''} in the market requiring close monitoring.`;
    } else if (competitors.length > 0) {
      competitiveThreats = `${competitors.length} competitor${competitors.length !== 1 ? 's' : ''} tracked with manageable threat levels.`;
    } else {
      competitiveThreats = 'No competitor intelligence data available.';
    }

    // Market Opportunities
    const highRelevanceNews = news.filter(n => n.relevance_score > 0.7).length;
    const positiveNews = news.filter(n => n.impact_assessment === 'positive').length;
    
    marketOpportunities = `Recent market analysis shows ${highRelevanceNews} highly relevant news item${highRelevanceNews !== 1 ? 's' : ''}, with ${positiveNews} indicating positive market conditions.`;

    // Recommendations
    if (growingTrends > 0) {
      recommendations.push('Prioritize product features aligned with growing market trends');
    }
    if (highThreatCompetitors > 0) {
      recommendations.push('Develop differentiation strategies for high-threat competitors');
    }
    if (opportunities > 0) {
      recommendations.push('Investigate market opportunities for potential product expansion');
    }
    if (news.length > 0) {
      recommendations.push('Stay updated on market news to identify emerging opportunities');
    }
    if (recommendations.length === 0) {
      recommendations.push('Expand market intelligence gathering to improve strategic insights');
    }

    return {
      trendAnalysis,
      competitiveThreats,
      marketOpportunities,
      recommendations
    };
  }

  static async suggestCompetitorAnalysis(competitorName: string): Promise<CompetitiveIntelligence> {
    // This would typically integrate with external APIs for competitive intelligence
    // For now, provide a template structure
    return {
      competitor_name: competitorName,
      competitor_type: 'direct',
      market_position: 'unknown',
      monitoring_frequency: 'monthly',
      threat_level_score: 0.5,
      key_products: [],
      strengths: ['Research their key strengths'],
      weaknesses: ['Identify potential weaknesses'],
      opportunities: ['Market opportunities they might pursue'],
      threats: ['Potential threats they pose'],
      intelligence_sources: ['company-website', 'press-releases', 'social-media']
    };
  }

  // ==================== ANALYTICS ====================

  static async getMarketIntelligenceAnalytics(): Promise<MarketIntelligenceAnalytics> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const [trends, competitors, news, reports, alerts] = await Promise.all([
      this.getAllMarketTrends(),
      this.getAllCompetitors(),
      this.getAllMarketNews(),
      this.getAllMarketResearchReports(),
      this.getAllMarketAlerts()
    ]);

    const totalTrendsTracked = trends.length;
    const growingTrends = trends.filter(t => t.trend_direction === 'growing').length;
    const opportunitiesIdentified = trends.filter(t => t.opportunity_threat === 'opportunity').length;
    
    const competitorsTracked = competitors.length;
    const highThreatCompetitors = competitors.filter(c => c.threat_level_score > 0.7).length;
    
    const newsArticlesTracked = news.length;
    const bookmarkedArticles = news.filter(n => n.is_bookmarked).length;
    const researchReports = reports.length;
    const activeAlerts = alerts.filter(a => a.is_active).length;

    // Trends by category
    const trendsByCategory: { [key: string]: number } = {};
    trends.forEach(trend => {
      trendsByCategory[trend.trend_category] = (trendsByCategory[trend.trend_category] || 0) + 1;
    });

    // Competitors by type
    const competitorsByType: { [key: string]: number } = {};
    competitors.forEach(competitor => {
      competitorsByType[competitor.competitor_type] = (competitorsByType[competitor.competitor_type] || 0) + 1;
    });

    // News by category
    const newsByCategory: { [key: string]: number } = {};
    news.forEach(item => {
      newsByCategory[item.news_category] = (newsByCategory[item.news_category] || 0) + 1;
    });

    // Threat level distribution
    const threatLevelDistribution = {
      low: competitors.filter(c => c.threat_level_score <= 0.33).length,
      medium: competitors.filter(c => c.threat_level_score > 0.33 && c.threat_level_score <= 0.66).length,
      high: competitors.filter(c => c.threat_level_score > 0.66).length
    };

    return {
      totalTrendsTracked,
      growingTrends,
      opportunitiesIdentified,
      competitorsTracked,
      highThreatCompetitors,
      newsArticlesTracked,
      bookmarkedArticles,
      researchReports,
      activeAlerts,
      trendsByCategory,
      competitorsByType,
      newsByCategory,
      threatLevelDistribution
    };
  }

  // ==================== BULK OPERATIONS ====================

  static async bulkImportNews(newsItems: Omit<MarketNews, 'id' | 'created_at' | 'updated_at' | 'user_id'>[]): Promise<MarketNews[]> {
    const results: MarketNews[] = [];
    
    for (const newsItem of newsItems) {
      try {
        const result = await this.createMarketNews(newsItem);
        results.push(result);
      } catch (error) {
        console.error(`Error importing news item ${newsItem.headline}:`, error);
      }
    }
    
    return results;
  }

  static async bulkUpdateTrendRelevance(updates: { id: string; relevance_to_product: number }[]): Promise<MarketTrend[]> {
    const results: MarketTrend[] = [];
    
    for (const { id, relevance_to_product } of updates) {
      try {
        const result = await this.updateMarketTrend(id, { relevance_to_product });
        results.push(result);
      } catch (error) {
        console.error(`Error updating trend ${id}:`, error);
      }
    }
    
    return results;
  }

  // ==================== EXPORT/IMPORT ====================

  static async exportMarketIntelligence(): Promise<{
    trends: MarketTrend[];
    competitors: CompetitiveIntelligence[];
    news: MarketNews[];
    reports: MarketResearchReport[];
    alerts: MarketAlert[];
  }> {
    const [trends, competitors, news, reports, alerts] = await Promise.all([
      this.getAllMarketTrends(),
      this.getAllCompetitors(),
      this.getAllMarketNews(),
      this.getAllMarketResearchReports(),
      this.getAllMarketAlerts()
    ]);

    return { trends, competitors, news, reports, alerts };
  }
}