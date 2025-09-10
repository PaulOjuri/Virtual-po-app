# Deployment Guide

Complete deployment guide for the Virtual Product Owner platform landing page.

## 🚀 Quick Deploy Commands

### Vercel (Recommended)
```bash
# One-line deploy to Vercel
npx vercel --prod
```

### Netlify
```bash
# One-line deploy to Netlify
npx netlify deploy --prod --dir=.next
```

### Self-hosted
```bash
# Build and serve
npm run build && npm start
```

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint passes without errors
- [ ] All components render without console errors
- [ ] Build completes successfully
- [ ] Bundle size under 150KB (excluding images)

### Performance
- [ ] Lighthouse Performance score ≥ 90
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 4s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Time to Interactive < 5s

### Accessibility
- [ ] Lighthouse Accessibility score ≥ 95
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility tested
- [ ] Color contrast ratios meet WCAG AA
- [ ] All images have alt text
- [ ] Focus indicators visible

### SEO & Meta
- [ ] Meta titles and descriptions set
- [ ] Open Graph tags configured
- [ ] Twitter Card metadata present
- [ ] Structured data implemented
- [ ] Sitemap generated
- [ ] Robots.txt configured

### Functionality
- [ ] All navigation links work
- [ ] Forms validate and submit
- [ ] Responsive design at 320px, 768px, 1024px, 1920px
- [ ] All animations smooth on mobile
- [ ] Newsletter signup functional
- [ ] CTA buttons lead to correct destinations

## 🔧 Environment Configuration

### Required Environment Variables
```env
# Production
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://virtual-po.colruyt-group.com

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_HOTJAR_ID=xxxxxxx

# API Endpoints (Optional)
NEXT_PUBLIC_API_URL=https://api.virtual-po.colruyt-group.com
NEXT_PUBLIC_CONTACT_FORM_URL=https://forms.virtual-po.colruyt-group.com
```

### Platform-Specific Settings

#### Vercel
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

#### Netlify
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Docker
```dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
COPY . .
RUN npm run build

FROM base AS runtime
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

## 🌐 Platform-Specific Instructions

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure Domain**
   - Go to Vercel dashboard
   - Add custom domain: `virtual-po.colruyt-group.com`
   - Configure DNS records

### Netlify Deployment

1. **Install Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

2. **Build locally**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=.next
   ```

### AWS Amplify

1. **Connect Repository**
   - Link GitHub/GitLab repository
   - Select branch: `main`

2. **Build Settings**
   ```yml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

### Self-Hosted (Ubuntu/CentOS)

1. **Install Dependencies**
   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone <repository-url> virtual-po-app
   cd virtual-po-app
   
   # Install dependencies
   npm install
   
   # Build application
   npm run build
   
   # Start with PM2
   pm2 start npm --name "virtual-po" -- start
   pm2 save
   pm2 startup
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name virtual-po.colruyt-group.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔒 Security Considerations

### Headers Configuration
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
```

### SSL/TLS
- Ensure HTTPS is enforced
- Use TLS 1.2 or higher
- Configure HSTS headers
- Verify certificate chain

### Content Security Policy
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' *.colruyt-group.com;
```

## 📊 Monitoring & Analytics

### Performance Monitoring
- Setup Lighthouse CI for automated testing
- Configure Core Web Vitals monitoring
- Monitor bundle size changes
- Track loading performance

### Error Tracking
```javascript
// Optional: Sentry integration
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

### Analytics Setup
```javascript
// Google Analytics 4
gtag('config', 'G-XXXXXXXXXX', {
  page_title: 'Virtual Product Owner',
  page_location: window.location.href
})
```

## 🚨 Rollback Procedures

### Vercel
```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Self-Hosted
```bash
# Stop current version
pm2 stop virtual-po

# Switch to backup
pm2 start virtual-po-backup

# Or deploy previous version
git checkout [previous-commit]
npm run build
pm2 reload virtual-po
```

## 📞 Support & Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (18+)
   - Clear node_modules and reinstall
   - Verify TypeScript configuration

2. **Images Not Loading**
   - Check Next.js image domains configuration
   - Verify image paths are absolute
   - Ensure images are in public folder

3. **Fonts Not Loading**
   - Verify Google Fonts configuration
   - Check network connectivity
   - Fallback fonts configured

4. **Performance Issues**
   - Analyze bundle size
   - Check for unused dependencies
   - Optimize images and assets

### Support Contacts
- **DevOps Team**: devops@colruyt-group.com
- **Frontend Team**: frontend@colruyt-group.com  
- **Emergency**: +32-xxx-xxx-xxxx

---

**Last Updated**: 2024-01-XX  
**Maintained By**: Colruyt Group Digital Team