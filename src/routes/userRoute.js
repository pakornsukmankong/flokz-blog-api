const express = require('express')
const upload = require('../middlewares/upload')

const userController = require('../controllers/userController')

const router = express.Router()

router.patch('/', upload.single('profileImage'), userController.updateUser)

module.exports = router
