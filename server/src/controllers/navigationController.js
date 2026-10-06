import pool from '../db/connection.js';

export const getNavigation = async (req, res) => {
  try {
    const { key } = req.params;
    const [rows] = await pool.query('SELECT * FROM navigation_menus WHERE menu_key = ?', [key]);
    if (rows.length === 0) {
      return res.json({ menu_key: key, menu_items: [] });
    }
    const menu = rows[0];
    let items = [];
    if (typeof menu.menu_items_json === 'string') {
      try { items = JSON.parse(menu.menu_items_json); } catch(e){}
    } else if (Array.isArray(menu.menu_items_json)) {
      items = menu.menu_items_json;
    }
    res.json({ menu_key: key, menu_items: items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch navigation menu' });
  }
};

export const updateNavigation = async (req, res) => {
  try {
    const { key } = req.params;
    const { menu_items } = req.body;
    const jsonStr = JSON.stringify(menu_items || []);

    await pool.query(
      `INSERT INTO navigation_menus (menu_key, menu_items_json) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE menu_items_json = VALUES(menu_items_json)`,
      [key, jsonStr]
    );

    res.json({ message: 'Navigation menu updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update navigation menu' });
  }
};
