const express = require('express')
const upload = require('../middlewares/upload')
const authenticate = require('../middlewares/authenticate')

const userController = require('../controllers/userController')

const router = express.Router()

router.patch(
  '/',
  authenticate,
  upload.single('profileImage'),
  userController.updateUser
)
router.get('/:id', userController.getUser)

module.exports = router
