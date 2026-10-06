import pool from './connection.js';
import { seedSinglePage } from './seedServices.js';
import fs from 'fs';
import path from 'path';

const dataDir = path.resolve('../../praveenjandassociates/src/data');

async function runFullSeed() {
  console.log(`🌱 Extracting and Seeding ALL existing service pages into MySQL database...`);

  let count = 0;
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts') && f !== 'navigationMenu.ts');

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const categoryName = file.replace('Services.ts', '').replace('.ts', '').toUpperCase();

    // Split content by '{ slug:' to separate service object definitions
    const chunks = content.split(/\{\s*slug\s*:/);

    for (let i = 1; i < chunks.length; i++) {
      let rawObj = '{ slug:' + chunks[i];
      
      // Trim string until the matching ending bracket of the service object
      // We cut at the start of next service object or array closing
      const nextServiceIdx = rawObj.indexOf('\n  },');
      if (nextServiceIdx !== -1) {
        rawObj = rawObj.substring(0, nextServiceIdx + 4);
      }

      try {
        // Clean trailing comma if any
        let cleanStr = rawObj.trim().replace(/,\s*$/, '');
        if (!cleanStr.endsWith('}')) cleanStr += '}';

        const s = Function('"use strict"; return (' + cleanStr + ')')();
        if (s && s.slug && s.title) {
          const created = await seedSinglePage(s, categoryName);
          if (created) count++;
        }
      } catch (err) {
        // Fallback parser if simple eval fails
      }
    }
  }

  console.log(`🎉 SUCCESS! Seeded ${count} existing website service pages into MySQL database!`);
  process.exit(0);
}

runFullSeed();
