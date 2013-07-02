chai = require 'chai'
chai.should()
expect = chai.expect

State = require '../../src/State/State'
Account = require '../../src/State/Account'
Engine = require '../../src/Engine/Engine'
Amount = require '../../src/Amount'

describe 'State', ->
  beforeEach ->
    @sequence = 0
    @engine = new Engine
      commission:
        account: 'commission'
        calculate: (params) =>
          amount: Amount.ONE
          reference: 'Flat 1'
    @deposit = (params) =>
      @engine.apply
        reference: '550e8400-e29b-41d4-a716-446655440000'
        account: params.account
        sequence: @sequence++
        timestamp: 1371737390976
        deposit:
          currency: params.currency
          amount: params.amount

  describe '#getAccount', ->
    it 'should create a new account if it does not exist', ->
      state = new State()
      account = state.getAccount 'Peter'
      account.should.be.an.instanceOf Account

    it 'should return the corresponding account if it does exist', ->
      state = new State()
      account1 = state.getAccount 'Peter'
      account2 = state.getAccount 'Peter'
      account2.should.equal account1

    it 'should return different accounts for different IDs', ->
      state = new State()
      accountPeter = state.getAccount 'Peter'
      accountPaul = state.getAccount 'Paul'
      accountPaul.should.not.equal accountPeter

  it 'should instantiate from an engine state', ->
    @deposit
      account: 'Peter'
      currency: 'EUR'
      amount: '5000'
    @deposit
      account: 'Peter'
      currency: 'BTC'
      amount: '50'
    @deposit
      account: 'Paul'
      currency: 'EUR'
      amount: '2500'
    @deposit
      account: 'Paul'
      currency: 'BTC'
      amount: '75'
    state = new State @engine.export()
    state.getAccount('Peter').getBalance('EUR').getFunds().should.equal '5000'
    state.getAccount('Peter').getBalance('BTC').getFunds().should.equal '50'
    state.getAccount('Paul').getBalance('EUR').getFunds().should.equal '2500'
    state.getAccount('Paul').getBalance('BTC').getFunds().should.equal '75'

  describe '#apply', ->
    it 'should apply deltas with sequential IDs', ->
      state = new State @engine.export()
      state.apply @deposit
        account: 'Peter'
        currency: 'EUR'
        amount: '100'
      state.getAccount('Peter').getBalance('EUR').getFunds().should.equal '100'
      state.apply @deposit
        account: 'Peter'
        currency: 'EUR'
        amount: '150'
      state.getAccount('Peter').getBalance('EUR').getFunds().should.equal '250'
      state.apply @deposit
        account: 'Peter'
        currency: 'EUR'
        amount: '50'
      state.getAccount('Peter').getBalance('EUR').getFunds().should.equal '300'

    it 'should ignore deltas with a sequence lower than expected as such a delta will have already been applied', ->
      delta = @deposit
        account: 'Peter'
        currency: 'EUR'
        amount: '5000'
      state = new State @engine.export()
      state.getAccount('Peter').getBalance('EUR').getFunds().should.equal '5000'
      state.apply delta
      state.getAccount('Peter').getBalance('EUR').getFunds().should.equal '5000'

    it 'should throw an error if a delta with a sequence higher than expected is applied as this will mean that it missed some', ->
      @deposit
        account: 'Peter'
        currency: 'EUR'
        amount: '5000'
      state = new State @engine.export()
      # make a deposit but don't apply the delta
      @deposit
        account: 'Peter'
        currency: 'EUR'
        amount: '2000'
      expect =>
        # try to apply the delta from the next deposit
        state.apply @deposit
          account: 'Peter'
          currency: 'EUR'
          amount: '6000'
      .to.throw 'Unexpected delta'

    it 'should throw an error if an unknown operation is received', ->
      state = new State()
      expect ->
        state.apply
          sequence: 0
          operation:
            account: 'Peter'
            sequence: 10
            unknown:
              blah: 'jvksjfv'
          result: 'success'
      .to.throw 'Unknown operation'

