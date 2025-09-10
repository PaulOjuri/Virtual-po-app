# Virtual Product Owner API Specification

OpenAPI 3.0 specification for the Virtual Product Owner platform backend services.

## 📋 Overview

- **Version**: 1.0.0
- **Base URL**: `https://api.virtual-po.colruyt-group.com/v1`
- **Authentication**: Bearer Token (JWT)
- **Content-Type**: `application/json`

## 🔐 Authentication

All API requests require authentication using JWT Bearer tokens.

```http
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### POST /auth/login
Login with Colruyt Group credentials.

**Request Body:**
```json
{
  "email": "user@colruyt-group.com",
  "password": "secure-password",
  "domain": "colruyt-group"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh-token-string",
  "user": {
    "id": "uuid",
    "email": "user@colruyt-group.com",
    "name": "John Doe",
    "role": "product_owner",
    "department": "Digital Experience",
    "permissions": ["read", "write", "admin"]
  },
  "expiresAt": "2024-01-01T10:00:00Z"
}
```

#### POST /auth/refresh
Refresh expired JWT token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token-string"
}
```

#### POST /auth/logout
Logout and invalidate tokens.

## 👤 User Management

### GET /users/profile
Get current user profile.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@colruyt-group.com",
  "name": "John Doe",
  "role": "product_owner",
  "department": "Digital Experience",
  "avatar": "https://cdn.colruyt-group.com/avatars/uuid.jpg",
  "preferences": {
    "timezone": "Europe/Brussels",
    "language": "en",
    "notifications": {
      "email": true,
      "push": false
    }
  },
  "teams": [
    {
      "id": "team-uuid",
      "name": "Xtra Mobile App",
      "role": "product_owner"
    }
  ]
}
```

### PUT /users/profile
Update user profile.

### GET /users/{userId}
Get user by ID (admin only).

## 🏢 Teams & Organizations

### GET /teams
List user's teams.

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 20)
- `status` (string): active, inactive, archived

**Response:**
```json
{
  "teams": [
    {
      "id": "team-uuid",
      "name": "Xtra Mobile App",
      "description": "Customer mobile experience team",
      "status": "active",
      "members": [
        {
          "id": "user-uuid",
          "name": "John Doe",
          "role": "product_owner",
          "avatar": "https://cdn.colruyt-group.com/avatars/uuid.jpg"
        }
      ],
      "metrics": {
        "velocity": 45,
        "sprintGoalSuccess": 0.85,
        "defectRate": 0.03
      }
    }
  ],
  "pagination": {
    "current": 1,
    "total": 5,
    "hasNext": true
  }
}
```

### GET /teams/{teamId}
Get team details.

### POST /teams
Create new team (admin only).

## 📊 AI Insights & Analytics

### GET /insights/backlog-prioritization
Get AI-powered backlog prioritization recommendations.

**Query Parameters:**
- `teamId` (string): Team identifier
- `sprintId` (string): Optional sprint identifier
- `confidenceThreshold` (float): Minimum confidence level (0.0-1.0)

**Response:**
```json
{
  "recommendations": [
    {
      "itemId": "story-uuid",
      "title": "Improve checkout flow UX",
      "currentPriority": 2,
      "suggestedPriority": 1,
      "confidence": 0.92,
      "reasoning": [
        "High business value impact (+€50K revenue)",
        "Low implementation complexity (3 story points)",
        "Blocks 2 dependent user stories",
        "Customer feedback score: 4.2/5 importance"
      ],
      "impact": {
        "business": "high",
        "technical": "medium",
        "user": "high"
      },
      "effort": {
        "storyPoints": 3,
        "complexity": "low",
        "risk": "low"
      }
    }
  ],
  "summary": {
    "itemsAnalyzed": 25,
    "recommendationsGenerated": 8,
    "averageConfidence": 0.84,
    "potentialValueIncrease": "€75,000"
  }
}
```

### GET /insights/sprint-forecast
Get AI sprint outcome predictions.

**Response:**
```json
{
  "forecast": {
    "commitmentLikelihood": 0.78,
    "velocityPrediction": {
      "min": 38,
      "expected": 42,
      "max": 47
    },
    "risks": [
      {
        "type": "capacity",
        "severity": "medium",
        "description": "Team member vacation during sprint",
        "impact": -5,
        "mitigation": "Consider reducing scope by 1-2 stories"
      }
    ],
    "opportunities": [
      {
        "type": "efficiency",
        "description": "Similar stories completed 20% faster last sprint",
        "impact": +3
      }
    ]
  }
}
```

### GET /insights/stakeholder-impact
Get stakeholder communication recommendations.

**Response:**
```json
{
  "stakeholders": [
    {
      "id": "stakeholder-uuid",
      "name": "Sarah Marketing Director",
      "role": "Marketing Director",
      "department": "Marketing",
      "interestLevel": "high",
      "influence": "high",
      "communicationFrequency": "weekly",
      "preferredChannel": "email",
      "lastUpdate": "2024-01-15T10:00:00Z",
      "relevantTopics": [
        "Customer acquisition features",
        "Marketing campaign integration",
        "Analytics and reporting"
      ],
      "suggestedActions": [
        {
          "type": "update",
          "priority": "high",
          "description": "Share mobile app adoption metrics from Q4",
          "dueDate": "2024-01-20T00:00:00Z"
        }
      ]
    }
  ]
}
```

## 📈 Sprint & Planning

### GET /sprints
List sprints for team.

**Response:**
```json
{
  "sprints": [
    {
      "id": "sprint-uuid",
      "name": "Sprint 45",
      "status": "active",
      "startDate": "2024-01-15T00:00:00Z",
      "endDate": "2024-01-29T00:00:00Z",
      "goal": "Improve mobile checkout conversion by 15%",
      "capacity": {
        "planned": 40,
        "committed": 38,
        "remaining": 12
      },
      "progress": {
        "completed": 26,
        "inProgress": 8,
        "todo": 4
      },
      "team": {
        "id": "team-uuid",
        "name": "Xtra Mobile App"
      }
    }
  ]
}
```

### POST /sprints
Create new sprint.

### GET /sprints/{sprintId}/stories
Get stories in sprint.

### POST /sprints/{sprintId}/stories
Add story to sprint.

## 📝 Backlog Management

### GET /backlog/{teamId}
Get team backlog.

**Query Parameters:**
- `status` (string): todo, in_progress, done, archived
- `priority` (string): critical, high, medium, low
- `assignee` (string): User ID
- `epic` (string): Epic ID
- `search` (string): Text search in title/description

**Response:**
```json
{
  "stories": [
    {
      "id": "story-uuid",
      "title": "Add biometric authentication",
      "description": "Implement fingerprint and face ID login options",
      "status": "todo",
      "priority": "high",
      "storyPoints": 8,
      "businessValue": 100,
      "assignee": {
        "id": "user-uuid",
        "name": "Jane Developer"
      },
      "epic": {
        "id": "epic-uuid",
        "name": "Security Enhancement"
      },
      "acceptanceCriteria": [
        "User can enable biometric auth in settings",
        "App falls back to password if biometric fails",
        "Biometric data stored securely on device"
      ],
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-15T14:30:00Z"
    }
  ],
  "epics": [
    {
      "id": "epic-uuid",
      "name": "Security Enhancement",
      "description": "Improve app security across all touchpoints",
      "status": "in_progress",
      "progress": {
        "completed": 60,
        "total": 100
      }
    }
  ]
}
```

### POST /backlog/{teamId}/stories
Create new user story.

### PUT /backlog/stories/{storyId}
Update user story.

### DELETE /backlog/stories/{storyId}
Delete user story.

## 🎯 Goals & OKRs

### GET /goals/{teamId}
Get team goals and OKRs.

**Response:**
```json
{
  "objectives": [
    {
      "id": "objective-uuid",
      "title": "Improve Customer Mobile Experience",
      "description": "Enhance mobile app usability and performance",
      "status": "in_progress",
      "progress": 0.65,
      "owner": {
        "id": "user-uuid",
        "name": "Product Owner"
      },
      "keyResults": [
        {
          "id": "kr-uuid",
          "title": "Increase mobile app rating to 4.5+",
          "target": 4.5,
          "current": 4.2,
          "progress": 0.75,
          "unit": "rating"
        },
        {
          "id": "kr-uuid-2",
          "title": "Reduce checkout abandonment to <20%",
          "target": 20,
          "current": 28,
          "progress": 0.4,
          "unit": "percentage"
        }
      ],
      "quarter": "Q1 2024"
    }
  ]
}
```

## 📊 Metrics & Reporting

### GET /metrics/team/{teamId}
Get team performance metrics.

**Query Parameters:**
- `period` (string): week, month, quarter, year
- `startDate` (string): ISO date
- `endDate` (string): ISO date

**Response:**
```json
{
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "metrics": {
    "velocity": {
      "current": 42,
      "previous": 38,
      "trend": "up"
    },
    "sprintGoalSuccess": {
      "current": 0.85,
      "previous": 0.78,
      "trend": "up"
    },
    "defectRate": {
      "current": 0.03,
      "previous": 0.05,
      "trend": "down"
    },
    "customerSatisfaction": {
      "current": 4.2,
      "previous": 4.0,
      "trend": "up"
    }
  },
  "burndown": [
    {
      "date": "2024-01-01",
      "remaining": 40
    },
    {
      "date": "2024-01-02",
      "remaining": 38
    }
  ]
}
```

## 🔔 Notifications

### GET /notifications
Get user notifications.

### POST /notifications/mark-read
Mark notifications as read.

### POST /notifications/subscribe
Subscribe to notification topics.

## 📁 File Management

### POST /files/upload
Upload file (images, documents).

### GET /files/{fileId}
Download file.

### DELETE /files/{fileId}
Delete file.

## ❌ Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ],
    "requestId": "req-uuid",
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

### Error Codes
- `AUTHENTICATION_REQUIRED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `VALIDATION_ERROR` (400)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_SERVER_ERROR` (500)

## 📈 Rate Limiting

- **Standard**: 100 requests/minute per user
- **AI Endpoints**: 20 requests/minute per user
- **File Upload**: 10 requests/minute per user

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1642234800
```

## 🔍 Pagination

Standard pagination format:
```json
{
  "data": [...],
  "pagination": {
    "current": 1,
    "total": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 📝 Changelog

### v1.0.0 (2024-01-15)
- Initial API release
- Authentication system
- Basic CRUD operations
- AI insights endpoints

---

**Maintained by**: Colruyt Group API Team  
**Support**: api-support@colruyt-group.com