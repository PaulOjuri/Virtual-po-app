import React, { useMemo, useState } from 'react';
import {
  Mail,
  Send,
  FileText,
  TrendingUp,
  Clock,
  User,
  Brain,
  Zap,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  ArrowRight,
  Upload,
  Download,
  Search as SearchIcon,
  Filter
} from 'lucide-react';

type Sentiment = 'positive' | 'neutral' | 'negative';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface Email {
  id: number;
  subject: string;
  sender: string;
  content: string;
  timestamp: string; // ISO string
  sentiment: Sentiment;
  priority: Priority;
  confidence: number; // 0..1
  topics: string[];
  actionItems: string[];
  hasResponse: boolean;
  responseTime?: number; // minutes to first response (optional)
}

interface EmailTemplate {
  id: number;
  title: string;
  category: 'sprint' | 'stakeholder' | 'escalation' | 'update';
  subject: string;
  content: string; // can contain {{placeholders}}
  variables: string[];
  usageCount: number;
  effectiveness: number; // 0..1
}

const formatMinutes = (mins?: number) => {
  if (mins == null) return '—';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

const sentimentBadge = (s: Sentiment) =>
  s === 'positive'
    ? 'text-green-700 bg-green-100'
    : s === 'neutral'
    ? 'text-slate-700 bg-slate-100'
    : 'text-red-700 bg-red-100';

const priorityBadge = (p: Priority) =>
  p === 'urgent'
    ? 'text-white bg-red-600'
    : p === 'high'
    ? 'text-orange-800 bg-orange-100'
    : p === 'medium'
    ? 'text-blue-800 bg-blue-100'
    : 'text-slate-700 bg-slate-100';

const EmailIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'analysis' | 'templates' | 'analytics'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [query, setQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [sentimentFilter, setSentimentFilter] = useState<Sentiment | 'all'>('all');

  // Sample inbox data
  const [emails] = useState<Email[]>([
    {
      id: 1,
      subject: 'Sprint Review Feedback',
      sender: 'sarah.johnson@colruyt.be',
      content:
        'Great work on the payment feature demo. Stakeholders were impressed. Please address mobile responsiveness before the next release. Can we schedule a follow-up?',
      timestamp: '2025-08-17T14:30:00Z',
      sentiment: 'positive',
      priority: 'medium',
      confidence: 0.85,
      topics: ['sprint review', 'mobile responsiveness', 'timeline'],
      actionItems: ['Schedule follow-up meeting', 'Improve mobile responsiveness'],
      hasResponse: false
    },
    {
      id: 2,
      subject: 'Critical Bug Report - Payment Gateway',
      sender: 'support@colruyt.be',
      content:
        'Multiple reports of payment failures (~15% of transactions). Seems related to new gateway integration. Please prioritize immediately.',
      timestamp: '2025-08-17T11:15:00Z',
      sentiment: 'negative',
      priority: 'urgent',
      confidence: 0.95,
      topics: ['bug report', 'payment gateway', 'urgent'],
      actionItems: ['Investigate failures', 'Prioritize fix', 'Update stakeholders'],
      hasResponse: true,
      responseTime: 45
    },
    {
      id: 3,
      subject: 'Design Review Complete - Onboarding',
      sender: 'mark.peters@colruyt.be',
      content:
        'Figma mockups for onboarding are ready. Need PO sign-off and alignment on copy. Suggested A/B variant included.',
      timestamp: '2025-08-16T09:05:00Z',
      sentiment: 'neutral',
      priority: 'high',
      confidence: 0.78,
      topics: ['design', 'onboarding', 'a/b test'],
      actionItems: ['Review mockups', 'Approve copy', 'Plan A/B test'],
      hasResponse: true,
      responseTime: 180
    }
  ]);

  // Templates
  const [templates] = useState<EmailTemplate[]>([
    {
      id: 1,
      title: 'Sprint Review Summary',
      category: 'sprint',
      subject: 'Sprint {{sprintNumber}} Review Summary',
      content:
        'Hi {{recipientName}},\n\nHere is a summary of our Sprint {{sprintNumber}} review:\n\n**Completed**\n{{completedItems}}\n\n**Challenges**\n{{challenges}}\n\n**Next Sprint Focus**\n{{nextSprintFocus}}\n\nBest regards,\n{{senderName}}',
      variables: ['sprintNumber', 'recipientName', 'completedItems', 'challenges', 'nextSprintFocus', 'senderName'],
      usageCount: 24,
      effectiveness: 0.92
    },
    {
      id: 2,
      title: 'Stakeholder Update',
      category: 'stakeholder',
      subject: 'Product Update - {{productName}}',
      content:
        'Dear {{stakeholderName}},\n\nA quick update on {{productName}}:\n\n**Key Achievements**\n{{achievements}}\n\n**Current Focus**\n{{currentFocus}}\n\n**Upcoming Milestones**\n{{milestones}}\n\nKind regards,\n{{senderName}}',
      variables: ['stakeholderName', 'productName', 'achievements', 'currentFocus', 'milestones', 'senderName'],
      usageCount: 18,
      effectiveness: 0.88
    },
    {
      id: 3,
      title: 'Priority Escalation',
      category: 'escalation',
      subject: 'Priority Escalation Required - {{issueTitle}}',
      content:
        'Hi {{recipient}},\n\nI need to escalate the following issue:\n\n**Issue** {{issueTitle}}\n**Impact** {{impact}}\n**Proposed Solution** {{solution}}\n**Timeline** {{timeline}}\n\nPlease advise on next steps.\n\nThanks,\n{{senderName}}',
      variables: ['recipient', 'issueTitle', 'impact', 'solution', 'timeline', 'senderName'],
      usageCount: 15,
      effectiveness: 0.93
    }
  ]);

  // Derived
  const filteredEmails = useMemo(() => {
    return emails.filter(e => {
      const matchesQuery =
        !query ||
        e.subject.toLowerCase().includes(query.toLowerCase()) ||
        e.sender.toLowerCase().includes(query.toLowerCase()) ||
        e.content.toLowerCase().includes(query.toLowerCase()) ||
        e.topics.some(t => t.toLowerCase().includes(query.toLowerCase()));

      const matchesPriority = priorityFilter === 'all' || e.priority === priorityFilter;
      const matchesSentiment = sentimentFilter === 'all' || e.sentiment === sentimentFilter;

      return matchesQuery && matchesPriority && matchesSentiment;
    });
  }, [emails, query, priorityFilter, sentimentFilter]);

  const kpis = useMemo(() => {
    const total = emails.length || 1;
    const urgent = emails.filter(e => e.priority === 'urgent').length;
    const positive = emails.filter(e => e.sentiment === 'positive').length;
    const responded = emails.filter(e => e.hasResponse).length;
    const avgResp =
      emails.filter(e => e.responseTime != null).reduce((acc, e) => acc + (e.responseTime || 0), 0) /
      Math.max(1, emails.filter(e => e.responseTime != null).length);
    return { total, urgent, positive, responded, avgResp: Math.round(avgResp) };
  }, [emails]);

  // UI subcomponents
  const TabButton: React.FC<{
    id: 'inbox' | 'analysis' | 'templates' | 'analytics';
    icon: React.ElementType;
    label: string;
  }> = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm ${
        activeTab === id
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  const EmailRow: React.FC<{ email: Email }> = ({ email }) => (
    <button
      onClick={() => setSelectedEmail(email)}
      className={`w-full text-left p-4 rounded-xl border transition hover:bg-slate-50 ${
        selectedEmail?.id === email.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Mail size={18} className="text-slate-500" />
          <div>
            <p className="font-semibold text-slate-900">{email.subject}</p>
            <p className="text-sm text-slate-600">
              <span className="inline-flex items-center gap-1">
                <User size={14} /> {email.sender}
              </span>
              <span className="mx-2">•</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={14} />
                {new Date(email.timestamp).toLocaleString()}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${priorityBadge(email.priority)}`}>{email.priority}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${sentimentBadge(email.sentiment)}`}>
            {email.sentiment}
          </span>
          {email.hasResponse ? (
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 inline-flex items-center gap-1">
              <CheckCircle size={14} /> responded
            </span>
          ) : (
            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 inline-flex items-center gap-1">
              <AlertCircle size={14} /> pending
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-slate-700 mt-2 line-clamp-2">{email.content}</p>
      <div className="flex flex-wrap gap-2 mt-3">
        {email.topics.map(t => (
          <span key={t} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
            #{t}
          </span>
        ))}
      </div>
    </button>
  );

  const Inbox = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: list + filters */}
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <SearchIcon size={16} className="shrink-0 text-slate-500" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="bg-transparent outline-none w-full text-sm"
                placeholder="Search subject, sender, content, or topic…"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-slate-500" />
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value as Priority | 'all')}
                className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white"
              >
                <option value="all">All priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={sentimentFilter}
                onChange={e => setSentimentFilter(e.target.value as Sentiment | 'all')}
                className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white"
              >
                <option value="all">All sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredEmails.map(e => (
            <EmailRow key={e.id} email={e} />
          ))}
          {!filteredEmails.length && (
            <div className="text-center text-slate-500 bg-white border border-slate-200 rounded-xl p-8">
              No emails match your filters.
            </div>
          )}
        </div>
      </div>

      {/* Right: detail */}
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl p-6 min-h-[300px]">
          {selectedEmail ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{selectedEmail.subject}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    <span className="inline-flex items-center gap-1 mr-3">
                      <User size={14} /> {selectedEmail.sender}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(selectedEmail.timestamp).toLocaleString()}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">
                    <Send size={16} /> Reply
                  </button>
                  <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-800 text-sm">
                    <FileText size={16} /> Create task
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className={`text-xs px-2 py-1 rounded-full ${priorityBadge(selectedEmail.priority)}`}>
                  {selectedEmail.priority}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${sentimentBadge(selectedEmail.sentiment)}`}>
                  {selectedEmail.sentiment} • {(selectedEmail.confidence * 100).toFixed(0)}%
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 inline-flex items-center gap-1">
                  <Clock size={14} /> Response time: {formatMinutes(selectedEmail.responseTime)}
                </span>
              </div>

              <p className="text-slate-800 whitespace-pre-wrap mt-4">{selectedEmail.content}</p>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-slate-900 mb-2 inline-flex items-center gap-2">
                  <Brain size={16} /> Suggested Actions
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  {selectedEmail.actionItems.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="h-full min-h-[260px] flex items-center justify-center text-slate-500">
              Select an email to see details.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const Analysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Emails</p>
              <p className="text-2xl font-bold text-slate-900">{kpis.total}</p>
            </div>
            <Mail size={28} />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Urgent</p>
              <p className="text-2xl font-bold text-slate-900">{kpis.urgent}</p>
            </div>
            <AlertCircle size={28} />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Positive</p>
              <p className="text-2xl font-bold text-slate-900">{kpis.positive}</p>
            </div>
            <CheckCircle size={28} />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Avg Response</p>
              <p className="text-2xl font-bold text-slate-900">{formatMinutes(kpis.avgResp)}</p>
            </div>
            <Clock size={28} />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-3 inline-flex items-center gap-2">
          <TrendingUp size={18} /> Insights
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-slate-700">
          <li>
            Urgent topics concentrate around <strong>payment gateway</strong>. Consider a dedicated incident channel.
          </li>
          <li>
            Positive feedback is mostly about the <strong>payment feature demo</strong>; capitalize with a stakeholder
            newsletter.
          </li>
          <li>
            Average response time improved week-over-week. Aim for {'<'}60m on urgent threads.
          </li>
        </ul>
      </div>
    </div>
  );

  const Templates = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-3">
        {templates.map(t => (
          <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{t.title}</p>
                <p className="text-xs text-slate-600 capitalize">{t.category}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                {(t.effectiveness * 100).toFixed(0)}% eff.
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
              <FileText size={14} /> {t.variables.length} variables • {t.usageCount} uses
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(t.content)}
              className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm"
            >
              <Download size={16} /> Copy content
            </button>
          </div>
        ))}
      </div>

      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 inline-flex items-center gap-2">
          <MessageSquare size={18} /> Preview
        </h3>
        <p className="text-slate-600">
          Select a template on the left and paste into your email client. Variables like{' '}
          <code className="px-1 py-0.5 bg-slate-100 rounded">{"{{sprintNumber}}"}</code> should be replaced manually or
          by your automation.
        </p>
      </div>
    </div>
  );

  const Analytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-sm text-slate-600">Response-rate</p>
          <p className="text-2xl font-bold text-slate-900">82%</p>
          <p className="text-xs text-green-700 mt-1 inline-flex items-center gap-1">
            <TrendingUp size={14} /> +6% WoW
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-sm text-slate-600">Avg time-to-first-response</p>
          <p className="text-2xl font-bold text-slate-900">1h 12m</p>
          <p className="text-xs text-green-700 mt-1 inline-flex items-center gap-1">
            <Zap size={14} /> faster this week
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-sm text-slate-600">Escalations</p>
          <p className="text-2xl font-bold text-slate-900">3</p>
          <p className="text-xs text-slate-600 mt-1 inline-flex items-center gap-1">
            <AlertCircle size={14} /> mostly payments
          </p>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2 inline-flex items-center gap-2">
          <Brain size={18} /> Recommendations
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-slate-700">
          <li>Create auto-labels for “gateway” and “checkout” topics.</li>
          <li>Auto-route urgent emails to a #payments-incident Slack channel.</li>
          <li>Standardize a 24-hour follow-up template for neutral sentiment threads.</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Email Intelligence</h2>
          <p className="text-slate-600 text-sm">Triage, analyze, and act faster.</p>
        </div>
        <div className="flex items-center gap-2">
          <TabButton id="inbox" icon={Mail} label="Inbox" />
          <TabButton id="analysis" icon={TrendingUp} label="Analysis" />
          <TabButton id="templates" icon={FileText} label="Templates" />
          <TabButton id="analytics" icon={Zap} label="Analytics" />
        </div>
      </div>

      {/* Content */}
      {activeTab === 'inbox' && <Inbox />}
      {activeTab === 'analysis' && <Analysis />}
      {activeTab === 'templates' && <Templates />}
      {activeTab === 'analytics' && <Analytics />}
    </div>
  );
};

export default EmailIntelligence;
