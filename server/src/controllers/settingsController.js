import pool from '../db/connection.js';

export const getSettings = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value, category FROM global_settings');
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch global settings' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settingsObj = req.body; // e.g. { phone: '+91 9876543210', email: 'info@praveenj.com' }
    
    for (const [key, value] of Object.entries(settingsObj)) {
      await pool.query(
        `INSERT INTO global_settings (setting_key, setting_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, String(value)]
      );
    }

    res.json({ message: 'Global settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update global settings' });
  }
};
