const AppError = require('../utils/appError')
const cloudinary = require('../utils/cloudinary')
const fs = require('fs')
const { Blog, Categories, Like, Comment, User } = require('../models')

exports.createBlog = async (req, res, next) => {
  try {
    const { title, content, categoryId } = req.body
    const file = req.file
    let image

    if (!title || !title.trim()) {
      throw new AppError('title is required', 400)
    }
    if (!file) {
      throw new AppError('image is required', 400)
    }
    if (!content || !content.trim()) {
      throw new AppError('content is required', 400)
    }
    if (!categoryId) {
      throw new AppError('content is required', 400)
    }
    if (file) {
      image = await cloudinary.upload(file.path)
      fs.unlinkSync(file.path)
    }

    const data = { title, image, content, categoryId, userId: req.user.id }

    const newBlog = await Blog.create(data)
    const blog = await Blog.findOne({
      where: { id: newBlog.id },
      attributes: { exclude: ['userId', 'categoryId'] },
      include: [
        { model: User, attributes: { exclude: 'password' } },
        Categories,
        Like,
        Comment,
      ],
    })

    res.status(201).json({ blog })
  } catch (err) {
    next(err)
  }
}

exports.getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.findAll({
      attributes: { exclude: ['userId', 'categoryId'] },
      include: [
        { model: User, attributes: { exclude: 'password' } },
        Categories,
        Like,
        Comment,
      ],
      order: [['updatedAt', 'DESC']],
    })
    res.status(200).json({ blogs })
  } catch (err) {
    next(err)
  }
}

exports.getOneBlog = async (req, res, next) => {
  try {
    const { id } = req.params
    const blog = await Blog.findOne({
      where: { id },
      attributes: { exclude: ['userId', 'categoryId'] },
      include: [
        { model: User, attributes: { exclude: 'password' } },
        Categories,
        Like,
        Comment,
      ],
    })
    res.status(200).json({ blog })
  } catch (err) {
    next(err)
  }
}
