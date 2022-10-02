const express = require('express')
const upload = require('../middlewares/upload')
const blogController = require('../controllers/blogController')

const router = express.Router()

router.post('/', upload.single('image'), blogController.createBlog)
router.get('/', blogController.getAllBlog)

module.exports = router
