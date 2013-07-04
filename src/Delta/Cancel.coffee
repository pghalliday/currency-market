Amount = require '../Amount'

module.exports = class Cancel
  constructor: (params) ->
    exported = params.exported
    if exported
      params = exported
      params.lockedFunds = new Amount params.lockedFunds
    @lockedFunds = params.lockedFunds
