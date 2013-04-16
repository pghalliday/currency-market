State = require('../src/State')

describe 'State', ->
  it 'should instantiate with a collection of accounts', ->
    state = new State()
    expect(state.accounts).to.be.an('object')
