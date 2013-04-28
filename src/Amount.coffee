BigDecimal = require('bigdecimal').BigDecimal
ROUND_HALF_UP = require('bigdecimal').RoundingMode.HALF_UP()
SCALE = 25

module.exports = class Amount
  constructor: (value, divisor) ->
    if value instanceof BigDecimal
      @value = value
      if divisor
        @divisor = divisor
    else if typeof value == 'string'
      try
        @value = new BigDecimal(value)
      catch e
        throw new Error('String initializer cannot be parsed to a number')
    else if value.state
      @value = new BigDecimal value.state.value
      if value.state.divisor
        @divisor = new BigDecimal value.state.divisor
    else
      throw new Error('Must intialize from string')

  export: =>
    state = Object.create null
    state.value = @value.toPlainString()
    if @divisor
      state.divisor = @divisor.toPlainString()
    return state

  compareTo: (amount) =>
    if amount instanceof Amount
      if @divisor
        if amount.divisor
          return (@value.multiply(amount.divisor)).compareTo(amount.value.multiply(@divisor))
        else
          return (@value).compareTo(amount.value.multiply(@divisor))
      else
        if amount.divisor
          return (@value.multiply(amount.divisor)).compareTo(amount.value)
        else
          return @value.compareTo(amount.value)
    else
      throw new Error('Can only compare to Amount objects')

  add: (amount) =>
    if amount instanceof Amount
      if @divisor
        if amount.divisor
          return new Amount((@value.multiply(amount.divisor)).add(amount.value.multiply(@divisor)), @divisor.multiply(amount.divisor))
        else
          return new Amount(@value.add(amount.value.multiply(@divisor)), @divisor)
      else
        if amount.divisor
          return new Amount((@value.multiply(amount.divisor)).add(amount.value), amount.divisor)
        else
          return new Amount(@value.add(amount.value))
    else
      throw new Error('Can only add Amount objects')

  subtract: (amount) =>
    if amount instanceof Amount
      if @divisor
        if amount.divisor
          return new Amount((@value.multiply(amount.divisor)).subtract(amount.value.multiply(@divisor)), @divisor.multiply(amount.divisor))
        else
          return new Amount(@value.subtract(amount.value.multiply(@divisor)), @divisor)
      else
        if amount.divisor
          return new Amount((@value.multiply(amount.divisor)).subtract(amount.value), amount.divisor)
        else
          return new Amount(@value.subtract(amount.value))
    else
      throw new Error('Can only subtract Amount objects')

  multiply: (amount) =>
    if amount instanceof Amount
      if @divisor
        if amount.divisor
          return new Amount(@value.multiply(amount.value), @divisor.multiply(amount.divisor))
        else
          return new Amount(@value.multiply(amount.value), @divisor)
      else
        if amount.divisor
          return new Amount(@value.multiply(amount.value), amount.divisor)
        else
          return new Amount(@value.multiply(amount.value))
    else
      throw new Error('Can only multiply Amount objects')    

  divide: (amount) =>
    if amount instanceof Amount
      if @divisor
        if amount.divisor
          return new Amount(@value.multiply(amount.divisor), amount.value.multiply(@divisor))
        else
          return new Amount(@value, amount.value.multiply(@divisor))
      else
        if amount.divisor
          return new Amount(@value.multiply(amount.divisor), amount.value)
        else
          return new Amount(@value, amount.value)
    else
      throw new Error('Can only divide Amount objects')    

  toString: =>
    if @divisor
      return @value.divide(@divisor, SCALE, ROUND_HALF_UP).stripTrailingZeros().toPlainString()
    else
      return @value.stripTrailingZeros().toPlainString()

Amount.ZERO = new Amount('0')