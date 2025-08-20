# ZURDIR - Space AI Platform

A sophisticated space-themed AI platform with Doctor Who aesthetics, featuring secure user management, AI chat capabilities, file handling, and web search functionality.

![ZURDIR Platform](https://via.placeholder.com/800x400/1A1A1A/FF00FF?text=ZURDIR+Space+AI+Platform)

## 🚀 Features

### 🎨 UI/UX Design
- **Space-themed Interface**: Charcoal grey (#1A1A1A) background with animated multi-colored stars
- **Doctor Who Elements**: TARDIS blue (#003B6F), Fuchsia (#FF00FF), and Wine red (#722F37) color palette
- **Typography**: Inter for body text, Space Mono for headers
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop
- **Animations**: Time vortex loading animations and sonic screwdriver hover effects

### 🤖 AI Integration
- **Ollama Support**: Auto-detect models from ollama.cosmictools.us
- **Manual URL Override**: Custom Ollama endpoint configuration
- **Real-time Streaming**: Live AI responses with pause/stop controls
- **Session Management**: Persistent chat sessions with PostgreSQL storage
- **Context Memory**: pgvector integration for contextual awareness
- **Take Your Time**: Configurable thinking delays (0-10 seconds)
- **Anti-Spam**: Prevention of repetitive user inputs

### 👥 User Management
- **Invite-Only Registration**: 15-digit invitation codes required
- **Flexible Authentication**: Username (1+ chars), Passcode (8+ chars)
- **Stay Logged In**: Optional 30-day sessions
- **Security Protection**: Brute-force protection (5 attempts, 15-min lockout)
- **Password Security**: bcrypt hashing with salt rounds

### 🛡️ Administrative Features
- **Admin Panel**: 6-digit passcode protection
- **User Management**: View accounts, modify invitation codes
- **Security Override**: Unlock user accounts
- **Chat Management**: Selective or complete chat history deletion
- **Invitation Control**: Create/deactivate invitation codes

### 📁 File Management
- **Universal Support**: All common file types including ZIP archives
- **MIME Verification**: Type checking with configurable size limits
- **AI Integration**: AI-generated files with download capabilities
- **Secure Upload**: User-specific file isolation

### 🔍 Web Search
- **Multiple Sources**: Wiby.me (classic web) and DuckDuckGo (privacy-focused)
- **URL Filtering**: Configurable domain blocklists
- **AI Integration**: Automatic triggering based on confidence levels

### 🔒 Security & Infrastructure
- **PostgreSQL RLS**: Row-Level Security for data isolation
- **Encrypted Backups**: Daily backups with 60-day retention
- **Comprehensive Logging**: Error tracking with Sentry integration
- **HTTPS Enforcement**: Secure connections only
- **Connection Pooling**: Optimized database performance

## 🛠️ Technology Stack

- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with pgvector extension
- **Authentication**: JWT tokens with bcrypt hashing
- **Deployment**: Render.com with automatic builds
- **Monitoring**: Sentry for error tracking
- **File Storage**: Local filesystem with secure access

## 📦 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+ with pgvector extension
- Git

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/zurdir-platform.git
cd zurdir-platform
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Essential Variables:**
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/zurdir

# Security
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-random
ADMIN_PASSCODE=123456
ENCRYPTION_KEY=your-32-character-encryption-key-here


# API Configuration
# For local development, set NEXT_PUBLIC_API_URL to your backend URL (e.g. http://localhost:3001)
# For production, leave NEXT_PUBLIC_API_URL blank to use same-origin relative API paths
NEXT_PUBLIC_API_URL=
PORT=3001

# Ollama
OLLAMA_BASE_URL=https://ollama.cosmictools.us
```

### 3. Database Setup
```bash
# The database will be automatically initialized on first run
npm run server:dev
```

### 4. Development
```bash
# Start backend (terminal 1)
npm run server:dev

# Start frontend (terminal 2)
npm run dev
```

Visit http://localhost:3000

## 🚀 Deployment (Render.com)

### Automatic Deployment
1. **Fork Repository**: Fork this repo to your GitHub account
2. **Connect Render**: Link your GitHub repo to Render.com
3. **Environment Variables**: Add required env vars in Render dashboard
4. **Deploy**: Render will automatically build and deploy


### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=[Provided by Render PostgreSQL]
JWT_SECRET=[Generate secure random string]
ADMIN_PASSCODE=[Your 6-digit admin code]
ENCRYPTION_KEY=[Generate 32-character key]
SENTRY_DSN=[Optional: Sentry error tracking]
OLLAMA_BASE_URL=https://ollama.cosmictools.us
# Leave NEXT_PUBLIC_API_URL blank for production (uses same-origin API calls)
NEXT_PUBLIC_API_URL=
```

### Manual Render Setup
```bash
# Install Render CLI (optional)
npm install -g @render/cli

# Deploy with render.yaml configuration
# (Automatically handled when connected to GitHub)
```

## 📝 Usage Guide

### First Time Setup

1. **Admin Access**: Visit `/dashboard`, click Admin Panel, enter admin passcode
2. **Create Invitation**: Generate 15-digit invitation codes
3. **User Registration**: Users register with invitation codes
4. **AI Configuration**: Select AI models and configure thinking time

### Admin Functions

**User Management:**
- View all registered users
- Unlock locked accounts
- Delete user chat history

**Invitation Management:**
- Create new invitation codes
- Toggle code active/inactive status
- View usage statistics

**System Management:**
- View system statistics
- Manage chat data
- Monitor user activity

### AI Chat Usage

1. **Create Session**: Click "New Chat" in sidebar
2. **Configure AI**: Expand settings panel, select model
3. **Thinking Time**: Set AI response delay (0-10 seconds)
4. **Chat**: Send messages and receive AI responses
5. **Manage**: Delete sessions via trash icon

### File Management

1. **Upload**: Click "Upload File" button
2. **Download**: Click download icon in file list
3. **Delete**: Click trash icon to remove files
4. **Types**: Support for all common formats

### Web Search

1. **Query**: Enter search terms
2. **Source**: Choose Wiby.me or DuckDuckGo
3. **Results**: Click results to open in new tab
4. **Filtering**: Some domains may be blocked

## 🔧 Configuration

### File Upload Limits
```env
MAX_FILE_SIZE=100000000  # 100MB
ALLOWED_FILE_TYPES=*     # All types or comma-separated MIME types
```

### Web Search Settings
```env
ENABLE_WEB_SEARCH=true
BLOCKED_DOMAINS=facebook.com,twitter.com
```

### Security Settings
```env
# JWT token expiration
# Default: 24h (regular), 30d (stay logged in)

# Brute force protection
# Default: 5 attempts, 15-minute lockout

# Session management
# Handled automatically based on user preference
```

## 🗂️ Project Structure

```
zurdir-platform/
├── app/                    # Next.js app directory
│   ├── dashboard/          # Main dashboard page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx           # Landing/auth page
├── backend/               # Node.js backend
│   ├── src/
│   │   ├── database/      # DB connection & migrations
│   │   ├── middleware/    # Authentication middleware
│   │   ├── routes/        # API endpoints
│   │   ├── workers/       # Background jobs
│   │   └── server.js      # Express server
│   └── package.json       # Backend dependencies
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth-form.tsx     # Authentication forms
│   ├── chat-interface.tsx # AI chat UI
│   ├── admin-panel.tsx   # Admin dashboard
│   ├── file-manager.tsx  # File upload/management
│   ├── web-search.tsx    # Web search interface
│   └── starfield-background.tsx # Animated background
├── lib/                  # Utility libraries
│   ├── auth-store.ts     # Zustand auth state
│   └── utils.ts          # Helper functions
├── render.yaml           # Render.com deployment config
├── .env.example          # Environment variables template
└── README.md            # This file
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors:**
```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Verify connection string
psql $DATABASE_URL
```

**AI Models Not Loading:**
```bash
# Check Ollama endpoint
curl https://ollama.cosmictools.us/api/tags

# Verify custom URL if configured
curl $OLLAMA_CUSTOM_URL/api/tags
```

**File Upload Failures:**
- Check `MAX_FILE_SIZE` environment variable
- Verify `ALLOWED_FILE_TYPES` configuration
- Ensure backend has write permissions

**Authentication Issues:**
- Verify `JWT_SECRET` is set and consistent
- Check token expiration in browser dev tools
- Confirm database user table exists

### Debug Mode

Enable detailed logging:
```env
NODE_ENV=development
DEBUG=zurdir:*
```

### Database Reset

**⚠️ WARNING: This will delete all data**
```sql
-- Connect to database
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Restart application to reinitialize
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

### Development Guidelines

- Follow TypeScript strict mode
- Use Tailwind CSS for styling
- Implement proper error handling
- Add JSDoc comments for functions
- Test on multiple screen sizes
- Verify security implementations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

**Documentation**: Check this README and inline code comments

**Issues**: Report bugs via GitHub Issues

**Community**: Join our Discord server (link coming soon)

**Professional Support**: Contact [your-email@domain.com]

## 🙏 Acknowledgments

- **Ollama**: For providing excellent open-source AI models
- **shadcn/ui**: Beautiful, accessible UI components
- **Next.js Team**: Amazing React framework
- **PostgreSQL**: Robust database with vector extensions
- **Render.com**: Simple, powerful deployment platform
- **Doctor Who**: Inspiration for the space-time aesthetic

## 🔮 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Voice chat with AI models
- [ ] Advanced file processing (OCR, analysis)
- [ ] Plugin system for custom integrations
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] WebRTC video chat capabilities
- [ ] Blockchain integration for decentralized features

### Performance Improvements
- [ ] Redis caching layer
- [ ] CDN for static assets
- [ ] Database query optimization
- [ ] WebSocket connection pooling
- [ ] Background job queue system

---

**Built with ❤️ and ⚡ by the ZURDIR Team**

*"Time isn't a straight line. It's all... wibbly wobbly... timey wimey... stuff."* - The Doctor













# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/zurdir

# JWT Configuration
JWT_SECRET=0239578650287437630983467 # Make sure to generate a secure key for production use
JWT_EXPIRES_IN="24h"  # 24 hours or "30d" for "Stay Logged In"


# Admin Configuration
ADMIN_PASSCODE=123456

# Sentry Configuration (Optional)
SENTRY_DSN=
SENTRY_AUTH_TOKEN=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
NEXT_PUBLIC_SENTRY_DSN=

# Ollama Configuration
OLLAMA_BASE_URL=https://ollama.cosmictools.us
OLLAMA_CUSTOM_URL=

# Encryption Key for Backups
ENCRYPTION_KEY=your-32-character-encryption-key-here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Server Configuration
PORT=3001
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE=100000000
ALLOWED_FILE_TYPES=*

# Web Search Configuration
ENABLE_WEB_SEARCH=true
BLOCKED_DOMAINS=