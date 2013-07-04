Deposit = require './Deposit'
Withdraw = require './Withdraw'
Submit = require './Submit'
Cancel = require './Cancel'

module.exports = class Operation
  constructor: (params) ->
    exported = params.exported
    if params.json
      exported = JSON.parse params.json
    if exported
      params = exported
      if params.deposit
        params.deposit =
          exported: params.deposit
      if params.withdraw
        params.withdraw =
          exported: params.withdraw
      if params.submit
        params.submit =
          exported: params.submit
      if params.cancel
        params.cancel =
          exported: params.cancel
    @reference = params.reference
    @sequence = params.sequence
    if typeof @sequence == 'undefined'
      throw new Error 'Must supply a sequence number'
    @timestamp = params.timestamp
    if typeof @timestamp == 'undefined'
      throw new Error 'Must supply a timestamp'
    @account = params.account || throw new Error 'Must supply an account ID'
    deposit = params.deposit
    withdraw = params.withdraw
    submit = params.submit
    cancel = params.cancel
    if deposit
      @deposit = new Deposit deposit
    else if withdraw
      @withdraw = new Withdraw withdraw
    else if submit
      @submit = new Submit submit
    else if cancel
      @cancel = new Cancel cancel
    else
      throw new Error 'Unknown operation'
