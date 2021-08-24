const express = require('express')
const router = express.Router()

const Order = require('../models/Order')

const {
  handle404,
  requireOwnership,
  BadParamsError
} = require('../../lib/custom_errors')

const requireToken = require('../../lib/require_token')

const createOrder = (req, res, next) => {
  req.body.order.owner = req.user.id
  Order.create(req.body.order)
    .then(order => res.status(201).json({ order }))
    .catch(next)
}

router.route('/orders')
  .post(requireToken, createOrder)

module.exports = router
