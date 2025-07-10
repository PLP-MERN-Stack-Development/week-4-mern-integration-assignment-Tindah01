import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all posts
router.get('/', async (req, res) => {
  try {
    const { limit = 10, offset = 0, category, author, search } = req.query;
    
    let query = `
      SELECT p.*, u.username as author_name, u.avatar as author_avatar, c.name as category_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'published'
    `;
    
    const params = [];
    
    if (category) {
      query += ' AND c.name = ?';
      params.push(category);
    }
    
    if (author) {
      query += ' AND u.username = ?';
      params.push(author);
    }
    
    if (search) {
      query += ' AND (p.title LIKE ? OR p.content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.execute(query, params);
    
    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.execute(`
      SELECT p.*, u.username as author_name, u.avatar as author_avatar, c.name as category_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.status = 'published'
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ post: result.rows[0] });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post
router.post('/', authenticateToken, [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('category_id').optional().isInt().withMessage('Category ID must be an integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, excerpt, featured_image, category_id } = req.body;

    const result = await db.execute(
      'INSERT INTO posts (title, content, excerpt, featured_image, author_id, category_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, excerpt, featured_image, req.userId, category_id]
    );

    // Get the created post with author and category info
    const postResult = await db.execute(`
      SELECT p.*, u.username as author_name, u.avatar as author_avatar, c.name as category_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [result.lastInsertRowid]);

    res.status(201).json({
      message: 'Post created successfully',
      post: postResult.rows[0]
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update post
router.put('/:id', authenticateToken, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().notEmpty().withMessage('Content cannot be empty'),
  body('category_id').optional().isInt().withMessage('Category ID must be an integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, content, excerpt, featured_image, category_id } = req.body;

    // Check if post exists and user owns it
    const existingPost = await db.execute(
      'SELECT * FROM posts WHERE id = ? AND author_id = ?',
      [id, req.userId]
    );

    if (existingPost.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found or unauthorized' });
    }

    const updates = [];
    const values = [];

    if (title) {
      updates.push('title = ?');
      values.push(title);
    }
    if (content) {
      updates.push('content = ?');
      values.push(content);
    }
    if (excerpt !== undefined) {
      updates.push('excerpt = ?');
      values.push(excerpt);
    }
    if (featured_image !== undefined) {
      updates.push('featured_image = ?');
      values.push(featured_image);
    }
    if (category_id !== undefined) {
      updates.push('category_id = ?');
      values.push(category_id);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await db.execute(
      `UPDATE posts SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated post
    const result = await db.execute(`
      SELECT p.*, u.username as author_name, u.avatar as author_avatar, c.name as category_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);

    res.json({
      message: 'Post updated successfully',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if post exists and user owns it
    const existingPost = await db.execute(
      'SELECT * FROM posts WHERE id = ? AND author_id = ?',
      [id, req.userId]
    );

    if (existingPost.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found or unauthorized' });
    }

    await db.execute('DELETE FROM posts WHERE id = ?', [id]);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's posts
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const result = await db.execute(`
      SELECT p.*, u.username as author_name, u.avatar as author_avatar, c.name as category_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.author_id = ? AND p.status = 'published'
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), parseInt(offset)]);

    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;