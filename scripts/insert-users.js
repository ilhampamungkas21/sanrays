/**
 * Script untuk insert user ke database
 * Run: node scripts/insert-users.js
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  // Koneksi database
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'sanrays_event',
  });

  console.log('Connected to database');

  const password = 'admin123';
  const passwordHash = await bcrypt.hash(password, 12);

  console.log('Password hash:', passwordHash);

  const users = [
    { name: 'Ahmad Super Admin', email: 'ahmad@sanrays.com', role: 'super_admin' },
    { name: 'Sarah Admin', email: 'sarah@sanrays.com', role: 'admin' },
    { name: 'Budi Admin', email: 'budi@sanrays.com', role: 'admin' },
    { name: 'Diana Event Manager', email: 'diana@sanrays.com', role: 'event_manager' },
    { name: 'Fitri Finance', email: 'fitri@sanrays.com', role: 'finance' },
    { name: 'Gunawan Finance', email: 'gunawan@sanrays.com', role: 'finance' },
    { name: 'Irwan Stakeholder', email: 'irwan@sanrays.com', role: 'stakeholder' },
  ];

  for (const user of users) {
    // Check if user exists
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [user.email]
    );

    if (existing.length > 0) {
      // Update password
      await connection.execute(
        'UPDATE users SET password_hash = ?, name = ?, role = ? WHERE email = ?',
        [passwordHash, user.name, user.role, user.email]
      );
      console.log(`Updated: ${user.email}`);
    } else {
      // Insert new
      const id = require('uuid').v4();
      await connection.execute(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [id, user.name, user.email, passwordHash, user.role]
      );
      console.log(`Inserted: ${user.email}`);
    }
  }

  console.log('\nDone! All users now have password: admin123');

  await connection.end();
}

main().catch(console.error);
