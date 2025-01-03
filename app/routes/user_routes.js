const express = require('express')
const passport = require('passport')
const bcrypt = require('bcrypt')

const bcryptSaltRounds = 10

const errors = require('../../lib/custom_errors')

const BadParamsError = errors.BadParamsError
const BadCredentialsError = errors.BadCredentialsError

const User = require('../models/user')
const refreshToken = require('../../lib/refresh_token')

const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

// GET BY ID
// GET /:id
router.get('/users/:id', (req, res, next) => {
  User.findById(req.params.id)
    .then(user => res.status(200).send({ user: user.ToObject() }))
    .catch(next)
})

// GET BY TOKEN
// GET /session
router.get('/session', requireToken, (req, res, next) => {
  if (!req.user) {
    next(new Error('No user found. Session Expired, login again.'))
    return
  }
  console.log(req.user)
  User.findById(req.user._id)
    .then(errors.handle404)
    .then(refreshToken)
    .then(user => res.status(200).json({ user: user.toObject() }))
    .catch(next)
})

// SIGN UP
// POST /sign-up
router.post('/sign-up', (req, res, next) => {
  Promise.resolve(req.body.credentials)
    // Input error handling
    .then(credentials => {
      if (!credentials ||
          !credentials.password ||
          credentials.password !== credentials.password_confirmation) {
        throw new BadParamsError()
      }
    })
    // Hash password
    .then(() => bcrypt.hash(req.body.credentials.password, bcryptSaltRounds))
    .then(hash => {
      return {
        email: req.body.credentials.email,
        hashedPassword: hash
      }
    })
    .then(user => User.create(user))
    .then(user => res.status(201).json({ user: user.toObject() }))
    .catch(next)
})

// SIGN IN
// POST /sign-in
router.post('/sign-in', (req, res, next) => {
  const pw = req.body.credentials.password
  let user

  User.findOne({ email: req.body.credentials.email })
    .then(record => {
      // Wrong email
      if (!record) {
        throw new BadCredentialsError()
      }
      user = record
      return bcrypt.compare(pw, user.hashedPassword)
    })
    .then(correctPassword => {
      if (correctPassword) {
        // Token will be a 16 byte random hex string
        return refreshToken(user)
      } else {
        // Incorrect password
        throw new BadCredentialsError()
      }
    })
    .then(user => {
      res.status(201).json({ user: user.toObject() })
    })
    .catch(next)
})

// CHANGE password
// PATCH /change-password
router.patch('/change-password', requireToken, (req, res, next) => {
  let user
  User.findById(req.user.id)
    .then(record => { user = record })
    // Check that the old password is correct
    .then(() => bcrypt.compare(req.body.passwords.old, user.hashedPassword))
    .then(correctPassword => {
      // Incorrect old password, or missing new password
      if (!req.body.passwords.new || !correctPassword) {
        throw new BadParamsError()
      }
    })
    // Hash the new password
    .then(() => bcrypt.hash(req.body.passwords.new, bcryptSaltRounds))
    .then(hash => {
      user.hashedPassword = hash
      return user.save()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

router.delete('/sign-out', requireToken, (req, res, next) => {
  // invalidate current token
  req.user.token = null
  req.user.save()
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
