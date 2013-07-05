Amount = require '../Amount'

module.exports = class Balance
  constructor: (params) ->
    @funds = Amount.ZERO
    @lockedFunds = Amount.ZERO
    if params
      @funds = new Amount params.funds
      @lockedFunds = new Amount params.lockedFunds
