Amount = require('./Amount')

module.exports = class Balance
  constructor: () ->
    @funds = Amount.ZERO
    @lockedFunds = Amount.ZERO

  deposit: (amount) =>
    @funds = @funds.add(amount)

  lock: (amount) =>
    newLockedFunds = @lockedFunds.add(amount)
    if newLockedFunds.compareTo(@funds) > 0
      throw new Error('Cannot lock funds that are not available')
    else
      @lockedFunds = newLockedFunds

  unlock: (amount) =>
    newLockedFunds = @lockedFunds.subtract(amount)
    if newLockedFunds.compareTo(Amount.ZERO) < 0
      throw new Error('Cannot unlock funds that are not locked')
    else
      @lockedFunds = newLockedFunds

  withdraw: (amount) =>
    newFunds = @funds.subtract(amount)
    if newFunds.compareTo(@lockedFunds) < 0
      throw new Error('Cannot withdraw funds that are not available')
    else
      @funds = newFunds