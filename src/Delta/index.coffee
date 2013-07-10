Deposit = require './Deposit'
Withdraw = require './Withdraw'
Submit = require './Submit'
Cancel = require './Cancel'
Operation = require '../Operation'

module.exports = class Delta
  constructor: (params) ->
    exported = params.exported
    if params.json
      exported = JSON.parse params.json
    if exported
      params = exported
      params.result = 
        exported: params.result
      params.operation = new Operation
        exported: params.operation
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
