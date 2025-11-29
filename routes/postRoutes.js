const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const postController = require('../controllers/postController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.get('/', postController.getAll);

// create new post
router.post('/', postController.create); 

// get post by ID
router.get('/:id', postController.getOne);

// update post
router.put('/:id', postController.update);

// delete post
router.delete('/:id', postController.remove);

module.exports = router;