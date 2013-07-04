chai = require 'chai'
chai.should()
expect = chai.expect
assert = chai.assert

CurrencyMarket = require '../src'
Engine = CurrencyMarket.Engine
State = CurrencyMarket.State
Operation = CurrencyMarket.Operation
Delta = CurrencyMarket.Delta
Amount = CurrencyMarket.Amount

describe 'CurrencyMarket', ->
  it.skip 'should be possible to construct an Engine, export the engine state to a State, apply an Operation and apply the resulting Delta to the State', ->
    commission = 
      account: 'commission'
      calculate: (params) ->
        amount: Amount.ONE
        reference: 'Flat 1'

    engine = new Engine
      commission: commission
    
    operation = new Operation
      reference: 'hello'
      sequence: 0
      timestamp: 1371737390976
      account: 'Peter'
      deposit:
        currency: 'EUR'
        amount: new Amount '500'

    # simulate transmiting the operation as JSON
    engine.apply new Operation
      json: JSON.stringify operation

    operation = new Operation
      reference: 'hello'
      sequence: 1
      timestamp: 1371737390976
      account: 'Paul'
      deposit:
        currency: 'BTC'
        amount: new Amount '50'

    # simulate transmiting the operation as JSON
    engine.apply new Operation
      json: JSON.stringify operation

    # simulate exporting and reconstructing an engine to and from JSON
    engine = new Engine
      commission: commission
      json: JSON.stringify engine

    # simulate transmiting the engine as JSON
    state = new State
      json: JSON.stringify engine

    operation = new Operation
      reference: 'hello'
      sequence: 2
      timestamp: 1371737390976
      account: 'Peter'
      submit:
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: new Amount '0.1'
        offerAmount: new Amount '500'

    # simulate transmiting the operation as JSON
    delta = engine.apply new Operation
      json: JSON.stringify operation

    # simulate transmitting the delta as JSON
    state.apply new Delta
      json: JSON.stringify delta

    operation = new Operation
      reference: 'hello'
      sequence: 3
      timestamp: 1371737390976
      account: 'Paul'
      submit:
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'
        offerPrice: new Amount '10'
        offerAmount: new Amount '50'

    # simulate transmiting the operation as JSON
    delta = engine.apply new Operation
      json: JSON.stringify operation

    # simulate transmitting the delta as JSON
    state.apply new Delta
      json: JSON.stringify delta

    # simulate transmitting the state as JSON
    state = new State
      json: JSON.stringify state

    # now check the end state
    state.getAccount('Peter').getBalance('EUR').funds.compareTo(Amount.ZERO).should.equal 0
    state.getAccount('Peter').getBalance('BTC').funds.compareTo(new Amount '49').should.equal 0
    state.getAccount('Paul').getBalance('EUR').funds.compareTo(new Amount '499').should.equal 0
    state.getAccount('Paul').getBalance('BTC').funds.compareTo(Amount.ZERO).should.equal 0
    state.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal 0
    state.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal 0



