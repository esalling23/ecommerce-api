require('dotenv').config()
const express = require('express')
const router = express.Router()

const Order = require('../models/order')

const { requireOpenOrder } = require('../../lib/custom_errors')
const requireToken = require('../../lib/require_token')
const { findOrder } = require('../../lib/find_documents')
const { toDisplayPrice, calculateTotalCents } = require('../../lib/price_helpers')

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

router.post('/payment-intent/:orderId',
  requireToken,
  findOrder,
  requireOpenOrder,
  async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.orderId).populate('products.productRef')
      const centsTotal = calculateTotalCents(order.products)
      const displayTotal = toDisplayPrice(centsTotal)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: centsTotal,
        currency: 'usd'
      })
      res.send({
        clientSecret: paymentIntent.client_secret,
        totalPrice: displayTotal
      })
    } catch (err) {
      next(err)
    }
  })

module.exports = router
