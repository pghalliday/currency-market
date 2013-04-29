chai = require 'chai'
chai.should()
expect = chai.expect
assert = chai.assert
sinon = require 'sinon'
sinonChai = require 'sinon-chai'
chai.use sinonChai
Checklist = require 'checklist'

Market = require '../src/Market'
Book = require '../src/Book'
Account = require '../src/Account'
Balance = require '../src/Balance'
Amount = require '../src/Amount'
Order = require '../src/Order'

amountPoint2 = new Amount '0.2'
amountPoint25 = new Amount '0.25'
amountPoint5 = new Amount '0.5'
amount1 = new Amount '1'
amount4 = new Amount '4'
amount5 = new Amount '5'
amount20 = new Amount '20'
amount50 = new Amount '50'
amount99 = new Amount '99'
amount100 = new Amount '100'
amount125 = new Amount '125'
amount150 = new Amount '150'
amount200 = new Amount '200'
amount250 = new Amount '250'
amount300 = new Amount '300'
amount350 = new Amount '350'
amount400 = new Amount '400'
amount475 = new Amount '475'
amount500 = new Amount '500'
amount525 = new Amount '525'
amount650 = new Amount '650'
amount750 = new Amount '750'
amount1000 = new Amount '1000'
amount1250 = new Amount '1250'
amount1500 = new Amount '1500'
amount1750 = new Amount '1750'
amount2000 = new Amount '2000'
amount2500 = new Amount '2500'
amount4950 = new Amount '4950'

newAccount = (id) ->
  new Account
    id: id
    timestamp: '987654321'
    currencies: [
      'EUR'
      'USD'
      'BTC'
    ]

describe 'Market', ->
  beforeEach ->
    @market = new Market
      currencies: [
        'EUR'
        'USD'
        'BTC'
      ]

  it 'should instantiate with a collection of accounts and books matching the supported currencies', ->
    Object.keys(@market.accounts).should.be.empty
    @market.books['EUR']['BTC'].should.be.an.instanceOf(Book)
    @market.books['EUR']['USD'].should.be.an.instanceOf(Book)
    @market.books['USD']['EUR'].should.be.an.instanceOf(Book)
    @market.books['BTC']['EUR'].should.be.an.instanceOf(Book)
    @market.books['USD']['EUR'].should.be.an.instanceOf(Book)
    @market.books['EUR']['USD'].should.be.an.instanceOf(Book)

  describe '#register', ->
    it 'should submit an account to the market, record the last transaction ID and emit an account event', (done) ->
      checklist = new Checklist [
          '123456789'
          '987654321'
        ],
        ordered: true,
        (error) =>
          @market.removeAllListeners()
          done error

      @market.on 'account', (account) ->
        checklist.check account.id
        checklist.check account.timestamp

      account = newAccount '123456789'
      @market.register account
      @market.lastTransaction.should.equal '123456789'
      account = @market.accounts['123456789']
      account.should.equal account

    it 'should throw an error if the account already exists', ->
      @market.register newAccount '123456789'
      expect =>
        @market.register newAccount '123456789'
      .to.throw('Account already exists')

  describe '#deposit', ->
    it 'should throw an error if no transaction ID is given', ->
      @market.register newAccount 'Peter'
      expect =>
        @market.deposit
          timestamp: '987654322'
          account: 'Peter'
          currency: 'BTC'
          amount: amount50
      .to.throw('Must supply transaction ID')

    it 'should throw an error if no timestamp is given', ->
      @market.register newAccount 'Peter'
      expect =>
        @market.deposit
          id: '123456790'
          account: 'Peter'
          currency: 'BTC'
          amount: amount50
      .to.throw('Must supply timestamp')

    it 'should credit the correct account and currency, record the last transaction ID and emit a deposit event', (done) ->
      checklist = new Checklist [
          '123456790'
          '987654322'
          'Peter'
          'BTC'
          '50'
        ],
        ordered: true,
        (error) =>
          @market.removeAllListeners()
          done error

      @market.on 'deposit', (deposit) ->
        checklist.check deposit.id
        checklist.check deposit.timestamp
        checklist.check deposit.account
        checklist.check deposit.currency
        checklist.check deposit.amount.toString()

      @market.register newAccount 'Peter'
      account = @market.accounts['Peter']
      account.balances['EUR'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.balances['USD'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.balances['BTC'].funds.compareTo(Amount.ZERO).should.equal(0)
      @market.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'BTC'
        amount: amount50
      @market.lastTransaction.should.equal '123456790'
      account.balances['EUR'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.balances['USD'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.balances['BTC'].funds.compareTo(amount50).should.equal(0)

    it 'should throw an error if the account does not exist', ->
      expect =>
        @market.deposit
          id: '123456790'
          timestamp: '987654322'
          account: 'Peter',
          currency: 'BTC',
          amount: amount50
      .to.throw('Account does not exist')

    it 'should throw an error if the currency is not supported', ->
      @market.register newAccount 'Peter'
      expect =>
        @market.deposit
          id: '123456790'
          timestamp: '987654322'
          account: 'Peter'
          currency: 'CAD'
          amount: amount50
      .to.throw('Currency is not supported')

  describe '#withdraw', ->
    it 'should throw an error if no transaction ID is given', ->
      @market.register newAccount 'Peter'
      @market.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'BTC'
        amount: amount200
      expect =>
        @market.withdraw
          timestamp: '987654322'
          account: 'Peter'
          currency: 'BTC'
          amount: amount50
      .to.throw('Must supply transaction ID')

    it 'should throw an error if no timestamp is given', ->
      @market.register newAccount 'Peter'
      @market.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'BTC'
        amount: amount200
      expect =>
        @market.withdraw
          id: '123456790'
          account: 'Peter'
          currency: 'BTC'
          amount: amount50
      .to.throw('Must supply timestamp')

    it 'should debit the correct account and currency, record the last transaction ID and emit a withdrawal event', (done) ->
      checklist = new Checklist [
          '123456791'
          '987654323'
          'Peter'
          'BTC'
          '50'
        ],
        ordered: true,
        (error) =>
          @market.removeAllListeners()
          done error

      @market.on 'withdrawal', (withdrawal) ->
        checklist.check withdrawal.id
        checklist.check withdrawal.timestamp
        checklist.check withdrawal.account
        checklist.check withdrawal.currency
        checklist.check withdrawal.amount.toString()

      @market.register newAccount 'Peter'
      account = @market.accounts['Peter']
      @market.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'BTC'
        amount: amount200
      @market.withdraw
        id: '123456791'
        timestamp: '987654323'
        account: 'Peter'
        currency: 'BTC'
        amount: amount50
      @market.lastTransaction.should.equal '123456791'
      account.balances['BTC'].funds.compareTo(amount150).should.equal(0)

    it 'should throw an error if the account does not exist', ->
      expect =>
        @market.withdraw
          id: '123456790'
          timestamp: '987654322'
          account: 'Peter'
          currency: 'BTC'
          amount: amount50
      .to.throw('Account does not exist')

    it 'should throw an error if the currency is not supported', ->
      @market.register newAccount 'Peter'
      expect =>
        @market.withdraw
          id: '123456790'
          timestamp: '987654322'
          account: 'Peter'
          currency: 'CAD'
          amount: amount50
      .to.throw('Currency is not supported')

  describe '#submit', ->
    it 'should lock the correct funds in the correct account', ->
      @market.register newAccount 'Peter'
      account = @market.accounts['Peter']
      @market.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: amount200
      @market.submit new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amount50        
      @market.submit new Order
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        bidCurrency: 'USD'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amount100        
      account.balances['EUR'].lockedFunds.compareTo(amount150).should.equal(0)

    it 'should record an order, submit it to the correct book, record the last transaction ID and emit an order event', (done) ->
      checklist = new Checklist [
          '123456793'
          '987654321'
          'Peter'
          'BTC'
          'EUR'
          '100'
          '50'
          'undefined'
          '5000'
          '123456794'
          '987654322'
          'Paul'
          'EUR'
          'BTC'
          'undefined'
          '4950'
          '99'
          '50'
        ],
        ordered: true,
        (error) =>
          @market.removeAllListeners()
          done error

      @market.on 'order', (order) ->
        checklist.check order.id
        checklist.check order.timestamp
        checklist.check order.account
        checklist.check order.bidCurrency
        checklist.check order.offerCurrency
        checklist.check order.offerPrice + ''
        checklist.check order.offerAmount.toString()
        checklist.check order.bidPrice + ''
        checklist.check order.bidAmount.toString()

      @market.register newAccount 'Peter'
      @market.register newAccount 'Paul'
      @market.deposit
        id: '123456791'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: amount200
      @market.deposit
        id: '123456792'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: amount4950
      @market.submit new Order
        id: '123456793'
        timestamp: '987654321'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amount50
      @market.lastTransaction.should.equal '123456793'
      @market.books['BTC']['EUR'].highest.id.should.equal('123456793')
      @market.submit new Order
        id: '123456794'
        timestamp: '987654322'
        account: 'Paul'
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'
        bidPrice: amount99
        bidAmount: amount50
      @market.lastTransaction.should.equal '123456794'
      @market.books['EUR']['BTC'].highest.id.should.equal('123456794')

    describe 'while executing orders', ->
      beforeEach ->
        @market.register newAccount 'Peter'
        @market.register newAccount 'Paul'
        @market.deposit
          id: '123456790'
          timestamp: '987654322'
          account: 'Peter'
          currency: 'EUR'
          amount: amount2000
        @market.deposit
          id: '123456790'
          timestamp: '987654322'
          account: 'Paul'
          currency: 'BTC'
          amount: amount400

      describe 'where the existing (right) order is an offer', ->
        beforeEach ->
          @market.submit new Order
            id: '1'
            timestamp: '1'
            account: 'Peter'
            bidCurrency: 'BTC'
            offerCurrency: 'EUR'
            offerPrice: amountPoint2   # 5
            offerAmount: amount1000 # 200

        describe 'and the new (left) price is same', ->
          describe 'and the left order is a bid', ->
            describe 'and the right order is offering exactly the amount the left order is bidding', ->
                it 'should trade the amount the right order is offering and emit a trade event', (done) ->
                  checklist = new Checklist [
                      '2'
                      '1'
                      '0.2'
                      '1000'
                    ],
                    ordered: true,
                    (error) =>
                      @market.removeAllListeners()
                      done error

                  @market.on 'trade', (trade) ->
                    checklist.check trade.bid.id
                    checklist.check trade.offer.id
                    checklist.check trade.price.toString()
                    checklist.check trade.amount.toString()

                  @market.submit new Order
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    bidPrice: amountPoint2
                    bidAmount: amount1000
                  expect(@market.books['BTC']['EUR'].entries['1']).to.not.be.ok
                  expect(@market.books['EUR']['BTC'].entries['2']).to.not.be.ok
                  @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                  @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering more than the left order is bidding', ->
                it 'should trade the amount the left order is offering and emit a trade event', (done) ->
                  checklist = new Checklist [
                      '2'
                      '1'
                      '0.2'
                      '500'
                    ],
                    ordered: true,
                    (error) =>
                      @market.removeAllListeners()
                      done error

                  @market.on 'trade', (trade) ->
                    checklist.check trade.bid.id
                    checklist.check trade.offer.id
                    checklist.check trade.price.toString()
                    checklist.check trade.amount.toString()

                  @market.submit new Order
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    bidPrice: amountPoint2
                    bidAmount: amount500
                  @market.books['BTC']['EUR'].entries['1'].order.offerAmount.compareTo(amount500).should.equal 0
                  expect(@market.books['EUR']['BTC'].entries['2']).to.not.be.ok
                  @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
                  @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal 0
                  @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering less than the left order is bidding', ->
                it 'should trade the amount the right order is offering and emit a trade event', (done) ->
                  checklist = new Checklist [
                      '2'
                      '1'
                      '0.2'
                      '1000'
                    ],
                    ordered: true,
                    (error) =>
                      @market.removeAllListeners()
                      done error

                  @market.on 'trade', (trade) ->
                    checklist.check trade.bid.id
                    checklist.check trade.offer.id
                    checklist.check trade.price.toString()
                    checklist.check trade.amount.toString()

                  @market.submit new Order
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    bidPrice: amountPoint2
                    bidAmount: amount1500
                  expect(@market.books['BTC']['EUR'].entries['1']).to.not.be.ok
                  @market.books['EUR']['BTC'].entries['2'].order.bidAmount.compareTo(amount500).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                  @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount100).should.equal 0

          describe 'and the left order is an offer', ->
            describe 'and the right order is offering exactly the amount the left order is offering', ->
                it 'should trade the amount the right order is offering and emit a trade event', (done) ->
                  checklist = new Checklist [
                      '2'
                      '1'
                      '0.2'
                      '1000'
                    ],
                    ordered: true,
                    (error) =>
                      @market.removeAllListeners()
                      done error

                  @market.on 'trade', (trade) ->
                    checklist.check trade.bid.id
                    checklist.check trade.offer.id
                    checklist.check trade.price.toString()
                    checklist.check trade.amount.toString()

                  @market.submit new Order
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    offerPrice: amount5
                    offerAmount: amount200
                  expect(@market.books['BTC']['EUR'].entries['1']).to.not.be.ok
                  expect(@market.books['EUR']['BTC'].entries['2']).to.not.be.ok
                  @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                  @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering more than the left order is offering', ->
                it 'should trade the amount the left order is offering and emit a trade event', (done) ->
                  checklist = new Checklist [
                      '2'
                      '1'
                      '0.2'
                      '500'
                    ],
                    ordered: true,
                    (error) =>
                      @market.removeAllListeners()
                      done error

                  @market.on 'trade', (trade) ->
                    checklist.check trade.bid.id
                    checklist.check trade.offer.id
                    checklist.check trade.price.toString()
                    checklist.check trade.amount.toString()

                  @market.submit new Order
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    offerPrice: amount5
                    offerAmount: amount100
                  @market.books['BTC']['EUR'].entries['1'].order.offerAmount.compareTo(amount500).should.equal 0
                  expect(@market.books['EUR']['BTC'].entries['2']).to.not.be.ok
                  @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
                  @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal 0
                  @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering less than the left order is offering', ->
                it 'should trade the amount the right order is offering and emit a trade event', (done) ->
                  checklist = new Checklist [
                      '2'
                      '1'
                      '0.2'
                      '1000'
                    ],
                    ordered: true,
                    (error) =>
                      @market.removeAllListeners()
                      done error

                  @market.on 'trade', (trade) ->
                    checklist.check trade.bid.id
                    checklist.check trade.offer.id
                    checklist.check trade.price.toString()
                    checklist.check trade.amount.toString()

                  @market.submit new Order
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    offerPrice: amount5
                    offerAmount: amount300
                  expect(@market.books['BTC']['EUR'].entries['1']).to.not.be.ok
                  @market.books['EUR']['BTC'].entries['2'].order.offerAmount.compareTo(amount100).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                  @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount100).should.equal 0

        describe 'and the new (left) price is the better', ->
          describe 'and the left order is an offer', ->              
            describe 'and the right order is offering exactly the amount that the left order is offering multiplied by the right order price', ->
              it 'should trade the amount the right order is offering at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    '2'
                    '1'
                    '0.2'
                    '1000'
                  ],
                  ordered: true,
                  (error) =>
                    @market.removeAllListeners()
                    done error

                @market.on 'trade', (trade) ->
                  checklist.check trade.bid.id
                  checklist.check trade.offer.id
                  checklist.check trade.price.toString()
                  checklist.check trade.amount.toString()

                @market.submit new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: amount4
                  offerAmount: amount200
                expect(@market.books['BTC']['EUR'].entries['1']).to.not.be.ok
                expect(@market.books['EUR']['BTC'].entries['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering more than the left order is offering multiplied by the right order price', ->
              it 'should trade the amount the left order is offering at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    '2'
                    '1'
                    '0.2'
                    '500'
                  ],
                  ordered: true,
                  (error) =>
                    @market.removeAllListeners()
                    done error

                @market.on 'trade', (trade) ->
                  checklist.check trade.bid.id
                  checklist.check trade.offer.id
                  checklist.check trade.price.toString()
                  checklist.check trade.amount.toString()

                @market.submit new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: amount4
                  offerAmount: amount100
                @market.books['BTC']['EUR'].entries['1'].order.offerAmount.compareTo(amount500).should.equal 0
                expect(@market.books['EUR']['BTC'].entries['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering less than the left order is offering multiplied by the right order price', ->
              it 'should trade the amount the right order is offering at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    '2'
                    '1'
                    '0.2'
                    '1000'
                  ],
                  ordered: true,
                  (error) =>
                    @market.removeAllListeners()
                    done error

                @market.on 'trade', (trade) ->
                  checklist.check trade.bid.id
                  checklist.check trade.offer.id
                  checklist.check trade.price.toString()
                  checklist.check trade.amount.toString()

                @market.submit new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: amount4
                  offerAmount: amount300
                expect(@market.books['BTC']['EUR'].entries['1']).to.not.be.ok
                @market.books['EUR']['BTC'].entries['2'].order.offerAmount.compareTo(amount100).should.equal 0
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount100).should.equal 0

          describe 'and the left order is a bid', ->
            describe 'and the right order is offering exactly the amount that the left order is bidding', ->
              it 'should trade the amount the right order is offering at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    '2'
                    '1'
                    '0.2'
                    '1000'
                  ],
                  ordered: true,
                  (error) =>
                    @market.removeAllListeners()
                    done error

                @market.on 'trade', (trade) ->
                  checklist.check trade.bid.id
                  checklist.check trade.offer.id
                  checklist.check trade.price.toString()
                  checklist.check trade.amount.toString()

                @market.submit new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: amountPoint25
                  bidAmount: amount1000
                expect(@market.books['BTC']['EUR'].entries['1']).to.not.be.ok
                expect(@market.books['EUR']['BTC'].entries['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is offering more than the left order is bidding', ->
              it 'should trade the amount the left order is bidding at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    '2'
                    '1'
                    '0.2'
                    '500'
                  ],
                  ordered: true,
                  (error) =>
                    @market.removeAllListeners()
                    done error

                @market.on 'trade', (trade) ->
                  checklist.check trade.bid.id
                  checklist.check trade.offer.id
                  checklist.check trade.price.toString()
                  checklist.check trade.amount.toString()

                @market.submit new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: amountPoint25
                  bidAmount: amount500
                @market.books['BTC']['EUR'].entries['1'].order.offerAmount.compareTo(amount500).should.equal 0
                expect(@market.books['EUR']['BTC'].entries['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is offering less than the left order is bidding', ->
              it 'should trade the amount the right order is offering at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    '2'
                    '1'
                    '0.2'
                    '1000'
                  ],
                  ordered: true,
                  (error) =>
                    @market.removeAllListeners()
                    done error

                @market.on 'trade', (trade) ->
                  checklist.check trade.bid.id
                  checklist.check trade.offer.id
                  checklist.check trade.price.toString()
                  checklist.check trade.amount.toString()

                @market.submit new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: amountPoint25
                  bidAmount: amount1500
                expect(@market.books['BTC']['EUR'].entries['1']).to.not.be.ok
                @market.books['EUR']['BTC'].entries['2'].order.bidAmount.compareTo(amount500).should.equal 0
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount125).should.equal 0
              
      describe 'where the existing (right) order is a bid', ->
        beforeEach ->
          @market.removeAllListeners()
          @rightOrder = new Order
            id: '1'
            timestamp: '1'
            account: 'Peter'
            bidCurrency: 'BTC'
            offerCurrency: 'EUR'
            bidPrice: amount5     # 0.2
            bidAmount: amount200  # 1000
          @market.submit @rightOrder

        describe 'and the new (left) price is better', ->
          describe 'and the left order is an offer', ->
            describe 'and the right order is bidding exactly the amount that the left order is offering', ->
              it 'should trade the amount the right order is bidding at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    '1'
                    '2'
                    '5'
                    '200'
                  ],
                  ordered: true,
                  (error) =>
                    @market.removeAllListeners()
                    done error

                @market.on 'trade', (trade) ->
                  checklist.check trade.bid.id
                  checklist.check trade.offer.id
                  checklist.check trade.price.toString()
                  checklist.check trade.amount.toString()

                @market.submit new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: amount4
                  offerAmount: amount200
                expect(@market.books['BTC']['EUR'].entries['1']).to.not.be.ok
                expect(@market.books['EUR']['BTC'].entries['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is bidding more than the left order is offering', ->
              it 'should trade the amount the left order is offering at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    '1'
                    '2'
                    '5'
                    '100'
                  ],
                  ordered: true,
                  (error) =>
                    @market.removeAllListeners()
                    done error

                @market.on 'trade', (trade) ->
                  checklist.check trade.bid.id
                  checklist.check trade.offer.id
                  checklist.check trade.price.toString()
                  checklist.check trade.amount.toString()

                @market.submit new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: amount4
                  offerAmount: amount100
                @market.books['BTC']['EUR'].entries['1'].order.bidAmount.compareTo(amount100).should.equal 0
                expect(@market.books['EUR']['BTC'].entries['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is bidding less than the left order is offering', ->
              it 'should trade the amount the right order is bidding at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    '1'
                    '2'
                    '5'
                    '200'
                  ],
                  ordered: true,
                  (error) =>
                    @market.removeAllListeners()
                    done error

                @market.on 'trade', (trade) ->
                  checklist.check trade.bid.id
                  checklist.check trade.offer.id
                  checklist.check trade.price.toString()
                  checklist.check trade.amount.toString()

                @market.submit new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: amount4
                  offerAmount: amount300
                expect(@market.books['BTC']['EUR'].entries['1']).to.not.be.ok
                @market.books['EUR']['BTC'].entries['2'].order.offerAmount.compareTo(amount100).should.equal 0
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount100).should.equal 0

          describe 'and the left order is a bid', ->
            describe 'and the right order is bidding exactly the amount that the left order is bidding multiplied by the right order price', ->
              it 'should trade the amount the right order is bidding at the right order price and emit a trade event', ->
                leftOrder = new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: amountPoint25
                  bidAmount: amount1000

                tradeSpy = sinon.spy (trade) =>
                  trade.bid.should.equal @rightOrder
                  trade.offer.should.equal leftOrder
                  trade.price.compareTo(amount5).should.equal 0
                  trade.amount.compareTo(amount200).should.equal 0
                @market.on 'trade', tradeSpy

                @market.submit leftOrder

                tradeSpy.should.have.been.calledOnce
                expect(@market.books['BTC']['EUR'].entries['1']).to.not.be.ok
                expect(@market.books['EUR']['BTC'].entries['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is bidding more than the left order is bidding multiplied by the right order price', ->
              it 'should trade the amount the left order is bidding at the right order price and emit a trade event', ->
                leftOrder = new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: amountPoint25
                  bidAmount: amount500

                tradeSpy = sinon.spy (trade) =>
                  trade.bid.should.equal @rightOrder
                  trade.offer.should.equal leftOrder
                  trade.price.compareTo(amount5).should.equal 0
                  trade.amount.compareTo(amount100).should.equal 0
                @market.on 'trade', tradeSpy

                @market.submit leftOrder

                tradeSpy.should.have.been.calledOnce
                @market.books['BTC']['EUR'].entries['1'].order.bidAmount.compareTo(amount100).should.equal 0
                expect(@market.books['EUR']['BTC'].entries['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is bidding less than the left order is bidding multiplied by the right order price', ->
              it 'should trade the amount the right order is bidding at the right order price and emit a trade event', ->
                leftOrder = new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: amountPoint25
                  bidAmount: amount1500

                tradeSpy = sinon.spy (trade) =>
                  trade.bid.should.equal @rightOrder
                  trade.offer.should.equal leftOrder
                  trade.price.compareTo(amount5).should.equal 0
                  trade.amount.compareTo(amount200).should.equal 0
                @market.on 'trade', tradeSpy

                @market.submit leftOrder

                tradeSpy.should.have.been.calledOnce
                expect(@market.books['BTC']['EUR'].entries['1']).to.not.be.ok
                @market.books['EUR']['BTC'].entries['2'].order.bidAmount.compareTo(amount500).should.equal 0
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount125).should.equal 0
                    
    describe 'when multiple orders can be matched', ->
      beforeEach ->
        @market.register newAccount 'Peter'
        @market.register newAccount 'Paul'
        @market.deposit
          id: '123456790'
          timestamp: '987654322'
          account: 'Peter'
          currency: 'EUR'
          amount: amount2000
        @market.deposit
          id: '123456790'
          timestamp: '987654322'
          account: 'Paul'
          currency: 'BTC'
          amount: amount1000
        @market.submit new Order
          id: '1'
          timestamp: '1'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amountPoint2
          offerAmount: amount500
        @market.submit new Order
          id: '2'
          timestamp: '2'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amountPoint25
          offerAmount: amount500
        @market.submit new Order
          id: '3'
          timestamp: '3'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amountPoint5
          offerAmount: amount500
        @market.submit new Order
          id: '4'
          timestamp: '4'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amount1
          offerAmount: amount500

      describe 'and the last order can be completely satisfied', ->
        it 'should correctly execute as many orders as it can and emit trade events', (done) ->
          checklist = new Checklist [
              '5'
              '1'
              '0.2'
              '500'
              '5'
              '2'
              '0.25'
              '500'
              '5'
              '3'
              '0.5'
              '250'
            ],
            ordered: true,
            (error) =>
              @market.removeAllListeners()
              done error

          @market.on 'trade', (trade) ->
            checklist.check trade.bid.id
            checklist.check trade.offer.id
            checklist.check trade.price.toString()
            checklist.check trade.amount.toString()

          @market.submit new Order
            id: '5'
            timestamp: '5'
            account: 'Paul'
            bidCurrency: 'EUR'
            offerCurrency: 'BTC'
            bidPrice: amountPoint5
            bidAmount: amount1250
          expect(@market.books['BTC']['EUR'].entries['1']).to.not.be.ok
          expect(@market.books['BTC']['EUR'].entries['2']).to.not.be.ok
          @market.books['BTC']['EUR'].entries['3'].order.offerAmount.compareTo(amount250).should.equal 0
          @market.books['BTC']['EUR'].entries[amount4].order.offerAmount.compareTo(amount500).should.equal 0
          expect(@market.books['EUR']['BTC'].entries[amount5]).to.not.be.ok
          @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount750).should.equal 0
          @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount750).should.equal 0
          @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount350).should.equal 0
          @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1250).should.equal 0
          @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount650).should.equal 0
          @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

      describe 'and the last order cannot be completely satisfied', ->    
        it 'should correctly execute as many orders as it can and emit trade events', (done) ->
          checklist = new Checklist [
              '5'
              '1'
              '0.2'
              '500'
              '5'
              '2'
              '0.25'
              '500'
              '5'
              '3'
              '0.5'
              '500'
            ],
            ordered: true,
            (error) =>
              @market.removeAllListeners()
              done error

          @market.on 'trade', (trade) ->
            checklist.check trade.bid.id
            checklist.check trade.offer.id
            checklist.check trade.price.toString()
            checklist.check trade.amount.toString()

          @market.submit new Order
            id: '5'
            timestamp: '5'
            account: 'Paul'
            bidCurrency: 'EUR'
            offerCurrency: 'BTC'
            bidPrice: amountPoint5
            bidAmount: amount1750
          expect(@market.books['BTC']['EUR'].entries['1']).to.not.be.ok
          expect(@market.books['BTC']['EUR'].entries['2']).to.not.be.ok
          expect(@market.books['BTC']['EUR'].entries['3']).to.not.be.ok
          @market.books['BTC']['EUR'].entries[amount4].order.offerAmount.compareTo(amount500).should.equal 0
          @market.books['EUR']['BTC'].entries[amount5].order.bidAmount.compareTo(amount250).should.equal 0
          @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount500).should.equal 0
          @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
          @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount475).should.equal 0
          @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1500).should.equal 0
          @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount525).should.equal 0
          @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount125).should.equal 0
              
    it 'should throw an error if the account does not exist', ->
      expect =>
        @market.submit new Order
          id: '123456789'
          timestamp: '987654321'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amount100
          offerAmount: amount50        
      .to.throw('Account does not exist')

    it 'should throw an error if the offer currency is not supported', ->
      @market.register newAccount 'Peter'
      expect =>
        @market.submit new Order
          id: '123456789'
          timestamp: '987654321'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'CAD'
          offerPrice: amount100
          offerAmount: amount50        
      .to.throw('Offer currency is not supported')

    it 'should throw an error if the bid currency is not supported', ->
      @market.register newAccount 'Peter'
      expect =>
        @market.submit new Order
          id: '123456789'
          timestamp: '987654321'
          account: 'Peter'
          bidCurrency: 'CAD'
          offerCurrency: 'EUR'
          offerPrice: amount100
          offerAmount: amount50        
      .to.throw('Bid currency is not supported')

    it 'should execute orders correctly and not throw a withdraw error when ? (captured from a failing random performance test)', ->
      @market.register newAccount '100000'
      @market.register newAccount '100001'
      @market.register newAccount '100002'
      @market.deposit
        id: '100010'
        timestamp: '1366758222'
        account: '100000'
        currency: 'EUR'
        amount: new Amount '8236'
      @market.submit new Order
        id: '100012'
        timestamp: '1366758222'
        account: '100000'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: new Amount '116'
        bidAmount: new Amount '71'
      @market.deposit
        id: '100021'
        timestamp: '1366758222'
        account: '100001'
        currency: 'BTC'
        amount: new Amount '34'
      @market.submit new Order
        id: '100023'
        timestamp: '1366758222'
        account: '100001'
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'
        offerPrice: new Amount '114'
        offerAmount: new Amount '34'
      @market.deposit
        id: '100031'
        timestamp: '1366758222'
        account: '100002'
        currency: 'BTC'
        amount: new Amount '52'
      @market.submit new Order
        id: '100033'
        timestamp: '1366758222'
        account: '100002'
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'
        offerPrice: new Amount '110'
        offerAmount: new Amount '52'

    it 'should execute orders correctly and not throw an unlock funds error when ? (captured from a failing random performance test)', ->
      @market.register newAccount '100000'
      @market.register newAccount '100001'
      @market.register newAccount '100002'
      @market.deposit
        id: '100011'
        timestamp: '1366758222'
        account: '100000'
        currency: 'BTC'
        amount: new Amount '54'
      @market.submit new Order
        id: '100013'
        timestamp: '1366758222'
        account: '100000'
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'
        offerPrice: new Amount '89'
        offerAmount: new Amount '54'
      @market.deposit
        id: '100020'
        timestamp: '1366758222'
        account: '100001'
        currency: 'EUR'
        amount: new Amount '5252'
      @market.submit new Order
        id: '100022'
        timestamp: '1366758222'
        account: '100001'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: new Amount '101'
        bidAmount: new Amount '52'
      @market.deposit
        id: '100030'
        timestamp: '1366758222'
        account: '100002'
        currency: 'EUR'
        amount: new Amount '4815'
      @market.submit new Order
        id: '100032'
        timestamp: '1366758222'
        account: '100002'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: new Amount '107'
        bidAmount: new Amount '45'

  describe '#cancel', ->
    it 'should unlock the correct funds in the correct account', ->
      @market.register newAccount 'Peter'
      account = @market.accounts['Peter']
      @market.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: amount200
      @market.submit new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amount50        
      @market.submit new Order
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        bidCurrency: 'USD'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amount100        
      account.balances['EUR'].lockedFunds.compareTo(amount150).should.equal 0
      @market.cancel
        id: '123456791'
        timestamp: '987654350'
        order: new Order
          id: '123456789'
          timestamp: '987654321'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amount100
          offerAmount: amount50        
      account.balances['EUR'].lockedFunds.compareTo(amount100).should.equal 0

    it 'should remove the order from the orders collection and from the correct book, record the last transaction ID and emit an cancellation event', (done) ->
      checklist = new Checklist [
          '123456795'
          '987654349'
          '123456793'
          '987654321'
          'Peter'
          'BTC'
          'EUR'
          '100'
          '50'
          'undefined'
          '5000'
          '123456796'
          '987654350'
          '123456794'
          '987654322'
          'Paul'
          'EUR'
          'BTC'
          'undefined'
          '4950'
          '99'
          '50'
        ],
        ordered: true,
        (error) =>
          @market.removeAllListeners()
          done error

      @market.on 'cancellation', (cancellation) ->
        checklist.check cancellation.id
        checklist.check cancellation.timestamp
        checklist.check cancellation.order.id
        checklist.check cancellation.order.timestamp
        checklist.check cancellation.order.account
        checklist.check cancellation.order.bidCurrency
        checklist.check cancellation.order.offerCurrency
        checklist.check cancellation.order.offerPrice + ''
        checklist.check cancellation.order.offerAmount.toString()
        checklist.check cancellation.order.bidPrice + ''
        checklist.check cancellation.order.bidAmount.toString()

      @market.register newAccount 'Peter'
      @market.register newAccount 'Paul'
      @market.deposit
        id: '123456791'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: amount200
      @market.deposit
        id: '123456792'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: amount4950
      @market.submit new Order
        id: '123456793'
        timestamp: '987654321'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amount50
      @market.submit new Order
        id: '123456794'
        timestamp: '987654322'
        account: 'Paul'
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'
        bidPrice: amount99
        bidAmount: amount50
      @market.cancel
        id: '123456795'
        timestamp: '987654349'
        order: new Order
          id: '123456793'
          timestamp: '987654321'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amount100
          offerAmount: amount50
      @market.lastTransaction.should.equal '123456795'
      expect(@market.books['BTC']['EUR'].entries['123456793']).to.not.be.ok
      expect(@market.books['BTC']['EUR'].highest).to.not.be.ok
      @market.cancel
        id: '123456796'
        timestamp: '987654350'
        order: new Order
          id: '123456794'
          timestamp: '987654322'
          account: 'Paul'
          bidCurrency: 'EUR'
          offerCurrency: 'BTC'
          bidPrice: amount99
          bidAmount: amount50
      @market.lastTransaction.should.equal '123456796'
      expect(@market.books['BTC']['EUR'].entries['123456794']).to.not.be.ok
      expect(@market.books['EUR']['BTC'].highest).to.not.be.ok

    it 'should throw an error if the order cannot be found', ->
      expect =>
        @market.cancel
          id: '123456795'
          timestamp: '987654349'
          order: new Order
            id: '123456793'
            timestamp: '987654321'
            account: 'Peter'
            bidCurrency: 'BTC'
            offerCurrency: 'EUR'
            offerPrice: amount100
            offerAmount: amount50        
      .to.throw('Order cannot be found')

    it 'should throw an error if the order does not match', ->
      @market.register newAccount 'Peter'
      account = @market.accounts['Peter']
      @market.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: amount200
      @market.submit new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amount50        
      expect =>
        @market.cancel
          id: '123456795'
          timestamp: '987654349'
          order: new Order
            id: '123456789'
            timestamp: '987654321'
            account: 'Peter'
            bidCurrency: 'BTC'
            offerCurrency: 'EUR'
            offerPrice: amount100
            offerAmount: amount20        
      .to.throw('Order does not match')

  describe '#equals', ->
    beforeEach ->
      @market1 = new Market
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]
      @market1.register newAccount 'Peter'
      @market1.register newAccount 'Paul'
      @market1.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: amount2000
      @market1.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: amount1000
      @market1.submit new Order
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint2
        offerAmount: amount500
      @market1.submit new Order
        id: '2'
        timestamp: '2'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint25
        offerAmount: amount500
      @market1.submit new Order
        id: '3'
        timestamp: '3'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint5
        offerAmount: amount500
      @market1.submit new Order
        id: '4'
        timestamp: '4'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount1
        offerAmount: amount500

    it 'should return true if 2 markets are equal', ->
      market2 = new Market
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]
      market2.register newAccount 'Peter'
      market2.register newAccount 'Paul'
      market2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: amount2000
      market2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: amount1000
      market2.submit new Order
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint2
        offerAmount: amount500
      market2.submit new Order
        id: '2'
        timestamp: '2'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint25
        offerAmount: amount500
      market2.submit new Order
        id: '3'
        timestamp: '3'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint5
        offerAmount: amount500
      market2.submit new Order
        id: '4'
        timestamp: '4'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount1
        offerAmount: amount500
      market2.equals(@market1).should.be.true

    it 'should return false if the last transaction is different', ->
      market2 = new Market
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]
      market2.register newAccount 'Peter'
      market2.register newAccount 'Paul'
      market2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: amount2000
      market2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: amount1000
      market2.submit new Order
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint2
        offerAmount: amount500
      market2.submit new Order
        id: '2'
        timestamp: '2'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint25
        offerAmount: amount500
      market2.submit new Order
        id: '3'
        timestamp: '3'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint5
        offerAmount: amount500
      market2.submit new Order
        id: '4'
        timestamp: '4'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount1
        offerAmount: amount500
      market2.lastTransaction = amount5
      market2.equals(@market1).should.be.false
      delete market2.lastTransaction
      market2.equals(@market1).should.be.false

    it 'should return false if the currencies list is different', ->
      market2 = new Market
        currencies: [
          'EUR'
          'BTC'
        ]
      market2.register newAccount 'Peter'
      market2.register newAccount 'Paul'
      market2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: amount2000
      market2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: amount1000
      market2.submit new Order
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint2
        offerAmount: amount500
      market2.submit new Order
        id: '2'
        timestamp: '2'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint25
        offerAmount: amount500
      market2.submit new Order
        id: '3'
        timestamp: '3'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint5
        offerAmount: amount500
      market2.submit new Order
        id: '4'
        timestamp: '4'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount1
        offerAmount: amount500
      market2.equals(@market1).should.be.false

    it 'should return false if the accounts are different', ->
      market2 = new Market
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]
      market2.register newAccount 'Peter'
      market2.register newAccount 'Paul'
      market2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: amount2500 # different EUR balance
      market2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: amount1000
      market2.submit new Order
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint2
        offerAmount: amount500
      market2.submit new Order
        id: '2'
        timestamp: '2'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint25
        offerAmount: amount500
      market2.submit new Order
        id: '3'
        timestamp: '3'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint5
        offerAmount: amount500
      market2.submit new Order
        id: '4'
        timestamp: '4'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount1
        offerAmount: amount500
      market2.equals(@market1).should.be.false

    it 'should return false if the orders or books are different', ->
      market2 = new Market
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]
      market2.register newAccount 'Peter'
      market2.register newAccount 'Paul'
      market2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: amount2000
      market2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: amount1000
      market2.submit new Order
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint2
        offerAmount: amount500
      market2.submit new Order
        id: '2'
        timestamp: '2'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint25
        offerAmount: amount500
      market2.submit new Order
        id: '3'
        timestamp: '3'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint5
        offerAmount: amount500
      # one less order
      market2.equals(@market1).should.be.false

  describe '#export', ->
    it 'should export the state of the market as a JSON stringifiable object that can be used to initialise a new Market in the exact same state', ->
      @market.register newAccount 'Peter'
      @market.register newAccount 'Paul'
      @market.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: amount2000
      @market.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: amount1000
      @market.submit new Order
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint2
        offerAmount: amount500
      @market.submit new Order
        id: '2'
        timestamp: '2'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint25
        offerAmount: amount500
      @market.submit new Order
        id: '3'
        timestamp: '3'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint5
        offerAmount: amount500
      @market.submit new Order
        id: '4'
        timestamp: '4'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount1
        offerAmount: amount500
      state = @market.export()
      json = JSON.stringify state
      newMarket = new Market
        state: JSON.parse(json)
      newMarket.equals(@market).should.be.true
