Market = require('../../src/Market/Market')
Book = require('../../src/Market/Book')
Account = require('../../src/Market/Account/Account')
Balance = require('../../src/Market/Account/Balance')
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
      account.balances['EUR'].should.be.an.instanceOf(Balance)
      account.balances['USD'].should.be.an.instanceOf(Balance)
      account.balances['BTC'].should.be.an.instanceOf(Balance)

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
      account.balances['EUR'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.balances['USD'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.balances['BTC'].funds.compareTo(Amount.ZERO).should.equal(0)
      market.deposit
        account: 'name'
        currency: 'BTC'
        amount: '50'
      account.balances['EUR'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.balances['USD'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.balances['BTC'].funds.compareTo(new Amount('50')).should.equal(0)

    it 'should throw an error if the account does not exist', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      expect ->
        market.deposit
          account: 'name',
          currency: 'BTC',
          amount: '50'
      .to.throw('Account does not exist')

    it 'should throw an error if the currency is not supported', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      expect ->
        market.deposit
          account: 'name'
          currency: 'CAD'
          amount: '50'
      .to.throw('Currency is not supported')

  describe '#withdraw', ->
    it 'should debit the correct account and currency', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      account = market.accounts['name']
      market.deposit
        account: 'name'
        currency: 'BTC'
        amount: '200'
      market.withdraw
        account: 'name'
        currency: 'BTC'
        amount: '50'
      account.balances['BTC'].funds.compareTo(new Amount('150')).should.equal(0)

    it 'should throw an error if the account does not exist', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      expect ->
        market.withdraw
          account: 'name'
          currency: 'BTC'
          amount: '50'
      .to.throw('Account does not exist')

    it 'should throw an error if the currency is not supported', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      expect ->
        market.withdraw
          account: 'name'
          currency: 'CAD'
          amount: '50'
      .to.throw('Currency is not supported')

  describe '#add', ->
    it 'should lock the correct funds in the correct account', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      account = market.accounts['name']
      market.deposit
        account: 'name'
        currency: 'EUR'
        amount: '200'
      market.add
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '100'
        offerAmount: '50'        
      market.add
        id: '123456790'
        timestamp: '987654322'
        account: 'name'
        bidCurrency: 'USD'
        offerCurrency: 'EUR'
        offerPrice: '100'
        offerAmount: '100'        
      account.balances['EUR'].lockedFunds.compareTo(new Amount('150')).should.equal(0)

    it 'should add an order to the correct book', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      market.deposit
        account: 'name'
        currency: 'EUR'
        amount: '200'
      market.add
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '100'
        offerAmount: '50'        
      market.books['BTC']['EUR'].orders['123456789'].should.be.ok

    it 'should execute exactly matching orders immediately', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('Peter')
      market.addAccount('Paul')
      market.deposit
        account: 'Peter'
        currency: 'EUR'
        amount: '2000'
      market.deposit
        account: 'Paul'
        currency: 'BTC'
        amount: '200'
      market.add
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: '5'
        bidAmount: '20'
      market.books['BTC']['EUR'].orders['1'].should.be.ok
      market.add
        id: '2'
        timestamp: '2'
        account: 'Paul'
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'
        offerPrice: '5'
        offerAmount: '20'
      expect(market.books['BTC']['EUR'].orders['1']).to.not.be.ok
      expect(market.books['EUR']['BTC'].orders['2']).to.not.be.ok
      market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1900')).should.equal(0)
      market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0)
      market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('20')).should.equal(0)
      market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('100')).should.equal(0)
      market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('180')).should.equal(0)
      market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0)

    it 'should execute partially matched bid orders immediately', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('Peter')
      market.addAccount('Paul')
      market.deposit
        account: 'Peter'
        currency: 'EUR'
        amount: '2000'
      market.deposit
        account: 'Paul'
        currency: 'BTC'
        amount: '200'
      market.add
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: '5'
        bidAmount: '20'
      market.books['BTC']['EUR'].orders['1'].should.be.ok
      market.add
        id: '2'
        timestamp: '2'
        account: 'Paul'
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'
        offerPrice: '5'
        offerAmount: '15'
      market.books['BTC']['EUR'].orders['1'].bidAmount.compareTo(new Amount('5')).should.equal(0)
      expect(market.books['EUR']['BTC'].orders['2']).to.not.be.ok
      market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1925')).should.equal(0)
      market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('25')).should.equal(0)
      market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('15')).should.equal(0)
      market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('75')).should.equal(0)
      market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('185')).should.equal(0)
      market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0)

    it 'should execute partially matched offer orders immediately', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('Peter')
      market.addAccount('Paul')
      market.deposit
        account: 'Peter'
        currency: 'EUR'
        amount: '2000'
      market.deposit
        account: 'Paul'
        currency: 'BTC'
        amount: '200'
      market.add
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: '5'
        bidAmount: '15'
      market.books['BTC']['EUR'].orders['1'].should.be.ok
      market.add
        id: '2'
        timestamp: '2'
        account: 'Paul'
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'
        offerPrice: '5'
        offerAmount: '20'
      expect(market.books['BTC']['EUR'].orders['1']).to.not.be.ok
      market.books['EUR']['BTC'].orders['2'].offerAmount.compareTo(new Amount('5')).should.equal(0)
      market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1925')).should.equal(0)
      market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0)
      market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('15')).should.equal(0)
      market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('75')).should.equal(0)
      market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('185')).should.equal(0)
      market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('5')).should.equal(0)

    it 'should throw an error if the account does not exist', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      expect ->
        market.add
          id: '123456789'
          timestamp: '987654321'
          account: 'name'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: '100'
          offerAmount: '50'        
      .to.throw('Account does not exist')

    it 'should throw an error if the offer currency is not supported', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      expect ->
        market.add
          id: '123456789'
          timestamp: '987654321'
          account: 'name'
          bidCurrency: 'BTC'
          offerCurrency: 'CAD'
          offerPrice: '100'
          offerAmount: '50'        
      .to.throw('Offer currency is not supported')

    it 'should throw an error if the bid currency is not supported', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      expect ->
        market.add
          id: '123456789'
          timestamp: '987654321'
          account: 'name'
          bidCurrency: 'CAD'
          offerCurrency: 'EUR'
          offerPrice: '100'
          offerAmount: '50'        
      .to.throw('Bid currency is not supported')

  describe '#delete', ->
    it 'should unlock the correct funds in the correct account', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      account = market.accounts['name']
      market.deposit
        account: 'name'
        currency: 'EUR'
        amount: '200'
      market.add
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '100'
        offerAmount: '50'        
      market.add
        id: '123456790'
        timestamp: '987654322'
        account: 'name'
        bidCurrency: 'USD'
        offerCurrency: 'EUR'
        offerPrice: '100'
        offerAmount: '100'        
      account.balances['EUR'].lockedFunds.compareTo(new Amount('150')).should.equal(0)
      market.delete
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '100'
        offerAmount: '50'        
      account.balances['EUR'].lockedFunds.compareTo(new Amount('100')).should.equal(0)

    it 'should remove the order from the correct book', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      market.deposit
        account: 'name'
        currency: 'EUR'
        amount: '200'
      market.add
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '100'
        offerAmount: '50'        
      market.delete
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '100'
        offerAmount: '50'        
      expect(market.books['BTC']['EUR'].orders['123456789']).to.not.be.ok

    it 'should throw an error if the account does not exist', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      expect ->
        market.delete
          id: '123456789'
          timestamp: '987654321'
          account: 'name'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: '100'
          offerAmount: '50'        
      .to.throw('Account does not exist')

    it 'should throw an error if the offer currency is not supported', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      expect ->
        market.delete
          id: '123456789'
          timestamp: '987654321'
          account: 'name'
          bidCurrency: 'BTC'
          offerCurrency: 'CAD'
          offerPrice: '100'
          offerAmount: '50'        
      .to.throw('Offer currency is not supported')

    it 'should throw an error if the bid currency is not supported', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      expect ->
        market.delete
          id: '123456789'
          timestamp: '987654321'
          account: 'name'
          bidCurrency: 'CAD'
          offerCurrency: 'EUR'
          offerPrice: '100'
          offerAmount: '50'        
      .to.throw('Bid currency is not supported')

    it 'should throw an error and leave the locked funds untouched if the offer cannot be found in the book', ->
      market = new Market(['EUR', 'USD', 'BTC'])
      market.addAccount('name')
      account = market.accounts['name']
      market.deposit
        account: 'name'
        currency: 'EUR'
        amount: '200'
      market.add
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '100'
        offerAmount: '50'        
      market.add
        id: '123456790'
        timestamp: '987654322'
        account: 'name'
        bidCurrency: 'USD'
        offerCurrency: 'EUR'
        offerPrice: '100'
        offerAmount: '100'        
      account.balances['EUR'].lockedFunds.compareTo(new Amount('150')).should.equal(0)
      expect ->
        market.delete
          id: '123456791'
          timestamp: '987654321'
          account: 'name'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: '100'
          offerAmount: '50'        
      .to.throw('Order cannot be found')
      account.balances['EUR'].lockedFunds.compareTo(new Amount('150')).should.equal(0)
