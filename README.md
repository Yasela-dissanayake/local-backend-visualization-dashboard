# 🔍 Backend Analyzer

> Instantly understand any backend codebase. Scan Node.js or Go projects to visualize routes, webhooks, cron jobs, and external integrations.

## The Problem

Every time you join a new project or explore an unfamiliar codebase:
- ❓ What API endpoints exist?
- ❓ What external services are we using?
- ❓ Are there any webhooks or scheduled jobs?
- ❓ How is everything connected?

**Backend Analyzer solves this in seconds.**

## Installation

```bash
# Install globally
npm install -g backend-analyzer

# Or use with npx (no installation needed)
npx backend-analyzer
```

## Usage

### Basic Usage
```bash
# Analyze current directory
backend-analyzer

# Analyze specific project
backend-analyzer /path/to/your/project

# Short alias
ba /path/to/project
```

This will:
1. Scan your backend codebase
2. Detect routes, webhooks, cron jobs, and external APIs
3. Generate an interactive HTML dashboard
4. Save it as `backend-analysis.html` in your project

### Example Output

```
🔍 Scanning backend project...

📋 Summary:
   Project: my-awesome-api
   Type: Node.js
   Routes: 24
   Webhooks: 3
   Cron Jobs: 2
   External Services: 5

✅ Analysis complete!
📊 Dashboard saved to: backend-analysis.html
```

## What It Detects

### ✅ Supported Frameworks

**Node.js:**
- Express
- Fastify
- NestJS
- Koa

**Go:**
- Gin
- Echo
- Chi
- net/http

### 📊 What Gets Analyzed

- **API Routes**: All HTTP endpoints (GET, POST, PUT, DELETE, etc.)
- **Webhooks**: Routes that look like webhooks
- **Cron Jobs**: Scheduled tasks using popular libraries
- **External APIs**: Fetch calls, axios requests, external URLs
- **External Services**: Stripe, Twilio, AWS, Firebase, SendGrid, etc.
- **Databases**: PostgreSQL, MySQL, MongoDB, Redis
- **Dependencies**: All npm packages used

## How It Works

Backend Analyzer uses **static code analysis**:
1. Parses your code into an Abstract Syntax Tree (AST)
2. Identifies routing patterns, HTTP methods, and function calls
3. Detects external service imports and API calls
4. Generates a beautiful, interactive dashboard

No code execution. No security risks. Pure static analysis.

## Use Cases

### 👨‍💼 For New Team Members
- Understand the architecture on day 1
- See all endpoints without digging through files
- Identify external dependencies instantly

### 🚀 For Startups
- Quick architecture overview for investors
- Onboarding documentation that stays up-to-date
- Technical debt visibility

### 📚 For Documentation
- Auto-generate API endpoint lists
- Keep architecture docs current
- Export for presentations

### 🔍 For Code Reviews
- Spot unused routes
- Identify potential webhook issues
- See all external dependencies

## Example Dashboard

The generated HTML dashboard includes:

- **Stats Overview**: Quick metrics (routes, webhooks, cron jobs)
- **API Routes Section**: All endpoints with methods and file locations
- **Webhooks Section**: Detected webhook endpoints
- **Cron Jobs Section**: Scheduled tasks with their schedules
- **External Services**: All third-party integrations
- **Dependencies**: Key npm packages

## Roadmap

- [ ] Interactive architecture graph
- [ ] Database schema detection
- [ ] Docker/Kubernetes config parsing
- [ ] Middleware and authentication layer detection
- [ ] Export to Markdown/JSON
- [ ] VS Code extension

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## Development

```bash
# Clone the repo
git clone https://github.com/yourusername/backend-analyzer.git
cd backend-analyzer

# Install dependencies
npm install

# Test locally
node cli.js /path/to/test/project
```

## License

MIT © [Your Name]

## Credits

Built by developers, for developers. Created to solve the onboarding pain we all experience.

---

**Found this useful?** Star the repo ⭐ and share with your team!