Account = require './Account'

module.exports = class State
  constructor: (state) ->
    @accounts = Object.create null
    @nextSequence = 0
    if state
      @nextSequence = state.nextDeltaSequence
      for id, account of state.accounts
        @accounts[id] = new Account account
      for bidCurrency, books of state.books
        for offerCurrency, book of books
          for order in book
            do (order) =>
              @accounts[order.account].orders[order.sequence] = order
              

  getAccount: (id) =>
    @accounts[id] = @accounts[id] || new Account()

  apply: (delta) =>
    if delta.sequence == @nextSequence
      @nextSequence++
      operation = delta.operation
      result = delta.result
      account = @getAccount(operation.account)
      deposit = operation.deposit
      if deposit
        account.getBalance(deposit.currency).funds = result.funds
      else
        throw new Error 'Unknown operation'
    else if delta.sequence > @nextSequence
      throw new Error 'Unexpected delta'
