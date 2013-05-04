Big = require('../thirdparty/big')
Big.DP = 25
Big.RM = 0

module.exports = class Amount
  constructor: (value) ->
    if value instanceof Big
      @value = value
    else if typeof value == 'string'
      try
        @value = new Big value
      catch e
        throw new Error('String initializer cannot be parsed to a number')
    else
      throw new Error('Must intialize from string')

  compareTo: (amount) =>
    if amount instanceof Amount
      return @value.cmp amount.value
    else
      throw new Error 'Can only compare to Amount objects'

  add: (amount) =>
    if amount instanceof Amount
      return new Amount @value.plus amount.value
    else
      throw new Error 'Can only add Amount objects'

  subtract: (amount) =>
    if amount instanceof Amount
      return new Amount @value.minus amount.value
    else
      throw new Error 'Can only subtract Amount objects'

  multiply: (amount) =>
    if amount instanceof Amount
      return new Amount @value.times amount.value
    else
      throw new Error 'Can only multiply Amount objects'

  divide: (amount) =>
    if amount instanceof Amount
      return new Amount @value.div amount.value
    else
      throw new Error 'Can only divide Amount objects'

  toString: =>
    return @value.toString()

Amount.ZERO = new Amount '0'
Amount.ONE = new Amount '1'