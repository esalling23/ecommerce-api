const mongoose = require('mongoose')
const { toDisplayPrice, toCentsPrice } = require('../../lib/price_helpers')

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  // Price will be stored as cents
  // Then converted to `00.00` format with getter
  // https://stackoverflow.com/questions/13304129/how-should-i-store-a-price-in-mongoose
  price: {
    type: Number,
    required: true,
    set: toCentsPrice,
    get: toDisplayPrice,
    default: 0
  }
}, {
  timestamps: true,
  toObject: {
    getters: true
  }
})

module.exports = mongoose.model('Product', productSchema)
