#!/bin/bash
# Backup original file
cp server/routes.ts server/routes.ts.bak

# Create a modified file with sed
sed -i 's/        \/\/ Import the pool from db.ts\n        const { pool } = require(.\/db.);/        \/\/ Use the already imported pool from the top of the file/g' server/routes.ts

# Use grep to confirm changes were made
echo "Changes applied. Checking for 'require('./db')' in the file:"
grep -n "require('./db')" server/routes.ts
