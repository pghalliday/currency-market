Market = require('../../src/Market/Market')
Book = require('../../src/Market/Book')
Account = require('../../src/Market/Account/Account')
Currency = require('../../src/Market/Account/Currency')
Deposit = require('../../src/Market/Account/Deposit')
Withdrawal = require('../../src/Market/Account/Withdrawal')
Amount = require('../../src/Market/Amount')

describe 'Market', ->
  it 'should instantiate with a collection of accounts and books matching the supported currencies', ->
    market = new Market(['EUR', 'USD', 'BTC'])
    Object.keys(market.accounts).should.be.empty
    market.books['EUR']['BTC'].should.be.an.instanceOf(Book)
    market.books['EUR']['USD'].should.be.an.instanceOf(Book)
    market.books['USD']['EUR'].should.be.an.instanceOf(Book)
    market.books['BTC']['EUR'].should.be.an.instanceOf(Book)
    market.books['USD']['EUR'].should.be.an.instanceOf(Book)
    market.books['EUR']['USD'].should.be.an.instanceOf(Book)

  describe '#addAccount', ->
    it 'should add an account to the market with the supported currencies', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      account = market.accounts['name']
      account.should.be.an.instanceOf(Account)
      account.currencies['EUR'].should.be.an.instanceOf(Currency)
      account.currencies['USD'].should.be.an.instanceOf(Currency)
      account.currencies['BTC'].should.be.an.instanceOf(Currency)

    it 'should throw an error if the account already exists', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      expect ->
        market.addAccount('name')
      .to.throw('Account already exists')

  describe '#deposit', ->
    it 'should credit the correct account and currency', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      account = market.accounts['name']
      account.currencies['EUR'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.currencies['USD'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.currencies['BTC'].funds.compareTo(Amount.ZERO).should.equal(0)
      deposit = new Deposit
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        currency: 'BTC',
        amount: '50'
      market.deposit(deposit)
      account.currencies['EUR'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.currencies['USD'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.currencies['BTC'].funds.compareTo(new Amount('50')).should.equal(0)

    it 'should throw an error if the account does not exist', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      deposit = new Deposit
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        currency: 'BTC',
        amount: '50'
      expect ->
        market.deposit(deposit)
      .to.throw('Account does not exist')

    it 'should throw an error if the currency is not supported', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      deposit = new Deposit
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        currency: 'CAD',
        amount: '50'
      expect ->
        market.deposit(deposit)
      .to.throw('Currency is not supported')

  describe '#withdraw', ->
    it 'should debit the correct account and currency', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      account = market.accounts['name']
      deposit = new Deposit
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        currency: 'BTC',
        amount: '200'
      market.deposit(deposit)
      withdrawal = new Withdrawal
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        currency: 'BTC',
        amount: '50'
      market.withdraw(withdrawal)
      account.currencies['BTC'].funds.compareTo(new Amount('150')).should.equal(0)

    it 'should throw an error if the account does not exist', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      withdrawal = new Withdrawal
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        currency: 'BTC',
        amount: '50'
      expect ->
        market.withdraw(withdrawal)
      .to.throw('Account does not exist')

    it 'should throw an error if the currency is not supported', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      withdrawal = new Withdrawal
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        currency: 'CAD',
        amount: '50'
      expect ->
        market.withdraw(withdrawal)
      .to.throw('Currency is not supported')




