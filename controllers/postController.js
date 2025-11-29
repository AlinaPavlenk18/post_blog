const { Post } = require('../models');

// Get all posts
exports.getAll = async (req, res) => {
  try {
    const posts = await Post.findAll({ order: [['createdAt', 'DESC']] });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get one post by ID
exports.getOne = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new post
exports.create = async (req, res) => {
  try {
    const { title, description, author, ip } = req.body;

    if (!title || !description || !author || !ip) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const post = await Post.create({ title, description, author, ip, image });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update post
exports.update = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const { title, description, author } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : post.image; 
    await post.update({ title, description, author, image });
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete post
exports.remove = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    await post.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
