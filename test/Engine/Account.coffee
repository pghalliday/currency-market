chai = require 'chai'
chai.should()
expect = chai.expect
assert = chai.assert
sinon = require 'sinon'
sinonChai = require 'sinon-chai'
chai.use sinonChai

Account = require '../../src/Engine/Account'
Balance = require '../../src/Engine/Balance'
Amount = require '../../src/Amount'
Order = require '../../src/Engine/Order'

amountPoint01 = new Amount '0.01'
amount4 = new Amount '4'
amount5 = new Amount '5'
amount10 = new Amount '10'
amount15 = new Amount '15'
amount25 = new Amount '25'
amount50 = new Amount '50'
amount100 = new Amount '100'
amount150 = new Amount '150'
amount175 = new Amount '175'
amount200 = new Amount '200'
amount300 = new Amount '300'
amount500 = new Amount '500'
amount1000 = new Amount '1000'

newOffer = (id, currency, amount) ->
  new Order
    id: id
    timestamp: '987654321'
    account: 'name'
    bidCurrency: 'EUR'
    offerCurrency: currency
    offerAmount: amount
    offerPrice: amount100

newBid = (id, currency, amount) ->
  new Order
    id: id
    timestamp: '987654321'
    account: 'name'
    bidCurrency: currency
    offerCurrency: 'EUR'
    bidAmount: amount
    bidPrice: amount150

describe 'Account', ->
  it 'should instantiate and record the account ID', ->
    account = new Account
      id: '1'
    account.id.should.equal '1'

  it 'should throw an error if no ID is given', ->
    expect ->
      account = new Account()
    .to.throw 'Account ID must be specified'

  describe '#submit', ->
    it 'should add an order to the orders collection and lock the appropriate funds', ->
      account = new Account
        id: '123456789'
      account.deposit
        currency: 'EUR'
        amount: '1000'
      order = new Order
        id: '1'
        timestamp: '1'
        account: '123456789'
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
        bidPrice: amount100
        bidAmount: amount10
      account.submit order
      account.getBalance('EUR').offers['1'].should.equal order
      account.getBalance('EUR').lockedFunds.compareTo(amount1000).should.equal 0

    describe 'when the order fill event fires', ->
      beforeEach ->
        @commissionAccount = new Account
          id: 'commission'
        @calculateCommission = sinon.stub().returns Amount.ONE
        @account = new Account
          id: '123456789'
          commission:
            account: @commissionAccount
            calculate: @calculateCommission
        @account.deposit
          currency: 'EUR'
          amount: '1000'
        @order = new Order
          id: '1'
          timestamp: '1'
          account: '123456789'
          offerCurrency: 'EUR'
          bidCurrency: 'BTC'
          bidPrice: amount100
          bidAmount: amount10
        @account.submit @order

      it 'should adjust the locked funds, apply commission and make deposits and withdrawals to apply the fill', ->
       order = new Order
          id: '2'
          timestamp: '2'
          account: '12345523'
          offerCurrency: 'BTC'
          bidCurrency: 'EUR'
          offerPrice: amount100
          offerAmount: amount5
        order.match @order
        @calculateCommission.should.have.been.calledOnce
        @calculateCommission.firstCall.args[0].amount.compareTo(amount5).should.equal 0
        @calculateCommission.firstCall.args[0].timestamp.should.equal order.timestamp
        @calculateCommission.firstCall.args[0].account.should.equal @order.account
        @calculateCommission.firstCall.args[0].currency.should.equal @order.bidCurrency
        @commissionAccount.getBalance('BTC').funds.compareTo(Amount.ONE).should.equal 0
        @account.getBalance('EUR').offers['1'].should.equal @order
        @account.getBalance('EUR').lockedFunds.compareTo(amount500).should.equal 0
        @account.getBalance('EUR').funds.compareTo(amount500).should.equal 0
        @account.getBalance('BTC').funds.compareTo(amount4).should.equal 0

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
        expect(@account.getBalance('EUR').offers['1']).to.not.be.ok
        @account.getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal 0

  describe '#cancel', ->
    it 'should delete an order and unlock the appropriate funds', ->
      account = new Account
        id: '123456789'
      account.deposit
        currency: 'EUR'
        amount: '1000'
      order = new Order
        id: '1'
        timestamp: '1'
        account: '123456789'
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
        bidPrice: amount100
        bidAmount: amount10
      account.submit order
      account.cancel order
      expect(@account.getBalance('EUR').offers['1']).to.not.be.ok
      account.getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal 0

  describe '#getBalance', ->
    it 'should return a balance object associated with the given currency', ->
      account = new Account
        id: '123456789'
      balance1 = account.getBalance 'EUR'
      balance1.should.be.an.instanceOf Balance
      balance2 = account.getBalance 'EUR'
      balance1.should.equal balance2
      balance3 = account.getBalance 'USD'
      balance3.should.not.equal balance1

  describe '#deposit', ->
    it 'should throw an error if no currency is supplied', ->
      account = new Account
        id: '123456789'
      expect =>
        account.deposit
          amount: '50'
      .to.throw 'Must supply a currency'

    it 'should throw an error if no amount is supplied', ->
      account = new Account
        id: '123456789'
      expect =>
        account.deposit
          currency: 'BTC'
      .to.throw 'Must supply an amount'

    it 'should add the deposited amount to the funds for the correct currency', ->
      account = new Account
        id: '123456789'
      account.deposit
        currency: 'BTC'
        amount: '50'
      account.getBalance('BTC').funds.compareTo(amount50).should.equal 0

  describe '#withdraw', ->
    it 'should throw an error if no currency is supplied', ->
      account = new Account
        id: '123456789'
      expect =>
        account.withdraw
          amount: '50'
      .to.throw 'Must supply a currency'

    it 'should throw an error if no amount is supplied', ->
      account = new Account
        id: '123456789'
      expect =>
        account.withdraw
          currency: 'BTC'
      .to.throw 'Must supply an amount'

    it 'should subtract the withdrawn amount from the funds of the correct currency', ->
      account = new Account
        id: '123456789'
      account.deposit
        currency: 'BTC'
        amount: '200'
      account.submit newOffer '1', 'BTC', amount50
      account.submit newOffer '2', 'BTC', amount100
      account.withdraw
        currency: 'BTC'
        amount: '25'
      account.getBalance('BTC').funds.compareTo(amount175).should.equal 0
      account.withdraw
        currency: 'BTC'
        amount: '25'
      account.getBalance('BTC').funds.compareTo(amount150).should.equal 0

    it 'should throw an error if the withdrawal amount is greater than the funds available', ->
      account = new Account
        id: '123456789'
      account.deposit
        currency: 'BTC'
        amount: '200'
      account.submit newOffer '1', 'BTC', amount50
      account.submit newOffer '2', 'BTC', amount100
      expect ->
        account.withdraw
          currency: 'BTC'
          amount: '100'
      .to.throw 'Cannot withdraw funds that are not available'

  describe '#export', ->
    it 'should return a JSON stringifiable object containing a snapshot of the account', ->
      account = new Account
        id: '123456789'
      account.deposit
        currency: 'BTC'
        amount: '200'
      account.submit newOffer '1', 'BTC', amount50
      account.submit newOffer '2', 'BTC', amount100
      json = JSON.stringify account.export()
      object = JSON.parse json
      object.id.should.equal account.id
      for currency, balance of object.balances
        balance.should.deep.equal account.getBalance(currency).export()
      for currency of account.balances
        object.balances[currency].should.be.ok


