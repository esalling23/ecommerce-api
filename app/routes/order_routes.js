const express = require('express')
const router = express.Router()

const Order = require('../models/order')
const Product = require('../models/product')

const {
  handle404,
  handleOrderCompleted,
  requireOwnership,
  BadParamsError
} = require('../../lib/custom_errors')
const { calculateTotalPrice } = require('../../lib/price_helpers')
const requireToken = require('../../lib/require_token')

const findOrderMiddleware = (req, res, next) => {
  Order.findById(req.params.id)
    .populate('products.productRef')
    .then(handle404)
    .then(order => requireOwnership(req, order))
    .then(order => { req.order = order })
    .then(() => next())
    .catch(next)
}

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

// PATCH /orders/:id/add
// Accepts { productId: 'id', count: 3 } as body data
// Will add product data to the order - if product exists, increases count by provided data
// if passed the query param `updateProduct` (set to `true`), will replace product count with provided data
// if passed the query param `deleteProduct` (set to `true`), will delete the product from the cart
const updateOrder = (req, res, next) => {
  const { updateProduct, deleteProduct } = req.query

  Promise.resolve()
    .then(() => {
      if (!req.body.productId) {
        throw new BadParamsError('Missing Product ID for order update')
      }
      if (!req.body.count && updateProduct) {
        throw new BadParamsError('Provide a count value greater than 1')
      } else if (!req.body.count) {
        req.body.count = 1
      }
    })
    .then(() => handleOrderCompleted(req.order))
    .then(() => Product.findById(req.body.productId))
    .then(product => handle404(product, 'Product ID Invalid'))
    .then(product => {
      // check if this product exists already, we can just add another one
      const currProd = req.order.products.find(el => el.productRef.equals(product.id))
      if (currProd) {
        const prodIndex = req.order.products.indexOf(currProd)
        if (deleteProduct) {
          req.order.products.splice(prodIndex, 1)
        } else {
          if (updateProduct) {
            currProd.count = req.body.count
          } else {
            currProd.count += req.body.count
          }
          req.order.products.splice(prodIndex, 1, currProd)
        }
      } else if (updateProduct || deleteProduct) {
        // If updating & no currProd, throw error
        throw new BadParamsError(`Cannot ${updateProduct ? 'update' : 'remove'} product not in cart`)
      } else {
        req.order.products.push({
          productRef: product.id,
          count: req.body.count
        })
      }
      return req.order.save()
    })
    .then(order => {
      // populate the productRef on each cart-product object
      return Order.findById(order.id).populate('products.productRef')
    })
    .then(order => {
      order.totalPrice = calculateTotalPrice(order.products).centsTotal
      return order.save()
    })
    .then(order => order.toObject())
    .then(order => res.json({ order }))
    .catch(next)
}

const checkoutOrder = (req, res, next) => {
  Promise.resolve()
    .then(() => handleOrderCompleted(req.order))
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
router.route('/:id')
  .patch(findOrderMiddleware, updateOrder)
  .get(findOrderMiddleware, showOrder)
  .delete(findOrderMiddleware, deleteOrder)

// Custom Routes
router.patch('/:id/checkout', findOrderMiddleware, checkoutOrder)

module.exports = router
