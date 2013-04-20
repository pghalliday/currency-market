Currency = require('../src/Currency')
Amount = require('../src/Amount')
Deposit = require('../src/Deposit')
Withdrawal = require('../src/Withdrawal')

ZERO = new Amount()

describe 'Currency', ->
  it 'should instantiate with a balance of zero, a reserved balance of zero, collections of deposits and withdrawals and collections of orders matching the supported currencies', ->
    currency = new Currency(['USD', 'EUR'])
    currency.funds.compareTo(ZERO).should.equal(0)
    currency.reservedFunds.compareTo(ZERO).should.equal(0)
    Object.keys(currency.deposits).should.be.empty
    Object.keys(currency.withdrawals).should.be.empty
    Object.keys(currency.orders['USD']).should.be.empty
    Object.keys(currency.orders['EUR']).should.be.empty

  describe '#deposit', ->
    it 'should add the deposited amount to the funds and record the deposit', ->
      currency = new Currency(['USD', 'EUR'])

  describe '#withdraw', ->
    it 'should subtract the withdrawn amount from the funds and record the withdrawal', ->
      currency = new Currency(['USD', 'EUR'])
