global.chai = require 'chai'
chai.should()
global.expect = chai.expect
global.assert = chai.assert

Market = require('../../src/Market/Market')
Book = require('../../src/Market/Book')
Account = require('../../src/Market/Account/Account')
Balance = require('../../src/Market/Account/Balance')
Amount = require('../../src/Market/Amount')

describe 'Market', ->
  it 'should instantiate with a collection of accounts, orders and books matching the supported currencies', ->
    market = new Market(['EUR', 'USD', 'BTC'])
    Object.keys(market.accounts).should.be.empty
    Object.keys(market.orders).should.be.empty
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

    it 'should record an order and add it to the correct book', ->
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
      market.orders['123456789'].should.be.ok
      market.books['BTC']['EUR'].highest.id.should.equal('123456789')

    describe 'while executing orders', ->
      beforeEach ->
        @market = new Market(['EUR', 'USD', 'BTC'])
        @market.addAccount('Peter')
        @market.addAccount('Paul')
        @market.deposit
          account: 'Peter'
          currency: 'EUR'
          amount: '2000'
        @market.deposit
          account: 'Paul'
          currency: 'BTC'
          amount: '400'

      describe 'where the existing (right) order is an offer', ->
        beforeEach ->
          @market.add
            id: '1'
            timestamp: '1'
            account: 'Peter'
            bidCurrency: 'BTC'
            offerCurrency: 'EUR'
            offerPrice: '0.2'   # 5
            offerAmount: '1000' # 200

        describe 'and the new (left) price is same', ->
          describe 'and the left order is a bid', ->
            describe 'and the right order is offering exactly the amount the left order is bidding', ->
                it 'should trade the amount the right order is offering', ->
                  @market.add
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    bidPrice: '0.2'
                    bidAmount: '1000'
                  expect(@market.orders['1']).to.not.be.ok
                  expect(@market.orders['2']).to.not.be.ok
                  @market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                  @market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                  @market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering more than the left order is bidding', ->
                it 'should trade the amount the left order is offering', ->
                  @market.add
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    bidPrice: '0.2'
                    bidAmount: '500'
                  @market.orders['1'].offerAmount.compareTo(new Amount('500')).should.equal 0
                  expect(@market.orders['2']).to.not.be.ok
                  @market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1500')).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('500')).should.equal 0
                  @market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('100')).should.equal 0
                  @market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('500')).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('300')).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering less than the left order is bidding', ->
                it 'should trade the amount the right order is offering', ->
                  @market.add
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    bidPrice: '0.2'
                    bidAmount: '1500'
                  expect(@market.orders['1']).to.not.be.ok
                  @market.orders['2'].bidAmount.compareTo(new Amount('500')).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                  @market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                  @market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('100')).should.equal 0

          describe 'and the left order is an offer', ->
            describe 'and the right order is offering exactly the amount the left order is offering', ->
                it 'should trade the amount the right order is offering', ->
                  @market.add
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    offerPrice: '5'
                    offerAmount: '200'
                  expect(@market.orders['1']).to.not.be.ok
                  expect(@market.orders['2']).to.not.be.ok
                  @market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                  @market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                  @market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering more than the left order is offering', ->
                it 'should trade the amount the left order is offering', ->
                  @market.add
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    offerPrice: '5'
                    offerAmount: '100'
                  @market.orders['1'].offerAmount.compareTo(new Amount('500')).should.equal 0
                  expect(@market.orders['2']).to.not.be.ok
                  @market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1500')).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('500')).should.equal 0
                  @market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('100')).should.equal 0
                  @market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('500')).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('300')).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering less than the left order is offering', ->
                it 'should trade the amount the right order is offering', ->
                  @market.add
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    offerPrice: '5'
                    offerAmount: '300'
                  expect(@market.orders['1']).to.not.be.ok
                  @market.orders['2'].offerAmount.compareTo(new Amount('100')).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                  @market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                  @market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('100')).should.equal 0

        describe 'and the new (left) price is the better', ->
          describe 'and the left order is an offer', ->              
            describe 'and the right order is offering exactly the amount that the left order is offering multiplied by the right order price', ->
              it 'should trade the amount the right order is offering at the right order price', ->
                @market.add
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: '4'
                  offerAmount: '200'
                expect(@market.orders['1']).to.not.be.ok
                expect(@market.orders['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering more than the left order is offering multiplied by the right order price', ->
              it 'should trade the amount the left order is offering at the right order price', ->
                @market.add
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: '4'
                  offerAmount: '100'
                @market.orders['1'].offerAmount.compareTo(new Amount('500')).should.equal 0
                expect(@market.orders['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1500')).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('500')).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('100')).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('500')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('300')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering less than the left order is offering multiplied by the right order price', ->
              it 'should trade the amount the right order is offering at the right order price', ->
                @market.add
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: '4'
                  offerAmount: '300'
                expect(@market.orders['1']).to.not.be.ok
                @market.orders['2'].offerAmount.compareTo(new Amount('100')).should.equal 0
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('100')).should.equal 0
                
          describe 'and the left order is a bid', ->
            describe 'and the right order is offering exactly the amount that the left order is bidding', ->
              it 'should trade the amount the right order is offering at the right order price', ->
                @market.add
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: '0.25'
                  bidAmount: '1000'
                expect(@market.orders['1']).to.not.be.ok
                expect(@market.orders['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is offering more than the left order is bidding', ->
              it 'should trade the amount the left order is bidding at the right order price', ->
                @market.add
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: '0.25'
                  bidAmount: '500'
                @market.orders['1'].offerAmount.compareTo(new Amount('500')).should.equal 0
                expect(@market.orders['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1500')).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('500')).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('100')).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('500')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('300')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is offering less than the left order is bidding', ->
              it 'should trade the amount the right order is offering at the right order price', ->
                @market.add
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: '0.25'
                  bidAmount: '1500'
                expect(@market.orders['1']).to.not.be.ok
                @market.orders['2'].bidAmount.compareTo(new Amount('500')).should.equal 0
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('125')).should.equal 0
              
      describe 'where the existing (right) order is a bid', ->
        beforeEach ->
          @market.add
            id: '1'
            timestamp: '1'
            account: 'Peter'
            bidCurrency: 'BTC'
            offerCurrency: 'EUR'
            bidPrice: '5'     # 0.2
            bidAmount: '200'  # 1000

        describe 'and the new (left) price is better', ->
          describe 'and the left order is an offer', ->
            describe 'and the right order is bidding exactly the amount that the left order is offering', ->
              it 'should trade the amount the right order is bidding at the right order price', ->
                @market.add
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: '4'
                  offerAmount: '200'
                expect(@market.orders['1']).to.not.be.ok
                expect(@market.orders['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is bidding more than the left order is offering', ->
              it 'should trade the amount the left order is offering at the right order price', ->
                @market.add
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: '4'
                  offerAmount: '100'
                @market.orders['1'].bidAmount.compareTo(new Amount('100')).should.equal 0
                expect(@market.orders['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1500')).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('500')).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('100')).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('500')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('300')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is bidding less than the left order is offering', ->
              it 'should trade the amount the right order is bidding at the right order price', ->
                @market.add
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: '4'
                  offerAmount: '300'
                expect(@market.orders['1']).to.not.be.ok
                @market.orders['2'].offerAmount.compareTo(new Amount('100')).should.equal 0
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('100')).should.equal 0
                
          describe 'and the left order is a bid', ->
            describe 'and the right order is bidding exactly the amount that the left order is bidding multiplied by the right order price', ->
              it 'should trade the amount the right order is bidding at the right order price', ->
                @market.add
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: '0.25'
                  bidAmount: '1000'
                expect(@market.orders['1']).to.not.be.ok
                expect(@market.orders['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is bidding more than the left order is bidding multiplied by the right order price', ->
              it 'should trade the amount the left order is bidding at the right order price', ->
                @market.add
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: '0.25'
                  bidAmount: '500'
                @market.orders['1'].bidAmount.compareTo(new Amount('100')).should.equal 0
                expect(@market.orders['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1500')).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('500')).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('100')).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('500')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('300')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is bidding less than the left order is bidding multiplied by the right order price', ->
              it 'should trade the amount the right order is bidding at the right order price', ->
                @market.add
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: '0.25'
                  bidAmount: '1500'
                expect(@market.orders['1']).to.not.be.ok
                @market.orders['2'].bidAmount.compareTo(new Amount('500')).should.equal 0
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('125')).should.equal 0
    
    describe 'when multiple orders can be matched', ->
      beforeEach ->
        @market = new Market(['EUR', 'USD', 'BTC'])
        @market.addAccount('Peter')
        @market.addAccount('Paul')
        @market.deposit
          account: 'Peter'
          currency: 'EUR'
          amount: '2000'
        @market.deposit
          account: 'Paul'
          currency: 'BTC'
          amount: '1000'
        @market.add
          id: '1'
          timestamp: '1'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: '0.2'
          offerAmount: '500'
        @market.add
          id: '2'
          timestamp: '2'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: '0.25'
          offerAmount: '500'
        @market.add
          id: '3'
          timestamp: '3'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: '0.5'
          offerAmount: '500'
        @market.add
          id: '4'
          timestamp: '4'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: '1.0'
          offerAmount: '500'

      describe 'and the last order can be completely satisfied', ->
        it 'should correctly execute as many orders as it can', ->
          @market.add
            id: '5'
            timestamp: '5'
            account: 'Paul'
            bidCurrency: 'EUR'
            offerCurrency: 'BTC'
            bidPrice: '0.5'
            bidAmount: '1250'
          expect(@market.orders['1']).to.not.be.ok
          expect(@market.orders['2']).to.not.be.ok
          @market.orders['3'].offerAmount.compareTo(new Amount('250')).should.equal 0
          @market.orders['4'].offerAmount.compareTo(new Amount('500')).should.equal 0
          expect(@market.orders['5']).to.not.be.ok
          @market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('750')).should.equal 0
          @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('750')).should.equal 0
          @market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('350')).should.equal 0
          @market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1250')).should.equal 0
          @market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('650')).should.equal 0
          @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

      describe 'and the last order can not be completely satisfied', ->    
        it 'should correctly execute as many orders as it can', ->
          @market.add
            id: '5'
            timestamp: '5'
            account: 'Paul'
            bidCurrency: 'EUR'
            offerCurrency: 'BTC'
            bidPrice: '0.5'
            bidAmount: '1750'
          expect(@market.orders['1']).to.not.be.ok
          expect(@market.orders['2']).to.not.be.ok
          expect(@market.orders['3']).to.not.be.ok
          @market.orders['4'].offerAmount.compareTo(new Amount('500')).should.equal 0
          @market.orders['5'].bidAmount.compareTo(new Amount('250')).should.equal 0
          @market.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('500')).should.equal 0
          @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('500')).should.equal 0
          @market.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('475')).should.equal 0
          @market.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1500')).should.equal 0
          @market.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('525')).should.equal 0
          @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('125')).should.equal 0
              
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

    it 'should remove the order from the orders collection and from the correct book', ->
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
      expect(market.orders['123456789']).to.not.be.ok
      expect(market.books['BTC']['EUR'].highest).to.not.be.ok

    it 'should throw an error if the order cannot be found', ->
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
      .to.throw('Order cannot be found')

    it 'should throw an error if the order does not match', ->
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
      expect ->
        market.delete
          id: '123456789'
          timestamp: '987654321'
          account: 'name'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: '100'
          offerAmount: '20'        
      .to.throw('Order does not match')
