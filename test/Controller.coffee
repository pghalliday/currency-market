Controller = require('../src/Controller')
State = require('../src/State')
Account = require('../src/Account')
Amount = require('../src/Amount')
uuid = require('node-uuid')

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
        controller.deposit
          account: 'name'
      .to.throw('Account does not exist')

    it 'should add the deposited amount to the specified currency balance', ->
      state = new State()
      controller = new Controller(state)
      controller.createAccount('name')
      controller.deposit
        account: 'name',
        currency: 'EUR',
        amount: '200'
      state.accounts['name'].currencies['EUR'].funds.compareTo(new Amount('200')).should.equal(0)
      controller.deposit
        account: 'name',
        currency: 'EUR',
        amount: '150'
      state.accounts['name'].currencies['EUR'].funds.compareTo(new Amount('350')).should.equal(0)

  describe '#insertBid', ->
    it 'should throw an error if the account does not exist', ->
      state = new State()
      controller = new Controller(state)
      expect ->
        controller.insertBid
          account: 'name'
      .to.throw('Account does not exist')

    it 'should throw an error if the account does not contain enough currency to fund the bid', ->
      state = new State()
      controller = new Controller(state)
      controller.createAccount('name')
      expect ->
        controller.insertBid
          account: 'name',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          price: '50',
          amount: '10'
      .to.throw('Not enough currency to fund the bid')

    it 'should throw an error if the account does not contain enough currency to fund the bid taking into account other existing bids', ->
      state = new State()
      controller = new Controller(state)
      controller.createAccount('name')
      controller.deposit
        account: 'name',
        currency: 'EUR',
        amount: '500'
      id = uuid.v1()
      controller.insertBid
        id: id
        account: 'name',
        offerCurrency: 'EUR',
        bidCurrency: 'BTC',
        price: '50',
        amount: '10'
      expect ->
        id = uuid.v1()
        controller.insertBid
          id: id
          account: 'name',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          price: '50',
          amount: '1'
      .to.throw('Not enough currency to fund the bid')

    it 'should add a bid to the correct market and associate it with the account', ->
      state = new State()
      controller = new Controller(state)
      controller.createAccount('name')
      controller.deposit
        account: 'name',
        currency: 'EUR',
        amount: '500'
      id1 = uuid.v1()
      controller.insertBid
        id: id1
        account: 'name',
        offerCurrency: 'EUR',
        bidCurrency: 'BTC',
        price: '50',
        amount: '3'
      id2 = uuid.v1()
      controller.insertBid
        id: id2
        account: 'name',
        offerCurrency: 'EUR',
        bidCurrency: 'BTC',
        price: '40',
        amount: '5'
      marketBid = state.markets['BTC']['EUR'].bids[id1]
      marketBid.price.compareTo(new Amount('50')).should.equal(0)
      marketBid.amount.compareTo(new Amount('3')).should.equal(0)
      accountBid = state.accounts['name'].currencies['EUR'].bids['BTC'][id1]
      accountBid.should.equal(marketBid)
      marketBid = state.markets['BTC']['EUR'].bids[id2]
      marketBid.price.compareTo(new Amount('40')).should.equal(0)
      marketBid.amount.compareTo(new Amount('5')).should.equal(0)
      accountBid = state.accounts['name'].currencies['EUR'].bids['BTC'][id2]
      accountBid.should.equal(marketBid)
      state.accounts['name'].currencies['EUR'].funds.compareTo(new Amount('500')).should.equal(0)
      state.accounts['name'].currencies['EUR'].reservedFunds.compareTo(new Amount('350')).should.equal(0)

  describe '#deleteBid', ->
    it 'should throw an error if the account does not exist', ->
      state = new State()
      controller = new Controller(state)
      expect ->
        controller.deleteBid
          account: 'name'
      .to.throw('Account does not exist')

    it 'should throw an error if the bid is not associated with the account', ->
      state = new State()
      controller = new Controller(state)
      controller.createAccount('name')
      controller.createAccount('someone else')
      controller.deposit
        account: 'name',
        currency: 'EUR',
        amount: '500'
      id = uuid.v1()
      controller.insertBid
        id: id
        account: 'name',
        offerCurrency: 'EUR',
        bidCurrency: 'BTC',
        price: '50',
        amount: '10'
      expect ->
        controller.deleteBid
          id: id
          account: 'someone else',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC'
      .to.throw('bid could not be located')      

    it 'should throw an error if the bid is not associated with the offer currency', ->
      state = new State()
      controller = new Controller(state)
      controller.createAccount('name')
      controller.deposit
        account: 'name',
        currency: 'EUR',
        amount: '500'
      id = uuid.v1()
      controller.insertBid
        id: id
        account: 'name',
        offerCurrency: 'EUR',
        bidCurrency: 'BTC',
        price: '50',
        amount: '10'
      expect ->
        controller.deleteBid
          id: id
          account: 'name',
          offerCurrency: 'USD',
          bidCurrency: 'BTC'
      .to.throw('bid could not be located')      

    it 'should throw an error if the bid is not associated with the bid currency', ->
      state = new State()
      controller = new Controller(state)
      controller.createAccount('name')
      controller.deposit
        account: 'name',
        currency: 'EUR',
        amount: '500'
      id = uuid.v1()
      controller.insertBid
        id: id
        account: 'name',
        offerCurrency: 'EUR',
        bidCurrency: 'BTC',
        price: '50',
        amount: '10'
      expect ->
        controller.deleteBid
          id: id
          account: 'name',
          offerCurrency: 'EUR',
          bidCurrency: 'USD'
      .to.throw('bid could not be located')

    it 'should remove the bid from the market and the account', ->
      state = new State()
      controller = new Controller(state)
      controller.createAccount('name1')
      controller.createAccount('name2')
      controller.deposit
        account: 'name1',
        currency: 'EUR',
        amount: '500'
      controller.deposit
        account: 'name2',
        currency: 'EUR',
        amount: '700'
      id1 = uuid.v1()
      controller.insertBid
        id: id1
        account: 'name1',
        offerCurrency: 'EUR',
        bidCurrency: 'BTC',
        price: '50',
        amount: '3'
      id2 = uuid.v1()
      controller.insertBid
        id: id2
        account: 'name2',
        offerCurrency: 'EUR',
        bidCurrency: 'BTC',
        price: '40',
        amount: '5'
      id3 = uuid.v1()
      controller.insertBid
        id: id3
        account: 'name1',
        offerCurrency: 'EUR',
        bidCurrency: 'BTC',
        price: '45',
        amount: '6'
      id4 = uuid.v1()
      controller.insertBid
        id: id4
        account: 'name2',
        offerCurrency: 'EUR',
        bidCurrency: 'BTC',
        price: '30',
        amount: '3'
      controller.deleteBid
        id: id1
        account: 'name1',
        offerCurrency: 'EUR',
        bidCurrency: 'BTC'
      controller.deleteBid
        id: id4
        account: 'name2',
        offerCurrency: 'EUR',
        bidCurrency: 'BTC'
      marketBid = state.markets['BTC']['EUR'].bids[id1]
      expect(marketBid).to.be.an('undefined', 'market bid id1 should have been deleted')
      accountBid = state.accounts['name1'].currencies['EUR'].bids['BTC'][id1]
      expect(accountBid).to.be.an('undefined', 'account bid id1 should have been deleted')
      marketBid = state.markets['BTC']['EUR'].bids[id2]
      marketBid.price.compareTo(new Amount('40')).should.equal(0, 'bid id2 amount should be correct')
      marketBid.amount.compareTo(new Amount('5')).should.equal(0, 'bid id2 price should be correct')
      accountBid = state.accounts['name2'].currencies['EUR'].bids['BTC'][id2]
      accountBid.should.equal(marketBid)
      marketBid = state.markets['BTC']['EUR'].bids[id3]
      marketBid.price.compareTo(new Amount('45')).should.equal(0, 'bid id3 amount should be correct')
      marketBid.amount.compareTo(new Amount('6')).should.equal(0, 'bid id3 price should be correct')
      accountBid = state.accounts['name1'].currencies['EUR'].bids['BTC'][id3]
      accountBid.should.equal(marketBid)
      marketBid = state.markets['BTC']['EUR'].bids[id4]
      expect(marketBid).to.be.an('undefined', 'market bid id4 should have been deleted')
      accountBid = state.accounts['name1'].currencies['EUR'].bids['BTC'][id4]
      expect(accountBid).to.be.an('undefined', 'account bid id4 should have been deleted')
      state.accounts['name1'].currencies['EUR'].funds.compareTo(new Amount('500')).should.equal(0, 'name1 funds should be correct')
      state.accounts['name1'].currencies['EUR'].reservedFunds.compareTo(new Amount('270')).should.equal(0, 'name1 reserved funds should be correct')
      state.accounts['name2'].currencies['EUR'].funds.compareTo(new Amount('700')).should.equal(0, 'name2 funds should be correct')
      state.accounts['name2'].currencies['EUR'].reservedFunds.compareTo(new Amount('200')).should.equal(0, 'name2 reserved funds should be correct')

  describe '#insertOffer', ->

  describe '#deleteOffer', ->

  describe '#withdraw', ->
