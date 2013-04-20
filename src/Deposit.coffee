Amount = require('../src/Amount')

module.exports = class Deposit
  constructor: (params) ->
    @id =  params.id
    if typeof @id == 'undefined'
      throw new Error('Deposit must have an ID')

    @timestamp = params.timestamp
    if typeof @timestamp == 'undefined'
      throw new Error('Deposit must have a time stamp')

    @account = params.account
    if typeof @account == 'undefined'
      throw new Error('Deposit must be associated with an account')

    @currency = params.currency
    if typeof @currency == 'undefined'
      throw new Error('Deposit must be associated with a currency')

    if typeof params.amount == 'undefined'
      throw new Error('Deposit must have an amount')
    else
      @amount = new Amount(params.amount)
