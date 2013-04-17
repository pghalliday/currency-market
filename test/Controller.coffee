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

  describe '#insertBid', ->
    it 'should throw an error if the account does not exist', ->
      state = new State()
      controller = new Controller(state)
      expect ->
        controller.insertBid({
          account: 'name'
        })
      .to.throw('Account does not exist')

    it 'should throw an error if the account does not contain enough currency to fund the bid', ->
      state = new State()
      controller = new Controller(state)
      controller.createAccount('name')
      expect ->
        controller.insertBid({
          account: 'name',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          price: '50',
          amount: '10'
        })
      .to.throw('Not enough currency to fund the bid')

    it 'should add a bid to the correct market', ->
      state = new State()
      controller = new Controller(state)
      controller.createAccount('name')
      controller.deposit
        account: 'name',
        currency: 'EUR',
        amount: '500'
      id = controller.insertBid({
        account: 'name',
        offerCurrency: 'EUR',
        bidCurrency: 'BTC',
        price: '50',
        amount: '10'
      })
      bid = state.markets['BTC']['EUR'].bids[id]
      bid.price.compareTo(new Amount('50')).should.equal(0)
      bid.amount.compareTo(new Amount('10')).should.equal(0)

    it 'should throw an error if the account does not contain enough currency to fund the bid taking into account other existing bids', ->
      state = new State()
      controller = new Controller(state)
      controller.createAccount('name')
      controller.deposit
        account: 'name',
        currency: 'EUR',
        amount: '500'
      id = controller.insertBid({
        account: 'name',
        offerCurrency: 'EUR',
        bidCurrency: 'BTC',
        price: '50',
        amount: '10'
      })
      expect ->
        controller.insertBid({
          account: 'name',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          price: '50',
          amount: '1'
        })
      .to.throw('Not enough currency to fund the bid')

  describe '#deleteBid', ->

  describe '#insertOffer', ->

  describe '#deleteOffer', ->

  describe '#withdraw', ->
