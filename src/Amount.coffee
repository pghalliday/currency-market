BigDecimal = require('bigdecimal').BigDecimal

module.exports = class Amount
  constructor: (value) ->
    if value instanceof BigDecimal
      @value = value
    else if typeof value == 'string'
      try
        @value = new BigDecimal(value)
      catch e
        throw new Error('String initializer cannot be parsed to a number')
    else if value.state
      @value = new BigDecimal value.state.value
    else
      throw new Error('Must intialize from string')

  export: =>
    state = Object.create null
    state.value = @value.toPlainString()
    return state

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

  toString: =>
    return @value.stripTrailingZeros().toPlainString()

Amount.ZERO = new Amount('0')