import pool from '../db/connection.js';

// Get all pages (Admin List)
export const getAllPages = async (req, res) => {
  try {
    const [pages] = await pool.query('SELECT id, title, slug, status, template, created_at, updated_at FROM pages ORDER BY updated_at DESC');
    res.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
};

// Get single page by slug (Frontend dynamic rendering or Admin edit)
export const getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const [pages] = await pool.query('SELECT * FROM pages WHERE slug = ?', [slug]);
    
    if (pages.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const page = pages[0];
    if (typeof page.blocks_json === 'string') {
      try {
        page.blocks_json = JSON.parse(page.blocks_json);
      } catch (e) {}
    }

    res.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
};

// Create new page (No-Code Page Creator - Super Admin Only)
export const createPage = async (req, res) => {
  try {
    if (req.user?.role !== 'superadmin') {
      return res.status(403).json({ error: 'Permission denied: Only Super Admin can create new pages.' });
    }

    const { title, slug, meta_title, meta_description, status, template, blocks } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ error: 'Title and Slug are required' });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-/]/g, '-').replace(/-+/g, '-');
    const blocksJson = JSON.stringify(blocks || []);

    const [result] = await pool.query(
      `INSERT INTO pages (title, slug, meta_title, meta_description, status, template, blocks_json) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        cleanSlug,
        meta_title || title,
        meta_description || '',
        status || 'draft',
        template || 'builder',
        blocksJson
      ]
    );

    res.status(201).json({
      message: 'Page created successfully',
      id: result.insertId,
      slug: cleanSlug
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'A page with this URL slug already exists.' });
    }
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
};

// Update existing page
export const updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, meta_title, meta_description, status, template, blocks } = req.body;

    const [existing] = await pool.query('SELECT id FROM pages WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const cleanSlug = slug ? slug.toLowerCase().trim().replace(/[^a-z0-9-/]/g, '-').replace(/-+/g, '-') : undefined;
    const blocksJson = blocks ? JSON.stringify(blocks) : undefined;

    const updates = [];
    const params = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (cleanSlug !== undefined) { updates.push('slug = ?'); params.push(cleanSlug); }
    if (meta_title !== undefined) { updates.push('meta_title = ?'); params.push(meta_title); }
    if (meta_description !== undefined) { updates.push('meta_description = ?'); params.push(meta_description); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (template !== undefined) { updates.push('template = ?'); params.push(template); }
    if (blocksJson !== undefined) { updates.push('blocks_json = ?'); params.push(blocksJson); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    await pool.query(`UPDATE pages SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ message: 'Page updated successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Another page is already using this URL slug.' });
    }
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Failed to update page' });
  }
};

// Delete page (Super Admin Only)
export const deletePage = async (req, res) => {
  try {
    if (req.user?.role !== 'superadmin') {
      return res.status(403).json({ error: 'Permission denied: Only Super Admin can delete pages.' });
    }

    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM pages WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Failed to delete page' });
  }
};
