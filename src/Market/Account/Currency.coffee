Amount = require('../Amount')

module.exports = class Currency
  constructor: (currencies) ->
    @funds = new Amount()
    @lockedFunds = new Amount()

  deposit: (deposit) =>
    @funds = @funds.add(deposit.amount)

  lock: (order) =>
    newLockedFunds = @lockedFunds.add(order.offerAmount)
    if newLockedFunds.compareTo(@funds) > 0
      throw new Error('Cannot lock funds that are not available')
    else
      @lockedFunds = newLockedFunds

  unlock: (order) =>
    newLockedFunds = @lockedFunds.subtract(order.offerAmount)
    if newLockedFunds.compareTo(Amount.ZERO) < 0
      throw new Error('Cannot unlock funds that are not locked')
    else
      @lockedFunds = newLockedFunds

  withdraw: (withdrawal) =>
    newFunds = @funds.subtract(withdrawal.amount)
    if newFunds.compareTo(@lockedFunds) < 0
      throw new Error('Cannot withdraw funds that are not available')
    else
      @funds = newFunds
