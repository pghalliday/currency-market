Withdrawal = require('../src/Withdrawal')
Amount = require('../src/Amount')

describe 'Withdrawal', ->
  it 'should throw an error if the ID is missing', ->
    expect ->
      withdrawal = new Withdrawal
        timestamp: '987654321'
        account: 'name',
        currency: 'BTC',
        amount: '50'
    .to.throw('Withdrawal must have an ID')

  it 'should throw an error if the timestamp is missing', ->
    expect ->
      withdrawal = new Withdrawal
        id: '123456789'
        account: 'name',
        currency: 'BTC',
        amount: '50'
    .to.throw('Withdrawal must have a time stamp')

  it 'should throw an error if the account name is missing', ->
    expect ->
      withdrawal = new Withdrawal
        id: '123456789'
        timestamp: '987654321'
        currency: 'BTC',
        amount: '50'
    .to.throw('Withdrawal must be associated with an account')

  it 'should throw an error if the currency is missing', ->
    expect ->
      withdrawal = new Withdrawal
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        amount: '50'
    .to.throw('Withdrawal must be associated with a currency')

  it 'should throw an error if the amount is missing', ->
    expect ->
      withdrawal = new Withdrawal
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        currency: 'BTC'
    .to.throw('Withdrawal must have an amount')

  it 'should record the id, timestamp, account name, currency and amount', ->
    withdrawal = new Withdrawal
      id: '123456789'
      timestamp: '987654321'
      account: 'name',
      currency: 'BTC',
      amount: '50'
    withdrawal.id.should.equal('123456789')
    withdrawal.timestamp.should.equal('987654321')
    withdrawal.account.should.equal('name')
    withdrawal.currency.should.equal('BTC')
    withdrawal.amount.compareTo(new Amount('50')).should.equal(0)    
