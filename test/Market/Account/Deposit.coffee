Deposit = require('../../../src/Market/Account/Deposit')
Amount = require('../../../src/Market/Amount')

describe 'Deposit', ->
  it 'should throw an error if the ID is missing', ->
    expect ->
      deposit = new Deposit
        timestamp: '987654321'
        account: 'name',
        currency: 'BTC',
        amount: '50'
    .to.throw('Deposit must have an ID')

  it 'should throw an error if the timestamp is missing', ->
    expect ->
      deposit = new Deposit
        id: '123456789'
        account: 'name',
        currency: 'BTC',
        amount: '50'
    .to.throw('Deposit must have a time stamp')

  it 'should throw an error if the account name is missing', ->
    expect ->
      deposit = new Deposit
        id: '123456789'
        timestamp: '987654321'
        currency: 'BTC',
        amount: '50'
    .to.throw('Deposit must be associated with an account')

  it 'should throw an error if the currency is missing', ->
    expect ->
      deposit = new Deposit
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        amount: '50'
    .to.throw('Deposit must be associated with a currency')

  it 'should throw an error if the amount is missing', ->
    expect ->
      deposit = new Deposit
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        currency: 'BTC'
    .to.throw('Deposit must have an amount')

  it 'should throw an error if the amount is negative', ->
    expect ->
      deposit = new Deposit
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        currency: 'BTC',
        amount: '-50'
    .to.throw('Deposit amount cannot be negative')

  it 'should record the id, timestamp, account name, currency and amount', ->
    deposit = new Deposit
      id: '123456789'
      timestamp: '987654321'
      account: 'name',
      currency: 'BTC',
      amount: '50'
    deposit.id.should.equal('123456789')
    deposit.timestamp.should.equal('987654321')
    deposit.account.should.equal('name')
    deposit.currency.should.equal('BTC')
    deposit.amount.compareTo(new Amount('50')).should.equal(0)    
