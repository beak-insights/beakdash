import fs from 'fs';

const routesPath = 'server/routes.ts';
const routesContent = fs.readFileSync(routesPath, 'utf8');

// Pattern to match for connection string creation blocks
const connectionStringPattern = /const host = config\.host \|\| 'localhost';\s+const port = config\.port \|\| [^;]+;\s+const database = config\.database;\s+const user = config\.user[^;]*;\s+const password = config\.password;\s+\s+if \(!database \|\| !user\) \{\s+return res\.status\(400\)\.json\([\s\S]+?\);\s+\}\s+\s+connectionString = `postgres:\/\/\${user}:\${password}@\${host}:\${port}\/\${database}`;/g;

// New replacement text
const replacementText = `const connStr = buildPgConnectionString(config);
          if (!connStr) {
            return res.status(400).json({ 
              message: "Connection configuration is incomplete. Database and user/username are required."
            });
          }
          
          connectionString = connStr;`;

// Perform global replacement
const updatedContent = routesContent.replace(connectionStringPattern, replacementText);

// Write the updated content
fs.writeFileSync(`${routesPath}.updated`, updatedContent);

// Count replacements
const originalMatches = routesContent.match(connectionStringPattern);
console.log(`Found and replaced ${originalMatches ? originalMatches.length : 0} occurrences.`);
console.log('File updated and saved as server/routes.ts.updated');