const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController'); 

//get all posts
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