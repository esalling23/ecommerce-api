const express = require('express')
const router = express.Router()

const Order = require('../models/Order')

const {
  handle404,
  requireOwnership,
  BadParamsError
} = require('../../lib/custom_errors')

const requireToken = require('../../lib/require_token')

const findOrderMiddleware = (req, res, next) => {
  Order.findById(req.params.id)
    .then(handle404)
    .then(order => requireOwnership(req, order))
    .then(order => req.order = order)
    .then(() => next())
    .catch(next)
}

const indexOrders = (req, res, next) => {
  Order.find({ owner: req.user.id })
    .then(orders => res.json({ orders }))
    .catch(next)
}

const showOrder = (req, res, next) => {
  res.json({ order: req.order })
}

const createOrder = (req, res, next) => {
  req.body.order.owner = req.user.id
  Order.create(req.body.order)
    .then(order => res.status(201).json({ order }))
    .catch(next)
}

const updateOrder = (req, res, next) => {
  if (!req.body.productId) {
    next(new BadParamsError('Missing Product ID for order update'))
  }

  req.order.products.push(req.body.productId)

  req.order.save()
    .then(order => res.json({ order }))
    .catch(next)
}

const deleteOrder = (req, res, next) => {
  req.order.deleteOne()
    .then(() => res.sendStatus(204))
    .catch(next)
}

// Middleware
router.use(requireToken)

// Create & Index routes
router.route('/orders')
  .post(createOrder)
  .get(indexOrders)

// Update, Delete, & Show routes
router.route('/orders/:id')
  .patch(findOrderMiddleware, updateOrder)
  .get(findOrderMiddleware, showOrder)
  .delete(findOrderMiddleware, deleteOrder)

  .patch(requireToken, updateOrder)
  .get(requireToken, showOrder)
  .delete(requireToken, deleteOrder)

module.exports = router
