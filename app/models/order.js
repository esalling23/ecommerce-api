const { model, Schema, Types } = require('mongoose')
const { toDisplayPrice } = require('../../lib/price_helpers')

const orderProductSchema = new Schema({
  productRef: {
    type: Types.ObjectId,
    ref: 'Product'
  },
  count: {
    type: Number,
    default: 1
  }
})

const orderSchema = new Schema({
  products: [orderProductSchema],
  totalPrice: {
    type: Number,
    get: toDisplayPrice,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  owner: {
    type: Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toObject: {
    getters: true
  }
})

const populateProductsQuery = function () {
  this.populate('products')
}

const populateProductsDoc = async function (doc) {
  await doc.populate('products').execPopulate()
}

orderSchema
  .pre('find', populateProductsQuery)
  .pre('findOne', populateProductsQuery)
  .post('save', populateProductsDoc)

module.exports = model('Order', orderSchema)
