Account = require('../src/Account')
Currency = require('../src/Currency')

describe 'Account', ->
  it 'should instantiate with collections of currencies with order collections matching the supported currencies', ->
    account = new Account(['EUR', 'USD', 'BTC'])
    account.currencies['EUR'].should.be.an.instanceOf(Currency)
    Object.keys(account.currencies['EUR'].orders['USD']).should.be.empty
    Object.keys(account.currencies['EUR'].orders['BTC']).should.be.empty
    account.currencies['USD'].should.be.an.instanceOf(Currency)
    Object.keys(account.currencies['USD'].orders['EUR']).should.be.empty
    Object.keys(account.currencies['USD'].orders['BTC']).should.be.empty
    account.currencies['BTC'].should.be.an.instanceOf(Currency)
    Object.keys(account.currencies['BTC'].orders['USD']).should.be.empty
    Object.keys(account.currencies['BTC'].orders['EUR']).should.be.empty
