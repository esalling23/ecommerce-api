const { model, Schema, Types } = require('mongoose')

const orderSchema = new Schema({
  products: [{
    type: Types.ObjectId,
    ref: 'Product'
  }],
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
  timestamps: true
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
