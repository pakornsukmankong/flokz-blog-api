const jwt = require('jsonwebtoken')
const { User, Social, Blog } = require('../models')

const AppError = require('../utils/appError')

module.exports = async (req, res, next) => {
  try {
    const { authorization } = req.headers
    if (!authorization || !authorization.startsWith('Bearer')) {
      throw new AppError('unauthenticated', 401)
    }
    const token = authorization.split(' ')[1]
    if (!token) {
      throw new AppError('unauthenticated', 401)
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY || 'private')

    const user = await User.findOne({
      where: { id: payload.id },
      attributes: { exclude: 'password' },
      include: [Social, Blog],
    })
    if (!user) {
      throw new AppError('unauthenticated', 401)
    }

    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}
