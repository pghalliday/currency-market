Account = require('../src/Account')

describe 'Account', ->
  it 'should instantiate with a collection of currencies', ->
    account = new Account()
    expect(account.currencies).to.be.an('object')
