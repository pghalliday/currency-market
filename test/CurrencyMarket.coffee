chai = require 'chai'
chai.should()
expect = chai.expect
assert = chai.assert
Checklist = require 'checklist'

CurrencyMarket = require '../src/CurrencyMarket'
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

describe 'CurrencyMarket', ->
  beforeEach ->
    @currencyMarket = new CurrencyMarket
      currencies: [
        'EUR'
        'USD'
        'BTC'
      ]

  it 'should instantiate with a collection of accounts and books matching the supported currencies', ->
    Object.keys(@currencyMarket.accounts).should.be.empty
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

    it 'should submit an account to the currencyMarket with the supported currencies, record the last transaction ID and emit an account event', (done) ->
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
      @currencyMarket.lastTransaction.should.equal '123456789'
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
          amount: amount50
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
          @currencyMarket.removeAllListeners()
          done error

      @currencyMarket.on 'deposit', (deposit) ->
        checklist.check deposit.id
        checklist.check deposit.timestamp
        checklist.check deposit.account
        checklist.check deposit.currency
        checklist.check deposit.amount.toString()

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
        amount: amount50
      @currencyMarket.lastTransaction.should.equal '123456790'
      account.balances['EUR'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.balances['USD'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.balances['BTC'].funds.compareTo(amount50).should.equal(0)

    it 'should throw an error if the account does not exist', ->
      expect =>
        @currencyMarket.deposit
          id: '123456790'
          timestamp: '987654322'
          account: 'Peter',
          currency: 'BTC',
          amount: amount50
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
          amount: amount50
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
        amount: amount200
      expect =>
        @currencyMarket.withdraw
          timestamp: '987654322'
          account: 'Peter'
          currency: 'BTC'
          amount: amount50
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
        amount: amount200
      expect =>
        @currencyMarket.withdraw
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
          @currencyMarket.removeAllListeners()
          done error

      @currencyMarket.on 'withdrawal', (withdrawal) ->
        checklist.check withdrawal.id
        checklist.check withdrawal.timestamp
        checklist.check withdrawal.account
        checklist.check withdrawal.currency
        checklist.check withdrawal.amount.toString()

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
        amount: amount200
      @currencyMarket.withdraw
        id: '123456791'
        timestamp: '987654323'
        account: 'Peter'
        currency: 'BTC'
        amount: amount50
      @currencyMarket.lastTransaction.should.equal '123456791'
      account.balances['BTC'].funds.compareTo(amount150).should.equal(0)

    it 'should throw an error if the account does not exist', ->
      expect =>
        @currencyMarket.withdraw
          id: '123456790'
          timestamp: '987654322'
          account: 'Peter'
          currency: 'BTC'
          amount: amount50
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
          amount: amount50
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
        amount: amount200
      @currencyMarket.submit new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amount50        
      @currencyMarket.submit new Order
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
          '0.01'
          '5000'
          '123456794'
          '987654322'
          'Paul'
          'EUR'
          'BTC'
          '0.010101010101010101010101'
          '4950'
          '99'
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
        checklist.check order.offerPrice + ''
        checklist.check order.offerAmount + ''
        checklist.check order.bidPrice + ''
        checklist.check order.bidAmount + ''

      @currencyMarket.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      @currencyMarket.register
        id: '123456790'
        timestamp: '987654321'
        key: 'Paul'
      @currencyMarket.deposit
        id: '123456791'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: amount200
      @currencyMarket.deposit
        id: '123456792'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: amount4950
      @currencyMarket.submit new Order
        id: '123456793'
        timestamp: '987654321'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amount50
      @currencyMarket.lastTransaction.should.equal '123456793'
      @currencyMarket.books['BTC']['EUR'].highest.id.should.equal('123456793')
      @currencyMarket.submit new Order
        id: '123456794'
        timestamp: '987654322'
        account: 'Paul'
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'
        bidPrice: amount99
        bidAmount: amount50
      @currencyMarket.lastTransaction.should.equal '123456794'
      @currencyMarket.books['EUR']['BTC'].highest.id.should.equal('123456794')

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
          amount: amount2000
        @currencyMarket.deposit
          id: '123456790'
          timestamp: '987654322'
          account: 'Paul'
          currency: 'BTC'
          amount: amount400

      describe 'where the existing (right) order is an offer', ->
        beforeEach ->
          @currencyMarket.submit new Order
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
                      '1000'
                      '0.2'
                      '1'
                      '200.0'
                      '5'
                    ],
                    ordered: true,
                    (error) =>
                      @currencyMarket.removeAllListeners()
                      done error

                  @currencyMarket.on 'trade', (trade) ->
                    checklist.check trade.left.order.id
                    checklist.check trade.left.amount.toString()
                    checklist.check trade.left.price.toString()
                    checklist.check trade.right.order.id
                    checklist.check trade.right.amount.toString()
                    checklist.check trade.right.price.toString()

                  @currencyMarket.submit new Order
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    bidPrice: amountPoint2
                    bidAmount: amount1000
                  expect(@currencyMarket.books['BTC']['EUR'].entries['1']).to.not.be.ok
                  expect(@currencyMarket.books['EUR']['BTC'].entries['2']).to.not.be.ok
                  @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering more than the left order is bidding', ->
                it 'should trade the amount the left order is offering and emit a trade event', (done) ->
                  checklist = new Checklist [
                      '2'
                      '500'
                      '0.2'
                      '1'
                      '100.0'
                      '5'
                    ],
                    ordered: true,
                    (error) =>
                      @currencyMarket.removeAllListeners()
                      done error

                  @currencyMarket.on 'trade', (trade) ->
                    checklist.check trade.left.order.id
                    checklist.check trade.left.amount.toString()
                    checklist.check trade.left.price.toString()
                    checklist.check trade.right.order.id
                    checklist.check trade.right.amount.toString()
                    checklist.check trade.right.price.toString()

                  @currencyMarket.submit new Order
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    bidPrice: amountPoint2
                    bidAmount: amount500
                  @currencyMarket.books['BTC']['EUR'].entries['1'].order.offerAmount.compareTo(amount500).should.equal 0
                  expect(@currencyMarket.books['EUR']['BTC'].entries['2']).to.not.be.ok
                  @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering less than the left order is bidding', ->
                it 'should trade the amount the right order is offering and emit a trade event', (done) ->
                  checklist = new Checklist [
                      '2'
                      '1000'
                      '0.2'
                      '1'
                      '200.0'
                      '5'
                    ],
                    ordered: true,
                    (error) =>
                      @currencyMarket.removeAllListeners()
                      done error

                  @currencyMarket.on 'trade', (trade) ->
                    checklist.check trade.left.order.id
                    checklist.check trade.left.amount.toString()
                    checklist.check trade.left.price.toString()
                    checklist.check trade.right.order.id
                    checklist.check trade.right.amount.toString()
                    checklist.check trade.right.price.toString()

                  @currencyMarket.submit new Order
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    bidPrice: amountPoint2
                    bidAmount: amount1500
                  expect(@currencyMarket.books['BTC']['EUR'].entries['1']).to.not.be.ok
                  @currencyMarket.books['EUR']['BTC'].entries['2'].order.bidAmount.compareTo(amount500).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount100).should.equal 0

          describe 'and the left order is an offer', ->
            describe 'and the right order is offering exactly the amount the left order is offering', ->
                it 'should trade the amount the right order is offering and emit a trade event', (done) ->
                  checklist = new Checklist [
                      '2'
                      '1000'
                      '0.2'
                      '1'
                      '200'
                      '5'
                    ],
                    ordered: true,
                    (error) =>
                      @currencyMarket.removeAllListeners()
                      done error

                  @currencyMarket.on 'trade', (trade) ->
                    checklist.check trade.left.order.id
                    checklist.check trade.left.amount.toString()
                    checklist.check trade.left.price.toString()
                    checklist.check trade.right.order.id
                    checklist.check trade.right.amount.toString()
                    checklist.check trade.right.price.toString()

                  @currencyMarket.submit new Order
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    offerPrice: amount5
                    offerAmount: amount200
                  expect(@currencyMarket.books['BTC']['EUR'].entries['1']).to.not.be.ok
                  expect(@currencyMarket.books['EUR']['BTC'].entries['2']).to.not.be.ok
                  @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering more than the left order is offering', ->
                it 'should trade the amount the left order is offering and emit a trade event', (done) ->
                  checklist = new Checklist [
                      '2'
                      '500'
                      '0.2'
                      '1'
                      '100'
                      '5'
                    ],
                    ordered: true,
                    (error) =>
                      @currencyMarket.removeAllListeners()
                      done error

                  @currencyMarket.on 'trade', (trade) ->
                    checklist.check trade.left.order.id
                    checklist.check trade.left.amount.toString()
                    checklist.check trade.left.price.toString()
                    checklist.check trade.right.order.id
                    checklist.check trade.right.amount.toString()
                    checklist.check trade.right.price.toString()

                  @currencyMarket.submit new Order
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    offerPrice: amount5
                    offerAmount: amount100
                  @currencyMarket.books['BTC']['EUR'].entries['1'].order.offerAmount.compareTo(amount500).should.equal 0
                  expect(@currencyMarket.books['EUR']['BTC'].entries['2']).to.not.be.ok
                  @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering less than the left order is offering', ->
                it 'should trade the amount the right order is offering and emit a trade event', (done) ->
                  checklist = new Checklist [
                      '2'
                      '1000'
                      '0.2'
                      '1'
                      '200.0'
                      '5'
                    ],
                    ordered: true,
                    (error) =>
                      @currencyMarket.removeAllListeners()
                      done error

                  @currencyMarket.on 'trade', (trade) ->
                    checklist.check trade.left.order.id
                    checklist.check trade.left.amount.toString()
                    checklist.check trade.left.price.toString()
                    checklist.check trade.right.order.id
                    checklist.check trade.right.amount.toString()
                    checklist.check trade.right.price.toString()

                  @currencyMarket.submit new Order
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    offerPrice: amount5
                    offerAmount: amount300
                  expect(@currencyMarket.books['BTC']['EUR'].entries['1']).to.not.be.ok
                  @currencyMarket.books['EUR']['BTC'].entries['2'].order.offerAmount.compareTo(amount100).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                  @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount100).should.equal 0

        describe 'and the new (left) price is the better', ->
          describe 'and the left order is an offer', ->              
            describe 'and the right order is offering exactly the amount that the left order is offering multiplied by the right order price', ->
              it 'should trade the amount the right order is offering at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    '2'
                    '1000'
                    '0.2'
                    '1'
                    '200'
                    '5'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.order.id
                  checklist.check trade.left.amount.toString()
                  checklist.check trade.left.price.toString()
                  checklist.check trade.right.order.id
                  checklist.check trade.right.amount.toString()
                  checklist.check trade.right.price.toString()

                @currencyMarket.submit new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: amount4
                  offerAmount: amount200
                expect(@currencyMarket.books['BTC']['EUR'].entries['1']).to.not.be.ok
                expect(@currencyMarket.books['EUR']['BTC'].entries['2']).to.not.be.ok
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering more than the left order is offering multiplied by the right order price', ->
              it 'should trade the amount the left order is offering at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    '2'
                    '500'
                    '0.2'
                    '1'
                    '100'
                    '5'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.order.id
                  checklist.check trade.left.amount.toString()
                  checklist.check trade.left.price.toString()
                  checklist.check trade.right.order.id
                  checklist.check trade.right.amount.toString()
                  checklist.check trade.right.price.toString()

                @currencyMarket.submit new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: amount4
                  offerAmount: amount100
                @currencyMarket.books['BTC']['EUR'].entries['1'].order.offerAmount.compareTo(amount500).should.equal 0
                expect(@currencyMarket.books['EUR']['BTC'].entries['2']).to.not.be.ok
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering less than the left order is offering multiplied by the right order price', ->
              it 'should trade the amount the right order is offering at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    '2'
                    '1000'
                    '0.2'
                    '1'
                    '200.0'
                    '5'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.order.id
                  checklist.check trade.left.amount.toString()
                  checklist.check trade.left.price.toString()
                  checklist.check trade.right.order.id
                  checklist.check trade.right.amount.toString()
                  checklist.check trade.right.price.toString()

                @currencyMarket.submit new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: amount4
                  offerAmount: amount300
                expect(@currencyMarket.books['BTC']['EUR'].entries['1']).to.not.be.ok
                @currencyMarket.books['EUR']['BTC'].entries['2'].order.offerAmount.compareTo(amount100).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount100).should.equal 0
                
          describe 'and the left order is a bid', ->
            describe 'and the right order is offering exactly the amount that the left order is bidding', ->
              it 'should trade the amount the right order is offering at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    '2'
                    '1000'
                    '0.2'
                    '1'
                    '200.0'
                    '5'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.order.id
                  checklist.check trade.left.amount.toString()
                  checklist.check trade.left.price.toString()
                  checklist.check trade.right.order.id
                  checklist.check trade.right.amount.toString()
                  checklist.check trade.right.price.toString()

                @currencyMarket.submit new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: amountPoint25
                  bidAmount: amount1000
                expect(@currencyMarket.books['BTC']['EUR'].entries['1']).to.not.be.ok
                expect(@currencyMarket.books['EUR']['BTC'].entries['2']).to.not.be.ok
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is offering more than the left order is bidding', ->
              it 'should trade the amount the left order is bidding at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    '2'
                    '500'
                    '0.2'
                    '1'
                    '100.0'
                    '5'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.order.id
                  checklist.check trade.left.amount.toString()
                  checklist.check trade.left.price.toString()
                  checklist.check trade.right.order.id
                  checklist.check trade.right.amount.toString()
                  checklist.check trade.right.price.toString()

                @currencyMarket.submit new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: amountPoint25
                  bidAmount: amount500
                @currencyMarket.books['BTC']['EUR'].entries['1'].order.offerAmount.compareTo(amount500).should.equal 0
                expect(@currencyMarket.books['EUR']['BTC'].entries['2']).to.not.be.ok
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is offering less than the left order is bidding', ->
              it 'should trade the amount the right order is offering at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    '2'
                    '1000'
                    '0.2'
                    '1'
                    '200.0'
                    '5'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.order.id
                  checklist.check trade.left.amount.toString()
                  checklist.check trade.left.price.toString()
                  checklist.check trade.right.order.id
                  checklist.check trade.right.amount.toString()
                  checklist.check trade.right.price.toString()

                @currencyMarket.submit new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: amountPoint25
                  bidAmount: amount1500
                expect(@currencyMarket.books['BTC']['EUR'].entries['1']).to.not.be.ok
                @currencyMarket.books['EUR']['BTC'].entries['2'].order.bidAmount.compareTo(amount500).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount125).should.equal 0
              
      describe 'where the existing (right) order is a bid', ->
        beforeEach ->
          @currencyMarket.submit new Order
            id: '1'
            timestamp: '1'
            account: 'Peter'
            bidCurrency: 'BTC'
            offerCurrency: 'EUR'
            bidPrice: amount5     # 0.2
            bidAmount: amount200  # 1000

        describe 'and the new (left) price is better', ->
          describe 'and the left order is an offer', ->
            describe 'and the right order is bidding exactly the amount that the left order is offering', ->
              it 'should trade the amount the right order is bidding at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    '2'
                    '1000'
                    '0.2'
                    '1'
                    '200'
                    '5'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.order.id
                  checklist.check trade.left.amount.toString()
                  checklist.check trade.left.price.toString()
                  checklist.check trade.right.order.id
                  checklist.check trade.right.amount.toString()
                  checklist.check trade.right.price.toString()

                @currencyMarket.submit new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: amount4
                  offerAmount: amount200
                expect(@currencyMarket.books['BTC']['EUR'].entries['1']).to.not.be.ok
                expect(@currencyMarket.books['EUR']['BTC'].entries['2']).to.not.be.ok
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is bidding more than the left order is offering', ->
              it 'should trade the amount the left order is offering at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    '2'
                    '500'
                    '0.2'
                    '1'
                    '100'
                    '5'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.order.id
                  checklist.check trade.left.amount.toString()
                  checklist.check trade.left.price.toString()
                  checklist.check trade.right.order.id
                  checklist.check trade.right.amount.toString()
                  checklist.check trade.right.price.toString()

                @currencyMarket.submit new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: amount4
                  offerAmount: amount100
                @currencyMarket.books['BTC']['EUR'].entries['1'].order.bidAmount.compareTo(amount100).should.equal 0
                expect(@currencyMarket.books['EUR']['BTC'].entries['2']).to.not.be.ok
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is bidding less than the left order is offering', ->
              it 'should trade the amount the right order is bidding at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    '2'
                    '1000'
                    '0.2'
                    '1'
                    '200'
                    '5'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.order.id
                  checklist.check trade.left.amount.toString()
                  checklist.check trade.left.price.toString()
                  checklist.check trade.right.order.id
                  checklist.check trade.right.amount.toString()
                  checklist.check trade.right.price.toString()

                @currencyMarket.submit new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: amount4
                  offerAmount: amount300
                expect(@currencyMarket.books['BTC']['EUR'].entries['1']).to.not.be.ok
                @currencyMarket.books['EUR']['BTC'].entries['2'].order.offerAmount.compareTo(amount100).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount100).should.equal 0
                
          describe 'and the left order is a bid', ->
            describe 'and the right order is bidding exactly the amount that the left order is bidding multiplied by the right order price', ->
              it 'should trade the amount the right order is bidding at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    '2'
                    '1000'
                    '0.2'
                    '1'
                    '200.0'
                    '5'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.order.id
                  checklist.check trade.left.amount.toString()
                  checklist.check trade.left.price.toString()
                  checklist.check trade.right.order.id
                  checklist.check trade.right.amount.toString()
                  checklist.check trade.right.price.toString()

                @currencyMarket.submit new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: amountPoint25
                  bidAmount: amount1000
                expect(@currencyMarket.books['BTC']['EUR'].entries['1']).to.not.be.ok
                expect(@currencyMarket.books['EUR']['BTC'].entries['2']).to.not.be.ok
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is bidding more than the left order is bidding multiplied by the right order price', ->
              it 'should trade the amount the left order is bidding at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    '2'
                    '500'
                    '0.2'
                    '1'
                    '100.0'
                    '5'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.order.id
                  checklist.check trade.left.amount.toString()
                  checklist.check trade.left.price.toString()
                  checklist.check trade.right.order.id
                  checklist.check trade.right.amount.toString()
                  checklist.check trade.right.price.toString()

                @currencyMarket.submit new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: amountPoint25
                  bidAmount: amount500
                @currencyMarket.books['BTC']['EUR'].entries['1'].order.bidAmount.compareTo(amount100).should.equal 0
                expect(@currencyMarket.books['EUR']['BTC'].entries['2']).to.not.be.ok
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is bidding less than the left order is bidding multiplied by the right order price', ->
              it 'should trade the amount the right order is bidding at the right order price and emit a trade event', (done) ->
                checklist = new Checklist [
                    '2'
                    '1000'
                    '0.2'
                    '1'
                    '200'
                    '5'
                  ],
                  ordered: true,
                  (error) =>
                    @currencyMarket.removeAllListeners()
                    done error

                @currencyMarket.on 'trade', (trade) ->
                  checklist.check trade.left.order.id
                  checklist.check trade.left.amount.toString()
                  checklist.check trade.left.price.toString()
                  checklist.check trade.right.order.id
                  checklist.check trade.right.amount.toString()
                  checklist.check trade.right.price.toString()

                @currencyMarket.submit new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: amountPoint25
                  bidAmount: amount1500
                expect(@currencyMarket.books['BTC']['EUR'].entries['1']).to.not.be.ok
                @currencyMarket.books['EUR']['BTC'].entries['2'].order.bidAmount.compareTo(amount500).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount125).should.equal 0
    
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
          amount: amount2000
        @currencyMarket.deposit
          id: '123456790'
          timestamp: '987654322'
          account: 'Paul'
          currency: 'BTC'
          amount: amount1000
        @currencyMarket.submit new Order
          id: '1'
          timestamp: '1'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amountPoint2
          offerAmount: amount500
        @currencyMarket.submit new Order
          id: '2'
          timestamp: '2'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amountPoint25
          offerAmount: amount500
        @currencyMarket.submit new Order
          id: '3'
          timestamp: '3'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amountPoint5
          offerAmount: amount500
        @currencyMarket.submit new Order
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
              '500'
              '0.2'
              '1'
              '100.0'
              '5'
              '5'
              '500'
              '0.25'
              '2'
              '125.00'
              '4'
              '5'
              '250.0'
              '0.5'
              '3'
              '125.00'
              '2'
            ],
            ordered: true,
            (error) =>
              @currencyMarket.removeAllListeners()
              done error

          @currencyMarket.on 'trade', (trade) ->
            checklist.check trade.left.order.id
            checklist.check trade.left.amount.toString()
            checklist.check trade.left.price.toString()
            checklist.check trade.right.order.id
            checklist.check trade.right.amount.toString()
            checklist.check trade.right.price.toString()

          @currencyMarket.submit new Order
            id: '5'
            timestamp: '5'
            account: 'Paul'
            bidCurrency: 'EUR'
            offerCurrency: 'BTC'
            bidPrice: amountPoint5
            bidAmount: amount1250
          expect(@currencyMarket.books['BTC']['EUR'].entries['1']).to.not.be.ok
          expect(@currencyMarket.books['BTC']['EUR'].entries['2']).to.not.be.ok
          @currencyMarket.books['BTC']['EUR'].entries['3'].order.offerAmount.compareTo(amount250).should.equal 0
          @currencyMarket.books['BTC']['EUR'].entries[amount4].order.offerAmount.compareTo(amount500).should.equal 0
          expect(@currencyMarket.books['EUR']['BTC'].entries[amount5]).to.not.be.ok
          @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(amount750).should.equal 0
          @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount750).should.equal 0
          @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(amount350).should.equal 0
          @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(amount1250).should.equal 0
          @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(amount650).should.equal 0
          @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

      describe 'and the last order cannot be completely satisfied', ->    
        it 'should correctly execute as many orders as it can and emit trade events', (done) ->
          checklist = new Checklist [
              '5'
              '500'
              '0.2'
              '1'
              '100.0'
              '5'
              '5'
              '500'
              '0.25'
              '2'
              '125.00'
              '4'
              '5'
              '500'
              '0.5'
              '3'
              '250.0'
              '2'
            ],
            ordered: true,
            (error) =>
              @currencyMarket.removeAllListeners()
              done error

          @currencyMarket.on 'trade', (trade) ->
            checklist.check trade.left.order.id
            checklist.check trade.left.amount.toString()
            checklist.check trade.left.price.toString()
            checklist.check trade.right.order.id
            checklist.check trade.right.amount.toString()
            checklist.check trade.right.price.toString()

          @currencyMarket.submit new Order
            id: '5'
            timestamp: '5'
            account: 'Paul'
            bidCurrency: 'EUR'
            offerCurrency: 'BTC'
            bidPrice: amountPoint5
            bidAmount: amount1750
          expect(@currencyMarket.books['BTC']['EUR'].entries['1']).to.not.be.ok
          expect(@currencyMarket.books['BTC']['EUR'].entries['2']).to.not.be.ok
          expect(@currencyMarket.books['BTC']['EUR'].entries['3']).to.not.be.ok
          @currencyMarket.books['BTC']['EUR'].entries[amount4].order.offerAmount.compareTo(amount500).should.equal 0
          @currencyMarket.books['EUR']['BTC'].entries[amount5].order.bidAmount.compareTo(amount250).should.equal 0
          @currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(amount500).should.equal 0
          @currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
          @currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(amount475).should.equal 0
          @currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(amount1500).should.equal 0
          @currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(amount525).should.equal 0
          @currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount125).should.equal 0
              
    it 'should throw an error if the account does not exist', ->
      expect =>
        @currencyMarket.submit new Order
          id: '123456789'
          timestamp: '987654321'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amount100
          offerAmount: amount50        
      .to.throw('Account does not exist')

    it 'should throw an error if the offer currency is not supported', ->
      @currencyMarket.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      expect =>
        @currencyMarket.submit new Order
          id: '123456789'
          timestamp: '987654321'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'CAD'
          offerPrice: amount100
          offerAmount: amount50        
      .to.throw('Offer currency is not supported')

    it 'should throw an error if the bid currency is not supported', ->
      @currencyMarket.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      expect =>
        @currencyMarket.submit new Order
          id: '123456789'
          timestamp: '987654321'
          account: 'Peter'
          bidCurrency: 'CAD'
          offerCurrency: 'EUR'
          offerPrice: amount100
          offerAmount: amount50        
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
        amount: amount200
      @currencyMarket.submit new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amount50        
      @currencyMarket.submit new Order
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        bidCurrency: 'USD'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amount100        
      account.balances['EUR'].lockedFunds.compareTo(amount150).should.equal 0
      @currencyMarket.cancel
        id: '123456791'
        timestamp: '987654350'
        orderId: '123456789'
        orderTimestamp: '987654321'
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
          'Peter'
          'BTC'
          'EUR'
          '100'
          '50'
          'undefined'
          'undefined'
          '123456796'
          '987654350'
          'Paul'
          'EUR'
          'BTC'
          'undefined'
          'undefined'
          '99'
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
        checklist.check order.offerPrice + ''
        checklist.check order.offerAmount + ''
        checklist.check order.bidPrice + ''
        checklist.check order.bidAmount + ''

      @currencyMarket.register
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
      @currencyMarket.register
        id: '123456790'
        timestamp: '987654321'
        key: 'Paul'
      @currencyMarket.deposit
        id: '123456791'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'EUR'
        amount: amount200
      @currencyMarket.deposit
        id: '123456792'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: amount4950
      @currencyMarket.submit new Order
        id: '123456793'
        timestamp: '987654321'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amount50
      @currencyMarket.submit new Order
        id: '123456794'
        timestamp: '987654322'
        account: 'Paul'
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'
        bidPrice: amount99
        bidAmount: amount50
      @currencyMarket.cancel
        id: '123456795'
        timestamp: '987654349'
        orderId: '123456793'
        orderTimestamp: '987654321'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amount50
      @currencyMarket.lastTransaction.should.equal '123456795'
      expect(@currencyMarket.books['BTC']['EUR'].entries['123456793']).to.not.be.ok
      expect(@currencyMarket.books['BTC']['EUR'].highest).to.not.be.ok
      @currencyMarket.cancel
        id: '123456796'
        timestamp: '987654350'
        orderId: '123456794'
        orderTimestamp: '987654322'
        account: 'Paul'
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'
        bidPrice: amount99
        bidAmount: amount50
      @currencyMarket.lastTransaction.should.equal '123456796'
      expect(@currencyMarket.books['BTC']['EUR'].entries['123456794']).to.not.be.ok
      expect(@currencyMarket.books['EUR']['BTC'].highest).to.not.be.ok

    it 'should throw an error if the order cannot be found', ->
      expect =>
        @currencyMarket.cancel
          id: '123456795'
          timestamp: '987654349'
          orderId: '123456793'
          orderTimestamp: '987654321'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amount100
          offerAmount: amount50        
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
        amount: amount200
      @currencyMarket.submit new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amount50        
      expect =>
        @currencyMarket.cancel
          id: '123456795'
          timestamp: '987654349'
          orderId: '123456789'
          orderTimestamp: '987654321'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amount100
          offerAmount: amount20        
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
        amount: amount2000
      @currencyMarket1.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: amount1000
      @currencyMarket1.submit new Order
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint2
        offerAmount: amount500
      @currencyMarket1.submit new Order
        id: '2'
        timestamp: '2'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint25
        offerAmount: amount500
      @currencyMarket1.submit new Order
        id: '3'
        timestamp: '3'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint5
        offerAmount: amount500
      @currencyMarket1.submit new Order
        id: '4'
        timestamp: '4'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount1
        offerAmount: amount500

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
        amount: amount2000
      currencyMarket2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: amount1000
      currencyMarket2.submit new Order
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint2
        offerAmount: amount500
      currencyMarket2.submit new Order
        id: '2'
        timestamp: '2'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint25
        offerAmount: amount500
      currencyMarket2.submit new Order
        id: '3'
        timestamp: '3'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint5
        offerAmount: amount500
      currencyMarket2.submit new Order
        id: '4'
        timestamp: '4'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount1
        offerAmount: amount500
      currencyMarket2.equals(@currencyMarket1).should.be.true

    it 'should return false if the last transaction is different', ->
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
        amount: amount2000
      currencyMarket2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: amount1000
      currencyMarket2.submit new Order
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint2
        offerAmount: amount500
      currencyMarket2.submit new Order
        id: '2'
        timestamp: '2'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint25
        offerAmount: amount500
      currencyMarket2.submit new Order
        id: '3'
        timestamp: '3'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint5
        offerAmount: amount500
      currencyMarket2.submit new Order
        id: '4'
        timestamp: '4'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount1
        offerAmount: amount500
      currencyMarket2.lastTransaction = amount5
      currencyMarket2.equals(@currencyMarket1).should.be.false
      delete currencyMarket2.lastTransaction
      currencyMarket2.equals(@currencyMarket1).should.be.false

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
        amount: amount2000
      currencyMarket2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: amount1000
      currencyMarket2.submit new Order
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint2
        offerAmount: amount500
      currencyMarket2.submit new Order
        id: '2'
        timestamp: '2'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint25
        offerAmount: amount500
      currencyMarket2.submit new Order
        id: '3'
        timestamp: '3'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint5
        offerAmount: amount500
      currencyMarket2.submit new Order
        id: '4'
        timestamp: '4'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount1
        offerAmount: amount500
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
        amount: amount2500 # different EUR balance
      currencyMarket2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: amount1000
      currencyMarket2.submit new Order
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint2
        offerAmount: amount500
      currencyMarket2.submit new Order
        id: '2'
        timestamp: '2'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint25
        offerAmount: amount500
      currencyMarket2.submit new Order
        id: '3'
        timestamp: '3'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint5
        offerAmount: amount500
      currencyMarket2.submit new Order
        id: '4'
        timestamp: '4'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount1
        offerAmount: amount500
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
        amount: amount2000
      currencyMarket2.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: amount1000
      currencyMarket2.submit new Order
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint2
        offerAmount: amount500
      currencyMarket2.submit new Order
        id: '2'
        timestamp: '2'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint25
        offerAmount: amount500
      currencyMarket2.submit new Order
        id: '3'
        timestamp: '3'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint5
        offerAmount: amount500
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
        amount: amount2000
      @currencyMarket.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Paul'
        currency: 'BTC'
        amount: amount1000
      @currencyMarket.submit new Order
        id: '1'
        timestamp: '1'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint2
        offerAmount: amount500
      @currencyMarket.submit new Order
        id: '2'
        timestamp: '2'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint25
        offerAmount: amount500
      @currencyMarket.submit new Order
        id: '3'
        timestamp: '3'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountPoint5
        offerAmount: amount500
      @currencyMarket.submit new Order
        id: '4'
        timestamp: '4'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount1
        offerAmount: amount500
      state = @currencyMarket.export()
      json = JSON.stringify state
      newCurrencyMarket = new CurrencyMarket
        state: JSON.parse(json)
      newCurrencyMarket.equals(@currencyMarket).should.be.true
