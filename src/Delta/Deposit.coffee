Amount = require '../Amount'

module.exports = class Deposit
  constructor: (params) ->
    exported = params.exported
    if exported
      params = exported
      params.funds = new Amount params.funds
    @funds = params.funds
