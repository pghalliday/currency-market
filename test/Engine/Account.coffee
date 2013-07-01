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
Book = require '../../src/Engine/Book'

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
amount250 = new Amount '250'
amount300 = new Amount '300'
amount500 = new Amount '500'
amount750 = new Amount '750'
amount1000 = new Amount '1000'
amount2500 = new Amount '2500'
amount3750 = new Amount '3750'
amount6250 = new Amount '6250'
amount8750 = new Amount '8750'
amount11250 = new Amount '11250'

describe 'Account', ->
  it 'should instantiate and record the account ID', ->
    account = new Account
      id: 'Peter'
    account.id.should.equal 'Peter'

  it 'should throw an error if no ID is given', ->
    expect ->
      account = new Account()
    .to.throw 'Account ID must be specified'

  describe '#submit', ->
    it 'should add the order to the orders list and lock the appropriate funds', ->
      book = new Book
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
      account = new Account
        id: 'Peter'
      account.deposit
        currency: 'EUR'
        amount: amount1000
      order = new Order
        sequence: 0
        timestamp: 1371737390976
        account: account
        book: book
        bidPrice: amount100
        bidAmount: amount10
      lockedFunds = account.submit order
      lockedFunds.should.equal '1000'
      account.orders[0].should.equal order
      account.getBalance('EUR').lockedFunds.compareTo(amount1000).should.equal 0

    it 'should throw an error if the funds cannot be locked', ->
      book = new Book
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
      account = new Account
        id: 'Peter'
      order = new Order
        sequence: 0
        timestamp: 1371737390976
        account: account
        book: book
        bidPrice: amount100
        bidAmount: amount10
      expect ->
        account.submit order
      .to.throw 'Cannot lock funds that are not available'
      expect(account.orders[0]).to.not.be.ok
      account.getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal 0

  describe '#complete', ->
    it 'should remove the order from the orders collection', ->
      book = new Book
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
      account = new Account
        id: 'Peter'
      account.deposit
        currency: 'EUR'
        amount: amount1000
      order = new Order
        sequence: 0
        timestamp: 1371737390976
        account: account
        book: book
        bidPrice: amount100
        bidAmount: amount10
      account.submit order
      account.orders[0].should.equal order
      account.complete order
      expect(account.orders[0]).to.not.be.ok

  describe '#getOrder', ->
    it 'should error if the order cannot be found', ->
      account = new Account
        id: 'Peter'
      expect ->
        account.getOrder 0
      .to.throw 'Order cannot be found'

    it 'should return the order with the given sequence number', ->
      book = new Book
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
      account = new Account
        id: 'Peter'
      account.deposit
        currency: 'EUR'
        amount: amount1000
      order = new Order
        sequence: 0
        timestamp: 1371737390976
        account: account
        book: book
        bidPrice: amount100
        bidAmount: amount10
      account.submit order
      account.getOrder(0).should.equal order

  describe '#cancel', ->
    it 'should delete the order from the orders collection, unlock the appropriate funds and return the order', ->
      book = new Book
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
      account = new Account
        id: 'Peter'
      account.deposit
        currency: 'EUR'
        amount: amount1000
      order = new Order
        sequence: 0
        timestamp: 1371737390976
        account: account
        book: book
        bidPrice: amount100
        bidAmount: amount10
      account.submit order
      order = account.getOrder 0
      lockedFunds = account.cancel order
      lockedFunds.should.equal '0'
      expect(account.orders[0]).to.not.be.ok
      account.getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal 0

  describe '#getBalance', ->
    it 'should return a balance object associated with the given currency', ->
      account = new Account
        id: 'Peter'
      balance1 = account.getBalance 'EUR'
      balance1.should.be.an.instanceOf Balance
      balance2 = account.getBalance 'EUR'
      balance1.should.equal balance2
      balance3 = account.getBalance 'USD'
      balance3.should.not.equal balance1

  describe '#deposit', ->
    it 'should throw an error if no currency is supplied', ->
      account = new Account
        id: 'Peter'
      expect =>
        account.deposit
          amount: amount50
      .to.throw 'Must supply a currency'

    it 'should throw an error if no amount is supplied', ->
      account = new Account
        id: 'Peter'
      expect =>
        account.deposit
          currency: 'BTC'
      .to.throw 'Must supply an amount'

    it 'should add the deposited amount to the funds for the correct currency', ->
      account = new Account
        id: 'Peter'
      funds = account.deposit
        currency: 'BTC'
        amount: amount50
      funds.should.equal '50'
      account.getBalance('BTC').funds.compareTo(amount50).should.equal 0

  describe '#withdraw', ->
    it 'should throw an error if no currency is supplied', ->
      account = new Account
        id: 'Peter'
      expect =>
        account.withdraw
          amount: amount50
      .to.throw 'Must supply a currency'

    it 'should throw an error if no amount is supplied', ->
      account = new Account
        id: 'Peter'
      expect =>
        account.withdraw
          currency: 'BTC'
      .to.throw 'Must supply an amount'

    it 'should subtract the withdrawn amount from the funds of the correct currency', ->
      book = new Book
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
      account = new Account
        id: 'Peter'
      account.deposit
        currency: 'EUR'
        amount: amount1000
      account.submit new Order
        sequence: 0
        timestamp: 1371737390976
        account: account
        book: book
        bidPrice: amount100
        bidAmount: amount5
      funds = account.withdraw
        currency: 'EUR'
        amount: amount250
      funds.should.equal '750'
      account.getBalance('EUR').funds.compareTo(amount750).should.equal 0
      funds = account.withdraw
        currency: 'EUR'
        amount: amount250
      funds.should.equal '500'
      account.getBalance('EUR').funds.compareTo(amount500).should.equal 0

    it 'should throw an error if the withdrawal amount is greater than the funds available', ->
      book = new Book
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
      account = new Account
        id: 'Peter'
      account.deposit
        currency: 'EUR'
        amount: amount1000
      account.submit new Order
        sequence: 0
        timestamp: 1371737390976
        account: account
        book: book
        bidPrice: amount100
        bidAmount: amount5
      expect ->
        account.withdraw
          currency: 'EUR'
          amount: amount1000
      .to.throw 'Cannot withdraw funds that are not available'
      account.getBalance('EUR').funds.compareTo(amount1000).should.equal 0

  describe '#export', ->
    it 'should return a JSON stringifiable object containing a snapshot of the account', ->
      book = new Book
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
      account = new Account
        id: 'Peter'
      account.deposit
        currency: 'EUR'
        amount: amount1000
      account.submit new Order
        sequence: 0
        timestamp: 1371737390976
        account: account
        book: book
        bidPrice: amount100
        bidAmount: amount5
      account.submit new Order
        sequence: 1
        timestamp: 1371737390976
        account: account
        book: book
        bidPrice: amount100
        bidAmount: amount5
      json = JSON.stringify account.export()
      object = JSON.parse json
      object.id.should.equal account.id
      for currency, balance of object.balances
        balance.should.deep.equal account.getBalance(currency).export()
      for currency of account.balances
        object.balances[currency].should.be.ok


