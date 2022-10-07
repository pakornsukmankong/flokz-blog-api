const AppError = require('../utils/appError')
const { Comment, User } = require('../models')

exports.createComment = async (req, res, next) => {
  try {
    const { title } = req.body
    if (!title || !title.trim()) {
      throw new AppError('title is require', 400)
    }

    const newComment = await Comment.create({
      title,
      blogId: req.params.id,
      userId: req.user.id,
    })

    const comment = await Comment.findOne({
      where: { id: newComment.id },
      attributes: { exclude: 'userId' },
      include: { model: User, attributes: { exclude: 'password' } },
    })

    res.status(201).json({ comment })
  } catch (err) {
    next(err)
  }
}
