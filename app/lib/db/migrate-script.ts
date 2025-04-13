// Import the migration function
import { runMigrations } from './migrations';

// Run migrations
runMigrations()
  .then((success) => {
    if (success) {
      console.log('✅ Migrations completed successfully');
    } else {
      console.error('❌ Migrations failed');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Error running migrations:', error);
    process.exit(1);
  });