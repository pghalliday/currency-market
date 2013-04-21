Market = require('../../src/Market/Market')
Book = require('../../src/Market/Book')
Account = require('../../src/Market/Account/Account')
Currency = require('../../src/Market/Account/Currency')
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
      deposit = 
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
      deposit = 
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
      deposit = 
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
      deposit = 
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        currency: 'BTC',
        amount: '200'
      market.deposit(deposit)
      withdrawal = 
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        currency: 'BTC',
        amount: '50'
      market.withdraw(withdrawal)
      account.currencies['BTC'].funds.compareTo(new Amount('150')).should.equal(0)

    it 'should throw an error if the account does not exist', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      withdrawal = 
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
      withdrawal = 
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        currency: 'CAD',
        amount: '50'
      expect ->
        market.withdraw(withdrawal)
      .to.throw('Currency is not supported')

  describe '#add', ->
    it 'should lock the correct funds in the correct account', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      account = market.accounts['name']
      deposit = 
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        currency: 'EUR',
        amount: '200'
      market.deposit(deposit)
      order1 = 
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        offerPrice: '100',
        offerAmount: '50'        
      market.add(order1)
      order2 = 
        id: '123456790'
        timestamp: '987654322'
        account: 'name',
        bidCurrency: 'USD',
        offerCurrency: 'EUR',
        offerPrice: '100',
        offerAmount: '100'        
      market.add(order2)
      account.currencies['EUR'].lockedFunds.compareTo(new Amount('150')).should.equal(0)

    it 'should add an order to the correct book', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      deposit = 
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        currency: 'EUR',
        amount: '200'
      market.deposit(deposit)
      order = 
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        offerPrice: '100',
        offerAmount: '50'        
      market.add(order)
      market.books['BTC']['EUR'].orders[order.id].should.be.ok

    it 'should execute the order immediately if it can', ->
      #false.should.be.true

    it 'should throw an error if the account does not exist', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      order = 
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        offerPrice: '100',
        offerAmount: '50'        
      expect ->
        market.add(order)
      .to.throw('Account does not exist')

    it 'should throw an error if the offer currency is not supported', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      order = 
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'CAD',
        offerPrice: '100',
        offerAmount: '50'        
      expect ->
        market.add(order)
      .to.throw('Offer currency is not supported')

    it 'should throw an error if the bid currency is not supported', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      order = 
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'CAD',
        offerCurrency: 'EUR',
        offerPrice: '100',
        offerAmount: '50'        
      expect ->
        market.add(order)
      .to.throw('Bid currency is not supported')

  describe '#delete', ->
    it 'should unlock the correct funds in the correct account', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      account = market.accounts['name']
      deposit = 
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        currency: 'EUR',
        amount: '200'
      market.deposit(deposit)
      order1 = 
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        offerPrice: '100',
        offerAmount: '50'        
      market.add(order1)
      order2 = 
        id: '123456790'
        timestamp: '987654322'
        account: 'name',
        bidCurrency: 'USD',
        offerCurrency: 'EUR',
        offerPrice: '100',
        offerAmount: '100'        
      market.add(order2)
      account.currencies['EUR'].lockedFunds.compareTo(new Amount('150')).should.equal(0)
      market.delete(order1)
      account.currencies['EUR'].lockedFunds.compareTo(new Amount('100')).should.equal(0)

    it 'should remove the order from the correct book', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      deposit = 
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        currency: 'EUR',
        amount: '200'
      market.deposit(deposit)
      order = 
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        offerPrice: '100',
        offerAmount: '50'        
      market.add(order)
      market.delete(order)
      expect(market.books['BTC']['EUR'].orders[order.id]).to.not.be.ok

    it 'should throw an error if the account does not exist', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      order = 
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        offerPrice: '100',
        offerAmount: '50'        
      expect ->
        market.delete(order)
      .to.throw('Account does not exist')

    it 'should throw an error if the offer currency is not supported', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      order = 
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'CAD',
        offerPrice: '100',
        offerAmount: '50'        
      expect ->
        market.delete(order)
      .to.throw('Offer currency is not supported')

    it 'should throw an error if the bid currency is not supported', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      order = 
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'CAD',
        offerCurrency: 'EUR',
        offerPrice: '100',
        offerAmount: '50'        
      expect ->
        market.delete(order)
      .to.throw('Bid currency is not supported')

    it 'should throw an error and leave the locked funds untouched if the offer cannot be found in the book', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      account = market.accounts['name']
      deposit = 
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        currency: 'EUR',
        amount: '200'
      market.deposit(deposit)
      order1 = 
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        offerPrice: '100',
        offerAmount: '50'        
      market.add(order1)
      order2 = 
        id: '123456790'
        timestamp: '987654322'
        account: 'name',
        bidCurrency: 'USD',
        offerCurrency: 'EUR',
        offerPrice: '100',
        offerAmount: '100'        
      market.add(order2)
      account.currencies['EUR'].lockedFunds.compareTo(new Amount('150')).should.equal(0)
      order3 = 
        id: '123456791'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        offerPrice: '100',
        offerAmount: '50'        
      expect ->
        market.delete(order3)
      .to.throw('Order cannot be found')
      account.currencies['EUR'].lockedFunds.compareTo(new Amount('150')).should.equal(0)
