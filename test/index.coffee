chai = require 'chai'
chai.should()
expect = chai.expect
assert = chai.assert

CurrencyMarket = require '../src'

describe 'CurrencyMarket', ->
  describe '#Engine', ->
    it 'should construct an engine', ->
      engine = new CurrencyMarket.Engine()
      engine.should.be.an.instanceOf CurrencyMarket.Engine

  describe '#State', ->
    it 'should construct a state', ->
      state = new CurrencyMarket.State()
      state.should.be.an.instanceOf CurrencyMarket.State

  describe '#Amount', ->
    it 'should construct an Amount', ->
      amount = new CurrencyMarket.Amount '200'
      amount.should.be.an.instanceOf CurrencyMarket.Amount
