Amount = require '../Amount'

module.exports = class Deposit
  constructor: (params) ->
    exported = params.exported
    if exported
      params = exported
      params.amount = new Amount exported.amount
    @currency = params.currency || throw new Error 'Must supply a currency'
    @amount = params.amount || throw new Error 'Must supply an amount'