chai = require 'chai'
chai.should()
expect = chai.expect

Deposit = require '../../src/Operation/Deposit'

describe 'Deposit', ->
  it 'should error if no currency is supplied', ->
    expect ->
      deposit = new Deposit
        amount: '1000'
    .to.throw 'Must supply a currency'

  it 'should error if no amount is supplied', ->
    expect ->
      deposit = new Deposit
        currency: 'EUR'
    .to.throw 'Must supply an amount'

  it 'should instantiate recording the currency and amount', ->
    deposit = new Deposit
      currency: 'EUR'
      amount: '1000'
    deposit.currency.should.equal 'EUR'
    deposit.amount.should.equal '1000'