-- Insert default data for ceremony templates and role configurations
-- This migration populates the system with default SAFe ceremonies and role templates

-- Insert default ceremony templates
INSERT INTO ceremony_templates (ceremony_type, title, description, duration_minutes, default_attendees, agenda_template, preparation_checklist, default_reminder_minutes, level, purpose, inputs, outputs, tips, user_id) VALUES
(
  'sprint_planning',
  'Sprint Planning - Team {TEAM_NAME}',
  'Team selects work from the Program Backlog and defines Sprint Goal',
  480,
  ARRAY['product.owner@example.com', 'scrum.master@example.com'],
  E'1. Review Sprint Goal (15 min)\n2. Review Product Backlog items (60 min)\n3. Break down stories into tasks (120 min)\n4. Capacity planning (30 min)\n5. Finalize Sprint Backlog (15 min)',
  ARRAY['Product Backlog is refined and prioritized', 'Team velocity is calculated', 'Definition of Done is reviewed', 'Team capacity is assessed'],
  ARRAY[60, 1440],
  'team',
  'Plan the work for the upcoming Sprint',
  ARRAY['Program Backlog', 'Team Velocity', 'Definition of Done'],
  ARRAY['Sprint Backlog', 'Sprint Goal', 'Sprint Plan'],
  ARRAY['Ensure all team members understand the Sprint Goal', 'Break down large stories into smaller tasks', 'Consider team capacity and planned time off', 'Review Definition of Done for all stories'],
  (SELECT id FROM auth.users LIMIT 1) -- Use first available user, or make this NULL for system defaults
),
(
  'daily_standup',
  'Daily Standup',
  'Daily team synchronization to inspect progress and adapt',
  15,
  ARRAY['development.team@example.com', 'scrum.master@example.com'],
  E'1. What did you do yesterday?\n2. What will you do today?\n3. Any impediments?',
  ARRAY['Review Sprint Backlog', 'Check Sprint Burndown', 'Prepare impediments list'],
  ARRAY[5],
  'team',
  'Synchronize activities and create plan for next 24 hours',
  ARRAY['Sprint Backlog', 'Sprint Burndown', 'Current Sprint Goal'],
  ARRAY['Updated Sprint plan', 'Impediments identified', 'Team synchronization'],
  ARRAY['Keep it time-boxed to 15 minutes', 'Focus on what was done, what will be done, and impediments', 'Take detailed discussions offline', 'Ensure everyone participates'],
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'sprint_review',
  'Sprint Review',
  'Team demonstrates completed work to stakeholders',
  120,
  ARRAY['development.team@example.com', 'product.owner@example.com', 'stakeholders@example.com'],
  E'1. Sprint Overview (10 min)\n2. Demo Completed Work (60 min)\n3. Stakeholder Feedback (30 min)\n4. Next Steps Discussion (20 min)',
  ARRAY['Prepare demo environment', 'Test all completed features', 'Invite stakeholders', 'Prepare Sprint metrics'],
  ARRAY[30],
  'team',
  'Inspect the increment and adapt Product Backlog',
  ARRAY['Sprint Increment', 'Sprint Backlog', 'Definition of Done'],
  ARRAY['Feedback from stakeholders', 'Updated Product Backlog', 'Input for retrospective'],
  ARRAY['Demonstrate working software, not presentations', 'Encourage stakeholder feedback and questions', 'Review what went well and what could be improved', 'Update Product Backlog based on feedback'],
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'pi_planning',
  'PI {PI_NUMBER} Planning',
  'Face-to-face event where teams plan work for next Program Increment',
  1440,
  ARRAY['rte@example.com', 'product.management@example.com', 'all.teams@example.com'],
  E'Day 1:\n- Business Context (30 min)\n- Product/Solution Vision (45 min)\n- Architecture Vision (45 min)\n- Planning Context (15 min)\n- Team Breakouts #1 (4 hours)\n- Draft Plan Review (60 min)\n\nDay 2:\n- Planning Adjustments (30 min)\n- Team Breakouts #2 (4 hours)\n- Final Plan Review (90 min)\n- PI Confidence Vote (30 min)\n- Plan Rework (if needed) (60 min)\n- Planning Retrospective (30 min)',
  ARRAY['Vision and roadmap are prepared', 'Features are defined and prioritized', 'Architecture runway is identified', 'Capacity planning is complete', 'Facilities and logistics are arranged'],
  ARRAY[1440, 10080],
  'program',
  'Align teams to shared mission and vision for PI',
  ARRAY['Vision', 'Roadmap', 'Features', 'Architectural guidance'],
  ARRAY['Team PI Objectives', 'Program Board', 'Risks and dependencies'],
  ARRAY['Prepare vision and context presentation in advance', 'Ensure all teams have Product Owner and Scrum Master', 'Identify and address risks and dependencies', 'Get business owner commitment on objectives'],
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'inspect_adapt',
  'Inspect & Adapt',
  'Problem-solving workshop held at end of each PI',
  480,
  ARRAY['all.art.members@example.com', 'stakeholders@example.com'],
  E'1. PI System Demo (60 min)\n2. Quantitative and Qualitative Measurement (30 min)\n3. Retrospective and Problem-Solving Workshop (360 min)\n4. Next Steps (30 min)',
  ARRAY['Gather PI metrics', 'Prepare system demo', 'Collect team feedback', 'Identify improvement opportunities'],
  ARRAY[60, 1440],
  'program',
  'Reflect on PI and identify improvement backlog items',
  ARRAY['PI metrics', 'Quantitative and qualitative data', 'ART assessment'],
  ARRAY['Improvement backlog items', 'Process improvements', 'PI retrospective insights'],
  ARRAY['Use data to drive improvement discussions', 'Focus on systemic issues, not individual blame', 'Create actionable improvement items', 'Celebrate successes and learning'],
  (SELECT id FROM auth.users LIMIT 1)
);

-- Insert default notification rules for each ceremony type
INSERT INTO notification_rules (ceremony_type, reminder_minutes, enabled, channels, custom_message, user_id) VALUES
('sprint_planning', ARRAY[60, 1440], true, ARRAY['email', 'browser'], 'Sprint Planning session starting soon. Please ensure you have reviewed the backlog.', (SELECT id FROM auth.users LIMIT 1)),
('daily_standup', ARRAY[5], true, ARRAY['browser'], NULL, (SELECT id FROM auth.users LIMIT 1)),
('sprint_review', ARRAY[30], true, ARRAY['email', 'browser'], 'Sprint Review demo starting soon. Please join to see the completed work.', (SELECT id FROM auth.users LIMIT 1)),
('sprint_retrospective', ARRAY[15], true, ARRAY['browser'], NULL, (SELECT id FROM auth.users LIMIT 1)),
('backlog_refinement', ARRAY[15], true, ARRAY['browser'], 'Backlog refinement session starting. Please come prepared to estimate stories.', (SELECT id FROM auth.users LIMIT 1)),
('pi_planning', ARRAY[1440, 10080], true, ARRAY['email', 'slack'], 'PI Planning event approaching. Please complete your preparation checklist.', (SELECT id FROM auth.users LIMIT 1)),
('system_demo', ARRAY[60], true, ARRAY['email', 'browser'], 'System Demo starting soon. Join to see integrated features from all teams.', (SELECT id FROM auth.users LIMIT 1)),
('inspect_adapt', ARRAY[1440], true, ARRAY['email'], 'Inspect & Adapt workshop tomorrow. Please review PI metrics and come prepared with improvement ideas.', (SELECT id FROM auth.users LIMIT 1));

-- Insert default role templates for different agile roles
INSERT INTO role_templates (role_id, template_type, name, description, template_data, is_default, user_id) VALUES
-- Product Owner Templates
('product_owner', 'priority', 'User Story Template', 'Standard user story template for Product Owners', '{"title": "As a [user type], I want [goal] so that [benefit]", "acceptanceCriteria": ["Given [context]", "When [action]", "Then [outcome]"], "priority": "medium", "storyPoints": 0}', true, (SELECT id FROM auth.users LIMIT 1)),
('product_owner', 'meeting', 'Backlog Refinement', 'Weekly backlog refinement session', '{"title": "Backlog Refinement - Week {WEEK}", "duration": 90, "attendees": ["Development Team", "Product Owner"], "agenda": "Review and estimate upcoming user stories"}', true, (SELECT id FROM auth.users LIMIT 1)),

-- Scrum Master Templates  
('scrum_master', 'priority', 'Impediment Log', 'Template for logging team impediments', '{"title": "IMPEDIMENT: [Brief description]", "description": "Detailed description of the impediment and its impact", "priority": "high", "assignedTo": "Scrum Master"}', true, (SELECT id FROM auth.users LIMIT 1)),
('scrum_master', 'meeting', 'Retrospective', 'Sprint retrospective meeting template', '{"title": "Sprint {SPRINT_NUM} Retrospective", "duration": 90, "agenda": "What went well? What could be improved? Action items for next sprint"}', true, (SELECT id FROM auth.users LIMIT 1)),

-- Business Analyst Templates
('business_analyst', 'priority', 'Requirement', 'Business requirement template', '{"title": "REQ: [Requirement name]", "description": "Business requirement description and rationale", "priority": "medium", "category": "business_requirement"}', true, (SELECT id FROM auth.users LIMIT 1)),
('business_analyst', 'meeting', 'Requirements Gathering', 'Stakeholder requirements session', '{"title": "Requirements Session - [Topic]", "duration": 120, "agenda": "Gather and validate business requirements"}', true, (SELECT id FROM auth.users LIMIT 1)),

-- Release Train Engineer Templates
('release_train_engineer', 'priority', 'PI Objective', 'Program Increment objective template', '{"title": "PI Objective: [Objective name]", "description": "PI-level objective with business value", "priority": "high", "category": "pi_objective"}', true, (SELECT id FROM auth.users LIMIT 1)),
('release_train_engineer', 'ceremony', 'ART Sync', 'Agile Release Train synchronization meeting', '{"title": "ART Sync - Week {WEEK}", "duration": 60, "attendees": ["RTE", "Product Management", "System Architect", "Scrum Masters"]}', true, (SELECT id FROM auth.users LIMIT 1)),

-- Product Manager Templates
('product_manager', 'priority', 'Feature', 'Product feature template', '{"title": "FEATURE: [Feature name]", "description": "Feature description with market opportunity", "priority": "high", "category": "feature"}', true, (SELECT id FROM auth.users LIMIT 1)),
('product_manager', 'meeting', 'Customer Interview', 'Customer discovery session', '{"title": "Customer Interview - [Customer/Topic]", "duration": 60, "agenda": "Validate assumptions and gather feedback"}', true, (SELECT id FROM auth.users LIMIT 1)),

-- Epic Owner Templates
('epic_owner', 'priority', 'Epic', 'Portfolio epic template', '{"title": "EPIC: [Epic name]", "description": "Large solution development initiative", "priority": "high", "category": "epic"}', true, (SELECT id FROM auth.users LIMIT 1)),
('epic_owner', 'meeting', 'Portfolio Review', 'Portfolio epic review session', '{"title": "Portfolio Review - [Epic/Quarter]", "duration": 120, "agenda": "Review epic progress and strategic alignment"}', true, (SELECT id FROM auth.users LIMIT 1));

-- Insert sample market intelligence data
INSERT INTO market_trends (name, description, trend_type, impact_score, confidence_level, time_horizon, status, sources, tags, user_id) VALUES
('AI-Powered Development Tools', 'Increasing adoption of AI assistants in software development workflows', 'technology', 8, 'high', 'short-term', 'monitoring', ARRAY['GitHub Copilot usage data', 'Developer surveys'], ARRAY['ai', 'development', 'productivity'], (SELECT id FROM auth.users LIMIT 1)),
('Remote-First Agile Practices', 'Permanent shift toward distributed agile teams and virtual ceremonies', 'market', 7, 'high', 'medium-term', 'confirmed', ARRAY['Industry reports', 'Team surveys'], ARRAY['remote', 'agile', 'distributed'], (SELECT id FROM auth.users LIMIT 1)),
('Platform Engineering Movement', 'Growing focus on internal developer platforms and self-service infrastructure', 'technology', 6, 'medium', 'medium-term', 'investigating', ARRAY['Conference talks', 'Tool adoption'], ARRAY['devops', 'platform', 'infrastructure'], (SELECT id FROM auth.users LIMIT 1));

INSERT INTO market_competitors (name, description, website, industry, size, market_position, threat_level, strengths, weaknesses, key_products, user_id) VALUES
('Atlassian', 'Leading provider of team collaboration and productivity software', 'https://atlassian.com', 'Software Tools', 'large', 'leader', 'high', ARRAY['Strong ecosystem', 'Enterprise adoption', 'Integrated suite'], ARRAY['Complex pricing', 'Performance issues'], ARRAY['Jira', 'Confluence', 'Trello'], (SELECT id FROM auth.users LIMIT 1)),
('Azure DevOps', 'Microsoft''s integrated DevOps platform for planning and development', 'https://dev.azure.com', 'Software Tools', 'enterprise', 'leader', 'high', ARRAY['Microsoft ecosystem', 'Enterprise sales', 'Integrated tools'], ARRAY['Complexity', 'Learning curve'], ARRAY['Azure Boards', 'Azure Repos', 'Azure Pipelines'], (SELECT id FROM auth.users LIMIT 1)),
('Linear', 'Modern issue tracking and project management for software teams', 'https://linear.app', 'Software Tools', 'startup', 'challenger', 'medium', ARRAY['Modern UI/UX', 'Performance', 'Developer experience'], ARRAY['Limited enterprise features', 'Smaller ecosystem'], ARRAY['Linear Issues', 'Linear Roadmap'], (SELECT id FROM auth.users LIMIT 1));