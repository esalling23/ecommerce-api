// Converts cents nums to string decimal
// 500 => '5.00'
const toDisplayPrice = n => (n / 100).toFixed(2)

// Converts dollar-representing numbers like 5 to cents (500)
const toCentsPrice = n => n * 100

// calculates both cents & display total
const calculateTotalPrice = products => {
  const total = products.reduce((a, c) => a + toCentsPrice(parseFloat(c.price)), 0)
  console.log(total)
  return {
    centsTotal: total,
    displayTotal: (total / 100).toFixed(2)
  }
}

module.exports = {
  toDisplayPrice,
  toCentsPrice,
  calculateTotalPrice
}
