chai = require 'chai'
chai.should()
expect = chai.expect
assert = chai.assert
sinon = require 'sinon'
sinonChai = require 'sinon-chai'
chai.use sinonChai

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

  it 'should instantiate with collections of accounts and books matching the supported currencies', ->
    Object.keys(@market.accounts).should.be.empty
    @market.books['EUR']['BTC'].should.be.an.instanceOf(Book)
    @market.books['EUR']['USD'].should.be.an.instanceOf(Book)
    @market.books['USD']['EUR'].should.be.an.instanceOf(Book)
    @market.books['BTC']['EUR'].should.be.an.instanceOf(Book)
    @market.books['USD']['EUR'].should.be.an.instanceOf(Book)
    @market.books['EUR']['USD'].should.be.an.instanceOf(Book)

  describe '#register', ->
    it 'should submit an account to the market, record the last transaction ID and emit an account event', ->
      accountSpy = sinon.spy()
      @market.on 'account', accountSpy

      account = newAccount '123456789'
      @market.register account
      @market.lastTransaction.should.equal '123456789'
      account = @market.accounts['123456789']
      account.should.equal account
      accountSpy.should.have.been.calledOnce
      accountSpy.firstCall.args[0].should.equal account

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

    it 'should credit the correct account and currency, record the last transaction ID and emit a deposit event', ->
      depositSpy = sinon.spy()
      @market.on 'deposit', depositSpy

      @market.register newAccount 'Peter'
      account = @market.accounts['Peter']
      account.balances['EUR'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.balances['USD'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.balances['BTC'].funds.compareTo(Amount.ZERO).should.equal(0)
      deposit = 
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'BTC'
        amount: amount50
      @market.deposit deposit
      @market.lastTransaction.should.equal '123456790'
      account.balances['EUR'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.balances['USD'].funds.compareTo(Amount.ZERO).should.equal(0)
      account.balances['BTC'].funds.compareTo(amount50).should.equal(0)
      depositSpy.should.have.been.calledOnce
      depositSpy.firstCall.args[0].should.equal deposit

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

    it 'should debit the correct account and currency, record the last transaction ID and emit a withdrawal event', ->
      withdrawalSpy = sinon.spy()
      @market.on 'withdrawal', withdrawalSpy

      @market.register newAccount 'Peter'
      account = @market.accounts['Peter']
      @market.deposit
        id: '123456790'
        timestamp: '987654322'
        account: 'Peter'
        currency: 'BTC'
        amount: amount200
      withdrawal = 
        id: '123456791'
        timestamp: '987654323'
        account: 'Peter'
        currency: 'BTC'
        amount: amount50
      @market.withdraw withdrawal
      @market.lastTransaction.should.equal '123456791'
      account.balances['BTC'].funds.compareTo(amount150).should.equal(0)
      withdrawalSpy.should.have.been.calledOnce
      withdrawalSpy.firstCall.args[0].should.equal withdrawal

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

    it 'should record an order, submit it to the correct book, record the last transaction ID and emit an order event', ->
      orderSpy = sinon.spy()
      @market.on 'order', orderSpy

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
      order1 = new Order
        id: '123456793'
        timestamp: '987654321'
        account: 'Peter'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amount50
      @market.submit order1
      @market.lastTransaction.should.equal '123456793'
      @market.books['BTC']['EUR'].highest.id.should.equal('123456793')
      order2 = new Order
        id: '123456794'
        timestamp: '987654322'
        account: 'Paul'
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'
        bidPrice: amount99
        bidAmount: amount50
      @market.submit order2
      @market.lastTransaction.should.equal '123456794'
      @market.books['EUR']['BTC'].highest.id.should.equal('123456794')

      orderSpy.should.have.been.calledTwice
      orderSpy.firstCall.args[0].should.equal order1
      orderSpy.secondCall.args[0].should.equal order2

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
          @rightOrder = new Order
            id: '1'
            timestamp: '1'
            account: 'Peter'
            bidCurrency: 'BTC'
            offerCurrency: 'EUR'
            offerPrice: amountPoint2   # 5
            offerAmount: amount1000 # 200
          @market.submit @rightOrder

        describe 'and the new (left) price is same', ->
          describe 'and the left order is a bid', ->
            describe 'and the right order is offering exactly the amount the left order is bidding', ->
                it 'should trade the amount the right order is offering and emit a trade event', ->
                  tradeSpy = sinon.spy()
                  @market.on 'trade', tradeSpy

                  leftOrder = new Order
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    bidPrice: amountPoint2
                    bidAmount: amount1000
                  @market.submit leftOrder

                  tradeSpy.should.have.been.calledOnce
                  tradeSpy.firstCall.args[0].bid.should.equal leftOrder
                  tradeSpy.firstCall.args[0].offer.should.equal @rightOrder
                  tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
                  tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal 0
                  expect(@market.accounts['Peter'].orders['1']).to.not.be.ok
                  expect(@market.accounts['Paul'].orders['2']).to.not.be.ok
                  @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                  @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering more than the left order is bidding', ->
                it 'should trade the amount the left order is offering and emit a trade event', ->
                  tradeSpy = sinon.spy()
                  @market.on 'trade', tradeSpy

                  leftOrder = new Order
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    bidPrice: amountPoint2
                    bidAmount: amount500
                  @market.submit leftOrder

                  tradeSpy.should.have.been.calledOnce
                  tradeSpy.firstCall.args[0].bid.should.equal leftOrder
                  tradeSpy.firstCall.args[0].offer.should.equal @rightOrder
                  tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
                  tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal 0
                  @market.accounts['Peter'].orders['1'].offerAmount.compareTo(amount500).should.equal 0
                  expect(@market.accounts['Paul'].orders['2']).to.not.be.ok
                  @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
                  @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal 0
                  @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering less than the left order is bidding', ->
                it 'should trade the amount the right order is offering and emit a trade event', ->
                  tradeSpy = sinon.spy()
                  @market.on 'trade', tradeSpy

                  leftOrder = new Order
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    bidPrice: amountPoint2
                    bidAmount: amount1500
                  @market.submit leftOrder

                  tradeSpy.should.have.been.calledOnce
                  tradeSpy.firstCall.args[0].bid.should.equal leftOrder
                  tradeSpy.firstCall.args[0].offer.should.equal @rightOrder
                  tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
                  tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal 0
                  expect(@market.accounts['Peter'].orders['1']).to.not.be.ok
                  @market.accounts['Paul'].orders['2'].bidAmount.compareTo(amount500).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                  @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount100).should.equal 0

          describe 'and the left order is an offer', ->
            describe 'and the right order is offering exactly the amount the left order is offering', ->
                it 'should trade the amount the right order is offering and emit a trade event', ->
                  tradeSpy = sinon.spy()
                  @market.on 'trade', tradeSpy

                  leftOrder = new Order
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    offerPrice: amount5
                    offerAmount: amount200
                  @market.submit leftOrder

                  tradeSpy.should.have.been.calledOnce
                  tradeSpy.firstCall.args[0].bid.should.equal leftOrder
                  tradeSpy.firstCall.args[0].offer.should.equal @rightOrder
                  tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
                  tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal 0
                  expect(@market.accounts['Peter'].orders['1']).to.not.be.ok
                  expect(@market.accounts['Paul'].orders['2']).to.not.be.ok
                  @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                  @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering more than the left order is offering', ->
                it 'should trade the amount the left order is offering and emit a trade event', ->
                  tradeSpy = sinon.spy()
                  @market.on 'trade', tradeSpy

                  leftOrder = new Order
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    offerPrice: amount5
                    offerAmount: amount100
                  @market.submit leftOrder

                  tradeSpy.should.have.been.calledOnce
                  tradeSpy.firstCall.args[0].bid.should.equal leftOrder
                  tradeSpy.firstCall.args[0].offer.should.equal @rightOrder
                  tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
                  tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal 0
                  @market.accounts['Peter'].orders['1'].offerAmount.compareTo(amount500).should.equal 0
                  expect(@market.accounts['Paul'].orders['2']).to.not.be.ok
                  @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
                  @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal 0
                  @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering less than the left order is offering', ->
                it 'should trade the amount the right order is offering and emit a trade event', ->
                  tradeSpy = sinon.spy()
                  @market.on 'trade', tradeSpy

                  leftOrder = new Order
                    id: '2'
                    timestamp: '2'
                    account: 'Paul'
                    bidCurrency: 'EUR'
                    offerCurrency: 'BTC'
                    offerPrice: amount5
                    offerAmount: amount300
                  @market.submit leftOrder

                  tradeSpy.should.have.been.calledOnce
                  tradeSpy.firstCall.args[0].bid.should.equal leftOrder
                  tradeSpy.firstCall.args[0].offer.should.equal @rightOrder
                  tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
                  tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal 0
                  expect(@market.accounts['Peter'].orders['1']).to.not.be.ok
                  @market.accounts['Paul'].orders['2'].offerAmount.compareTo(amount100).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                  @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                  @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount100).should.equal 0

        describe 'and the new (left) price is the better', ->
          describe 'and the left order is an offer', ->              
            describe 'and the right order is offering exactly the amount that the left order is offering multiplied by the right order price', ->
              it 'should trade the amount the right order is offering at the right order price and emit a trade event', ->
                tradeSpy = sinon.spy()
                @market.on 'trade', tradeSpy

                leftOrder = new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: amount4
                  offerAmount: amount200
                @market.submit leftOrder

                tradeSpy.should.have.been.calledOnce
                tradeSpy.firstCall.args[0].bid.should.equal leftOrder
                tradeSpy.firstCall.args[0].offer.should.equal @rightOrder
                tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
                tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal 0
                expect(@market.accounts['Peter'].orders['1']).to.not.be.ok
                expect(@market.accounts['Paul'].orders['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering more than the left order is offering multiplied by the right order price', ->
              it 'should trade the amount the left order is offering at the right order price and emit a trade event', ->
                tradeSpy = sinon.spy()
                @market.on 'trade', tradeSpy

                leftOrder = new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: amount4
                  offerAmount: amount100
                @market.submit leftOrder

                tradeSpy.should.have.been.calledOnce
                tradeSpy.firstCall.args[0].bid.should.equal leftOrder
                tradeSpy.firstCall.args[0].offer.should.equal @rightOrder
                tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
                tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal 0
                @market.accounts['Peter'].orders['1'].offerAmount.compareTo(amount500).should.equal 0
                expect(@market.accounts['Paul'].orders['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

            describe 'and the right order is offering less than the left order is offering multiplied by the right order price', ->
              it 'should trade the amount the right order is offering at the right order price and emit a trade event', ->
                tradeSpy = sinon.spy()
                @market.on 'trade', tradeSpy

                leftOrder = new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: amount4
                  offerAmount: amount300
                @market.submit leftOrder

                tradeSpy.should.have.been.calledOnce
                tradeSpy.firstCall.args[0].bid.should.equal leftOrder
                tradeSpy.firstCall.args[0].offer.should.equal @rightOrder
                tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
                tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal 0
                expect(@market.accounts['Peter'].orders['1']).to.not.be.ok
                @market.accounts['Paul'].orders['2'].offerAmount.compareTo(amount100).should.equal 0
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount100).should.equal 0

          describe 'and the left order is a bid', ->
            describe 'and the right order is offering exactly the amount that the left order is bidding', ->
              it 'should trade the amount the right order is offering at the right order price and emit a trade event', ->
                tradeSpy = sinon.spy()
                @market.on 'trade', tradeSpy

                leftOrder = new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: amountPoint25
                  bidAmount: amount1000
                @market.submit leftOrder

                tradeSpy.should.have.been.calledOnce
                tradeSpy.firstCall.args[0].bid.should.equal leftOrder
                tradeSpy.firstCall.args[0].offer.should.equal @rightOrder
                tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
                tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal 0
                expect(@market.accounts['Peter'].orders['1']).to.not.be.ok
                expect(@market.accounts['Paul'].orders['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is offering more than the left order is bidding', ->
              it 'should trade the amount the left order is bidding at the right order price and emit a trade event', ->
                tradeSpy = sinon.spy()
                @market.on 'trade', tradeSpy

                leftOrder = new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: amountPoint25
                  bidAmount: amount500
                @market.submit leftOrder

                tradeSpy.should.have.been.calledOnce
                tradeSpy.firstCall.args[0].bid.should.equal leftOrder
                tradeSpy.firstCall.args[0].offer.should.equal @rightOrder
                tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
                tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal 0
                @market.accounts['Peter'].orders['1'].offerAmount.compareTo(amount500).should.equal 0
                expect(@market.accounts['Paul'].orders['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is offering less than the left order is bidding', ->
              it 'should trade the amount the right order is offering at the right order price and emit a trade event', ->
                tradeSpy = sinon.spy()
                @market.on 'trade', tradeSpy

                leftOrder = new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: amountPoint25
                  bidAmount: amount1500
                @market.submit leftOrder

                tradeSpy.should.have.been.calledOnce
                tradeSpy.firstCall.args[0].bid.should.equal leftOrder
                tradeSpy.firstCall.args[0].offer.should.equal @rightOrder
                tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
                tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal 0
                expect(@market.accounts['Peter'].orders['1']).to.not.be.ok
                @market.accounts['Paul'].orders['2'].bidAmount.compareTo(amount500).should.equal 0
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount125).should.equal 0
              
      describe 'where the existing (right) order is a bid', ->
        beforeEach ->
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
              it 'should trade the amount the right order is bidding at the right order price and emit a trade event', ->
                tradeSpy = sinon.spy()
                @market.on 'trade', tradeSpy

                leftOrder = new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: amount4
                  offerAmount: amount200
                @market.submit leftOrder

                tradeSpy.should.have.been.calledOnce
                tradeSpy.firstCall.args[0].bid.should.equal @rightOrder
                tradeSpy.firstCall.args[0].offer.should.equal leftOrder
                tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal 0
                tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal 0
                expect(@market.accounts['Peter'].orders['1']).to.not.be.ok
                expect(@market.accounts['Paul'].orders['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is bidding more than the left order is offering', ->
              it 'should trade the amount the left order is offering at the right order price and emit a trade event', ->
                tradeSpy = sinon.spy()
                @market.on 'trade', tradeSpy

                leftOrder = new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: amount4
                  offerAmount: amount100
                @market.submit leftOrder

                tradeSpy.should.have.been.calledOnce
                tradeSpy.firstCall.args[0].bid.should.equal @rightOrder
                tradeSpy.firstCall.args[0].offer.should.equal leftOrder
                tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal 0
                tradeSpy.firstCall.args[0].amount.compareTo(amount100).should.equal 0
                @market.accounts['Peter'].orders['1'].bidAmount.compareTo(amount100).should.equal 0
                expect(@market.accounts['Paul'].orders['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is bidding less than the left order is offering', ->
              it 'should trade the amount the right order is bidding at the right order price and emit a trade event', ->
                tradeSpy = sinon.spy()
                @market.on 'trade', tradeSpy

                leftOrder = new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: amount4
                  offerAmount: amount300
                @market.submit leftOrder

                tradeSpy.should.have.been.calledOnce
                tradeSpy.firstCall.args[0].bid.should.equal @rightOrder
                tradeSpy.firstCall.args[0].offer.should.equal leftOrder
                tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal 0
                tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal 0
                expect(@market.accounts['Peter'].orders['1']).to.not.be.ok
                @market.accounts['Paul'].orders['2'].offerAmount.compareTo(amount100).should.equal 0
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount100).should.equal 0

          describe 'and the left order is a bid', ->
            describe 'and the right order is bidding exactly the amount that the left order is bidding multiplied by the right order price', ->
              it 'should trade the amount the right order is bidding at the right order price and emit a trade event', ->
                tradeSpy = sinon.spy()
                @market.on 'trade', tradeSpy

                leftOrder = new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: amountPoint25
                  bidAmount: amount1000
                @market.submit leftOrder

                tradeSpy.should.have.been.calledOnce
                tradeSpy.firstCall.args[0].bid.should.equal @rightOrder
                tradeSpy.firstCall.args[0].offer.should.equal leftOrder
                tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal 0
                tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal 0
                expect(@market.accounts['Peter'].orders['1']).to.not.be.ok
                expect(@market.accounts['Paul'].orders['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is bidding more than the left order is bidding multiplied by the right order price', ->
              it 'should trade the amount the left order is bidding at the right order price and emit a trade event', ->
                tradeSpy = sinon.spy()
                @market.on 'trade', tradeSpy

                leftOrder = new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: amountPoint25
                  bidAmount: amount500
                @market.submit leftOrder

                tradeSpy.should.have.been.calledOnce
                tradeSpy.firstCall.args[0].bid.should.equal @rightOrder
                tradeSpy.firstCall.args[0].offer.should.equal leftOrder
                tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal 0
                tradeSpy.firstCall.args[0].amount.compareTo(amount100).should.equal 0
                @market.accounts['Peter'].orders['1'].bidAmount.compareTo(amount100).should.equal 0
                expect(@market.accounts['Paul'].orders['2']).to.not.be.ok
                @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal 0
                @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
                @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal 0
                @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal 0
                @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal 0
                @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
                
            describe 'and the right order is bidding less than the left order is bidding multiplied by the right order price', ->
              it 'should trade the amount the right order is bidding at the right order price and emit a trade event', ->
                tradeSpy = sinon.spy()
                @market.on 'trade', tradeSpy

                leftOrder = new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: amountPoint25
                  bidAmount: amount1500
                @market.submit leftOrder

                tradeSpy.should.have.been.calledOnce
                tradeSpy.firstCall.args[0].bid.should.equal @rightOrder
                tradeSpy.firstCall.args[0].offer.should.equal leftOrder
                tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal 0
                tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal 0
                expect(@market.accounts['Peter'].orders['1']).to.not.be.ok
                @market.accounts['Paul'].orders['2'].bidAmount.compareTo(amount500).should.equal 0
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
        @rightOrder1 = new Order
          id: '1'
          timestamp: '1'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amountPoint2
          offerAmount: amount500
        @market.submit @rightOrder1
        @rightOrder2 = new Order
          id: '2'
          timestamp: '2'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amountPoint25
          offerAmount: amount500
        @market.submit @rightOrder2
        @rightOrder3 = new Order
          id: '3'
          timestamp: '3'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amountPoint5
          offerAmount: amount500
        @market.submit @rightOrder3
        @rightOrder4 = new Order
          id: '4'
          timestamp: '4'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amount1
          offerAmount: amount500
        @market.submit @rightOrder4

      describe 'and the last order can be completely satisfied', ->
        it 'should correctly execute as many orders as it can and emit trade events', ->
          tradeSpy = sinon.spy()
          @market.on 'trade', tradeSpy

          leftOrder = new Order
            id: '5'
            timestamp: '5'
            account: 'Paul'
            bidCurrency: 'EUR'
            offerCurrency: 'BTC'
            bidPrice: amountPoint5
            bidAmount: amount1250
          @market.submit leftOrder

          tradeSpy.should.have.been.calledThrice
          tradeSpy.firstCall.args[0].bid.should.equal leftOrder
          tradeSpy.firstCall.args[0].offer.should.equal @rightOrder1
          tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
          tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal 0
          tradeSpy.secondCall.args[0].bid.should.equal leftOrder
          tradeSpy.secondCall.args[0].offer.should.equal @rightOrder2
          tradeSpy.secondCall.args[0].price.compareTo(amountPoint25).should.equal 0
          tradeSpy.secondCall.args[0].amount.compareTo(amount500).should.equal 0
          tradeSpy.thirdCall.args[0].bid.should.equal leftOrder
          tradeSpy.thirdCall.args[0].offer.should.equal @rightOrder3
          tradeSpy.thirdCall.args[0].price.compareTo(amountPoint5).should.equal 0
          tradeSpy.thirdCall.args[0].amount.compareTo(amount250).should.equal 0
          expect(@market.accounts['Peter'].orders['1']).to.not.be.ok
          expect(@market.accounts['Peter'].orders['2']).to.not.be.ok
          @market.accounts['Peter'].orders['3'].offerAmount.compareTo(amount250).should.equal 0
          @market.accounts['Peter'].orders[amount4].offerAmount.compareTo(amount500).should.equal 0
          expect(@market.accounts['Paul'].orders[amount5]).to.not.be.ok
          @market.accounts['Peter'].balances['EUR'].funds.compareTo(amount750).should.equal 0
          @market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount750).should.equal 0
          @market.accounts['Peter'].balances['BTC'].funds.compareTo(amount350).should.equal 0
          @market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1250).should.equal 0
          @market.accounts['Paul'].balances['BTC'].funds.compareTo(amount650).should.equal 0
          @market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

      describe 'and the last order cannot be completely satisfied', ->    
        it 'should correctly execute as many orders as it can and emit trade events', ->
          tradeSpy = sinon.spy()
          @market.on 'trade', tradeSpy

          leftOrder = new Order
            id: '5'
            timestamp: '5'
            account: 'Paul'
            bidCurrency: 'EUR'
            offerCurrency: 'BTC'
            bidPrice: amountPoint5
            bidAmount: amount1750
          @market.submit leftOrder

          tradeSpy.should.have.been.calledThrice
          tradeSpy.firstCall.args[0].bid.should.equal leftOrder
          tradeSpy.firstCall.args[0].offer.should.equal @rightOrder1
          tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
          tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal 0
          tradeSpy.secondCall.args[0].bid.should.equal leftOrder
          tradeSpy.secondCall.args[0].offer.should.equal @rightOrder2
          tradeSpy.secondCall.args[0].price.compareTo(amountPoint25).should.equal 0
          tradeSpy.secondCall.args[0].amount.compareTo(amount500).should.equal 0
          tradeSpy.thirdCall.args[0].bid.should.equal leftOrder
          tradeSpy.thirdCall.args[0].offer.should.equal @rightOrder3
          tradeSpy.thirdCall.args[0].price.compareTo(amountPoint5).should.equal 0
          tradeSpy.thirdCall.args[0].amount.compareTo(amount500).should.equal 0
          expect(@market.accounts['Peter'].orders['1']).to.not.be.ok
          expect(@market.accounts['Peter'].orders['2']).to.not.be.ok
          expect(@market.accounts['Peter'].orders['3']).to.not.be.ok
          @market.accounts['Peter'].orders[amount4].offerAmount.compareTo(amount500).should.equal 0
          @market.accounts['Paul'].orders[amount5].bidAmount.compareTo(amount250).should.equal 0
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

    it 'should execute BID/OFFER orders correctly and not throw a withdraw error when ? (captured from a failing random performance test)', ->
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

    it 'should execute BID/OFFER orders correctly and not throw an unlock funds error when ? (captured from a failing random performance test)', ->
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

    it 'should execute BID/BID orders correctly and not throw an unlock funds error when ? (captured from a failing random performance test)', ->
      @market.register newAccount '100000'
      @market.register newAccount '100001'
      @market.register newAccount '100003'
      @market.deposit
        id: '101000'
        timestamp: '1366758222'
        account: '100000'
        currency: 'EUR'
        amount: new Amount '7540'
      @market.submit new Order
        id: '101002'
        timestamp: '1366758222'
        account: '100000'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: new Amount '116'
        bidAmount: new Amount '65'
      @market.deposit
        id: '101011'
        timestamp: '1366758222'
        account: '100001'
        currency: 'BTC'
        amount: new Amount '47.000000000000000047'
      @market.submit new Order
        id: '101013'
        timestamp: '1366758222'
        account: '100001'
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'
        bidPrice: new Amount '0.009900990099009901'
        bidAmount: new Amount '4747'
      @market.deposit
        id: '101031'
        timestamp: '1366758222'
        account: '100003'
        currency: 'BTC'
        amount: new Amount '53.99999999999999865'
      @market.submit new Order
        id: '101033'
        timestamp: '1366758222'
        account: '100003'
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'
        bidPrice: new Amount '0.011235955056179775'
        bidAmount: new Amount '4806'

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
        order: '123456789'
      account.balances['EUR'].lockedFunds.compareTo(amount100).should.equal 0

    it 'should remove the order from the orders collection and from the correct book, record the last transaction ID and emit an cancellation event', ->
      cancellationSpy = sinon.spy()
      @market.on 'cancellation', cancellationSpy

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
      cancellation1 = 
        id: '123456795'
        timestamp: '987654349'
        order: '123456793'
      @market.cancel cancellation1
      @market.lastTransaction.should.equal '123456795'
      expect(@market.accounts['Peter'].orders['123456793']).to.not.be.ok
      expect(@market.books['BTC']['EUR'].highest).to.not.be.ok
      expect(@market.orders['123456793']).to.not.be.ok
      cancellation2 = 
        id: '123456796'
        timestamp: '987654350'
        order: '123456794'
      @market.cancel cancellation2
      @market.lastTransaction.should.equal '123456796'
      expect(@market.accounts['Peter'].orders['123456794']).to.not.be.ok
      expect(@market.books['EUR']['BTC'].highest).to.not.be.ok
      expect(@market.orders['123456794']).to.not.be.ok
      cancellationSpy.should.have.been.calledTwice
      cancellationSpy.firstCall.args[0].should.equal cancellation1
      cancellationSpy.secondCall.args[0].should.equal cancellation2

    it 'should throw an error if the order cannot be found', ->
      expect =>
        @market.cancel
          id: '123456795'
          timestamp: '987654349'
          order: '123456793'
      .to.throw('Order cannot be found')

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
