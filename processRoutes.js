import fs from 'fs';

// Read the file
const routesFile = fs.readFileSync('server/routes.ts', 'utf8');

// Find all blocks of code that build connection strings
const pattern = /const host = config.host \|\| 'localhost';\s*const port = config.port \|\| config.dbPort \|\| 5432;\s*const database = config.database;\s*(?:const user = config.user|const user = config.user \|\| config.username);\s*const password = config.password;\s*\s*if \(!database \|\| !user\) \{\s*return res.status\(400\).json\(\{ \s*message: "Connection configuration is incomplete. Database and user are required."\s*\}\);\s*\}\s*\s*connectionString = `postgres:\/\/\${user}:\${password}@\${host}:\${port}\/\${database}`;/g;

// If the pattern is too complex, we can use a simpler one
const simplePattern = /const host = config\.host.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*connectionString = `postgres/g;

// Replace with our helper function
let modifiedContent = routesFile.replace(/const host = config\.host[\s\S]*?connectionString = `postgres:\/\/\${user}:\${password}@\${host}:\${port}\/\${database}`;/g, 
`const connStr = buildPgConnectionString(config);
          if (!connStr) {
            return res.status(400).json({ 
              message: "Connection configuration is incomplete. Database and user/username are required."
            });
          }
          
          connectionString = connStr;`);

// Save the modified content
fs.writeFileSync('server/routes.processed.ts', modifiedContent);

console.log('File processed and saved as server/routes.processed.ts');