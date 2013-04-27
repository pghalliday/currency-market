chai = require 'chai'
chai.should()
expect = chai.expect
assert = chai.assert

Account = require('../src/Account')
Balance = require('../src/Balance')
Amount = require('../src/Amount')

describe 'Account', ->
  it 'should instantiate with a collection of balances matching the supported currencies', ->
    account = new Account
      id: '123456789'
      timestamp: '987654321'
      currencies: [
        'EUR'
        'USD'
        'BTC'
      ]
    account.id.should.equal '123456789'
    account.timestamp.should.equal '987654321'
    account.balances['EUR'].should.be.an.instanceOf(Balance)
    account.balances['USD'].should.be.an.instanceOf(Balance)
    account.balances['BTC'].should.be.an.instanceOf(Balance)

  it 'should throw an error if no id is present', ->
    expect =>
      account = new Account
        timestamp: '987654321'
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]
    .to.throw('Must supply transaction ID')   

  it 'should throw an error if no timestamp is present', ->
    expect =>
      account = new Account
        id: '123456789'
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]
    .to.throw('Must supply timestamp')   

  it 'should throw an error if no currencies are present', ->
    expect =>
      account = new Account
        id: '123456789'
        timestamp: '987654321'
    .to.throw('Must supply currencies')   

  describe '#equals', ->
    beforeEach ->
      @account = new Account
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]      
      @account.balances['EUR'].deposit new Amount '300'
      @account.balances['EUR'].lock new Amount '100'
      @account.balances['USD'].deposit new Amount '200'
      @account.balances['USD'].lock new Amount '50'
      @account.balances['BTC'].deposit new Amount '50'
      @account.balances['BTC'].lock new Amount '25'

    it 'should return true if 2 accounts are equal', ->
      account = new Account
        id: '123456789'
        timestamp: '987654321'
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]      
      account.balances['EUR'].deposit new Amount '300'
      account.balances['EUR'].lock new Amount '100'
      account.balances['USD'].deposit new Amount '200'
      account.balances['USD'].lock new Amount '50'
      account.balances['BTC'].deposit new Amount '50'
      account.balances['BTC'].lock new Amount '25'
      @account.equals(account).should.be.true

    it 'should return false if the ids are different', ->
      account = new Account
        id: '123456790'
        timestamp: '987654321'
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]      
      account.balances['EUR'].deposit new Amount '300'
      account.balances['EUR'].lock new Amount '100'
      account.balances['USD'].deposit new Amount '200'
      account.balances['USD'].lock new Amount '50'
      account.balances['BTC'].deposit new Amount '50'
      account.balances['BTC'].lock new Amount '25'
      @account.equals(account).should.be.false

    it 'should return false if the timestamps are different', ->
      account = new Account
        id: '123456789'
        timestamp: '987654322'
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]      
      account.balances['EUR'].deposit new Amount '300'
      account.balances['EUR'].lock new Amount '100'
      account.balances['USD'].deposit new Amount '200'
      account.balances['USD'].lock new Amount '50'
      account.balances['BTC'].deposit new Amount '50'
      account.balances['BTC'].lock new Amount '25'
      @account.equals(account).should.be.false

    it 'should return false if a balance is different', ->
      account = new Account
        id: '123456789'
        timestamp: '987654322'
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]      
      account.balances['EUR'].deposit new Amount '300'
      account.balances['EUR'].lock new Amount '50'
      account.balances['USD'].deposit new Amount '200'
      account.balances['USD'].lock new Amount '50'
      account.balances['BTC'].deposit new Amount '50'
      account.balances['BTC'].lock new Amount '25'
      @account.equals(account).should.be.false
      account = new Account
        id: '123456789'
        timestamp: '987654322'
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]      
      account.balances['EUR'].deposit new Amount '300'
      account.balances['EUR'].lock new Amount '100'
      account.balances['USD'].deposit new Amount '150'
      account.balances['USD'].lock new Amount '50'
      account.balances['BTC'].deposit new Amount '50'
      account.balances['BTC'].lock new Amount '25'
      @account.equals(account).should.be.false
      account = new Account
        id: '123456789'
        timestamp: '987654322'
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]      
      account.balances['EUR'].deposit new Amount '300'
      account.balances['EUR'].lock new Amount '100'
      account.balances['USD'].deposit new Amount '200'
      account.balances['USD'].lock new Amount '50'
      account.balances['BTC'].deposit new Amount '50'
      account.balances['BTC'].lock new Amount '50'
      @account.equals(account).should.be.false

  describe '#export', ->
    it 'should export the state of the account as a JSON stringifiable object that can be used to initialise a new Account in the exact same state', ->
      account = new Account
        id: '123456789'
        timestamp: '987654322'
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]
      state = account.export()
      json = JSON.stringify state
      newAccount = new Account
        state: JSON.parse(json)
      newAccount.equals(account).should.be.true
