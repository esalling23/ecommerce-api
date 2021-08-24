const express = require('express')
const router = express.Router()

const Product = require('../models/product')

const { handle404 } = require('../../lib/custom_errors')

// INDEX
router.get('/', (req, res, next) => {
  Product.find()
    .then(products => res.status(200).json({ products }))
    .catch(next)
})

// SHOW
router.get('/:id', (req, res, next) => {
  Product.findById(req.params.id)
    .then(handle404)
    .then(product => res.status(200).json({ product }))
    .catch(next)
})

module.exports = router
