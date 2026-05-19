const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// MySQL error codes that are safe to ignore (already-exists scenarios)
const IGNORABLE_ERRORS = new Set([
  1050, // ER_TABLE_EXISTS_ERROR
  1061, // ER_DUP_KEYNAME
  1068, // ER_MULTIPLE_PRI_KEY
]);

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

const run = async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'railgo_db',
    multipleStatements: false,
  });

  try {
    console.log('🔗 Connected to database');

    // Create migrations tracking table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get already-applied migrations
    const [applied] = await conn.execute('SELECT filename FROM _migrations');
    const appliedSet = new Set(applied.map(r => r.filename));

    // Read migration files sorted by name (skip directories)
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql') && fs.statSync(path.join(MIGRATIONS_DIR, f)).isFile())
      .sort();

    if (files.length === 0) {
      console.log('⚠️  No migration files found in', MIGRATIONS_DIR);
      return;
    }

    let ranCount = 0;

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`  ⏭  ${file} (already applied)`);
        continue;
      }

      console.log(`  ▶  Running ${file}...`);

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

      // Strip single-line comments, then split on semicolons
      const stripped = sql
        .split('\n')
        .map(line => {
          const idx = line.indexOf('--');
          return idx >= 0 ? line.slice(0, idx) : line;
        })
        .join('\n');

      const statements = stripped
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const stmt of statements) {
        try {
          await conn.execute(stmt);
        } catch (err) {
          if (IGNORABLE_ERRORS.has(err.errno)) {
            console.log(`     ↳ skipped (${err.message})`);
          } else {
            throw new Error(`Failed on statement in ${file}:\n${stmt}\n\nError: ${err.message}`);
          }
        }
      }

      await conn.execute('INSERT INTO _migrations (filename) VALUES (?)', [file]);
      console.log(`  ✅ ${file} applied`);
      ranCount++;
    }

    if (ranCount === 0) {
      console.log('\n✨ Database is up to date — no migrations to run.');
    } else {
      console.log(`\n🎉 ${ranCount} migration(s) applied successfully.`);
    }

  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
};

run();
