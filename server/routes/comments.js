import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    const result = await db.execute(`
      SELECT c.*, u.username as author_name, u.avatar as author_avatar
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [postId]);

    res.json({ comments: result.rows });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create comment
router.post('/', authenticateToken, [
  body('content').notEmpty().withMessage('Content is required'),
  body('post_id').isInt().withMessage('Post ID is required'),
  body('parent_id').optional().isInt().withMessage('Parent ID must be an integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, post_id, parent_id } = req.body;

    // Check if post exists
    const postExists = await db.execute(
      'SELECT id FROM posts WHERE id = ? AND status = "published"',
      [post_id]
    );

    if (postExists.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const result = await db.execute(
      'INSERT INTO comments (content, author_id, post_id, parent_id) VALUES (?, ?, ?, ?)',
      [content, req.userId, post_id, parent_id]
    );

    // Get the created comment with author info
    const commentResult = await db.execute(`
      SELECT c.*, u.username as author_name, u.avatar as author_avatar
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.id = ?
    `, [result.lastInsertRowid]);

    res.status(201).json({
      message: 'Comment created successfully',
      comment: commentResult.rows[0]
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update comment
router.put('/:id', authenticateToken, [
  body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { content } = req.body;

    // Check if comment exists and user owns it
    const existingComment = await db.execute(
      'SELECT * FROM comments WHERE id = ? AND author_id = ?',
      [id, req.userId]
    );

    if (existingComment.rows.length === 0) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    await db.execute(
      'UPDATE comments SET content = ? WHERE id = ?',
      [content, id]
    );

    // Get updated comment
    const result = await db.execute(`
      SELECT c.*, u.username as author_name, u.avatar as author_avatar
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.id = ?
    `, [id]);

    res.json({
      message: 'Comment updated successfully',
      comment: result.rows[0]
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if comment exists and user owns it
    const existingComment = await db.execute(
      'SELECT * FROM comments WHERE id = ? AND author_id = ?',
      [id, req.userId]
    );

    if (existingComment.rows.length === 0) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    await db.execute('DELETE FROM comments WHERE id = ?', [id]);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;