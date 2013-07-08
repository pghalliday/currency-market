chai = require 'chai'
chai.should()
expect = chai.expect

State = require '../../src/State'
Account = require '../../src/State/Account'
Engine = require '../../src/Engine'
Amount = require '../../src/Amount'
Operation = require '../../src/Operation'

describe 'State', ->
  beforeEach ->
    @sequence = 0
    @timestamp = 1371737390976
    @engine = new Engine
      commission:
        account: 'commission'
        calculate: (params) =>
          amount: Amount.ONE
          reference: 'Flat 1'
    @deposit = (params) =>
      @engine.apply new Operation
        reference: '550e8400-e29b-41d4-a716-446655440000'
        account: params.account
        sequence: @sequence++
        timestamp: @timestamp++
        deposit:
          currency: params.currency
          amount: new Amount params.amount
    @withdraw = (params) =>
      @engine.apply new Operation
        reference: '550e8400-e29b-41d4-a716-446655440000'
        account: params.account
        sequence: @sequence++
        timestamp: @timestamp++
        withdraw:
          currency: params.currency
          amount: new Amount params.amount
    @submitOffer = (params) =>
      @engine.apply new Operation
        reference: '550e8400-e29b-41d4-a716-446655440000'
        account: params.account
        sequence: @sequence++
        timestamp: @timestamp++
        submit:
          bidCurrency: params.bidCurrency
          offerCurrency: params.offerCurrency
          offerPrice: new Amount params.price
          offerAmount: new Amount params.amount
    @submitBid = (params) =>
      @engine.apply new Operation
        reference: '550e8400-e29b-41d4-a716-446655440000'
        account: params.account
        sequence: @sequence++
        timestamp: @timestamp++
        submit:
          bidCurrency: params.bidCurrency
          offerCurrency: params.offerCurrency
          bidPrice: new Amount params.price
          bidAmount: new Amount params.amount
    @cancel = (params) =>
      @engine.apply new Operation
        reference: '550e8400-e29b-41d4-a716-446655440000'
        account: params.account
        sequence: @sequence++
        timestamp: @timestamp++
        cancel:
          sequence: params.sequence
    @deposit
      account: 'Peter'
      currency: 'EUR'
      amount: '10000'
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
      amount: '1000'
    @submitOffer
      account: 'Peter'
      offerCurrency: 'EUR'
      bidCurrency: 'BTC'
      price: '0.04'
      amount: '5000'
    @submitOffer
      account: 'Peter'
      offerCurrency: 'EUR'
      bidCurrency: 'BTC'
      price: '0.03'
      amount: '2000'
    @submitBid
      account: 'Paul'
      offerCurrency: 'BTC'
      bidCurrency: 'EUR'
      price: '0.02'
      amount: '2500'
    @submitBid
      account: 'Paul'
      offerCurrency: 'BTC'
      bidCurrency: 'EUR'
      price: '0.01'
      amount: '1000'

    @checkState = (state) =>
      accountPeter = state.getAccount 'Peter'

      balancePeterEUR = accountPeter.getBalance 'EUR'
      balancePeterEUR.funds.compareTo(new Amount '10000').should.equal 0
      balancePeterEUR.lockedFunds.compareTo(new Amount '7000').should.equal 0

      balancePeterBTC = accountPeter.getBalance 'BTC'
      balancePeterBTC.funds.compareTo(new Amount '50').should.equal 0
      balancePeterBTC.lockedFunds.compareTo(Amount.ZERO).should.equal 0

      ordersPeter = accountPeter.orders

      orderPeter4 = ordersPeter[4]
      orderPeter4.sequence.should.equal 4
      orderPeter4.timestamp.should.equal 1371737390976 + 4
      orderPeter4.account.should.equal 'Peter'
      orderPeter4.offerCurrency.should.equal 'EUR'
      orderPeter4.bidCurrency.should.equal 'BTC'
      orderPeter4.offerPrice.compareTo(new Amount '0.04').should.equal 0
      orderPeter4.offerAmount.compareTo(new Amount '5000').should.equal 0

      orderPeter5 = ordersPeter[5]
      orderPeter5.sequence.should.equal 5
      orderPeter5.timestamp.should.equal 1371737390976 + 5
      orderPeter5.account.should.equal 'Peter'
      orderPeter5.offerCurrency.should.equal 'EUR'
      orderPeter5.bidCurrency.should.equal 'BTC'
      orderPeter5.offerPrice.compareTo(new Amount '0.03').should.equal 0
      orderPeter5.offerAmount.compareTo(new Amount '2000').should.equal 0

      accountPaul = state.getAccount 'Paul'

      balancePaulEUR = accountPaul.getBalance 'EUR'
      balancePaulEUR.funds.compareTo(new Amount '2500').should.equal 0
      balancePaulEUR.lockedFunds.compareTo(Amount.ZERO).should.equal 0

      balancePaulBTC = accountPaul.getBalance 'BTC'
      balancePaulBTC.funds.compareTo(new Amount '1000').should.equal 0
      balancePaulBTC.lockedFunds.compareTo(new Amount '60').should.equal 0

      ordersPaul = accountPaul.orders

      orderPaul6 = ordersPaul[6]
      orderPaul6.sequence.should.equal 6
      orderPaul6.timestamp.should.equal 1371737390976 + 6
      orderPaul6.account.should.equal 'Paul'
      orderPaul6.offerCurrency.should.equal 'BTC'
      orderPaul6.bidCurrency.should.equal 'EUR'
      orderPaul6.bidPrice.compareTo(new Amount '0.02').should.equal 0
      orderPaul6.bidAmount.compareTo(new Amount '2500').should.equal 0

      orderPaul7 = ordersPaul[7]
      orderPaul7.sequence.should.equal 7
      orderPaul7.timestamp.should.equal 1371737390976 + 7
      orderPaul7.account.should.equal 'Paul'
      orderPaul7.offerCurrency.should.equal 'BTC'
      orderPaul7.bidCurrency.should.equal 'EUR'
      orderPaul7.bidPrice.compareTo(new Amount '0.01').should.equal 0
      orderPaul7.bidAmount.compareTo(new Amount '1000').should.equal 0

      bookEURBTC = state.getBook
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'

      bookEURBTC[0].should.equal orderPaul6
      bookEURBTC[1].should.equal orderPaul7

      bookBTCEUR = state.getBook
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'

      bookBTCEUR[0].should.equal orderPeter5
      bookBTCEUR[1].should.equal orderPeter4

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

  describe '#getBook', ->
    it 'should error if no bid currency is supplied', ->
      state = new State()
      expect ->
        book = state.getBook
          offerCurrency: 'BTC'
      .to.throw 'Must supply a bid currency'

    it 'should error if no offer currency is supplied', ->
      state = new State()
      expect ->
        book = state.getBook
          bidCurrency: 'EUR'
      .to.throw 'Must supply an offer currency'

    it 'should create a new orders array if it does not exist', ->
      state = new State()
      book = state.getBook
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'
      book.should.have.length 0

    it 'should return the corresponding orders array if it does exist', ->
      state = new State()
      book1 = state.getBook
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'        
      book2 = state.getBook
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'        
      book2.should.equal book1

    it 'should return different arrays for different bid and offer currencies', ->
      state = new State()
      book1 = state.getBook
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'        
      book2 = state.getBook
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'        
      book2.should.not.equal book1

  it 'should instantiate from an engine state', ->
    state = new State
      json: JSON.stringify @engine
      commission:
        account: 'commission'
    @checkState state

  describe 'JSON.stringify', ->
    it 'should be possible to instantiate an identical state from an exported JSON state', ->
      state1 = state = new State
        json: JSON.stringify @engine
        commission:
          account: 'commission'
      state2 = new State
        json: JSON.stringify state1
      @checkState state2

  describe '#apply', ->
    it 'should ignore deltas with a sequence lower than expected as such a delta will have already been applied', ->
      delta = @deposit
        account: 'Peter'
        currency: 'EUR'
        amount: '5000'
      state = state = new State
        json: JSON.stringify @engine
        commission:
          account: 'commission'
      state.getAccount('Peter').getBalance('EUR').funds.compareTo(new Amount '15000').should.equal 0
      state.apply delta
      state.getAccount('Peter').getBalance('EUR').funds.compareTo(new Amount '15000').should.equal 0

    it 'should throw an error if a delta with a sequence higher than expected is applied as this will mean that it missed some', ->
      @deposit
        account: 'Peter'
        currency: 'EUR'
        amount: '5000'
      state = state = new State
        json: JSON.stringify @engine
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

    describe 'deposit delta', ->
      it 'should update the account balance accordingly', ->
        state = state = new State
          json: JSON.stringify @engine
          commission:
            account: 'commission'
        state.apply @deposit
          account: 'Peter'
          currency: 'EUR'
          amount: '100'
        state.getAccount('Peter').getBalance('EUR').funds.compareTo(new Amount '10100').should.equal 0
        state.apply @deposit
          account: 'Peter'
          currency: 'EUR'
          amount: '150'
        state.getAccount('Peter').getBalance('EUR').funds.compareTo(new Amount '10250').should.equal 0
        state.apply @deposit
          account: 'Peter'
          currency: 'EUR'
          amount: '50'
        state.getAccount('Peter').getBalance('EUR').funds.compareTo(new Amount '10300').should.equal 0

    describe 'withdraw delta', ->
      it 'should update the account balance accordingly', ->
        state = state = new State
          json: JSON.stringify @engine
          commission:
            account: 'commission'
        state.apply @withdraw
          account: 'Peter'
          currency: 'EUR'
          amount: '100'
        state.getAccount('Peter').getBalance('EUR').funds.compareTo(new Amount '9900').should.equal 0
        state.apply @withdraw
          account: 'Peter'
          currency: 'EUR'
          amount: '150'
        state.getAccount('Peter').getBalance('EUR').funds.compareTo(new Amount '9750').should.equal 0
        state.apply @withdraw
          account: 'Peter'
          currency: 'EUR'
          amount: '50'
        state.getAccount('Peter').getBalance('EUR').funds.compareTo(new Amount '9700').should.equal 0

    describe 'submit delta', ->
      it 'should update the state accordingly', ->
        state = state = new State
          json: JSON.stringify @engine
          commission:
            account: 'commission'

        # submit a bid somewhere in a book but not at the top
        state.apply @submitBid
          account: 'Paul'
          offerCurrency: 'BTC'
          bidCurrency: 'EUR'
          price: '0.005'
          amount: '1000'
        order = state.getAccount('Paul').orders[8]
        balance = state.getAccount('Paul').getBalance('BTC')
        balance.lockedFunds.compareTo(new Amount '65').should.equal 0
        order.sequence.should.equal 8
        order.timestamp.should.equal 1371737390976 + 8
        order.account.should.equal 'Paul'
        order.offerCurrency.should.equal 'BTC'
        order.bidCurrency.should.equal 'EUR'
        order.bidPrice.compareTo(new Amount '0.005').should.equal 0
        order.bidAmount.compareTo(new Amount '1000').should.equal 0
        bookEURBTC = state.getBook
          bidCurrency: 'EUR'
          offerCurrency: 'BTC'
        bookEURBTC[2].should.equal order

        # submit a bid at the top of it's book that will not match any orders from the opposing book
        state.apply @submitBid
          account: 'Paul'
          offerCurrency: 'BTC'
          bidCurrency: 'EUR'
          price: '0.025'
          amount: '500'
        order = state.getAccount('Paul').orders[9]
        balance = state.getAccount('Paul').getBalance('BTC')
        balance.lockedFunds.compareTo(new Amount '77.5').should.equal 0
        order.sequence.should.equal 9
        order.timestamp.should.equal 1371737390976 + 9
        order.account.should.equal 'Paul'
        order.offerCurrency.should.equal 'BTC'
        order.bidCurrency.should.equal 'EUR'
        order.bidPrice.compareTo(new Amount '0.025').should.equal 0
        order.bidAmount.compareTo(new Amount '500').should.equal 0
        bookEURBTC = state.getBook
          bidCurrency: 'EUR'
          offerCurrency: 'BTC'
        bookEURBTC[0].should.equal order

        # submit a bid at the top of it's book that will match 1 and a bit orders from the opposing book
        state.apply @submitBid
          account: 'Paul'
          offerCurrency: 'BTC'
          bidCurrency: 'EUR'
          price: '0.04'
          amount: '6000'

        # completed orders
        expect(state.getAccount('Paul').orders[10]).to.not.be.ok
        expect(state.getAccount('Peter').orders[5]).to.not.be.ok

        # Paul's new balances
        balance = state.getAccount('Paul').getBalance('BTC')
        balance.funds.compareTo(new Amount '780').should.equal 0
        balance.lockedFunds.compareTo(new Amount '77.5').should.equal 0
        balance = state.getAccount('Paul').getBalance('EUR')
        balance.funds.compareTo(new Amount '8498').should.equal 0
        balance.lockedFunds.compareTo(new Amount '0').should.equal 0

        # Peter's new balances
        balance = state.getAccount('Peter').getBalance('BTC')
        balance.funds.compareTo(new Amount '268').should.equal 0
        balance.lockedFunds.compareTo(new Amount '0').should.equal 0
        balance = state.getAccount('Peter').getBalance('EUR')
        balance.funds.compareTo(new Amount '4000').should.equal 0
        balance.lockedFunds.compareTo(new Amount '1000').should.equal 0

        # The new commission balances
        balance = state.getAccount('commission').getBalance('BTC')
        balance.funds.compareTo(new Amount '2').should.equal 0
        balance = state.getAccount('commission').getBalance('EUR')
        balance.funds.compareTo(new Amount '2').should.equal 0

        # The remainder of the order that was partially complete
        order = state.getAccount('Peter').orders[4]
        order.offerAmount.compareTo(new Amount '1000').should.equal 0

        # the state of the books
        bookEURBTC = state.getBook
          bidCurrency: 'EUR'
          offerCurrency: 'BTC'

        bookEURBTC.should.have.length 4
        bookEURBTC[0].should.equal state.getAccount('Paul').orders[9]

        bookBTCEUR = state.getBook
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'

        bookBTCEUR.should.have.length 1
        bookBTCEUR[0].should.equal order

    describe 'cancel delta', ->
      it 'should update the state accordingly', ->
        state = state = new State
          json: JSON.stringify @engine
          commission:
            account: 'commission'
        state.apply @cancel
          account: 'Peter'
          sequence: 4
        expect(state.getAccount('Peter').orders[4]).to.not.be.ok
        balance = state.getAccount('Peter').getBalance('EUR')
        balance.lockedFunds.compareTo(new Amount '2000').should.equal 0
        bookBTCEUR = state.getBook
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
        bookBTCEUR.should.have.length 1
        bookBTCEUR[0].should.equal state.getAccount('Peter').orders[5]
        state.apply @cancel
          account: 'Paul'
          sequence: 6
        expect(state.getAccount('Paul').orders[6]).to.not.be.ok
        balance = state.getAccount('Paul').getBalance('BTC')
        balance.lockedFunds.compareTo(new Amount '10').should.equal 0
        bookEURBTC = state.getBook
          bidCurrency: 'EUR'
          offerCurrency: 'BTC'
        bookEURBTC.should.have.length 1
        bookEURBTC[0].should.equal state.getAccount('Paul').orders[7]
