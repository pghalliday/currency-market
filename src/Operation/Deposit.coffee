module.exports = class Deposit
  constructor: (params) ->
    @currency = params.currency || throw new Error 'Must supply a currency'
    @amount = params.amount || throw new Error 'Must supply an amount'