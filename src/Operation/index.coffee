module.exports = class Operation
  constructor: (params) ->
    @reference = params.reference
    @sequence = params.sequence
    if typeof @sequence == 'undefined'
      throw new Error 'Must supply a sequence number'
    @timestamp = params.timestamp
    if typeof @timestamp == 'undefined'
      throw new Error 'Must supply a timestamp'
    @account = params.account || throw new Error 'Must supply an account ID'
    @deposit = params.deposit
    @withdraw = params.withdraw
    @submit = params.submit
    @cancel = params.cancel
    if @deposit
    else if @withdraw
    else if @submit
    else if @cancel
    else
      throw new Error 'Unknown operation'
