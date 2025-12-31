const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

class BackendAnalyzer {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.results = {
      routes: [],
      cronJobs: [],
      webhooks: [],
      externalAPIs: [],
      databases: [],
      projectInfo: {}
    };
  }

  // Main analysis entry point
  async analyze() {
    console.log('🔍 Scanning backend project...\n');
    
    this.detectProjectType();
    await this.scanDirectory(this.rootDir);
    this.categorizeFindings();
    
    return this.results;
  }

  // Detect if Node.js or Go project
  detectProjectType() {
    const packageJsonPath = path.join(this.rootDir, 'package.json');
    const goModPath = path.join(this.rootDir, 'go.mod');

    if (fs.existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      this.results.projectInfo = {
        type: 'Node.js',
        name: pkg.name,
        version: pkg.version,
        dependencies: Object.keys(pkg.dependencies || {})
      };
    } else if (fs.existsSync(goModPath)) {
      this.results.projectInfo = {
        type: 'Go',
        name: 'Go Project'
      };
    }
  }

  // Recursively scan directory
  async scanDirectory(dir, depth = 0) {
    if (depth > 10) return; // Prevent infinite recursion
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip node_modules, .git, etc.
      if (this.shouldSkip(entry.name)) continue;

      if (entry.isDirectory()) {
        await this.scanDirectory(fullPath, depth + 1);
      } else if (entry.isFile()) {
        await this.analyzeFile(fullPath);
      }
    }
  }

  shouldSkip(name) {
    const skipList = ['node_modules', '.git', 'dist', 'build', 'coverage', '.next'];
    return skipList.includes(name);
  }

  // Analyze individual file
  async analyzeFile(filePath) {
    const ext = path.extname(filePath);
    
    if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
      await this.analyzeJSFile(filePath);
    } else if (ext === '.go') {
      await this.analyzeGoFile(filePath);
    }
  }

  // Analyze JavaScript/TypeScript files
  async analyzeJSFile(filePath) {
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx', 'decorators-legacy']
      });

      const relativePath = path.relative(this.rootDir, filePath);

      traverse(ast, {
        // Detect Express routes: app.get(), router.post(), etc.
        CallExpression: (path) => {
          const { callee, arguments: args } = path.node;
          
          // Express/Fastify routes
          if (callee.type === 'MemberExpression') {
            const method = callee.property.name;
            const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'all'];
            
            if (httpMethods.includes(method) && args.length >= 1) {
              const route = this.extractStringValue(args[0]);
              if (route) {
                this.results.routes.push({
                  method: method.toUpperCase(),
                  path: route,
                  file: relativePath,
                  isWebhook: this.isWebhookRoute(route)
                });
              }
            }
          }

          // Cron job detection
          if (callee.type === 'MemberExpression' && 
              callee.property.name === 'schedule') {
            const schedule = this.extractStringValue(args[0]);
            if (schedule) {
              this.results.cronJobs.push({
                schedule,
                file: relativePath
              });
            }
          }

          // External API calls (fetch, axios)
          if (callee.name === 'fetch' || 
              (callee.object && callee.object.name === 'axios')) {
            const url = this.extractStringValue(args[0]);
            if (url && this.isExternalURL(url)) {
              this.results.externalAPIs.push({
                url,
                file: relativePath
              });
            }
          }
        },

        // Import detection for external services
        ImportDeclaration: (path) => {
          const source = path.node.source.value;
          this.detectExternalService(source, relativePath);
        }
      });

    } catch (error) {
      // Skip files with parse errors
      console.log(`⚠️  Could not parse: ${filePath}`);
    }
  }

  // Basic Go file analysis (simplified)
  async analyzeGoFile(filePath) {
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(this.rootDir, filePath);

      // Simple regex patterns for Go
      const routePatterns = [
        /(?:router|mux|engine)\.(?:GET|POST|PUT|DELETE|PATCH)\s*\(\s*["']([^"']+)["']/g,
        /Handle\s*\(\s*["']([^"']+)["']/g
      ];

      for (const pattern of routePatterns) {
        let match;
        while ((match = pattern.exec(code)) !== null) {
          this.results.routes.push({
            method: 'UNKNOWN',
            path: match[1],
            file: relativePath,
            isWebhook: this.isWebhookRoute(match[1])
          });
        }
      }

    } catch (error) {
      console.log(`⚠️  Could not read: ${filePath}`);
    }
  }

  // Helper: Extract string value from AST node
  extractStringValue(node) {
    if (!node) return null;
    if (node.type === 'StringLiteral') return node.value;
    if (node.type === 'TemplateLiteral' && node.quasis.length === 1) {
      return node.quasis[0].value.raw;
    }
    return null;
  }

  // Detect if route is likely a webhook
  isWebhookRoute(route) {
    const webhookKeywords = ['webhook', 'callback', 'notify', 'hook'];
    return webhookKeywords.some(kw => route.toLowerCase().includes(kw));
  }

  // Check if URL is external
  isExternalURL(url) {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  // Detect external services from imports
  detectExternalService(importPath, file) {
    const services = {
      'stripe': 'Stripe (Payments)',
      '@stripe/stripe-js': 'Stripe (Payments)',
      'twilio': 'Twilio (SMS/Voice)',
      'aws-sdk': 'AWS Services',
      '@aws-sdk': 'AWS Services',
      'firebase': 'Firebase',
      'firebase-admin': 'Firebase Admin',
      '@sendgrid/mail': 'SendGrid (Email)',
      'nodemailer': 'Email Service',
      'pg': 'PostgreSQL',
      'mysql': 'MySQL',
      'mongodb': 'MongoDB',
      'mongoose': 'MongoDB (Mongoose)',
      'redis': 'Redis',
      'prisma': 'Prisma ORM'
    };

    for (const [key, name] of Object.entries(services)) {
      if (importPath.includes(key)) {
        if (!this.results.externalAPIs.find(api => api.service === name)) {
          this.results.externalAPIs.push({
            service: name,
            file,
            type: 'SDK'
          });
        }
      }
    }
  }

  // Categorize and deduplicate findings
  categorizeFindings() {
    // Separate webhooks from regular routes
    this.results.webhooks = this.results.routes.filter(r => r.isWebhook);
    this.results.routes = this.results.routes.filter(r => !r.isWebhook);

    // Deduplicate external APIs
    const seen = new Set();
    this.results.externalAPIs = this.results.externalAPIs.filter(api => {
      const key = api.service || api.url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

module.exports = BackendAnalyzer;