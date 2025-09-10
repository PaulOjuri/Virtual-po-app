// src/services/webScrapingService.ts
import axios from 'axios';

// Free web scraping and data extraction service
export interface ScrapingResult {
  title?: string;
  content: string;
  url: string;
  summary?: string;
  metadata?: {
    author?: string;
    publishedDate?: string;
    keywords?: string[];
  };
}

export interface MarketDataResult {
  trends: MarketTrend[];
  news: NewsItem[];
  competitors: CompetitorData[];
}

export interface MarketTrend {
  name: string;
  category: string;
  description: string;
  direction: 'up' | 'down' | 'stable';
  relevance: number;
  source: string;
}

export interface NewsItem {
  headline: string;
  summary: string;
  source: string;
  url: string;
  publishedDate: string;
  category: string;
}

export interface CompetitorData {
  name: string;
  website: string;
  description: string;
  products: string[];
  marketPosition: string;
}

export class WebScrapingService {
  private static readonly CORS_PROXY = 'https://api.allorigins.win/get?url=';
  private static readonly FALLBACK_PROXY = 'https://cors-anywhere.herokuapp.com/';
  
  // ==================== WEB SCRAPING CORE ====================

  static async scrapeUrl(url: string, options: {
    extractText?: boolean;
    extractImages?: boolean;
    extractLinks?: boolean;
    maxLength?: number;
  } = {}): Promise<ScrapingResult> {
    try {
      const { extractText = true, maxLength = 5000 } = options;
      
      // Try multiple proxy services for CORS handling
      const proxies = [
        `${this.CORS_PROXY}${encodeURIComponent(url)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
      ];
      
      let response = null;
      let lastError = null;
      
      for (const proxyUrl of proxies) {
        try {
          response = await axios.get(proxyUrl, {
            timeout: 15000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          if (response.data) break;
        } catch (error) {
          console.warn(`Proxy ${proxyUrl} failed:`, error);
          lastError = error;
          continue;
        }
      }
      
      if (!response?.data) {
        throw new Error(`All proxies failed. Last error: ${lastError}`);
      }
      
      // Handle different response formats
      let html = '';
      if (typeof response.data === 'string') {
        html = response.data;
      } else if (response.data.contents) {
        html = response.data.contents;
      } else {
        html = JSON.stringify(response.data);
      }
      
      const result = await this.parseHtmlContent(html, url, { extractText, maxLength });
      return result;
      
    } catch (error) {
      console.error('Error scraping URL:', error);
      return {
        url,
        content: `Failed to scrape content from ${url}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        title: 'Scraping Failed'
      };
    }
  }

  private static async parseHtmlContent(html: string, url: string, options: {
    extractText: boolean;
    maxLength: number;
  }): Promise<ScrapingResult> {
    try {
      // Simple HTML parsing without external dependencies
      const title = this.extractTitle(html);
      let content = '';
      
      if (options.extractText) {
        content = this.extractTextContent(html);
        if (content.length > options.maxLength) {
          content = content.substring(0, options.maxLength) + '...';
        }
      }
      
      const metadata = {
        author: this.extractMetaTag(html, 'author'),
        publishedDate: this.extractMetaTag(html, 'publish_date') || this.extractMetaTag(html, 'date'),
        keywords: this.extractKeywords(content)
      };
      
      return {
        url,
        title: title || 'Untitled',
        content: content || 'No content extracted',
        summary: content.substring(0, 300) + (content.length > 300 ? '...' : ''),
        metadata
      };
      
    } catch (error) {
      console.error('Error parsing HTML:', error);
      return {
        url,
        title: 'Parse Error',
        content: 'Failed to parse HTML content'
      };
    }
  }

  private static extractTitle(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : '';
  }

  private static extractTextContent(html: string): string {
    // Remove script and style elements
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Remove HTML tags
    html = html.replace(/<[^>]+>/g, ' ');
    
    // Clean up whitespace
    html = html.replace(/\s+/g, ' ').trim();
    
    // Decode HTML entities
    html = html.replace(/&quot;/g, '"')
               .replace(/&apos;/g, "'")
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&amp;/g, '&');
    
    return html;
  }

  private static extractMetaTag(html: string, name: string): string | undefined {
    const metaRegex = new RegExp(`<meta[^>]*name="${name}"[^>]*content="([^"]*)"`, 'i');
    const match = html.match(metaRegex);
    return match ? match[1] : undefined;
  }

  private static extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
                     .replace(/[^\w\s]/g, ' ')
                     .split(/\s+/)
                     .filter(word => word.length > 3);
    
    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    return Object.entries(wordFreq)
                 .sort(([,a], [,b]) => b - a)
                 .slice(0, 10)
                 .map(([word]) => word);
  }

  // ==================== MARKET INTELLIGENCE SCRAPING ====================

  static async scrapeMarketTrends(query: string, instructions?: string): Promise<MarketTrend[]> {
    try {
      const trends: MarketTrend[] = [];
      
      // Search for market trends using free APIs
      const searchUrls = [
        `https://www.google.com/search?q=${encodeURIComponent(query + ' market trends 2024')}`,
        `https://trends.google.com/trends/explore?q=${encodeURIComponent(query)}`,
        `https://www.reddit.com/search/?q=${encodeURIComponent(query + ' trends')}`
      ];
      
      // For demonstration, we'll create mock data based on the query
      const mockTrends = this.generateMockMarketTrends(query, instructions);
      trends.push(...mockTrends);
      
      // In a real implementation, you would scrape the search results
      // For now, we'll use the Serper API or similar free services
      
      return trends;
    } catch (error) {
      console.error('Error scraping market trends:', error);
      return [];
    }
  }

  static async scrapeCompetitorData(competitorName: string): Promise<CompetitorData | null> {
    try {
      const searchQuery = `${competitorName} company information`;
      
      // This would typically scrape company websites, LinkedIn, Crunchbase, etc.
      // For now, return mock data structure
      return {
        name: competitorName,
        website: `https://${competitorName.toLowerCase().replace(/\s+/g, '')}.com`,
        description: `${competitorName} is a company in the market...`,
        products: ['Product A', 'Product B'],
        marketPosition: 'Competitor'
      };
    } catch (error) {
      console.error('Error scraping competitor data:', error);
      return null;
    }
  }

  static async scrapeNewsArticles(topic: string, limit: number = 10): Promise<NewsItem[]> {
    try {
      const news: NewsItem[] = [];
      
      // Free news sources (RSS feeds, public APIs)
      const newsSources = [
        `https://rss.cnn.com/rss/edition.rss`,
        `https://feeds.npr.org/1001/rss.xml`,
        `https://techcrunch.com/feed/`
      ];
      
      // For demonstration, generate mock news data
      const mockNews = this.generateMockNews(topic, limit);
      news.push(...mockNews);
      
      return news;
    } catch (error) {
      console.error('Error scraping news:', error);
      return [];
    }
  }

  // ==================== KNOWLEDGE BASE WEB SEARCH ====================

  static async searchWeb(query: string, options: {
    maxResults?: number;
    includeImages?: boolean;
    includeVideos?: boolean;
    dateRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  } = {}): Promise<ScrapingResult[]> {
    try {
      const { maxResults = 10, dateRange = 'all' } = options;
      const results: ScrapingResult[] = [];
      
      // Use DuckDuckGo Instant Answer API (free)
      const duckDuckGoUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      
      try {
        const response = await axios.get(duckDuckGoUrl, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Virtual-PO-Bot/1.0'
          }
        });
        
        if (response.data && response.data.RelatedTopics) {
          response.data.RelatedTopics.slice(0, maxResults).forEach((item: any, index: number) => {
            if (item.FirstURL && item.Text) {
              results.push({
                url: item.FirstURL,
                title: `Search Result ${index + 1}`,
                content: item.Text,
                summary: item.Text.substring(0, 200) + '...'
              });
            }
          });
        }
      } catch (error) {
        console.warn('DuckDuckGo API failed:', error);
      }
      
      // If no results, add a helpful message
      if (results.length === 0) {
        results.push({
          url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
          title: 'Web Search Results',
          content: `Search results for "${query}". Due to API limitations, detailed results are not available. Try searching manually for more specific information.`,
          summary: `Web search for: ${query}`
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error in web search:', error);
      return [{
        url: '',
        title: 'Search Error',
        content: `Failed to perform web search for "${query}". Please try again later.`
      }];
    }
  }

  // ==================== HELPER METHODS ====================

  private static generateMockMarketTrends(query: string, instructions?: string): MarketTrend[] {
    const categories = ['Technology', 'Consumer Behavior', 'Economic', 'Industry'];
    const directions: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];
    
    return Array.from({ length: 5 }, (_, i) => ({
      name: `${query} Trend ${i + 1}`,
      category: categories[i % categories.length],
      description: `Market trend related to ${query}${instructions ? ` based on: ${instructions}` : ''}`,
      direction: directions[i % directions.length],
      relevance: Math.random() * 0.5 + 0.5, // 0.5 - 1.0
      source: 'Market Research Analysis'
    }));
  }

  private static generateMockNews(topic: string, limit: number): NewsItem[] {
    return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      headline: `${topic} News Update ${i + 1}`,
      summary: `Latest developments in ${topic} market and industry trends...`,
      source: `News Source ${i + 1}`,
      url: `https://example-news${i + 1}.com/article`,
      publishedDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Business'
    }));
  }

  // ==================== CONTENT ANALYSIS ====================

  static async analyzeContent(content: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    keywords: string[];
    summary: string;
    entities: string[];
  }> {
    try {
      const keywords = this.extractKeywords(content);
      const sentiment = this.analyzeSentiment(content);
      const summary = content.length > 300 ? content.substring(0, 300) + '...' : content;
      const entities = this.extractEntities(content);
      
      return { sentiment, keywords, summary, entities };
    } catch (error) {
      console.error('Error analyzing content:', error);
      return {
        sentiment: 'neutral',
        keywords: [],
        summary: 'Analysis failed',
        entities: []
      };
    }
  }

  private static analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'positive', 'success', 'growth', 'increase'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'negative', 'failure', 'decline', 'decrease', 'problem', 'issue'];
    
    const words = text.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private static extractEntities(text: string): string[] {
    // Simple entity extraction (companies, products, etc.)
    const entities: string[] = [];
    
    // Look for capitalized words that might be entities
    const capitalizedWords = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    
    // Filter out common words
    const commonWords = ['The', 'This', 'That', 'With', 'For', 'And', 'But', 'Or'];
    const filteredEntities = capitalizedWords.filter(word => 
      !commonWords.includes(word) && word.length > 2
    );
    
    return [...new Set(filteredEntities)].slice(0, 10);
  }

  // ==================== RATE LIMITING ====================

  private static requestCounts: Map<string, { count: number; resetTime: number }> = new Map();

  private static checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.requestCounts.get(key);
    
    if (!record || now > record.resetTime) {
      this.requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxRequests) {
      return false;
    }
    
    record.count++;
    return true;
  }

  static async rateLimitedRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    maxRequests: number = 100,
    windowMs: number = 60000
  ): Promise<T> {
    if (!this.checkRateLimit(key, maxRequests, windowMs)) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }
    
    return await requestFn();
  }
}