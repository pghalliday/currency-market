chai = require 'chai'
chai.should()
expect = chai.expect
assert = chai.assert

Account = require('../src/Account')
Balance = require('../src/Balance')
Amount = require('../src/Amount')
Order = require('../src/Order')

amountPoint01 = new Amount '0.01'
amount5 = new Amount '5'
amount10 = new Amount '10'
amount15 = new Amount '15'
amount100 = new Amount '100'
amount500 = new Amount '500'
amount1000 = new Amount '1000'

describe 'Account', ->
  it 'should instantiate with collections of orders and balances matching the supported currencies', ->
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
    Object.keys(account.orders).should.be.empty

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
      @account.orders['1'] = new Order
        id: '1'
        timestamp: '1'
        account: '123456789'
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
        bidPrice: new Amount '100'
        bidAmount: new Amount '10'

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
      account.orders['1'] = new Order
        id: '1'
        timestamp: '1'
        account: '123456789'
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
        bidPrice: new Amount '100'
        bidAmount: new Amount '10'
      account.equals(@account).should.be.true
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
      account.orders['1'] = new Order
        id: '1'
        timestamp: '1'
        account: '123456789'
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
        bidPrice: new Amount '100'
        bidAmount: new Amount '10'
      account.balances['EUR'].deposit new Amount '300'
      account.balances['EUR'].lock new Amount '100'
      account.balances['USD'].deposit new Amount '200'
      account.balances['USD'].lock new Amount '50'
      account.balances['BTC'].deposit new Amount '50'
      account.balances['BTC'].lock new Amount '25'
      account.equals(@account).should.be.false
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
      account.orders['1'] = new Order
        id: '1'
        timestamp: '1'
        account: '123456789'
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
        bidPrice: new Amount '100'
        bidAmount: new Amount '10'
      account.balances['EUR'].deposit new Amount '300'
      account.balances['EUR'].lock new Amount '100'
      account.balances['USD'].deposit new Amount '200'
      account.balances['USD'].lock new Amount '50'
      account.balances['BTC'].deposit new Amount '50'
      account.balances['BTC'].lock new Amount '25'
      account.equals(@account).should.be.false
      @account.equals(account).should.be.false

    it 'should return false if the orders are different', ->
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
      account.equals(@account).should.be.false
      @account.equals(account).should.be.false
      account.orders['1'] = new Order
        id: '1'
        timestamp: '1'
        account: '123456789'
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
        bidPrice: new Amount '100'
        bidAmount: new Amount '1' # different bid amount
      account.equals(@account).should.be.false
      @account.equals(account).should.be.false
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
      account.orders['1'] = new Order
        id: '1'
        timestamp: '1'
        account: '123456789'
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
        bidPrice: new Amount '100'
        bidAmount: new Amount '10' # different bid amount
      account.orders['2'] = new Order
        id: '2'
        timestamp: '1'
        account: '123456789'
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
        bidPrice: new Amount '100'
        bidAmount: new Amount '10'
      account.equals(@account).should.be.false
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
      account.orders['1'] = new Order
        id: '1'
        timestamp: '1'
        account: '123456789'
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
        bidPrice: new Amount '100'
        bidAmount: new Amount '10'
      account.balances['EUR'].deposit new Amount '300'
      account.balances['EUR'].lock new Amount '50'
      account.balances['USD'].deposit new Amount '200'
      account.balances['USD'].lock new Amount '50'
      account.balances['BTC'].deposit new Amount '50'
      account.balances['BTC'].lock new Amount '25'
      account.equals(@account).should.be.false
      @account.equals(account).should.be.false
      account = new Account
        id: '123456789'
        timestamp: '987654322'
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]      
      account.orders['1'] = new Order
        id: '1'
        timestamp: '1'
        account: '123456789'
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
        bidPrice: new Amount '100'
        bidAmount: new Amount '10'
      account.balances['EUR'].deposit new Amount '300'
      account.balances['EUR'].lock new Amount '100'
      account.balances['USD'].deposit new Amount '150'
      account.balances['USD'].lock new Amount '50'
      account.balances['BTC'].deposit new Amount '50'
      account.balances['BTC'].lock new Amount '25'
      account.equals(@account).should.be.false
      @account.equals(account).should.be.false
      account = new Account
        id: '123456789'
        timestamp: '987654322'
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]      
      account.orders['1'] = new Order
        id: '1'
        timestamp: '1'
        account: '123456789'
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
        bidPrice: new Amount '100'
        bidAmount: new Amount '10'
      account.balances['EUR'].deposit new Amount '300'
      account.balances['EUR'].lock new Amount '100'
      account.balances['USD'].deposit new Amount '200'
      account.balances['USD'].lock new Amount '50'
      account.balances['BTC'].deposit new Amount '50'
      account.balances['BTC'].lock new Amount '50'
      account.equals(@account).should.be.false
      @account.equals(account).should.be.false

  describe '#submit', ->
    it 'should add an order to the orders collection and lock the appropriate funds', ->
      account = new Account
        id: '123456789'
        timestamp: '987654322'
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]
      account.balances['EUR'].deposit new Amount '1000'
      order = new Order
        id: '1'
        timestamp: '1'
        account: '123456789'
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
        bidPrice: new Amount '100'
        bidAmount: new Amount '10'
      account.submit order
      account.orders['1'].should.equal order
      account.balances['EUR'].lockedFunds.compareTo(amount1000).should.equal 0

    describe 'when the order fill event fires', ->
      beforeEach ->
        @account = new Account
          id: '123456789'
          timestamp: '987654322'
          currencies: [
            'EUR'
            'USD'
            'BTC'
          ]
        @account.balances['EUR'].deposit new Amount '1000'
        @order = new Order
          id: '1'
          timestamp: '1'
          account: '123456789'
          offerCurrency: 'EUR'
          bidCurrency: 'BTC'
          bidPrice: amount100
          bidAmount: amount10
        @account.submit @order

      it 'should adjust the locked funds and make deposits and withdrawals to apply the fill', ->
       order = new Order
          id: '2'
          timestamp: '2'
          account: '12345523'
          offerCurrency: 'BTC'
          bidCurrency: 'EUR'
          offerPrice: amount100
          offerAmount: amount5
        order.match @order
        @account.orders['1'].should.equal @order
        @account.balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
        @account.balances['EUR'].funds.compareTo(amount500).should.equal 0
        @account.balances['BTC'].funds.compareTo(amount5).should.equal 0

      it 'should delete fully filled orders', ->
       order = new Order
          id: '2'
          timestamp: '2'
          account: '12345523'
          offerCurrency: 'BTC'
          bidCurrency: 'EUR'
          offerPrice: amount100
          offerAmount: amount15
        order.match @order
        expect(@account.orders['1']).to.not.be.ok
        @account.balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

  describe '#cancel', ->
    it 'should delete an order and unlock the appropriate funds', ->
      account = new Account
        id: '123456789'
        timestamp: '987654322'
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]
      account.balances['EUR'].deposit new Amount '1000'
      order = new Order
        id: '1'
        timestamp: '1'
        account: '123456789'
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
        bidPrice: new Amount '100'
        bidAmount: new Amount '10'
      account.submit order
      account.cancel order
      expect(@account.orders['1']).to.not.be.ok
      account.balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

  describe '#export', ->
    it 'should export the state of the account as a JSON stringifiable object that can be used to initialise a new Account in the exact same state', ->
      orders = Object.create null
      order = new Order
        id: '1'
        timestamp: '1'
        account: '123456789'
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
        bidPrice: amount100
        bidAmount: amount10
      orders[order.id] = order     
      account = new Account
        id: '123456789'
        timestamp: '987654322'
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]
      account.balances['EUR'].deposit amount1000
      account.submit order
      state = account.export()
      json = JSON.stringify state
      newAccount = new Account
        state: JSON.parse(json)
        orders: orders
      newAccount.equals(account).should.be.true
      newAccount.orders[order.id].should.equal order
