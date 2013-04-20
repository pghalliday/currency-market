Account = require('../../../src/Market/Account/Account')
Currency = require('../../../src/Market/Account/Currency')

describe 'Account', ->
  it 'should instantiate with collections of currencies with order collections matching the supported currencies', ->
    account = new Account(['EUR', 'USD', 'BTC'])
    account.currencies['EUR'].should.be.an.instanceOf(Currency)
    account.currencies['USD'].should.be.an.instanceOf(Currency)
    account.currencies['BTC'].should.be.an.instanceOf(Currency)
