module.exports = class Submit
  constructor: (params) ->
    @lockedFunds = params.lockedFunds
    @nextHigherOrderSequence = params.nextHigherOrderSequence
    @trades = params.trades
