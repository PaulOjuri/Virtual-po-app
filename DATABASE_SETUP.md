# Virtual Product Owner Platform - Database Setup Guide

## Overview

This guide provides instructions for setting up the Supabase database with all necessary tables and integrating the real database with the Virtual Product Owner Platform.

## Database Architecture

The system uses Supabase (PostgreSQL) as the backend database with the following main components:

### Core Tables Created

1. **Notes System Tables**
   - `notebooks` - OneNote-style notebook containers
   - `sections` - Notebook sections for organization
   - `notes` - Individual notes with rich content
   - `todos` - Task items linked to notes
   - `reminders` - Notification reminders for notes/todos/calendar events

2. **Calendar System Tables**
   - `calendar_events` - SAFe ceremony events and meetings
   - `program_increments` - PI planning periods
   - `ceremony_templates` - Reusable ceremony templates
   - `notification_rules` - User-specific notification preferences

3. **Additional Feature Tables**
   - `meetings` - Meeting management
   - `emails` - Email intelligence
   - `kb_documents` & `kb_folders` - Knowledge base
   - `market_trends`, `market_competitors`, `market_alerts` - Market intelligence
   - `daily_tasks` - Daily planning
   - `user_roles`, `role_templates` - Role management
   - `analytics_metrics` - System analytics

4. **Existing Tables**
   - `priorities` - Priority/backlog management
   - `stakeholders` - Stakeholder relationship management

## Setup Instructions

### 1. Supabase Project Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Update your environment variables:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Run Database Migrations

Execute the migration files in order in your Supabase SQL editor:

1. `supabase/migrations/001_create_notes_tables.sql`
   - Creates notes, notebooks, sections, todos, reminders tables
   - Sets up Row Level Security (RLS) policies
   - Creates indexes for performance

2. `supabase/migrations/002_create_calendar_tables.sql`
   - Creates calendar events, ceremony templates, PI tables
   - Sets up calendar-specific RLS policies
   - Creates calendar integration tables

3. `supabase/migrations/003_create_additional_tables.sql`
   - Creates remaining feature tables (meetings, emails, KB, etc.)
   - Sets up comprehensive RLS policies
   - Creates full-text search capabilities

4. `supabase/migrations/004_insert_default_data.sql`
   - Inserts default ceremony templates
   - Creates default notification rules
   - Adds sample market intelligence data

### 3. Verify Database Setup

After running migrations, verify these tables exist:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- analytics_metrics
- calendar_events
- calendar_integrations
- ceremony_templates
- daily_tasks
- emails
- kb_document_folders
- kb_documents
- kb_folders
- market_alerts
- market_competitors
- market_trends
- meetings
- notebooks
- notes
- notification_preferences
- notification_rules
- priorities
- program_increments
- reminders
- role_templates
- sections
- stakeholders
- todos
- user_roles

## Service Integration Status

### ✅ Completed Integrations

1. **NotesService** - Fully integrated with Supabase
   - Real CRUD operations for notes, notebooks, sections
   - Todo management with reminders
   - Knowledge base linking
   - Full-text search capabilities
   - Notification preferences

2. **CalendarService** - Fully integrated with Supabase
   - Calendar event CRUD operations
   - Program Increment management
   - Ceremony templates
   - SAFe ceremony definitions

### 🔄 Partial Integrations

1. **PriorityService** - Using existing Supabase table
2. **StakeholderService** - Using existing Supabase table

### 📋 Pending Integrations

The following services still use mock data and need integration:
- EmailService
- MeetingService
- KnowledgeBaseService
- MarketIntelligenceService
- AnalyticsService
- DailyPlanningService

## Testing the Integration

### 1. Authentication Setup

Ensure Supabase authentication is properly configured:
- Email/password authentication enabled
- RLS policies are working correctly
- Users can sign up and sign in

### 2. Feature Testing

Test each major feature area:

**Notes App:**
```bash
# Test creating notebooks and sections
# Test creating notes with todos
# Test reminder functionality
# Test knowledge base linking
```

**Calendar:**
```bash
# Test creating calendar events
# Test ceremony templates
# Test PI planning events
# Test notification rules
```

**Dashboard Integration:**
```bash
# Verify dashboard loads data from real services
# Test role-based module visibility
# Test analytics integration
```

## Row Level Security (RLS)

All tables implement RLS policies ensuring:
- Users can only access their own data
- Shared resources (like ceremony templates) are properly accessible
- Collaborative features (shared notebooks) work correctly

## Performance Considerations

### Indexes Created

The migration includes strategic indexes for:
- User-based queries (`user_id` columns)
- Time-based queries (`created_at`, `updated_at`, `start_time`, etc.)
- Search operations (GIN indexes for arrays and text search)
- Foreign key relationships

### Query Optimization

The services use:
- Efficient joins for related data
- Pagination for large datasets
- Selective field loading
- Proper use of Supabase query filters

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   - Ensure user is properly authenticated
   - Check that policies allow the intended operations
   - Verify `user_id` is set correctly

2. **Foreign Key Violations**
   - Ensure referenced records exist before creating relationships
   - Use proper UUID format for IDs

3. **Authentication Issues**
   - Verify Supabase environment variables
   - Check that auth policies are enabled
   - Ensure proper session management

### Debug Queries

```sql
-- Check if user can access their data
SELECT * FROM notes WHERE user_id = auth.uid();

-- Verify RLS policies
SELECT * FROM pg_policies WHERE tablename = 'notes';

-- Check authentication
SELECT auth.uid(), auth.jwt();
```

## Next Steps

1. **Complete Service Integration**: Integrate remaining services (Email, Meeting, etc.)
2. **Real-time Features**: Implement Supabase real-time subscriptions for live updates
3. **File Storage**: Set up Supabase storage for file uploads in knowledge base
4. **Advanced Features**: Implement full-text search, advanced analytics
5. **Performance Monitoring**: Set up monitoring and optimization

## Development vs Production

### Development Setup
- Uses fallback to mock data when Supabase fails
- Comprehensive error logging
- Graceful degradation

### Production Readiness
- Remove mock data fallbacks
- Implement proper error handling
- Add monitoring and alerting
- Optimize query performance
- Set up backup strategies

This completes the database integration setup for the Virtual Product Owner Platform. The system now uses real Supabase data for Notes and Calendar features, with a solid foundation for integrating the remaining services.