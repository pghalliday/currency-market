Deposit = require './Deposit'
Withdraw = require './Withdraw'
Submit = require './Submit'
Cancel = require './Cancel'

module.exports = class Delta
  constructor: (params) ->
    @sequence = params.sequence
    if typeof @sequence == 'undefined'
      throw new Error 'Must supply a sequence number'
    @operation = params.operation || throw new Error 'Must supply an operation'
    result = params.result
    if result
      if @operation.deposit
        @result = new Deposit result
      else if @operation.withdraw
        @result = new Withdraw result
      else if @operation.submit
        @result = new Submit result
      else if @operation.cancel
        @result = new Cancel result
      else
        throw new Error 'Unknown operation'
    else
      throw new Error 'Must supply a result'
