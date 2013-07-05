Amount = require '../Amount'

module.exports = class Balance
  constructor: (params) ->
    if params.account
      if params.currency
        @funds = Amount.ZERO
        @lockedFunds = Amount.ZERO
        @account = params.account
        @currency = params.currency
        if params.commission
          @commissionBalance = params.commission.account.getBalance @currency
          @commissionCalculate = params.commission.calculate
      else
        throw new Error 'Must supply a currency'
    else
      throw new Error 'Must supply an account'

  deposit: (amount) =>
    @funds = @funds.add amount

  withdraw: (amount) =>
    newFunds = @funds.subtract amount
    if newFunds.compareTo(@lockedFunds) < 0
      throw new Error('Cannot withdraw funds that are not available')
    else
      @funds = newFunds

  lock: (amount) =>
    newLockedFunds = @lockedFunds.add amount
    if newLockedFunds.compareTo(@funds) > 0
      throw new Error('Cannot lock funds that are not available')
    else
      @lockedFunds = newLockedFunds

  unlock: (amount) =>
    @lockedFunds = @lockedFunds.subtract amount

  applyOffer: (params) =>
    @lockedFunds = @lockedFunds.subtract params.fundsUnlocked
    @funds = @funds.subtract params.amount
    debit = 
      amount: params.amount
      funds: @funds
      lockedFunds: @lockedFunds

  applyBid: (params) =>
    if @commissionBalance
      commission = @commissionCalculate
        amount: params.amount
        timestamp: params.timestamp
        account: @account
        currency: @currency
      amount = params.amount.subtract commission.amount
      @funds = @funds.add amount
      credit =
        amount: amount
        funds: @funds
        commission:
          amount: commission.amount
          funds: @commissionBalance.deposit commission.amount
          reference: commission.reference
    else
      @funds = @funds.add params.amount
      credit =
        amount: params.amount
        funds: @funds

  toJSON: =>
    object = 
      funds: @funds
      lockedFunds: @lockedFunds
