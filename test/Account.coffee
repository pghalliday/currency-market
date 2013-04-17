Account = require('../src/Account')
Currency = require('../src/Currency')

describe 'Account', ->
  it 'should instantiate with collections of currencies', ->
    account = new Account()
    expect(account.currencies).to.be.an('object')

  describe '#getCurrency', ->
    it 'should return a Currency instance, creating one if necessary', ->
      account = new Account()
      currencyBTC = account.getCurrency('BTC')
      currencyBTC.should.be.an.instanceOf(Currency)
      currencyEUR = account.getCurrency('EUR')
      currencyEUR.should.be.an.instanceOf(Currency)
      currencyUSD = account.getCurrency('USD')
      currencyUSD.should.be.an.instanceOf(Currency)
      currencyUSD.should.not.equal(currencyEUR)
      currencyUSD.should.not.equal(currencyBTC)
      currencyEUR.should.not.equal(currencyBTC)
      currencyBTC2 = account.getCurrency('BTC')
      currencyEUR2 = account.getCurrency('EUR')
      currencyUSD2 = account.getCurrency('USD')
      currencyBTC2.should.equal(currencyBTC)
      currencyEUR2.should.equal(currencyEUR)
      currencyUSD2.should.equal(currencyUSD)
