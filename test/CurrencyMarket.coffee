chai = require 'chai'
chai.should()
expect = chai.expect
assert = chai.assert
Checklist = require('checklist')

CurrencyMarket = require('../src/CurrencyMarket')
Book = require('../src/Book')
Account = require('../src/Account')
Balance = require('../src/Balance')
Amount = require('../src/Amount')

describe 'CurrencyMarket', ->
  beforeEach ->
    @currencyMarket = new CurrencyMarket
      currencies: [
        'EUR'
        'USD'
        'BTC'
      ]

  it 'should instantiate with a collection of accounts, orders and books matching the supported currencies', ->
    Object.keys(@currencyMarket.accounts).should.be.empty
    Object.keys(@currencyMarket.orders).should.be.empty
    @currencyMarket.books['EUR']['BTC'].should.be.an.instanceOf(Book)
    @currencyMarket.books['EUR']['USD'].should.be.an.instanceOf(Book)
    @currencyMarket.books['USD']['EUR'].should.be.an.instanceOf(Book)
    @currencyMarket.books['BTC']['EUR'].should.be.an.instanceOf(Book)
    @currencyMarket.books['USD']['EUR'].should.be.an.instanceOf(Book)
    @currencyMarket.books['EUR']['USD'].should.be.an.instanceOf(Book)

  describe '#register', ->
    it 'should throw an error if no transaction ID is given', ->
      expect =>
        @currencyMarket.register
          timestamp: '987654321'
          key: 'Peter'
      .to.throw('Must supply transaction ID')

    it 'should throw an error if no timestamp is given', ->
      expect =>
        @currencyMarket.register
          id: '123456789'
          key: 'Peter'
      .to.throw('Must supply timestamp')

    it 'should submit an account to the currencyMarket with the supported currencies and emit an account event', (done) ->
      checklist = new Checklist [
          '123456789'
          '987654321'
          'Peter'
        ],
        ordered: true,
        (error) =>
          @currencyMarket.removeAllListeners()
          done error

      @currencyMarket.on 'account', (account) ->
        checklist.check account.id
        checklist.check account.timestamp
        checklist.check account.key

      @currencyMarket.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      account = @currencyMarket.accounts['Peter']
      account.should.be.an.instanceOf(Account)
      account.balances['EUR'].should.be.an.instanceOf(Balance)
      account.balances['USD'].should.be.an.instanceOf(Balance)
      account.balances['BTC'].should.be.an.instanceOf(Balance)

    it 'should throw an error if the account already exists', ->
      @currencyMarket.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      expect =>
        @currencyMarket.register
          id: '123456790'
          timestamp: '987654322'
          key: 'Peter'
      .to.throw('Account already exists')

  describe '#deposit', ->
    it 'should throw an error if no transaction ID is given', ->
      @currencyMarket.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      expect =>
        @currencyMarket.deposit
          timestamp: '987654322'
          account: 'Peter'
          currency: 'BTC'
          amount: '50'
      .to.throw('Must supply transaction ID')

    it 'should throw an error if no timestamp is given', ->
      @currencyMarket.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      expect =>
        @currencyMarket.deposit
          id: '123456790'
          account: 'Peter'
          currency: 'BTC'
          amount: '50'
      .to.throw('Must supply timestamp')

    it 'should credit the correct account and currency and emit a deposit event', (done) ->
      checklist = new Checklist [
          '123456790'
          '987654322'
          'Peter'
          'BTC'
          '50'
        ],
        ordered: true,
        (error) =>
          @currencyMarket.removeAllListeners()
          done error

      @currencyMarket.on 'deposit', (deposit) ->
        checklist.check deposit.id
        checklist.check deposit.timestamp
        checklist.check deposit.account
        checklist.check deposit.currency
        checklist.check deposit.amount

      @currencyMarket.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      account = @currencyMarket.accounts['Peter']
      account.balances['EUR'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.balances['USD'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.balances['BTC'].funds.compareTo(Amount.ZERO).should.equal(0)
      @currencyMarket.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'BTC'
        amount: '50'
      account.balances['EUR'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.balances['USD'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.balances['BTC'].funds.compareTo(new Amount('50')).should.equal(0)

    it 'should throw an error if the account does not exist', ->
      expect =>
        @currencyMarket.deposit
          id: '123456790'
          timestamp: '987654322'
          account: 'Peter',
          currency: 'BTC',
          amount: '50'
      .to.throw('Account does not exist')

    it 'should throw an error if the currency is not supported', ->
      @currencyMarket.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      expect =>
        @currencyMarket.deposit
          id: '123456790'
          timestamp: '987654322'
          account: 'Peter'
          currency: 'CAD'
          amount: '50'
      .to.throw('Currency is not supported')

  describe '#withdraw', ->
    it 'should throw an error if no transaction ID is given', ->
      @currencyMarket.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      @currencyMarket.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'BTC'
        amount: '200'
      expect =>
        @currencyMarket.withdraw
          timestamp: '987654322'
          account: 'Peter'
          currency: 'BTC'
          amount: '50'
      .to.throw('Must supply transaction ID')

    it 'should throw an error if no timestamp is given', ->
      @currencyMarket.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      @currencyMarket.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'BTC'
        amount: '200'
      expect =>
        @currencyMarket.withdraw
          id: '123456790'
          account: 'Peter'
          currency: 'BTC'
          amount: '50'
      .to.throw('Must supply timestamp')

    it 'should debit the correct account and currency and emit a withdrawal event', (done) ->
      checklist = new Checklist [
          '123456790'
          '987654322'
          'Peter'
          'BTC'
          '50'
        ],
        ordered: true,
        (error) =>
          @currencyMarket.removeAllListeners()
          done error

      @currencyMarket.on 'withdrawal', (withdrawal) ->
        checklist.check withdrawal.id
        checklist.check withdrawal.timestamp
        checklist.check withdrawal.account
        checklist.check withdrawal.currency
        checklist.check withdrawal.amount

      @currencyMarket.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      account = @currencyMarket.accounts['Peter']
      @currencyMarket.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'BTC'
        amount: '200'
      @currencyMarket.withdraw
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'BTC'
        amount: '50'
      account.balances['BTC'].funds.compareTo(new Amount('150')).should.equal(0)

    it 'should throw an error if the account does not exist', ->
      expect =>
        @currencyMarket.withdraw
          id: '123456790'
          timestamp: '987654322'
          account: 'Peter'
          currency: 'BTC'
          amount: '50'
      .to.throw('Account does not exist')

    it 'should throw an error if the currency is not supported', ->
      @currencyMarket.register
        id: '123456790'
        timestamp: '987654322'
        key: 'Peter'
      expect =>
        @currencyMarket.withdraw
          id: '123456790'
          timestamp: '987654322'
          account: 'Peter'
          currency: 'CAD'
          amount: '50'
      .to.throw('Currency is not supported')

  describe '#submit', ->
    it 'should lock the correct funds in the correct account', ->
      @currencyMarket.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      account = @currencyMarket.accounts['Peter']
      @currencyMarket.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: '200'
      @currencyMarket.submit
        id: '123456789'
        timestamp: '987654321'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '100'
        offerAmount: '50'        
      @currencyMarket.submit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        bidCurrency: 'USD'
        offerCurrency: 'EUR'
        offerPrice: '100'
        offerAmount: '100'        
      account.balances['EUR'].lockedFunds.compareTo(new Amount('150')).should.equal(0)

    it 'should record an order, submit it to the correct book and emit an order event', (done) ->
      checklist = new Checklist [
          '123456789'
          '987654321'
          'Peter'
          'BTC'
          'EUR'
          '100'
          '50'
        ],
        ordered: true,
        (error) =>
          @currencyMarket.removeAllListeners()
          done error

      @currencyMarket.on 'order', (order) ->
        checklist.check order.id
        checklist.check order.timestamp
        checklist.check order.account
        checklist.check order.bidCurrency
        checklist.check order.offerCurrency
        checklist.check order.offerPrice.toString()
        checklist.check order.offerAmount.toString()

      @currencyMarket.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      @currencyMarket.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: '200'
      @currencyMarket.submit
        id: '123456789'
        timestamp: '987654321'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '100'
        offerAmount: '50'
      @currencyMarket.orders['123456789'].should.be.ok
      @currencyMarket.books['BTC']['EUR'].highest.id.should.equal('123456789')

    describe 'while executing orders', ->
      beforeEach ->
        @currencyMarket.register
          id: '123456789'
          timestamp: '987654321'
          key: 'Peter'
        @currencyMarket.register
          id: '123456790'
          timestamp: '987654322'
          key: 'Paul'
        @currencyMarket.deposit
          id: '123456790'
          timestamp: '987654322'
          account: 'Peter'
          currency: 'EUR'
          amount: '2000'
        @currencyMarket.deposit
          id: '123456790'
          timestamp: '987654322'
          account: 'Paul'
          currency: 'BTC'
          amount: '400'

      describe 'where the existing (right) order is an offer', ->
        beforeEach ->
          @currencyMarket.submit
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
                it 'should trade the amount the right order is offering and emit a trade event', (done) ->
                  checklist = new Checklist [
                      'EUR'
                      '1000'
                      '0.2'
                      'Paul'
                      'BTC'
                      '200.0'
                      '5'
                      'Peter'
                    ],
                    ordered: true,
                    (error) =>
                      @currencyMarket.removeAllListeners()
                      done error

                  @currencyMarket.on 'trade', (trade) ->
                    checklist.check trade.left.currency
                    checklist.check trade.left.amount
                    checklist.check trade.left.price
                    checklist.check trade.left.account
                    checklist.check trade.right.currency
                    checklist.check trade.right.amount
                    checklist.check trade.right.price
                    checklist.check trade.right.account

                  @currencyMarket.submit
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    bidPrice: '0.2'
                    bidAmount: '1000'
                  expect(@currencyMarket.orders['1']).to.not.be.ok
                  expect(@currencyMarket.orders['2']).to.not.be.ok
                  @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering more than the left order is bidding', ->
                it 'should trade the amount the left order is offering and emit a trade event', (done) ->
                  checklist = new Checklist [
                      'EUR'
                      '500'
                      '0.2'
                      'Paul'
                      'BTC'
                      '100.0'
                      '5'
                      'Peter'
                    ],
                    ordered: true,
                    (error) =>
                      @currencyMarket.removeAllListeners()
                      done error

                  @currencyMarket.on 'trade', (trade) ->
                    checklist.check trade.left.currency
                    checklist.check trade.left.amount
                    checklist.check trade.left.price
                    checklist.check trade.left.account
                    checklist.check trade.right.currency
                    checklist.check trade.right.amount
                    checklist.check trade.right.price
                    checklist.check trade.right.account

                  @currencyMarket.submit
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    bidPrice: '0.2'
                    bidAmount: '500'
                  @currencyMarket.orders['1'].offerAmount.compareTo(new Amount('500')).should.equal 0
                  expect(@currencyMarket.orders['2']).to.not.be.ok
                  @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1500')).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('500')).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('100')).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('500')).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('300')).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering less than the left order is bidding', ->
                it 'should trade the amount the right order is offering and emit a trade event', (done) ->
                  checklist = new Checklist [
                      'EUR'
                      '1000'
                      '0.2'
                      'Paul'
                      'BTC'
                      '200.0'
                      '5'
                      'Peter'
                    ],
                    ordered: true,
                    (error) =>
                      @currencyMarket.removeAllListeners()
                      done error

                  @currencyMarket.on 'trade', (trade) ->
                    checklist.check trade.left.currency
                    checklist.check trade.left.amount
                    checklist.check trade.left.price
                    checklist.check trade.left.account
                    checklist.check trade.right.currency
                    checklist.check trade.right.amount
                    checklist.check trade.right.price
                    checklist.check trade.right.account

                  @currencyMarket.submit
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    bidPrice: '0.2'
                    bidAmount: '1500'
                  expect(@currencyMarket.orders['1']).to.not.be.ok
                  @currencyMarket.orders['2'].bidAmount.compareTo(new Amount('500')).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('100')).should.equal 0

          describe 'and the left order is an offer', ->
            describe 'and the right order is offering exactly the amount the left order is offering', ->
                it 'should trade the amount the right order is offering and emit a trade event', (done) ->
                  checklist = new Checklist [
                      'EUR'
                      '1000'
                      '0.2'
                      'Paul'
                      'BTC'
                      '200'
                      '5'
                      'Peter'
                    ],
                    ordered: true,
                    (error) =>
                      @currencyMarket.removeAllListeners()
                      done error

                  @currencyMarket.on 'trade', (trade) ->
                    checklist.check trade.left.currency
                    checklist.check trade.left.amount
                    checklist.check trade.left.price
                    checklist.check trade.left.account
                    checklist.check trade.right.currency
                    checklist.check trade.right.amount
                    checklist.check trade.right.price
                    checklist.check trade.right.account

                  @currencyMarket.submit
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    offerPrice: '5'
                    offerAmount: '200'
                  expect(@currencyMarket.orders['1']).to.not.be.ok
                  expect(@currencyMarket.orders['2']).to.not.be.ok
                  @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering more than the left order is offering', ->
                it 'should trade the amount the left order is offering and emit a trade event', (done) ->
                  checklist = new Checklist [
                      'EUR'
                      '500'
                      '0.2'
                      'Paul'
                      'BTC'
                      '100'
                      '5'
                      'Peter'
                    ],
                    ordered: true,
                    (error) =>
                      @currencyMarket.removeAllListeners()
                      done error

                  @currencyMarket.on 'trade', (trade) ->
                    checklist.check trade.left.currency
                    checklist.check trade.left.amount
                    checklist.check trade.left.price
                    checklist.check trade.left.account
                    checklist.check trade.right.currency
                    checklist.check trade.right.amount
                    checklist.check trade.right.price
                    checklist.check trade.right.account

                  @currencyMarket.submit
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    offerPrice: '5'
                    offerAmount: '100'
                  @currencyMarket.orders['1'].offerAmount.compareTo(new Amount('500')).should.equal 0
                  expect(@currencyMarket.orders['2']).to.not.be.ok
                  @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1500')).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('500')).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('100')).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('500')).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('300')).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering less than the left order is offering', ->
                it 'should trade the amount the right order is offering and emit a trade event', (done) ->
                  checklist = new Checklist [
                      'EUR'
                      '1000'
                      '0.2'
                      'Paul'
                      'BTC'
                      '200.0'
                      '5'
                      'Peter'
                    ],
                    ordered: true,
                    (error) =>
                      @currencyMarket.removeAllListeners()
                      done error

                  @currencyMarket.on 'trade', (trade) ->
                    checklist.check trade.left.currency
                    checklist.check trade.left.amount
                    checklist.check trade.left.price
                    checklist.check trade.left.account
                    checklist.check trade.right.currency
                    checklist.check trade.right.amount
                    checklist.check trade.right.price
                    checklist.check trade.right.account

                  @currencyMarket.submit
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    offerPrice: '5'
                    offerAmount: '300'
                  expect(@currencyMarket.orders['1']).to.not.be.ok
                  @currencyMarket.orders['2'].offerAmount.compareTo(new Amount('100')).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('100')).should.equal 0

        describe 'and the new (left) price is the better', ->
          describe 'and the left order is an offer', ->              
            describe 'and the right order is offering exactly the amount that the left order is offering multiplied by the right order price', ->
              it 'should trade the amount the right order is offering at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    'EUR'
                    '1000'
                    '0.2'
                    'Paul'
                    'BTC'
                    '200'
                    '5'
                    'Peter'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.currency
                  checklist.check trade.left.amount
                  checklist.check trade.left.price
                  checklist.check trade.left.account
                  checklist.check trade.right.currency
                  checklist.check trade.right.amount
                  checklist.check trade.right.price
                  checklist.check trade.right.account

                @currencyMarket.submit
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: '4'
                  offerAmount: '200'
                expect(@currencyMarket.orders['1']).to.not.be.ok
                expect(@currencyMarket.orders['2']).to.not.be.ok
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering more than the left order is offering multiplied by the right order price', ->
              it 'should trade the amount the left order is offering at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    'EUR'
                    '500'
                    '0.2'
                    'Paul'
                    'BTC'
                    '100'
                    '5'
                    'Peter'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.currency
                  checklist.check trade.left.amount
                  checklist.check trade.left.price
                  checklist.check trade.left.account
                  checklist.check trade.right.currency
                  checklist.check trade.right.amount
                  checklist.check trade.right.price
                  checklist.check trade.right.account

                @currencyMarket.submit
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: '4'
                  offerAmount: '100'
                @currencyMarket.orders['1'].offerAmount.compareTo(new Amount('500')).should.equal 0
                expect(@currencyMarket.orders['2']).to.not.be.ok
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1500')).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('500')).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('100')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('500')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('300')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering less than the left order is offering multiplied by the right order price', ->
              it 'should trade the amount the right order is offering at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    'EUR'
                    '1000'
                    '0.2'
                    'Paul'
                    'BTC'
                    '200.0'
                    '5'
                    'Peter'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.currency
                  checklist.check trade.left.amount
                  checklist.check trade.left.price
                  checklist.check trade.left.account
                  checklist.check trade.right.currency
                  checklist.check trade.right.amount
                  checklist.check trade.right.price
                  checklist.check trade.right.account

                @currencyMarket.submit
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: '4'
                  offerAmount: '300'
                expect(@currencyMarket.orders['1']).to.not.be.ok
                @currencyMarket.orders['2'].offerAmount.compareTo(new Amount('100')).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('100')).should.equal 0
                
          describe 'and the left order is a bid', ->
            describe 'and the right order is offering exactly the amount that the left order is bidding', ->
              it 'should trade the amount the right order is offering at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    'EUR'
                    '1000'
                    '0.2'
                    'Paul'
                    'BTC'
                    '200.0'
                    '5'
                    'Peter'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.currency
                  checklist.check trade.left.amount
                  checklist.check trade.left.price
                  checklist.check trade.left.account
                  checklist.check trade.right.currency
                  checklist.check trade.right.amount
                  checklist.check trade.right.price
                  checklist.check trade.right.account

                @currencyMarket.submit
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: '0.25'
                  bidAmount: '1000'
                expect(@currencyMarket.orders['1']).to.not.be.ok
                expect(@currencyMarket.orders['2']).to.not.be.ok
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is offering more than the left order is bidding', ->
              it 'should trade the amount the left order is bidding at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    'EUR'
                    '500'
                    '0.2'
                    'Paul'
                    'BTC'
                    '100.0'
                    '5'
                    'Peter'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.currency
                  checklist.check trade.left.amount
                  checklist.check trade.left.price
                  checklist.check trade.left.account
                  checklist.check trade.right.currency
                  checklist.check trade.right.amount
                  checklist.check trade.right.price
                  checklist.check trade.right.account

                @currencyMarket.submit
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: '0.25'
                  bidAmount: '500'
                @currencyMarket.orders['1'].offerAmount.compareTo(new Amount('500')).should.equal 0
                expect(@currencyMarket.orders['2']).to.not.be.ok
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1500')).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('500')).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('100')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('500')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('300')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is offering less than the left order is bidding', ->
              it 'should trade the amount the right order is offering at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    'EUR'
                    '1000'
                    '0.2'
                    'Paul'
                    'BTC'
                    '200.0'
                    '5'
                    'Peter'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.currency
                  checklist.check trade.left.amount
                  checklist.check trade.left.price
                  checklist.check trade.left.account
                  checklist.check trade.right.currency
                  checklist.check trade.right.amount
                  checklist.check trade.right.price
                  checklist.check trade.right.account

                @currencyMarket.submit
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: '0.25'
                  bidAmount: '1500'
                expect(@currencyMarket.orders['1']).to.not.be.ok
                @currencyMarket.orders['2'].bidAmount.compareTo(new Amount('500')).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('125')).should.equal 0
              
      describe 'where the existing (right) order is a bid', ->
        beforeEach ->
          @currencyMarket.submit
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
              it 'should trade the amount the right order is bidding at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    'EUR'
                    '1000'
                    '0.2'
                    'Paul'
                    'BTC'
                    '200'
                    '5'
                    'Peter'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.currency
                  checklist.check trade.left.amount
                  checklist.check trade.left.price
                  checklist.check trade.left.account
                  checklist.check trade.right.currency
                  checklist.check trade.right.amount
                  checklist.check trade.right.price
                  checklist.check trade.right.account

                @currencyMarket.submit
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: '4'
                  offerAmount: '200'
                expect(@currencyMarket.orders['1']).to.not.be.ok
                expect(@currencyMarket.orders['2']).to.not.be.ok
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is bidding more than the left order is offering', ->
              it 'should trade the amount the left order is offering at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    'EUR'
                    '500'
                    '0.2'
                    'Paul'
                    'BTC'
                    '100'
                    '5'
                    'Peter'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.currency
                  checklist.check trade.left.amount
                  checklist.check trade.left.price
                  checklist.check trade.left.account
                  checklist.check trade.right.currency
                  checklist.check trade.right.amount
                  checklist.check trade.right.price
                  checklist.check trade.right.account

                @currencyMarket.submit
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: '4'
                  offerAmount: '100'
                @currencyMarket.orders['1'].bidAmount.compareTo(new Amount('100')).should.equal 0
                expect(@currencyMarket.orders['2']).to.not.be.ok
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1500')).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('500')).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('100')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('500')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('300')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is bidding less than the left order is offering', ->
              it 'should trade the amount the right order is bidding at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    'EUR'
                    '1000'
                    '0.2'
                    'Paul'
                    'BTC'
                    '200'
                    '5'
                    'Peter'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.currency
                  checklist.check trade.left.amount
                  checklist.check trade.left.price
                  checklist.check trade.left.account
                  checklist.check trade.right.currency
                  checklist.check trade.right.amount
                  checklist.check trade.right.price
                  checklist.check trade.right.account

                @currencyMarket.submit
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: '4'
                  offerAmount: '300'
                expect(@currencyMarket.orders['1']).to.not.be.ok
                @currencyMarket.orders['2'].offerAmount.compareTo(new Amount('100')).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('100')).should.equal 0
                
          describe 'and the left order is a bid', ->
            describe 'and the right order is bidding exactly the amount that the left order is bidding multiplied by the right order price', ->
              it 'should trade the amount the right order is bidding at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    'EUR'
                    '1000'
                    '0.2'
                    'Paul'
                    'BTC'
                    '200.0'
                    '5'
                    'Peter'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.currency
                  checklist.check trade.left.amount
                  checklist.check trade.left.price
                  checklist.check trade.left.account
                  checklist.check trade.right.currency
                  checklist.check trade.right.amount
                  checklist.check trade.right.price
                  checklist.check trade.right.account

                @currencyMarket.submit
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: '0.25'
                  bidAmount: '1000'
                expect(@currencyMarket.orders['1']).to.not.be.ok
                expect(@currencyMarket.orders['2']).to.not.be.ok
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is bidding more than the left order is bidding multiplied by the right order price', ->
              it 'should trade the amount the left order is bidding at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    'EUR'
                    '500'
                    '0.2'
                    'Paul'
                    'BTC'
                    '100.0'
                    '5'
                    'Peter'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.currency
                  checklist.check trade.left.amount
                  checklist.check trade.left.price
                  checklist.check trade.left.account
                  checklist.check trade.right.currency
                  checklist.check trade.right.amount
                  checklist.check trade.right.price
                  checklist.check trade.right.account

                @currencyMarket.submit
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: '0.25'
                  bidAmount: '500'
                @currencyMarket.orders['1'].bidAmount.compareTo(new Amount('100')).should.equal 0
                expect(@currencyMarket.orders['2']).to.not.be.ok
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1500')).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('500')).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('100')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('500')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('300')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is bidding less than the left order is bidding multiplied by the right order price', ->
              it 'should trade the amount the right order is bidding at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    'EUR'
                    '1000'
                    '0.2'
                    'Paul'
                    'BTC'
                    '200'
                    '5'
                    'Peter'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.currency
                  checklist.check trade.left.amount
                  checklist.check trade.left.price
                  checklist.check trade.left.account
                  checklist.check trade.right.currency
                  checklist.check trade.right.amount
                  checklist.check trade.right.price
                  checklist.check trade.right.account

                @currencyMarket.submit
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: '0.25'
                  bidAmount: '1500'
                expect(@currencyMarket.orders['1']).to.not.be.ok
                @currencyMarket.orders['2'].bidAmount.compareTo(new Amount('500')).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('125')).should.equal 0
    
    describe 'when multiple orders can be matched', ->
      beforeEach ->
        @currencyMarket.register
          id: '123456789'
          timestamp: '987654321'
          key: 'Peter'
        @currencyMarket.register
          id: '123456790'
          timestamp: '987654322'
          key: 'Paul'
        @currencyMarket.deposit
          id: '123456790'
          timestamp: '987654322'
          account: 'Peter'
          currency: 'EUR'
          amount: '2000'
        @currencyMarket.deposit
          id: '123456790'
          timestamp: '987654322'
          account: 'Paul'
          currency: 'BTC'
          amount: '1000'
        @currencyMarket.submit
          id: '1'
          timestamp: '1'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: '0.2'
          offerAmount: '500'
        @currencyMarket.submit
          id: '2'
          timestamp: '2'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: '0.25'
          offerAmount: '500'
        @currencyMarket.submit
          id: '3'
          timestamp: '3'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: '0.5'
          offerAmount: '500'
        @currencyMarket.submit
          id: '4'
          timestamp: '4'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: '1.0'
          offerAmount: '500'

      describe 'and the last order can be completely satisfied', ->
        it 'should correctly execute as many orders as it can and emit trade events', (done) ->
          checklist = new Checklist [
              'EUR'
              '500'
              '0.2'
              'Paul'
              'BTC'
              '100.0'
              '5'
              'Peter'
              'EUR'
              '500'
              '0.25'
              'Paul'
              'BTC'
              '125.00'
              '4'
              'Peter'
              'EUR'
              '250.0'
              '0.5'
              'Paul'
              'BTC'
              '125.00'
              '2'
              'Peter'
            ],
            ordered: true,
            (error) =>
              @currencyMarket.removeAllListeners()
              done error

          @currencyMarket.on 'trade', (trade) ->
            checklist.check trade.left.currency
            checklist.check trade.left.amount
            checklist.check trade.left.price
            checklist.check trade.left.account
            checklist.check trade.right.currency
            checklist.check trade.right.amount
            checklist.check trade.right.price
            checklist.check trade.right.account

          @currencyMarket.submit
            id: '5'
            timestamp: '5'
            account: 'Paul'
            bidCurrency: 'EUR'
            offerCurrency: 'BTC'
            bidPrice: '0.5'
            bidAmount: '1250'
          expect(@currencyMarket.orders['1']).to.not.be.ok
          expect(@currencyMarket.orders['2']).to.not.be.ok
          @currencyMarket.orders['3'].offerAmount.compareTo(new Amount('250')).should.equal 0
          @currencyMarket.orders['4'].offerAmount.compareTo(new Amount('500')).should.equal 0
          expect(@currencyMarket.orders['5']).to.not.be.ok
          @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('750')).should.equal 0
          @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('750')).should.equal 0
          @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('350')).should.equal 0
          @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1250')).should.equal 0
          @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('650')).should.equal 0
          @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

      describe 'and the last order can not be completely satisfied', ->    
        it 'should correctly execute as many orders as it can and emit trade events', (done) ->
          checklist = new Checklist [
              'EUR'
              '500'
              '0.2'
              'Paul'
              'BTC'
              '100.0'
              '5'
              'Peter'
              'EUR'
              '500'
              '0.25'
              'Paul'
              'BTC'
              '125.00'
              '4'
              'Peter'
              'EUR'
              '500'
              '0.5'
              'Paul'
              'BTC'
              '250.0'
              '2'
              'Peter'
            ],
            ordered: true,
            (error) =>
              @currencyMarket.removeAllListeners()
              done error

          @currencyMarket.on 'trade', (trade) ->
            checklist.check trade.left.currency
            checklist.check trade.left.amount
            checklist.check trade.left.price
            checklist.check trade.left.account
            checklist.check trade.right.currency
            checklist.check trade.right.amount
            checklist.check trade.right.price
            checklist.check trade.right.account

          @currencyMarket.submit
            id: '5'
            timestamp: '5'
            account: 'Paul'
            bidCurrency: 'EUR'
            offerCurrency: 'BTC'
            bidPrice: '0.5'
            bidAmount: '1750'
          expect(@currencyMarket.orders['1']).to.not.be.ok
          expect(@currencyMarket.orders['2']).to.not.be.ok
          expect(@currencyMarket.orders['3']).to.not.be.ok
          @currencyMarket.orders['4'].offerAmount.compareTo(new Amount('500')).should.equal 0
          @currencyMarket.orders['5'].bidAmount.compareTo(new Amount('250')).should.equal 0
          @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('500')).should.equal 0
          @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('500')).should.equal 0
          @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('475')).should.equal 0
          @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1500')).should.equal 0
          @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('525')).should.equal 0
          @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('125')).should.equal 0
              
    it 'should throw an error if the account does not exist', ->
      expect =>
        @currencyMarket.submit
          id: '123456789'
          timestamp: '987654321'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: '100'
          offerAmount: '50'        
      .to.throw('Account does not exist')

    it 'should throw an error if the offer currency is not supported', ->
      @currencyMarket.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      expect =>
        @currencyMarket.submit
          id: '123456789'
          timestamp: '987654321'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'CAD'
          offerPrice: '100'
          offerAmount: '50'        
      .to.throw('Offer currency is not supported')

    it 'should throw an error if the bid currency is not supported', ->
      @currencyMarket.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      expect =>
        @currencyMarket.submit
          id: '123456789'
          timestamp: '987654321'
          account: 'Peter'
          bidCurrency: 'CAD'
          offerCurrency: 'EUR'
          offerPrice: '100'
          offerAmount: '50'        
      .to.throw('Bid currency is not supported')

  describe '#cancel', ->
    it 'should unlock the correct funds in the correct account', ->
      @currencyMarket.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      account = @currencyMarket.accounts['Peter']
      @currencyMarket.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: '200'
      @currencyMarket.submit
        id: '123456789'
        timestamp: '987654321'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '100'
        offerAmount: '50'        
      @currencyMarket.submit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        bidCurrency: 'USD'
        offerCurrency: 'EUR'
        offerPrice: '100'
        offerAmount: '100'        
      account.balances['EUR'].lockedFunds.compareTo(new Amount('150')).should.equal(0)
      @currencyMarket.cancel
        id: '123456789'
        timestamp: '987654321'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '100'
        offerAmount: '50'        
      account.balances['EUR'].lockedFunds.compareTo(new Amount('100')).should.equal(0)

    it 'should remove the order from the orders collection and from the correct book and emit an cancellation event', (done) ->
      checklist = new Checklist [
          '123456789'
          '987654321'
          'Peter'
          'BTC'
          'EUR'
          '100'
          '50'
        ],
        ordered: true,
        (error) =>
          @currencyMarket.removeAllListeners()
          done error

      @currencyMarket.on 'cancellation', (order) ->
        checklist.check order.id
        checklist.check order.timestamp
        checklist.check order.account
        checklist.check order.bidCurrency
        checklist.check order.offerCurrency
        checklist.check order.offerPrice.toString()
        checklist.check order.offerAmount.toString()

      @currencyMarket.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      @currencyMarket.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: '200'
      @currencyMarket.submit
        id: '123456789'
        timestamp: '987654321'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '100'
        offerAmount: '50'        
      @currencyMarket.cancel
        id: '123456789'
        timestamp: '987654321'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '100'
        offerAmount: '50'
      expect(@currencyMarket.orders['123456789']).to.not.be.ok
      expect(@currencyMarket.books['BTC']['EUR'].highest).to.not.be.ok

    it 'should throw an error if the order cannot be found', ->
      expect =>
        @currencyMarket.cancel
          id: '123456789'
          timestamp: '987654321'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: '100'
          offerAmount: '50'        
      .to.throw('Order cannot be found')

    it 'should throw an error if the order does not match', ->
      @currencyMarket.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      account = @currencyMarket.accounts['Peter']
      @currencyMarket.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: '200'
      @currencyMarket.submit
        id: '123456789'
        timestamp: '987654321'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '100'
        offerAmount: '50'        
      expect =>
        @currencyMarket.cancel
          id: '123456789'
          timestamp: '987654321'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: '100'
          offerAmount: '20'        
      .to.throw('Order does not match')

  describe '#equals', ->
    beforeEach ->
      @currencyMarket1 = new CurrencyMarket
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]
      @currencyMarket1.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      @currencyMarket1.register
        id: '123456790'
        timestamp: '987654322'
        key: 'Paul'
      @currencyMarket1.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: '2000'
      @currencyMarket1.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: '1000'
      @currencyMarket1.submit
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '0.2'
        offerAmount: '500'
      @currencyMarket1.submit
        id: '2'
        timestamp: '2'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '0.25'
        offerAmount: '500'
      @currencyMarket1.submit
        id: '3'
        timestamp: '3'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '0.5'
        offerAmount: '500'
      @currencyMarket1.submit
        id: '4'
        timestamp: '4'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '1.0'
        offerAmount: '500'

    it 'should return true if 2 markets are equal', ->
      currencyMarket2 = new CurrencyMarket
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]
      currencyMarket2.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      currencyMarket2.register
        id: '123456790'
        timestamp: '987654322'
        key: 'Paul'
      currencyMarket2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: '2000'
      currencyMarket2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: '1000'
      currencyMarket2.submit
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '0.2'
        offerAmount: '500'
      currencyMarket2.submit
        id: '2'
        timestamp: '2'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '0.25'
        offerAmount: '500'
      currencyMarket2.submit
        id: '3'
        timestamp: '3'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '0.5'
        offerAmount: '500'
      currencyMarket2.submit
        id: '4'
        timestamp: '4'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '1.0'
        offerAmount: '500'
      currencyMarket2.equals(@currencyMarket1).should.be.true

    it 'should return false if the currencies list is different', ->
      currencyMarket2 = new CurrencyMarket
        currencies: [
          'EUR'
          'BTC'
        ]
      currencyMarket2.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      currencyMarket2.register
        id: '123456790'
        timestamp: '987654322'
        key: 'Paul'
      currencyMarket2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: '2000'
      currencyMarket2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: '1000'
      currencyMarket2.submit
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '0.2'
        offerAmount: '500'
      currencyMarket2.submit
        id: '2'
        timestamp: '2'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '0.25'
        offerAmount: '500'
      currencyMarket2.submit
        id: '3'
        timestamp: '3'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '0.5'
        offerAmount: '500'
      currencyMarket2.submit
        id: '4'
        timestamp: '4'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '1.0'
        offerAmount: '500'
      currencyMarket2.equals(@currencyMarket1).should.be.false

    it 'should return false if the accounts are different', ->
      currencyMarket2 = new CurrencyMarket
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]
      currencyMarket2.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      currencyMarket2.register
        id: '123456790'
        timestamp: '987654322'
        key: 'Paul'
      currencyMarket2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: '2500' # different EUR balance
      currencyMarket2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: '1000'
      currencyMarket2.submit
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '0.2'
        offerAmount: '500'
      currencyMarket2.submit
        id: '2'
        timestamp: '2'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '0.25'
        offerAmount: '500'
      currencyMarket2.submit
        id: '3'
        timestamp: '3'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '0.5'
        offerAmount: '500'
      currencyMarket2.submit
        id: '4'
        timestamp: '4'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '1.0'
        offerAmount: '500'
      currencyMarket2.equals(@currencyMarket1).should.be.false

    it 'should return false if the orders or books are different', ->
      currencyMarket2 = new CurrencyMarket
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]
      currencyMarket2.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      currencyMarket2.register
        id: '123456790'
        timestamp: '987654322'
        key: 'Paul'
      currencyMarket2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: '2000'
      currencyMarket2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: '1000'
      currencyMarket2.submit
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '0.2'
        offerAmount: '500'
      currencyMarket2.submit
        id: '2'
        timestamp: '2'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '0.25'
        offerAmount: '500'
      currencyMarket2.submit
        id: '3'
        timestamp: '3'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '0.5'
        offerAmount: '500'
      # one less order
      currencyMarket2.equals(@currencyMarket1).should.be.false

  describe '#export', ->
    it 'should export the state of the market as a JSON stringifiable object that can be used to initialise a new CurrencyMarket in the exact same state', ->
      @currencyMarket.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      @currencyMarket.register
        id: '123456790'
        timestamp: '987654322'
        key: 'Paul'
      @currencyMarket.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: '2000'
      @currencyMarket.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: '1000'
      @currencyMarket.submit
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '0.2'
        offerAmount: '500'
      @currencyMarket.submit
        id: '2'
        timestamp: '2'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '0.25'
        offerAmount: '500'
      @currencyMarket.submit
        id: '3'
        timestamp: '3'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '0.5'
        offerAmount: '500'
      @currencyMarket.submit
        id: '4'
        timestamp: '4'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: '1.0'
        offerAmount: '500'
      state = @currencyMarket.export()
      json = JSON.stringify state
      newCurrencyMarket = new CurrencyMarket
        state: JSON.parse(json)
      newCurrencyMarket.equals(@currencyMarket).should.be.true
