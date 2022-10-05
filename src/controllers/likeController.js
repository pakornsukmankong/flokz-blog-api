const { Like } = require('../models')

exports.toggleLike = async (req, res, next) => {
  try {
    const id = +req.params.id
    const existLike = await Like.findOne({
      where: { userId: req.user.id, blogId: id },
    })

    if (existLike) {
      await existLike.destroy()
      return res.status(200).json({ like: null })
    }

    const like = await Like.create({
      userId: req.user.id,
      blogId: id,
    })
    res.status(201).json({ like })
  } catch (err) {
    next(err)
  }
}
