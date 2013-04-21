Balance = require('../../../src/Market/Account/Balance')
Amount = require('../../../src/Market/Amount')

describe 'Balance', ->
  it 'should instantiate with funds of zero and locked funds of zero', ->
    balance = new Balance()
    balance.funds.compareTo(Amount.ZERO).should.equal(0)
    balance.lockedFunds.compareTo(Amount.ZERO).should.equal(0)

  describe '#deposit', ->
    it 'should add the deposited amount to the funds', ->
      balance = new Balance()
      balance.deposit(new Amount('200'))
      balance.funds.compareTo(new Amount('200')).should.equal(0)
      balance.deposit(new Amount('150'))
      balance.funds.compareTo(new Amount('350')).should.equal(0)

  describe '#lock', ->
    it 'should add the offer amount to the locked funds', ->
      balance = new Balance()
      balance.deposit(new Amount('200'))
      balance.lock(new Amount('50'))
      balance.lockedFunds.compareTo(new Amount('50')).should.equal(0)
      balance.lock(new Amount('100'))
      balance.lockedFunds.compareTo(new Amount('150')).should.equal(0)

    it 'should throw an error if the there are not enough funds available to satisfy the lock', ->
      balance = new Balance()
      balance.deposit(new Amount('200'))
      balance.lock(new Amount('100'))
      expect ->
        balance.lock(new Amount('150'))
      .to.throw('Cannot lock funds that are not available')

  describe '#unlock', ->
    it 'should subtract the offer amount from the locked funds', ->
      balance = new Balance()
      balance.deposit(new Amount('200'))
      balance.lock(new Amount('200'))
      balance.unlock(new Amount('100'))
      balance.lockedFunds.compareTo(new Amount('100')).should.equal(0)
      balance.unlock(new Amount('50'))
      balance.lockedFunds.compareTo(new Amount('50')).should.equal(0)

    it 'should throw an error if the there are not enough funds locked to unlock', ->
      balance = new Balance()
      balance.deposit(new Amount('200'))
      balance.lock(new Amount('200'))
      balance.unlock(new Amount('100'))
      balance.lockedFunds.compareTo(new Amount('100')).should.equal(0)
      expect ->
        balance.unlock(new Amount('150'))
      .to.throw('Cannot unlock funds that are not locked')

  describe '#withdraw', ->
    it 'should subtract the withdrawn amount from the funds', ->
      balance = new Balance()
      balance.deposit(new Amount('200'))
      balance.lock(new Amount('50'))
      balance.lockedFunds.compareTo(new Amount('50')).should.equal(0)
      balance.lock(new Amount('100'))
      balance.withdraw(new Amount('25'))
      balance.funds.compareTo(new Amount('175')).should.equal(0)
      balance.withdraw(new Amount('25'))
      balance.funds.compareTo(new Amount('150')).should.equal(0)

    it 'should throw an error if the withdrawal amount is greater than the funds available taking into account the locked funds', ->
      balance = new Balance()
      balance.deposit(new Amount('200'))
      balance.lock(new Amount('50'))
      balance.lockedFunds.compareTo(new Amount('50')).should.equal(0)
      balance.lock(new Amount('100'))
      expect ->
        balance.withdraw(new Amount('100'))
      .to.throw('Cannot withdraw funds that are not available')
