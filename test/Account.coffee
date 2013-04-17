Account = require('../src/Account')

describe 'Account', ->
  it 'should instantiate with collections of currencies and bids', ->
    account = new Account()
    expect(account.currencies).to.be.an('object')
    expect(account.bids).to.be.an('object')
