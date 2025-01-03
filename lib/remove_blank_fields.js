// Middleware for removing any key/value pairs from `req.body.foo`
// that have an empty string as a value, e.g.
// Input { example: { title: 'thing', text: '' } }
// Output { example: { title: 'thing' } }
module.exports = function (req, res, next) {
  Object.values(req.body).forEach(obj => {
    for (const key in obj) {
      if (obj[key] === '') {
        // removes both the key and the value, preventing it from being updated
        delete obj[key]
      }
    }
  })

  next()
}
