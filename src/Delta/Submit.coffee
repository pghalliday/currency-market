Amount = require '../Amount'

module.exports = class Submit
  constructor: (params) ->
    exported = params.exported
    if exported
      params = exported
      params.lockedFunds = new Amount params.lockedFunds
    @lockedFunds = params.lockedFunds
    @nextHigherOrderSequence = params.nextHigherOrderSequence
    @trades = params.trades
