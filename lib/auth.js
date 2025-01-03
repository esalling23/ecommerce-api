const passport = require('passport')
const bearer = require('passport-http-bearer')

const User = require('../app/models/user')

const isTokenValid = (tokenTime) => {
  const timeDiff = (new Date()).getTime() - tokenTime.getTime()
  const minutesPassed = timeDiff / (1000 * 60)

  return minutesPassed < 1
}

const strategy = new bearer.Strategy(
  function (token, done) {
    User.findOne({ token: token }, function (err, user) {
      if (err) { return done(err) }
      if (user && !isTokenValid(user.lastTokenTime)) return done(null, false, { message: 'Invalid Token' })
      return done(null, user, { scope: 'all' })
    })
  }
)

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

passport.use(strategy)

module.exports = passport.initialize()
