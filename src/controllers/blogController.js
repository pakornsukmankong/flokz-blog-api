const AppError = require('../utils/appError')
const cloudinary = require('../utils/cloudinary')
const fs = require('fs')
const {
  Blog,
  Categories,
  Like,
  Comment,
  User,
  sequelize,
} = require('../models')

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
    const { title } = req.query
    let blogs = await Blog.findAll({
      attributes: { exclude: ['userId', 'categoryId'] },
      include: [
        { model: User, attributes: { exclude: 'password' } },
        Categories,
        Like,
        Comment,
      ],
      order: [['updatedAt', 'DESC']],
    })

    if (title) {
      blogs = blogs.filter(
        (item) =>
          !title || item.title.toLowerCase().includes(title.toLowerCase())
      )
    }

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
        {
          model: Comment,
          include: { model: User, attributes: { exclude: 'password' } },
        },
      ],
      order: [[{ model: Comment }, 'updatedAt', 'DESC']],
    })
    res.status(200).json({ blog })
  } catch (err) {
    next(err)
  }
}

exports.updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, categoryId, content } = req.body
    const file = req.file

    const findBlog = await Blog.findOne({ where: { id } })
    if (!findBlog) {
      throw new AppError('cannot find blog', 400)
    }
    if (req.user.id !== findBlog.userId) {
      throw new AppError('no permission to update', 403)
    }

    let image = findBlog.image
    if (file) {
      const secureUrl = await cloudinary.upload(
        file.path,
        image ? cloudinary.getPublicId(image) : undefined
      )
      image = secureUrl
      fs.unlinkSync(file.path)
    }

    await Blog.update({ title, categoryId, content, image }, { where: { id } })

    const blog = await Blog.findOne({
      where: { id },
      attributes: { exclude: ['userId'] },
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

exports.deleteBlog = async (req, res, next) => {
  let t
  try {
    t = await sequelize.transaction()

    const blog = await Blog.findOne({ where: { id: req.params.id } })
    if (!blog) {
      throw new AppError('cannot find blog', 400)
    }
    if (req.user.id !== blog.userId) {
      throw new AppError('no permission to delete', 403)
    }

    const secureUrl = await cloudinary.getPublicId(blog.image)

    if (!secureUrl) {
      throw new AppError('no image found', 400)
    }

    await Comment.destroy({ where: { blogId: blog.id }, transaction: t })
    await Like.destroy({ where: { blogId: blog.id }, transaction: t })
    await Blog.destroy({ where: { id: blog.id }, transaction: t })
    await t.commit()
    await cloudinary.delete(secureUrl)
    res.status(200).json({ message: 'success delete' })
  } catch (err) {
    await t.rollback()
    next(err)
  }
}
