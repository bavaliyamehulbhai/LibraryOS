const fs = require('fs');
const path = require('path');

const clientSrcPath = path.join(__dirname, '..', '..', 'client', 'src');
const serverRoutesPath = path.join(__dirname, '..', 'src', 'routes');
const appJsPath = path.join(__dirname, '..', 'src', 'app.js');
const reportPath = 'C:\\Users\\Mehul\\.gemini\\antigravity-ide\\brain\\99f5100b-a161-439e-9e90-7fa3e13ba5aa\\api_audit_report.md';

const frontendApis = new Set();
const backendRoutes = new Map();

// Helper to recursively get files
function getFiles(dir, ext) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath, ext));
    } else if (fullPath.endsWith(ext) || ext === '*') {
      results.push(fullPath);
    }
  });
  return results;
}

// 1. Scan frontend for API calls
const clientFiles = [...getFiles(clientSrcPath, '.js'), ...getFiles(clientSrcPath, '.jsx')];
const frontendRegex = /api\.(get|post|put|delete|patch)\(\s*[`'"](\/v1\/[^`'"?]+)/g;

clientFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = frontendRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    let route = match[2];
    // Remove trailing slashes and variable parts for grouping
    route = route.replace(/\/\${[^}]+}/g, '/:id');
    frontendApis.add(`${method} ${route}`);
  }
});

// 2. Scan app.js to map routers
const routerMap = {}; // { 'routes/userRoutes': '/api/v1/users' }
const appContent = fs.readFileSync(appJsPath, 'utf-8');
const mountRegex = /app\.use\(['"](\/api\/v1\/[^'"]+)['"],\s*require\(['"]\.\/(routes\/[^'"]+)['"]\)/g;
let m;
while ((m = mountRegex.exec(appContent)) !== null) {
  const prefix = m[1];
  const file = m[2]; // e.g. routes/authRoutes
  routerMap[file] = prefix;
}

// 3. Scan server routes
const serverFiles = getFiles(serverRoutesPath, '.js');
const backendRegex = /router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/g;

serverFiles.forEach(file => {
  const baseName = 'routes/' + path.basename(file, '.js');
  const content = fs.readFileSync(file, 'utf-8');
  let prefix = routerMap[baseName] || '';
  
  // also check if file is routes/inventoryRoutes.js -> routerMap['routes/inventoryRoutes']
  
  let match;
  while ((match = backendRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    let route = match[2];
    if (route === '/') route = '';
    
    // Normalize path params like /:id
    const fullRoute = prefix + route;
    backendRoutes.set(`${method} ${fullRoute}`, file);
  }
});

// 4. Compare
const missingInBackend = [];
const implementedInBackend = [];

frontendApis.forEach(api => {
  // Rough match because frontend might have /v1/users/123 and backend has /api/v1/users/:id
  // We'll just do a loose check. If the frontend route starts with /v1, we prefix with /api
  let normalizedApi = api.replace(/ (GET|POST|PUT|DELETE|PATCH) \/v1/, ' $1 /api/v1');
  
  let found = false;
  for (const [backendRoute, file] of backendRoutes.entries()) {
    // Convert backend /:id to regex
    const regexStr = backendRoute.replace(/:[^\/]+/g, '[^/]+');
    const regex = new RegExp('^' + regexStr + '$');
    
    if (regex.test(normalizedApi)) {
      found = true;
      implementedInBackend.push({ frontend: normalizedApi, backend: backendRoute, file });
      break;
    }
  }
  
  if (!found) {
    missingInBackend.push(normalizedApi);
  }
});

// Write Markdown Report
let md = `# Comprehensive API Audit Report\n\n`;
md += `This report compares all API requests made in the React frontend against the routes defined in the Node.js Express backend.\n\n`;

md += `## ❌ Missing Backend APIs\n`;
md += `The frontend expects these endpoints, but they are not implemented in the backend router:\n\n`;
if (missingInBackend.length === 0) {
  md += `✅ *All frontend APIs seem to have a backend endpoint!* \n\n`;
} else {
  missingInBackend.sort().forEach(api => {
    md += `- \`${api}\`\n`;
  });
}

md += `\n\n## ✅ Implemented APIs (Sample)\n`;
md += `Successfully matched ${implementedInBackend.length} API calls.\n`;

fs.writeFileSync(reportPath, md);
console.log('API Audit Report generated successfully at: ' + reportPath);
