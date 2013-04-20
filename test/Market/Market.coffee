Market = require('../../src/Market/Market')
Book = require('../../src/Market/Book')
Account = require('../../src/Market/Account/Account')
Currency = require('../../src/Market/Account/Currency')

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
