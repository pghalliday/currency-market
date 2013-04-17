State = require('../src/State')

describe 'State', ->
  it 'should instantiate with a collections accounts and markets', ->
    state = new State()
    expect(state.accounts).to.be.an('object')
    expect(state.markets).to.be.an('object')
