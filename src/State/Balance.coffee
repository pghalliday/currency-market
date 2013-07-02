module.exports = class Balance

  constructor: (params) ->
    if params
      @funds = params.funds
      @lockedFunds = params.lockedFunds
    else
      @funds = '0'
      @lockedFunds = '0'
