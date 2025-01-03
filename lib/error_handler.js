// Error handling middleware function used to set HTTP status codes
module.exports = function (err, req, res, next) {
  if (!process.env.TESTENV) {
    console.log('\n', new Date().toTimeString() + ':')
    console.error(err)
  }

  // Update HTTP Responses
  if (err.name.match(/Valid/) || err.name === 'MongoError') {
    const message = 'The received params failed a Mongoose validation'
    err = { status: 422, message }
  } else if (err.name === 'DocumentNotFoundError') {
    err.status = 404
  } else if (err.name === 'CastError' || err.name === 'BadParamsError') {
    err.status = 422
  } else if (err.name === 'BadCredentialsError') {
    err.status = 401
  } else if (err.name === 'OwnershipError') {
    err.status = 403
  }

  res.status(err.status || 500).json(err)
}
