import pool from '../db/connection.js';

export const getAllBlogs = async (req, res) => {
  try {
    const [blogs] = await pool.query('SELECT id, title, slug, category, read_time, author, status, created_at, updated_at FROM blogs ORDER BY updated_at DESC');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const [blogs] = await pool.query('SELECT * FROM blogs WHERE slug = ?', [slug]);
    if (blogs.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    const blog = blogs[0];
    if (typeof blog.content_json === 'string') {
      try { blog.content_json = JSON.parse(blog.content_json); } catch(e){}
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
};

export const createBlog = async (req, res) => {
  try {
    const { title, slug, category, read_time, author, excerpt, quick_answer, content_json, seo_title, meta_description, status } = req.body;
    if (!title || !slug) {
      return res.status(400).json({ error: 'Title and Slug are required' });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-/]/g, '-').replace(/-+/g, '-');
    const content = typeof content_json === 'object' ? JSON.stringify(content_json) : (content_json || '[]');

    const [result] = await pool.query(
      `INSERT INTO blogs (title, slug, category, read_time, author, excerpt, quick_answer, content_json, seo_title, meta_description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, cleanSlug, category || 'General', read_time || '5 mins', author || 'CA Praveen Jain',
        excerpt || '', quick_answer || '', content, seo_title || title, meta_description || '', status || 'draft'
      ]
    );

    res.status(201).json({ message: 'Blog created successfully', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'A blog post with this slug already exists.' });
    }
    res.status(500).json({ error: 'Failed to create blog post' });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, category, read_time, author, excerpt, quick_answer, content_json, seo_title, meta_description, status } = req.body;

    const cleanSlug = slug ? slug.toLowerCase().trim().replace(/[^a-z0-9-/]/g, '-').replace(/-+/g, '-') : undefined;
    const content = content_json ? (typeof content_json === 'object' ? JSON.stringify(content_json) : content_json) : undefined;

    const updates = [];
    const params = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (cleanSlug !== undefined) { updates.push('slug = ?'); params.push(cleanSlug); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category); }
    if (read_time !== undefined) { updates.push('read_time = ?'); params.push(read_time); }
    if (author !== undefined) { updates.push('author = ?'); params.push(author); }
    if (excerpt !== undefined) { updates.push('excerpt = ?'); params.push(excerpt); }
    if (quick_answer !== undefined) { updates.push('quick_answer = ?'); params.push(quick_answer); }
    if (content !== undefined) { updates.push('content_json = ?'); params.push(content); }
    if (seo_title !== undefined) { updates.push('seo_title = ?'); params.push(seo_title); }
    if (meta_description !== undefined) { updates.push('meta_description = ?'); params.push(meta_description); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    params.push(id);
    await pool.query(`UPDATE blogs SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ message: 'Blog updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update blog post' });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM blogs WHERE id = ?', [id]);
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
};
