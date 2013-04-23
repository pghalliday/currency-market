chai = require 'chai'
chai.should()
expect = chai.expect
assert = chai.assert

Account = require('../../../src/Market/Account/Account')
Balance = require('../../../src/Market/Account/Balance')

describe 'Account', ->
  it 'should instantiate with a collection of balances matching the supported currencies', ->
    account = new Account
      id: 'Peter'
      currencies: [
        'EUR'
        'USD'
        'BTC'
      ]
    account.balances['EUR'].should.be.an.instanceOf(Balance)
    account.balances['USD'].should.be.an.instanceOf(Balance)
    account.balances['BTC'].should.be.an.instanceOf(Balance)
