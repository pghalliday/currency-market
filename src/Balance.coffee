Amount = require('./Amount')

module.exports = class Balance
  constructor: (params) ->
    if typeof params == 'undefined'
      @funds = Amount.ZERO
      @lockedFunds = Amount.ZERO
    else
      @funds = new Amount 
        state: params.state.funds
      @lockedFunds = new Amount
        state: params.state.lockedFunds

  export: =>
    state = Object.create null
    state.funds = @funds.export()
    state.lockedFunds = @lockedFunds.export()
    return state

  deposit: (amount) =>
    @funds = @funds.add(amount)

  submitOffer: (order) =>
    newLockedFunds = @lockedFunds.add order.offerAmount
    if newLockedFunds.compareTo(@funds) > 0
      throw new Error('Cannot lock funds that are not available')
    else
      @lockedFunds = newLockedFunds
      order.on 'fill', (fill) =>
        @lockedFunds = @lockedFunds.subtract fill.fundsUnlocked
        @funds = @funds.subtract fill.offerAmount

  submitBid: (order) =>
    order.on 'fill', (fill) =>
      @funds = @funds.add fill.bidAmount

  cancel: (order) =>
    @lockedFunds = @lockedFunds.subtract order.offerAmount    

  withdraw: (amount) =>
    newFunds = @funds.subtract(amount)
    if newFunds.compareTo(@lockedFunds) < 0
      throw new Error('Cannot withdraw funds that are not available')
    else
      @funds = newFunds

  equals: (balance) =>
    return @funds.compareTo(balance.funds) == 0 && @lockedFunds.compareTo(balance.lockedFunds) == 0
