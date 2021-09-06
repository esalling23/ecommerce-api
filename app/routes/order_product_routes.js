const express = require('express')
const router = express.Router()

const { calculateTotalPrice } = require('../../lib/price_helpers')
const {
  requireProductId,
  requireProductInOrder,
  requireOpenOrder,
  BadParamsError
} = require('../../lib/custom_errors')
const { findProductInOrder, findProduct } = require('../../lib/find_documents')

const Order = require('../models/order')

// POST /orders/:orderId/update
// Adds new product to order. If product already exists in order, updates count.
const addToOrder = (req, res, next) => {
  console.log(req.product, req.order)
  Promise.resolve()
    .then(() => {
      if (!req.body.count) {
        req.body.count = 1
      }
    })
    .then(() => {
      if (req.productInOrder.product) {
        const { product, index } = req.productInOrder
        product.count += req.body.count
        req.order.products.splice(index, 1, product)
      } else {
        req.order.products.push({
          productRef: req.body.productId,
          count: req.body.count
        })
      }
      return req.order.save()
    })
    .then(order => Order.findById(order.id).populate('products.productRef'))
    .then(order => {
      order.totalPrice = calculateTotalPrice(order.products).centsTotal
      return order.save()
    })
    .then(order => res.json({ order: order.toObject() }))
    .catch(next)
}

// PATCH /orders/:orderId/update/:productId
// Updates product on order (count)
const updateOrder = (req, res, next) => {
  Promise.resolve()
    .then(() => (req.order))
    .then(() => {
      if (!req.body.count) {
        throw new BadParamsError('Provide a count value greater than 1')
      }
    })
    .then(() => {
      const { product, index } = req.productInOrder
      product.count = req.body.count
      req.order.products.splice(index, 1, product)
      return req.order.save()
    })
    .then(order => {
      // // populate the productRef on each cart-product object
      //
      res.json({ order: order.toObject() })
    })
    .catch(next)
}

// DELETE /orders/:orderId/delete/:productId
// Removes product from order
const removeFromOrder = (req, res, next) => {
  const prodIndex = req.order.products.indexOf(req.product)

  req.order.products.splice(prodIndex, 1)
  req.order.save()
    .then(order => res.status(203).json({ order: order.toObject() }))
    .catch(next)
}

router.use('/products', requireProductId, requireOpenOrder, findProduct, findProductInOrder)

router.route('/products')
  .patch(requireProductInOrder, updateOrder)
  .post(addToOrder)
  .delete(requireProductInOrder, removeFromOrder)

module.exports = router
