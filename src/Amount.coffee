BigDecimal = require('bigdecimal').BigDecimal
ROUND_HALF_UP = require('bigdecimal').RoundingMode.HALF_UP()
SCALE = 25

module.exports = class Amount
  constructor: (value) ->
    if value instanceof BigDecimal
      @value = value
    else if typeof value == 'string'
      try
        @value = new BigDecimal(value)
      catch e
        throw new Error('String initializer cannot be parsed to a number')
    else
      throw new Error('Must intialize from string')

  compareTo: (amount) =>
    if amount instanceof Amount
      return @value.compareTo(amount.value)
    else
      throw new Error('Can only compare to Amount objects')

  add: (amount) =>
    if amount instanceof Amount
      return new Amount(@value.add(amount.value))
    else
      throw new Error('Can only add Amount objects')

  subtract: (amount) =>
    if amount instanceof Amount
      return new Amount(@value.subtract(amount.value))
    else
      throw new Error('Can only subtract Amount objects')

  multiply: (amount) =>
    if amount instanceof Amount
      return new Amount(@value.multiply(amount.value))
    else
      throw new Error('Can only multiply Amount objects')    

  divide: (amount) =>
    if amount instanceof Amount
      return new Amount(@value.divide(amount.value, SCALE, ROUND_HALF_UP).stripTrailingZeros())
    else
      throw new Error('Can only divide Amount objects')    

  toString: =>
    return @value.toString()

Amount.ZERO = new Amount('0')