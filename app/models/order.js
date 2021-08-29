const { model, Schema, Types } = require('mongoose')
const { toDisplayPrice } = require('../../lib/price_helpers')

const orderSchema = new Schema({
  products: [{
    type: Types.ObjectId,
    ref: 'Product'
  }],
  totalPrice: {
    type: Number,
    get: toDisplayPrice
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
  toJSON: {
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
