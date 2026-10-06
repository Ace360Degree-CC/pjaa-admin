import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306');
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'pjaa_cms';

  console.log(`🔌 Connecting to MySQL server at ${host}:${port}...`);

  try {
    // 1. Create connection without database name to ensure DB exists
    const rootConn = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✅ Database '${dbName}' verified/created.`);
    await rootConn.end();

    // 2. Connect to the specific database
    const conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database: dbName,
    });

    // 3. Create Users Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Create Pages Table (For Dynamic No-Code Page Builder)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        meta_title VARCHAR(255),
        meta_description TEXT,
        status VARCHAR(50) DEFAULT 'draft',
        template VARCHAR(50) DEFAULT 'builder',
        blocks_json JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Create Enquiries / Leads Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        service_name VARCHAR(255),
        message TEXT,
        source_type VARCHAR(100) DEFAULT 'website',
        form_name VARCHAR(100),
        cta_name VARCHAR(100),
        cta_location VARCHAR(100),
        page_title VARCHAR(255),
        page_url VARCHAR(500),
        page_path VARCHAR(255),
        utm_source VARCHAR(100),
        utm_medium VARCHAR(100),
        utm_campaign VARCHAR(100),
        ip_address VARCHAR(50),
        user_agent TEXT,
        status VARCHAR(50) DEFAULT 'new',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Create Blogs Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        category VARCHAR(100) DEFAULT 'General',
        read_time VARCHAR(50) DEFAULT '5 mins',
        author VARCHAR(100) DEFAULT 'CA Praveen Jain',
        excerpt TEXT,
        quick_answer TEXT,
        content_json JSON,
        seo_title VARCHAR(255),
        meta_description TEXT,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Create Navigation Menus Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS navigation_menus (
        id INT AUTO_INCREMENT PRIMARY KEY,
        menu_key VARCHAR(100) NOT NULL UNIQUE,
        menu_items_json JSON,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 8. Create Global Settings Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS global_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT,
        category VARCHAR(50) DEFAULT 'general',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log(`✅ All MySQL database tables created successfully.`);

    // 9. Seed Default Admin User if not exists
    const [adminRows] = await conn.query(`SELECT id FROM users WHERE email = 'admin@praveenj.com'`);
    if (adminRows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await conn.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        ['Admin', 'admin@praveenj.com', hashedPassword, 'admin']
      );
      console.log(`👤 Created default admin user: admin@praveenj.com / admin123`);
    } else {
      await conn.query(`UPDATE users SET role = 'admin' WHERE email = 'admin@praveenj.com'`);
    }

    // 10. Seed Default Super Admin User if not exists
    const [superadminRows] = await conn.query(`SELECT id FROM users WHERE email = 'superadmin@praveenj.com'`);
    if (superadminRows.length === 0) {
      const hashedPassword = await bcrypt.hash('superadmin123', 10);
      await conn.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        ['Super Admin', 'superadmin@praveenj.com', hashedPassword, 'superadmin']
      );
      console.log(`⚡ Created default superadmin user: superadmin@praveenj.com / superadmin123`);
    }

    // 10. Seed Sample Dynamic Page
    const [pageRows] = await conn.query(`SELECT id FROM pages WHERE slug = 'sample-dynamic-service'`);
    if (pageRows.length === 0) {
      const sampleBlocks = [
        {
          id: 'b-1',
          type: 'hero',
          data: {
            badge: '🔥 2026 Special Offer',
            title: 'Specialized CA Consultation & Business Setup',
            subtitle: 'Get expert guidance on Tax Planning, GST Compliance, and Corporate Registrations with 100% Online Processing.',
            primaryCtaText: 'Book Free Consultation',
            secondaryCtaText: 'Explore Services',
            showForm: true,
          }
        },
        {
          id: 'b-2',
          type: 'features',
          data: {
            heading: 'Why Work With Praveen J & Associates?',
            subtitle: 'Over 15+ years of chartered accountancy expertise delivering fast, transparent results.',
            items: [
              { title: '100% Digital & Paperless', description: 'Complete your filings remotely without visiting physical offices.' },
              { title: 'Transparent Flat Pricing', description: 'No hidden fees or unexpected billings.' },
              { title: 'Dedicated CA Manager', description: 'Direct communication with seasoned tax professionals.' }
            ]
          }
        },
        {
          id: 'b-3',
          type: 'faqs',
          data: {
            heading: 'Frequently Asked Questions',
            faqs: [
              { q: 'How fast can a new company be registered?', a: 'Typically 3–5 working days once all director documents are submitted.' },
              { q: 'Is physical presence required?', a: 'No, the entire process is completed online via digital signature.' }
            ]
          }
        }
      ];

      await conn.query(
        `INSERT INTO pages (title, slug, meta_title, meta_description, status, template, blocks_json) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          'Specialized CA Consultation & Business Setup',
          'sample-dynamic-service',
          'CA Consultation & Setup Services — Praveen J & Associates',
          'Expert CA advice for business setup, GST, and tax compliance.',
          'published',
          'builder',
          JSON.stringify(sampleBlocks)
        ]
      );
      console.log(`📄 Created sample dynamic CMS page: /sample-dynamic-service`);
    }

    await conn.end();
    console.log(`🎉 Database initialization complete!`);
  } catch (error) {
    console.error(`❌ Database Initialization Error:`, error);
    process.exit(1);
  }
}

initDatabase();
