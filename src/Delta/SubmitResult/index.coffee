module.exports = class SubmitResult
  constructor: (params) ->
    @lockedFunds = params.lockedFunds
    @nextHigherOrderSequence = params.nextHigherOrderSequence
    @trades = params.trades
