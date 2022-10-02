const fs = require('fs')
const cloudinary = require('../utils/cloudinary')
const { User, Social, Blog, Categories } = require('../models')
const AppError = require('../utils/appError')

exports.updateUser = async (req, res, next) => {
  try {
    const { username, email, description, facebookUrl, instagramUrl } = req.body
    const file = req.file
    let profileImage = req.user.profileImage
    if (file) {
      const secureUrl = await cloudinary.upload(
        file.path,
        profileImage ? cloudinary.getPublicId(profileImage) : undefined
      )
      profileImage = secureUrl
      fs.unlinkSync(file.path)
    }

    await User.update({ profileImage }, { where: { id: req.user.id } })
    await User.update(
      { username, email, description },
      { where: { id: req.user.id } }
    )
    await Social.update(
      { facebookUrl, instagramUrl },
      { where: { userId: req.user.id } }
    )

    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: { exclude: 'password' },
      include: [Social, { model: Blog, include: Categories }],
    })

    res.status(200).json({ user })
  } catch (err) {
    next(err)
  }
}

exports.getUser = async (req, res, next) => {
  try {
    const id = +req.params.id
    const user = await User.findOne({
      where: { id },
      attributes: { exclude: 'password' },
      include: [Social, { model: Blog, include: Categories }],
    })
    if (!user) {
      throw new AppError('user not found', 400)
    }
    res.status(200).json({ user })
  } catch (err) {
    next(err)
  }
}
