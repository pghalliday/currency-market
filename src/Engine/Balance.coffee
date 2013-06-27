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
    debit = 
      amount: params.amount
    @lockedFunds = @lockedFunds.subtract params.fundsUnlocked
    @funds = @funds.subtract debit.amount
    return debit

  applyBid: (params) =>
    if @commissionBalance
      credit =
        commission: @commissionCalculate
          amount: params.amount
          timestamp: params.timestamp
          account: @account
          currency: @currency
      credit.amount = params.amount.subtract credit.commission.amount
      @funds = @funds.add credit.amount
      @commissionBalance.deposit credit.commission.amount
      return credit
    else
      credit =
        amount: params.amount
      @funds = @funds.add credit.amount
      return credit

  export: =>
    object = Object.create null
    object.funds = @funds.toString()
    object.lockedFunds = @lockedFunds.toString()
    return object