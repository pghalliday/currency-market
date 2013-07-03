module.exports = class Balance

  constructor: (params) ->
    @funds = '0'
    @lockedFunds = '0'
    if params
      @funds = params.funds
      @lockedFunds = params.lockedFunds
