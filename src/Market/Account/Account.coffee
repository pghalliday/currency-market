Currency = require('./Currency')

module.exports = class Account
  constructor: (currencies) ->
    @currencies = Object.create null
    currencies.forEach (currency) =>
      @currencies[currency] = new Currency currencies.filter (match) ->
        return currency != match

