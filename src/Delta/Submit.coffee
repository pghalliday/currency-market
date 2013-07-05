Amount = require '../Amount'

convert = (halfTrade) ->
  remainder = halfTrade.remainder
  if remainder
    remainder.bidAmount = new Amount remainder.bidAmount
    remainder.offerAmount = new Amount remainder.offerAmount
  transaction = halfTrade.transaction
  debit = transaction.debit
  debit.amount = new Amount debit.amount
  debit.funds = new Amount debit.funds
  debit.lockedFunds = new Amount debit.lockedFunds
  credit = transaction.credit
  credit.amount = new Amount credit.amount
  credit.funds = new Amount credit.funds
  commission = credit.commission
  if commission
    commission.amount = new Amount commission.amount
    commission.funds = new Amount commission.funds

module.exports = class Submit
  constructor: (params) ->
    exported = params.exported
    if exported
      params = exported
      params.lockedFunds = new Amount params.lockedFunds
      trades = params.trades
      if trades
        for trade in trades
          convert trade.left
          convert trade.right
    @lockedFunds = params.lockedFunds
    @nextHigherOrderSequence = params.nextHigherOrderSequence
    @trades = params.trades
