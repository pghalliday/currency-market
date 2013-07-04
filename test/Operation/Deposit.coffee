chai = require 'chai'
chai.should()
expect = chai.expect

Deposit = require '../../src/Operation/Deposit'
Amount = require '../../src/Amount'

describe 'Deposit', ->
  it 'should error if no currency is supplied', ->
    expect ->
      deposit = new Deposit
        amount: new Amount '1000'
    .to.throw 'Must supply a currency'

  it 'should error if no amount is supplied', ->
    expect ->
      deposit = new Deposit
        currency: 'EUR'
    .to.throw 'Must supply an amount'

  it 'should instantiate recording the currency and amount', ->
    deposit = new Deposit
      currency: 'EUR'
      amount:  new Amount '1000'
    deposit.currency.should.equal 'EUR'
    deposit.amount.compareTo(new Amount '1000').should.equal 0
    deposit = new Deposit
      exported: JSON.parse JSON.stringify deposit
    deposit.currency.should.equal 'EUR'
    deposit.amount.compareTo(new Amount '1000').should.equal 0
