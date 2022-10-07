const express = require('express')
const upload = require('../middlewares/upload')
const blogController = require('../controllers/blogController')
const likeController = require('../controllers/likeController')
const commentController = require('../controllers/commentController')
const authenticate = require('../middlewares/authenticate')

const router = express.Router()

router.post(
  '/',
  authenticate,
  upload.single('image'),
  blogController.createBlog
)
router.get('/', blogController.getAllBlogs)

router.get('/:id', blogController.getOneBlog)

router.patch(
  '/:id/edit',
  authenticate,
  upload.single('image'),
  blogController.updateBlog
)

router.delete('/:id', authenticate, blogController.deleteBlog)

router.post('/:id/likes', authenticate, likeController.toggleLike)

router.post('/:id/comments', authenticate, commentController.createComment)

module.exports = router
