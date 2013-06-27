Amount = require('../Amount')

module.exports = class Balance
  constructor: (params) ->
    @funds = Amount.ZERO
    @lockedFunds = Amount.ZERO
    if params
      @commission = params.commission

  deposit: (amount) =>
    @funds = @funds.add amount

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
      if @commission
        commission = @commission.calculate
          amount: fill.bidAmount
          timestamp: fill.timestamp
          account: order.account
          currency: order.bidCurrency
        @funds = @funds.add fill.bidAmount.subtract commission
        @commission.account.deposit
          currency: order.bidCurrency
          amount: commission
      else
        @funds = @funds.add fill.bidAmount

  cancel: (order) =>
    @lockedFunds = @lockedFunds.subtract order.offerAmount    

  withdraw: (amount) =>
    newFunds = @funds.subtract amount
    if newFunds.compareTo(@lockedFunds) < 0
      throw new Error('Cannot withdraw funds that are not available')
    else
      @funds = newFunds

  export: =>
    object = Object.create null
    object.funds = @funds.toString()
    object.lockedFunds = @lockedFunds.toString()
    return object