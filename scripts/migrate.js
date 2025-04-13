#!/usr/bin/env node

/**
 * This script runs database migrations using the migrations.ts file.
 * It initializes the database and creates initial users.
 */

import { exec } from 'child_process';

console.log('Running database migrations...');

// Execute the migration file
exec('npx tsx app/lib/db/migrations.ts', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing migration: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  
  console.log(stdout);
  console.log('Database migrations completed successfully');
});