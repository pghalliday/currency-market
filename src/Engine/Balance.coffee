Amount = require('../Amount')

module.exports = class Balance
  constructor: (params) ->
    @offers = Object.create null
    @funds = Amount.ZERO
    @lockedFunds = Amount.ZERO
    if params
      @commission = params.commission

  deposit: (amount) =>
    @funds = @funds.add new Amount amount

  submitOffer: (order) =>
    newLockedFunds = @lockedFunds.add order.offerAmount
    if newLockedFunds.compareTo(@funds) > 0
      throw new Error('Cannot lock funds that are not available')
    else
      @offers[order.id] = order
      @lockedFunds = newLockedFunds
      order.on 'fill', (fill) =>
        @lockedFunds = @lockedFunds.subtract fill.fundsUnlocked
        @funds = @funds.subtract fill.offerAmount
      order.on 'done', =>
        delete @offers[order.id]

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
          amount: commission.toString()
      else
        @funds = @funds.add fill.bidAmount

  cancel: (order) =>
    @lockedFunds = @lockedFunds.subtract order.offerAmount    
    delete @offers[order.id]

  withdraw: (amount) =>
    newFunds = @funds.subtract new Amount amount
    if newFunds.compareTo(@lockedFunds) < 0
      throw new Error('Cannot withdraw funds that are not available')
    else
      @funds = newFunds

  export: =>
    object = Object.create null
    object.funds = @funds.toString()
    object.lockedFunds = @lockedFunds.toString()
    object.offers = Object.create null
    for id, order of @offers
      object.offers[id] = order.export()
    return object