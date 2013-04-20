Currency = require('../../../src/Market/Account/Currency')
Amount = require('../../../src/Market/Amount')
Deposit = require('../../../src/Market/Account/Deposit')
Withdrawal = require('../../../src/Market/Account/Withdrawal')
Order = require('../../../src/Market/Order')

describe 'Currency', ->
  it 'should instantiate with a balance of zero, a reserved balance of zero, collections of deposits and withdrawals and collections of orders matching the supported currencies', ->
    currency = new Currency(['USD', 'EUR'])
    currency.funds.compareTo(Amount.ZERO).should.equal(0)
    currency.lockedFunds.compareTo(Amount.ZERO).should.equal(0)

  describe '#deposit', ->
    it 'should add the deposited amount to the funds', ->
      currency = new Currency(['USD', 'EUR'])
      deposit = new Deposit
        id: '123456789',
        timestamp: '987654321',
        account: 'name',
        currency: 'BTC',
        amount: '200'
      currency.deposit(deposit)
      currency.funds.compareTo(new Amount('200')).should.equal(0)
      deposit = new Deposit
        id: '123456790',
        timestamp: '987654322',
        account: 'name',
        currency: 'BTC',
        amount: '150'
      currency.deposit(deposit)
      currency.funds.compareTo(new Amount('350')).should.equal(0)

  describe '#lock', ->
    it 'should add the offer amount to the locked funds', ->
      currency = new Currency(['USD', 'EUR'])
      deposit = new Deposit
        id: '123456789',
        timestamp: '987654321',
        account: 'name',
        currency: 'BTC',
        amount: '200'
      currency.deposit(deposit)
      order = new Order
        id: '123456790',
        timestamp: '987654322',
        account: 'name',
        bidCurrency: 'EUR',
        offerCurrency: 'BTC',
        bidPrice: '0.01',
        bidAmount: '5000'
      currency.lock(order)
      currency.lockedFunds.compareTo(new Amount('50')).should.equal(0)
      order = new Order
        id: '123456791',
        timestamp: '987654323',
        account: 'name',
        bidCurrency: 'USD',
        offerCurrency: 'BTC',
        bidPrice: '0.005',
        bidAmount: '20000'
      currency.lock(order)
      currency.lockedFunds.compareTo(new Amount('150')).should.equal(0)

    it 'should throw an error if the there are not enough funds available to satisfy the lock', ->
      currency = new Currency(['USD', 'EUR'])
      deposit = new Deposit
        id: '123456789',
        timestamp: '987654321',
        account: 'name',
        currency: 'BTC',
        amount: '200'
      currency.deposit(deposit)
      order = new Order
        id: '123456791',
        timestamp: '987654323',
        account: 'name',
        bidCurrency: 'USD',
        offerCurrency: 'BTC',
        offerPrice: '200',
        offerAmount: '100'
      currency.lock(order)
      order = new Order
        id: '123456792',
        timestamp: '987654324',
        account: 'name',
        bidCurrency: 'USD',
        offerCurrency: 'BTC',
        offerPrice: '200',
        offerAmount: '150'
      expect ->
        currency.lock(order)
      .to.throw('Cannot lock funds that are not available')

  describe '#unlock', ->
    it 'should subtract the offer amount from the locked funds', ->
      currency = new Currency(['USD', 'EUR'])
      deposit = new Deposit
        id: '123456789',
        timestamp: '987654321',
        account: 'name',
        currency: 'BTC',
        amount: '200'
      currency.deposit(deposit)
      order = new Order
        id: '123456791',
        timestamp: '987654323',
        account: 'name',
        bidCurrency: 'USD',
        offerCurrency: 'BTC',
        offerPrice: '200',
        offerAmount: '200'
      currency.lock(order)
      order = new Order
        id: '123456792',
        timestamp: '987654324',
        account: 'name',
        bidCurrency: 'USD',
        offerCurrency: 'BTC',
        offerPrice: '200',
        offerAmount: '100'
      currency.unlock(order)
      currency.lockedFunds.compareTo(new Amount('100')).should.equal(0)
      order = new Order
        id: '123456792',
        timestamp: '987654324',
        account: 'name',
        bidCurrency: 'USD',
        offerCurrency: 'BTC',
        offerPrice: '200',
        offerAmount: '50'
      currency.unlock(order)
      currency.lockedFunds.compareTo(new Amount('50')).should.equal(0)

    it 'should throw an error if the there are not enough funds locked to unlock', ->
      currency = new Currency(['USD', 'EUR'])
      deposit = new Deposit
        id: '123456789',
        timestamp: '987654321',
        account: 'name',
        currency: 'BTC',
        amount: '200'
      currency.deposit(deposit)
      order = new Order
        id: '123456791',
        timestamp: '987654323',
        account: 'name',
        bidCurrency: 'USD',
        offerCurrency: 'BTC',
        offerPrice: '200',
        offerAmount: '200'
      currency.lock(order)
      order = new Order
        id: '123456792',
        timestamp: '987654324',
        account: 'name',
        bidCurrency: 'USD',
        offerCurrency: 'BTC',
        offerPrice: '200',
        offerAmount: '100'
      currency.unlock(order)
      currency.lockedFunds.compareTo(new Amount('100')).should.equal(0)
      order = new Order
        id: '123456792',
        timestamp: '987654324',
        account: 'name',
        bidCurrency: 'USD',
        offerCurrency: 'BTC',
        offerPrice: '200',
        offerAmount: '150'
      expect ->
        currency.unlock(order)
      .to.throw('Cannot unlock funds that are not locked')

  describe '#withdraw', ->
    it 'should subtract the withdrawn amount from the funds', ->
      currency = new Currency(['USD', 'EUR'])
      deposit = new Deposit
        id: '123456789',
        timestamp: '987654321',
        account: 'name',
        currency: 'BTC',
        amount: '200'
      currency.deposit(deposit)
      order = new Order
        id: '123456790',
        timestamp: '987654322',
        account: 'name',
        bidCurrency: 'EUR',
        offerCurrency: 'BTC',
        bidPrice: '0.01',
        bidAmount: '5000'
      currency.lock(order)
      currency.lockedFunds.compareTo(new Amount('50')).should.equal(0)
      order = new Order
        id: '123456791',
        timestamp: '987654323',
        account: 'name',
        bidCurrency: 'USD',
        offerCurrency: 'BTC',
        bidPrice: '0.005',
        bidAmount: '20000'
      currency.lock(order)
      withdrawal = new Withdrawal
        id: '123456790',
        timestamp: '987654322',
        account: 'name',
        currency: 'BTC',
        amount: '25'
      currency.withdraw(withdrawal)
      currency.funds.compareTo(new Amount('175')).should.equal(0)
      withdrawal = new Withdrawal
        id: '123456791',
        timestamp: '987654323',
        account: 'name',
        currency: 'BTC',
        amount: '25'
      currency.withdraw(withdrawal)
      currency.funds.compareTo(new Amount('150')).should.equal(0)

    it 'should throw an error if the withdrawal amount is greater than the funds available taking into accoutn the locked funds', ->
      currency = new Currency(['USD', 'EUR'])
      deposit = new Deposit
        id: '123456789',
        timestamp: '987654321',
        account: 'name',
        currency: 'BTC',
        amount: '200'
      currency.deposit(deposit)
      order = new Order
        id: '123456790',
        timestamp: '987654322',
        account: 'name',
        bidCurrency: 'EUR',
        offerCurrency: 'BTC',
        bidPrice: '0.01',
        bidAmount: '5000'
      currency.lock(order)
      currency.lockedFunds.compareTo(new Amount('50')).should.equal(0)
      order = new Order
        id: '123456791',
        timestamp: '987654323',
        account: 'name',
        bidCurrency: 'USD',
        offerCurrency: 'BTC',
        bidPrice: '0.005',
        bidAmount: '20000'
      currency.lock(order)
      withdrawal = new Withdrawal
        id: '123456791',
        timestamp: '987654323',
        account: 'name',
        currency: 'BTC',
        amount: '100'
      expect ->
        currency.withdraw(withdrawal)
      .to.throw('Cannot withdraw funds that are not available')
