chai = require 'chai'
chai.should()
expect = chai.expect

Withdraw = require '../../src/Operation/Withdraw'

describe 'Withdraw', ->
  it 'should error if no currency is supplied', ->
    expect ->
      withdraw = new Withdraw
        amount: '1000'
    .to.throw 'Must supply a currency'

  it 'should error if no amount is supplied', ->
    expect ->
      withdraw = new Withdraw
        currency: 'EUR'
    .to.throw 'Must supply an amount'

  it 'should instantiate recording the currency and amount', ->
    withdraw = new Withdraw
      currency: 'EUR'
      amount: '1000'
    withdraw.currency.should.equal 'EUR'
    withdraw.amount.should.equal '1000'