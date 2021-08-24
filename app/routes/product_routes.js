// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for products
const Product = require('../models/product')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when nonexistant document is requested
const handle404 = customErrors.handle404

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /products
router.get('/products', requireToken, (req, res, next) => {
  Product.find()
    // respond with status 200 and JSON of the products
    .then(products => res.status(200).json({ products }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /products/5a7db6c74d55bc51bdf39793
router.get('/products/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Product.findById(req.params.id)
    .then(handle404)
    // if `findById` is successful, respond with 200 and "product" JSON
    .then(product => res.status(200).json({ product }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
