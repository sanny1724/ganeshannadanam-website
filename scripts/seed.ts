import { seedDatabase } from '../server/src/db/seeder.js';

seedDatabase()
  .then(() => {
    console.log('✨ Seed script completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
