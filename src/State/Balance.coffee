module.exports = class Balance

  constructor: (params) ->
    if params
      @funds = params.funds
      @lockedFunds = params.lockedFunds
    else
      @funds = '0'
      @lockedFunds = '0'

  setFunds: (amount) =>
    @funds = amount

  setLockedFunds: (amount) =>
    @lockedFunds = amount

  getFunds: =>
    @funds

  getLockedFunds: =>
    @lockedFunds