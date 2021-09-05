const express = require('express')
const router = express.Router()

const Order = require('../models/order')

const { requireOpenOrder } = require('../../lib/custom_errors')
const { calculateTotalPrice } = require('../../lib/price_helpers')
const { findOrder } = require('../../lib/find_documents')
const requireToken = require('../../lib/require_token')

const orderProductsRouter = require('./order_product_routes')

// Query param `completed` allowed for filtering
// ?completed=true to get only completed orders
const indexOrders = (req, res, next) => {
  const query = { owner: req.user.id }
  if (req.query.completed) {
    query.completed = true
  }
  Order.find(query)
    .then(orders => orders.map(o => o.toObject()))
    .then(orders => res.json({ orders }))
    .catch(next)
}

const showOrder = (req, res, next) => {
  res.json({ order: req.order.toObject() })
}

// Creates an order, or locates the current order and returns that
const createOrder = (req, res, next) => {
  Order.findOne({ completed: false, owner: req.user.id })
    .populate('products.productRef')
    .then(currOrder => {
      if (currOrder) {
        return currOrder
      } else {
        req.body.order.owner = req.user.id
        return Order.create(req.body.order)
      }
    })
    .then(order => order.toObject())
    .then(order => res.status(201).json({ order }))
    .catch(next)
}

const checkoutOrder = (req, res, next) => {
  Promise.resolve()
    .then(() => {
      req.order.completed = true
      req.order.totalPrice = calculateTotalPrice(req.order.products).centsTotal
      return req.order.save()
    })
    .then(order => res.json({ order: order.toObject() }))
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
router.route('/:orderId')
  .get(findOrder, showOrder)
  .delete(findOrder, deleteOrder)

// Include orderProductsRouter at `/:id` endpoint
router.use('/:orderId', findOrder, orderProductsRouter)

// Custom Routes
router.patch('/:orderId/checkout', requireOpenOrder, findOrder, checkoutOrder)

module.exports = router
