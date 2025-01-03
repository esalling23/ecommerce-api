class OwnershipError extends Error {
  constructor () {
    super()
    this.name = 'OwnershipError'
    this.message = 'The provided token does not match the owner of this document'
  }
}

class DocumentNotFoundError extends Error {
  constructor (msg) {
    super()
    this.name = 'DocumentNotFoundError'
    this.message = `The provided ID doesn't match any documents. \n ${msg || ''}`
  }
}

class BadParamsError extends Error {
  constructor (msg) {
    super()
    this.name = 'BadParamsError'
    this.message = `A required parameter was omitted or invalid. \n ${msg || ''}`
  }
}

class BadCredentialsError extends Error {
  constructor () {
    super()
    this.name = 'BadCredentialsError'
    this.message = 'The provided username or password is incorrect.'
  }
}

class ClosedOrderError extends Error {
  constructor () {
    super()
    this.name = 'ClosedOrderError'
    this.message = 'The requested order is closed. Start a new order to continue.'
  }
}

class ProductNotInOrderError extends Error {
  constructor () {
    super()
    this.name = 'ProductNotInOrderError'
    this.message = 'Product to update is not in order. Add it to your order to update.'
  }
}

// this method checks if the user trying to modify a resource is the owner of
// resource, and throws an error if not
// `requestObject` should be the actual `req` object from the route file
const requireOwnership = (requestObject, resource) => {
  // `requestObject.user` will be defined in any route that uses `requireToken`
  // `requireToken` MUST be passed to the route as a second argument
  const owner = resource.owner._id ? resource.owner._id : resource.owner
  //  check if the resource.owner is an object in case populate is being used
  //  if it is, use the `_id` property and if not, just use its value
  if (!requestObject.user._id.equals(owner)) {
    throw new OwnershipError()
  }

  // Return the resource
  return resource
}

// if the client passes an ID that isn't in the DB, we want to return 404
const handle404 = (record, errMsg) => {
  if (!record) {
    throw new DocumentNotFoundError(errMsg)
  } else {
    return record
  }
}

// Throws error if order is completed
const requireOpenOrder = (req, res, next) => {
  if (req.order.completed) {
    throw new ClosedOrderError()
  }
  next()
}

// Confirms provided order contains the provided product (on request)
// Fails if requested product is not in order
const requireProductInOrder = (req, res, next) => {
  if (!req.productInOrder.product) {
    throw new ProductNotInOrderError()
  }
  next()
}

// Requires valid `productId` body value
const requireProductId = (req, res, next) => {
  if (!req.body.productId) {
    throw new BadParamsError('Missing Product ID for order update')
  }
  next()
}

// Requires valid `orderId` param value
const requireOrderId = (req, res, next) => {
  if (!req.params.orderId) {
    throw new BadParamsError('Missing Product ID for order update')
  }
  next()
}

module.exports = {
  requireOwnership,
  handle404,
  requireOpenOrder,
  requireProductInOrder,
  requireProductId,
  requireOrderId,
  BadParamsError,
  BadCredentialsError
}
