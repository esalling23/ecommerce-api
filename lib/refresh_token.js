const crypto = require('crypto')

const refreshToken = user => {
  // refresh token
  const token = crypto.randomBytes(16).toString('hex')
  user.token = token
  user.lastTokenTime = new Date()
  return user.save()
}

module.exports = refreshToken
