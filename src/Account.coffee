Currency = require('./Currency')

module.exports = class Account
  constructor: ->
    @currencies = Object.create null

  getCurrency: (name) ->
    currency = @currencies[name]
    if typeof currency == 'undefined'
      @currencies[name] = currency = new Currency()
    return currency
