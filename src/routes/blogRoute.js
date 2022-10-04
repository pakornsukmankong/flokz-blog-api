const express = require('express')
const upload = require('../middlewares/upload')
const blogController = require('../controllers/blogController')
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

module.exports = router
