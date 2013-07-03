module.exports = class SubmitDelta
  constructor: (params) ->
    @lockedFunds = params.lockedFunds
    @nextHigherOrderSequence = params.nextHigherOrderSequence
    @trades = params.trades
