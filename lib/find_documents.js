const Order = require('../app/models/order')
const Product = require('../app/models/product')
const {
  handle404,
  requireOwnership
} = require('./custom_errors')

// Locates order based on `orderId`
const findOrder = (req, res, next) => {
  Order.findById(req.params.orderId)
  // todo: investigate if we can sometimes populate but not other times...
    .populate('products.productRef')
    .then(order => handle404(order, 'Order ID invalid'))
    .then(order => requireOwnership(req, order))
    .then(order => { req.order = order })
    .then(() => next())
    .catch(next)
}

// Locates product based on `productId` in `req.body`
const findProduct = (req, res, next) => {
  Product.findById(req.body.productId)
    .populate('productRef')
    .then(product => handle404(product, 'Product ID Invalid'))
    .then(product => { req.product = product })
    .then(() => next())
    .catch(next)
}

// Uses `req.order` & `req.body.productId` to locate the orderProduct subdoc
const findProductInOrder = (req, res, next) => {
  // should already have `req.order` at this point
  // should also have `req.body.productId`
  const currProd = req.order.products.find(p => p.productRef.equals(req.body.productId))

  req.productInOrder = {
    product: currProd,
    index: req.order.products.indexOf(currProd)
  }

  next()
}

module.exports = {
  findOrder,
  findProduct,
  findProductInOrder
}
