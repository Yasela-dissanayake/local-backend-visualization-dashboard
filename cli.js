#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const BackendAnalyzer = require('./scanner');

// Simple CLI argument parsing
const args = process.argv.slice(2);
const targetDir = args[0] || process.cwd();
const outputPath = path.join(targetDir, 'backend-analysis.html');

async function main() {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   Backend Analyzer - Developer Dashboard  ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  if (!fs.existsSync(targetDir)) {
    console.error('❌ Directory not found:', targetDir);
    process.exit(1);
  }

  try {
    const analyzer = new BackendAnalyzer(targetDir);
    const results = await analyzer.analyze();

    // Print summary to console
    printSummary(results);

    // Generate HTML dashboard
    const html = generateDashboard(results);
    fs.writeFileSync(outputPath, html);

    console.log('\n✅ Analysis complete!');
    console.log(`📊 Dashboard saved to: ${outputPath}`);
    console.log('\n💡 Open the file in your browser to view the interactive dashboard\n');

  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
    process.exit(1);
  }
}

function printSummary(results) {
  console.log('📋 Summary:');
  console.log(`   Project: ${results.projectInfo.name || 'Unknown'}`);
  console.log(`   Type: ${results.projectInfo.type || 'Unknown'}`);
  console.log(`   Routes: ${results.routes.length}`);
  console.log(`   Webhooks: ${results.webhooks.length}`);
  console.log(`   Cron Jobs: ${results.cronJobs.length}`);
  console.log(`   External Services: ${results.externalAPIs.length}`);
}

function generateDashboard(results) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Backend Analysis - ${results.projectInfo.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      padding: 2rem;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
    }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .subtitle { opacity: 0.9; font-size: 1rem; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: #1e293b;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    .stat-number { font-size: 2rem; font-weight: bold; color: #667eea; }
    .stat-label { color: #94a3b8; margin-top: 0.5rem; }
    .section {
      background: #1e293b;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }
    .section h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #667eea;
    }
    .grid {
      display: grid;
      gap: 0.75rem;
    }
    .item {
      background: #0f172a;
      padding: 1rem;
      border-radius: 6px;
      border-left: 3px solid #475569;
    }
    .item:hover { border-left-color: #667eea; }
    .method {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: bold;
      margin-right: 0.5rem;
    }
    .GET { background: #10b981; color: white; }
    .POST { background: #3b82f6; color: white; }
    .PUT { background: #f59e0b; color: white; }
    .DELETE { background: #ef4444; color: white; }
    .PATCH { background: #8b5cf6; color: white; }
    .path { font-family: 'Monaco', 'Courier New', monospace; color: #e2e8f0; }
    .file { color: #94a3b8; font-size: 0.875rem; margin-top: 0.25rem; }
    .empty { color: #64748b; font-style: italic; }
    .badge {
      display: inline-block;
      background: #334155;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      margin-right: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🔍 Backend Analysis Dashboard</h1>
      <div class="subtitle">
        ${results.projectInfo.name || 'Project'} · ${results.projectInfo.type || 'Unknown Type'}
      </div>
    </header>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-number">${results.routes.length}</div>
        <div class="stat-label">API Routes</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${results.webhooks.length}</div>
        <div class="stat-label">Webhooks</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${results.cronJobs.length}</div>
        <div class="stat-label">Cron Jobs</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${results.externalAPIs.length}</div>
        <div class="stat-label">External Services</div>
      </div>
    </div>

    <div class="section">
      <h2>🛣️ API Routes</h2>
      <div class="grid">
        ${results.routes.length ? results.routes.map(route => `
          <div class="item">
            <span class="method ${route.method}">${route.method}</span>
            <span class="path">${route.path}</span>
            <div class="file">📁 ${route.file}</div>
          </div>
        `).join('') : '<div class="empty">No routes detected</div>'}
      </div>
    </div>

    <div class="section">
      <h2>🪝 Webhooks</h2>
      <div class="grid">
        ${results.webhooks.length ? results.webhooks.map(hook => `
          <div class="item">
            <span class="method ${hook.method}">${hook.method}</span>
            <span class="path">${hook.path}</span>
            <div class="file">📁 ${hook.file}</div>
          </div>
        `).join('') : '<div class="empty">No webhooks detected</div>'}
      </div>
    </div>

    <div class="section">
      <h2>⏰ Cron Jobs</h2>
      <div class="grid">
        ${results.cronJobs.length ? results.cronJobs.map(cron => `
          <div class="item">
            <span class="path">${cron.schedule}</span>
            <div class="file">📁 ${cron.file}</div>
          </div>
        `).join('') : '<div class="empty">No cron jobs detected</div>'}
      </div>
    </div>

    <div class="section">
      <h2>🌐 External Services & APIs</h2>
      <div class="grid">
        ${results.externalAPIs.length ? results.externalAPIs.map(api => `
          <div class="item">
            <span class="path">${api.service || api.url}</span>
            ${api.type ? `<span class="badge">${api.type}</span>` : ''}
            <div class="file">📁 ${api.file}</div>
          </div>
        `).join('') : '<div class="empty">No external services detected</div>'}
      </div>
    </div>

    ${results.projectInfo.dependencies ? `
      <div class="section">
        <h2>📦 Key Dependencies</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          ${results.projectInfo.dependencies.slice(0, 20).map(dep => 
            `<span class="badge">${dep}</span>`
          ).join('')}
        </div>
      </div>
    ` : ''}
  </div>
</body>
</html>`;
}

main();