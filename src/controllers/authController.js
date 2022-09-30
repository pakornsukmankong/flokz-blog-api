const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const validator = require('validator')

const AppError = require('../utils/appError')
const { User, Social } = require('../models')
const { Op } = require('sequelize')

const genToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET_KEY || 'private', {
    expiresIn: process.env.JWT_EXPIRES || '1d',
  })

exports.register = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      confirmPassword,
      facebookUrl = '',
      instagramUrl = '',
    } = req.body
    if (!username) {
      throw new AppError('username is required', 400)
    }
    if (!email) {
      throw new AppError('email is required', 400)
    }
    if (!password) {
      throw new AppError('password is required', 400)
    }
    if (password !== confirmPassword) {
      throw new AppError('password and confirm password did not match', 400)
    }

    const isEmail = validator.isEmail(email + '')
    const isAlphanumeric = validator.isAlphanumeric(username + '')

    if (!isEmail && !isAlphanumeric) {
      throw new AppError('username or email is invalid format', 400)
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    })
    await Social.create({ facebookUrl, instagramUrl, userId: user.id })

    const token = genToken({ id: user.id })
    res.status(201).json({ token })
  } catch (err) {
    next(err)
  }
}

exports.login = async (req, res, next) => {
  try {
    const { usernameOrEmail, password } = req.body
    if (!usernameOrEmail) {
      throw new AppError('username or email is required', 400)
    }
    if (!password) {
      throw new AppError('password is required', 400)
    }
    if (typeof usernameOrEmail !== 'string' || typeof password !== 'string') {
      throw new AppError('username or email or password is invalid', 400)
    }
    // SELECT * from users WHERE username = 'usernameOrEmail' OR email = 'usernameOrEmail'
    const user = await User.findOne({
      where: {
        [Op.or]: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    })
    if (!user) {
      throw new AppError('username or email or password is invalid', 400)
    }

    const correctPassword = await bcrypt.compare(password, user.password)
    if (!correctPassword) {
      throw new AppError('username or email or password is invalid', 400)
    }
    const token = genToken({ id: user.id })
    res.status(200).json({ token })
  } catch (err) {
    next(err)
  }
}

exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({ user: req.user })
  } catch (err) {
    next(err)
  }
}
