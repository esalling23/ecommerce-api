const express = require('express')
const router = express.Router()

const Order = require('../models/order')
const Product = require('../models/product')

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

// Creates an order, or locates the current order and returns that
const createOrder = (req, res, next) => {
  Order.findOne({ completed: false, owner: req.user.id })
    .then(currOrder => {
      if (currOrder) {
        return currOrder
      }
      else {
  req.body.order.owner = req.user.id
        return Order.create(req.body.order)
      }
    })
    .then(order => res.status(201).json({ order }))
    .catch(next)
}

const updateOrder = (req, res, next) => {

  Promise.resolve()
    .then(() => {
      if (!req.body.productId) {
        throw new BadParamsError('Missing Product ID for order update')
      }
      else if (req.order.completed) {
        throw new BadParamsError('Cannot update closed order')
      }

      return Product.findById(req.body.productId)
    })
    .then(product => {
      if (!product) {
        throw new BadParamsError('Product ID Invalid')
      }

      req.order.products.push(req.body.productId)

      return req.order.save()
    })
    .then(order => res.json({ order }))
    .catch(next)
}

const checkoutOrder = (req, res, next) => {
  req.order.completed = true

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
router.route('/')
  .post(createOrder)
  .get(indexOrders)

// Update, Delete, & Show routes
router.route('/:id')
  .patch(findOrderMiddleware, updateOrder)
  .get(findOrderMiddleware, showOrder)
  .delete(findOrderMiddleware, deleteOrder)

// Custom Routes
router.patch('/:id/checkout', findOrderMiddleware, checkoutOrder)

module.exports = router
