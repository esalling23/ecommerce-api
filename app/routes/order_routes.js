const express = require('express')
const router = express.Router()

const Order = require('../models/Order')

const {
  handle404,
  requireOwnership,
  BadParamsError
} = require('../../lib/custom_errors')

const requireToken = require('../../lib/require_token')

const indexOrders = (req, res, next) => {
  Order.find({ owner: req.user.id })
    .then(orders => res.json({ orders }))
    .catch(next)
}

const showOrder = (req, res, next) => {
  Order.findById(req.params.id)
    .then(handle404)
    .then(order => requireOwnership(req, order))
    .then(order => res.json({ order }))
    .catch(next)
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
  Order.findById(req.params.id)
    .then(handle404)
    .then(order => requireOwnership(req, order))
    .then(order => {
      order.products.push(req.body.productId)
      return order.save()
    })
    .then(order => res.json({ order }))
    .catch(next)
}

const deleteOrder = (req, res, next) => {
  Order.findById(req.params.id)
    .then(handle404)
    .then(order => requireOwnership(req, order))
    .then(order => order.deleteOne())
    .then(() => res.sendStatus(204))
    .catch(next)
}

// Create & Index routes
router.route('/orders')
  .post(requireToken, createOrder)
  .get(requireToken, indexOrders)

// Update, Delete, & Show routes
router.route('/orders/:id')
  .patch(requireToken, updateOrder)
  .get(requireToken, showOrder)
  .delete(requireToken, deleteOrder)

module.exports = router
