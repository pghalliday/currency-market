Controller = require('../src/Controller')
State = require('../src/State')
Account = require('../src/Account')
Amount = require('../src/Amount')

describe 'Controller', ->
  it 'should instantiate', ->
    state = new State()
    controller = new Controller(state)
    controller.should.be.ok

  describe '#createAccount', ->
    it 'should add an account to the state', ->
      state = new State()
      controller = new Controller(state)
      controller.createAccount('name')
      account = state.accounts['name']
      account.should.be.an.instanceOf(Account)

    it 'throw an error if the account already exists', ->
      state = new State()
      controller = new Controller(state)
      controller.createAccount('name')
      expect ->
        controller.createAccount('name')
      .to.throw('Account already exists')

  describe '#deposit', ->
    it 'should throw an error if the account does not exist', ->
      state = new State()
      controller = new Controller(state)
      expect ->
        controller.deposit({
          account: 'name'
        })
      .to.throw('Account does not exist')

    it 'should add the deposited amount to the specified currency balance', ->
      state = new State()
      controller = new Controller(state)
      controller.createAccount('name')
      controller.deposit
        account: 'name',
        currency: 'EUR',
        amount: '200'
      state.accounts['name'].currencies['EUR'].compareTo(new Amount('200')).should.equal(0)
      controller.deposit
        account: 'name',
        currency: 'EUR',
        amount: '150'
      state.accounts['name'].currencies['EUR'].compareTo(new Amount('350')).should.equal(0)

  describe '#withdraw', ->

  describe '#insertLimitOrder', ->

  describe '#deleteLimitOrder', ->
