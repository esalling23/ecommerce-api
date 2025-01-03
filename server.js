const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const productRoutes = require('./app/routes/product_routes')
const orderRoutes = require('./app/routes/order_routes')
const stripeRoutes = require('./app/routes/stripe_routes')
const userRoutes = require('./app/routes/user_routes')

const errorHandler = require('./lib/error_handler')
const requestLogger = require('./lib/request_logger')

const db = require('./config/db')
const auth = require('./lib/auth')

mongoose.connect(db, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
})

const app = express()

app.use(cors({ origin: process.env.CLIENT_ORIGIN }))

const port = process.env.PORT || 8080

// Authentication middleware
app.use(auth)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(requestLogger)

// Routes
app.use('/products', productRoutes)
app.use('/orders', orderRoutes)
app.use('/stripe', stripeRoutes)
app.use('/auth', userRoutes)

app.use(errorHandler)

app.listen(port, () => {
  console.log('listening on port ' + port)
})

module.exports = app
