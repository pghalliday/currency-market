chai = require 'chai'
chai.should()
expect = chai.expect
assert = chai.assert
sinon = require 'sinon'
sinonChai = require 'sinon-chai'
chai.use sinonChai

Order = require('../src/Order')
Amount = require('../src/Amount')

amountPoint01 = new Amount '0.01'
amountPoint2 = new Amount '0.2'
amountPoint25 = new Amount '0.25'
amountPoint5 = new Amount '0.5'
amount1 = new Amount '1'
amount2 = new Amount '2'
amount3 = new Amount '3'
amount4 = new Amount '4'
amount5 = new Amount '5'
amount6 = new Amount '6'
amount7 = new Amount '7'
amount8 = new Amount '8'
amount25 = new Amount '25'
amount48Point5 = new Amount '48.5'
amount48Point75 = new Amount '48.75'
amount49 = new Amount '49'
amount49Point5 = new Amount '49.5'
amount49Point75 = new Amount '49.75'
amount50 = new Amount '50'
amount50Point5 = new Amount '50.5'
amount50Point75 = new Amount '50.75'
amount51 = new Amount '51'
amount52 = new Amount '52'
amount53 = new Amount '53'
amount75 = new Amount '75'
amount60 = new Amount '60'
amount99 = new Amount '99'
amount100 = new Amount '100'
amount101 = new Amount '101'
amount125 = new Amount '125'
amount150 = new Amount '150'
amount200 = new Amount '200'
amount300 = new Amount '300'
amount400 = new Amount '400'
amount500 = new Amount '500'
amount1000 = new Amount '1000'
amount1500 = new Amount '1500'
amount5000 = new Amount '5000'
amount7500 = new Amount '7500'

amountMinus50 = new Amount '-50'
amountMinus100 = new Amount '-100'

newBidOrder = (bidPrice, id) ->
  new Order
    id: id || '1'
    timestamp: '1'
    account: 'Peter'
    bidCurrency: 'EUR'
    offerCurrency: 'BTC'
    bidPrice: bidPrice
    bidAmount: amount200

newOfferOrder = (offerPrice, id) ->
  new Order
    id: id || '1'
    timestamp: '1'
    account: 'Peter'
    bidCurrency: 'EUR'
    offerCurrency: 'BTC'
    offerPrice: offerPrice
    offerAmount: amount200

describe 'Order', ->
  it 'should throw an error if the ID is missing', ->
    expect ->
      order = new Order
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount50
    .to.throw('Order must have an ID')

  it 'should throw an error if the timestamp is missing', ->
    expect ->
      order = new Order
        id: '123456789'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount50
    .to.throw('Order must have a time stamp')

  it 'should throw an error if the account id is missing', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount50
    .to.throw('Order must be associated with an account')

  it 'should throw an error if the bid currency is missing', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount50
    .to.throw('Order must be associated with a bid currency')

  it 'should throw an error if the offer currency is missing', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        bidPrice: amount100
        bidAmount: amount50
    .to.throw('Order must be associated with an offer currency')

  it 'should throw an error if only a bid price is given as it is not enough information to calculate the other fields a bid', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
    .to.throw('Must specify either bid amount and price or offer amount and price')

  it 'should throw an error if only an offer price is given as it is not enough information to calculate the other fields a bid', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount100
    .to.throw('Must specify either bid amount and price or offer amount and price')

  it 'should throw an error if only a bid amount is given as it is not enough information to calculate the other fields a bid', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidAmount: amount100
    .to.throw('Must specify either bid amount and price or offer amount and price')

  it 'should throw an error if only a offer amount is given as it is not enough information to calculate the other fields a bid', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerAmount: amount100
    .to.throw('Must specify either bid amount and price or offer amount and price')

  it 'should throw an error if both the bid price and offer price are given as we do not want to trust the calculations of others', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        offerPrice: amount50
        bidAmount: amount50
    .to.throw('Must specify either bid amount and price or offer amount and price')

  it 'should throw an error if the bid price, offer amount and bid amount are given as we do not want to trust the calculations of others', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        offerAmount: amount60
        bidAmount: amount50
    .to.throw('Must specify either bid amount and price or offer amount and price')

  it 'should throw an error if the offer price, offer amount and bid amount are given as we do not want to trust the calculations of others', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amount60
        bidAmount: amount50
    .to.throw('Must specify either bid amount and price or offer amount and price')

  it 'should throw an error if only amounts are specified as we need to know which amount to satisfy if the order is excuted at a better price', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidAmount: amount100
        offerAmount: amount50
    .to.throw('Must specify either bid amount and price or offer amount and price')

  it 'should throw an error if a bid amount and offer price are specified as we need to know which amount to satisfy if the order is excuted at a better price', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidAmount: amount100
        offerPrice: amount50
    .to.throw('Must specify either bid amount and price or offer amount and price')

  it 'should throw an error if an offer amount and bid price are specified as we need to know which amount to satisfy if the order is excuted at a better price', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerAmount: amount100
        bidPrice: amount50
    .to.throw('Must specify either bid amount and price or offer amount and price')

  it 'should throw an error if the bid amount is negative', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amountMinus50
    .to.throw('bid amount cannot be negative')

  it 'should throw an error if the bid price is negative', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amountMinus100
        bidAmount: amount50
    .to.throw('bid price cannot be negative')

  it 'should throw an error if the offer amount is negative', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amountMinus50
    .to.throw('offer amount cannot be negative')

  it 'should throw an error if the offer price is negative', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountMinus100
        offerAmount: amount50
    .to.throw('offer price cannot be negative')

  it 'should record the id, timestamp, account name, bid currency and offer currency', ->
    order = new Order
      id: '123456789'
      timestamp: '987654321'
      account: 'name'
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
      bidPrice: amount100
      bidAmount: amount50
    order.id.should.equal '123456789'
    order.timestamp.should.equal '987654321'
    order.account.should.equal 'name'
    order.bidCurrency.should.equal 'BTC'
    order.offerCurrency.should.equal 'EUR'

  it 'should instantiate with an undefined parent, lower and higher orders, bid price and bid amount calculating the offer amount', ->
    order = new Order
      id: '123456789'
      timestamp: '987654321'
      account: 'name'
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
      bidPrice: amount100
      bidAmount: amount50
    order.bidPrice.compareTo(amount100).should.equal 0
    order.bidAmount.compareTo(amount50).should.equal 0
    order.offerAmount.compareTo(amount5000).should.equal 0
    expect(order.parent).to.not.be.ok
    expect(order.lower).to.not.be.ok
    expect(order.higher).to.not.be.ok

  it 'should instantiate with an undefined parent, lower and higher orders, offer price and offer amount calculating the bid amount', ->
    order = new Order
      id: '123456789'
      timestamp: '987654321'
      account: 'name'
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
      offerPrice: amount100
      offerAmount: amount50
    order.offerPrice.compareTo(amount100).should.equal 0
    order.bidAmount.compareTo(amount5000).should.equal 0
    order.offerAmount.compareTo(amount50).should.equal 0
    expect(order.parent).to.not.be.ok
    expect(order.lower).to.not.be.ok
    expect(order.higher).to.not.be.ok

  describe '#match', ->
    describe 'where the existing (right) order is an offer', ->
      beforeEach ->
        @order = new Order
          id: '1'
          timestamp: '1'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amountPoint2   # 5
          offerAmount: amount1000 # 200
        @doneSpy = sinon.spy()
        @order.on 'done', @doneSpy
        @fillSpy = sinon.spy()
        @order.on 'fill', @fillSpy
        @tradeSpy = sinon.spy()
        @order.on 'trade', @tradeSpy

      describe 'and the new (left) price is same', ->
        describe 'and the left order is a bid', ->
          describe 'and the right order is offering exactly the amount the left order is bidding', ->
              it 'should trade the amount the right order is offering, emit fill events and a trade event and return false to indicate that no higher trades can be filled by the left order', ->
                order = new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: amountPoint2
                  bidAmount: amount1000
                doneSpy = sinon.spy()
                order.on 'done', doneSpy
                fillSpy = sinon.spy()
                order.on 'fill', fillSpy
                tradeSpy = sinon.spy()
                order.on 'trade', tradeSpy

                order.match(@order).should.be.false

                doneSpy.should.have.been.calledOnce
                @doneSpy.should.have.been.calledOnce

                fillSpy.should.have.been.calledOnce
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal 0
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal 0
                order.offerAmount.compareTo(Amount.ZERO).should.equal 0
                order.bidAmount.compareTo(Amount.ZERO).should.equal 0

                @fillSpy.should.have.been.calledOnce
                @fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal 0
                @fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal 0
                @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
                @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

                tradeSpy.should.not.have.been.called
                @tradeSpy.should.have.been.calledOnce
                @tradeSpy.firstCall.args[0].bid.should.equal order
                @tradeSpy.firstCall.args[0].offer.should.equal @order
                @tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
                @tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal 0

          describe 'and the right order is offering more than the left order is bidding', ->
              it 'should trade the amount the left order is offering, emit fill events and a trade event and return false to indicate that higher trades may still be filled by the left order', ->
                order = new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: amountPoint2
                  bidAmount: amount500
                doneSpy = sinon.spy()
                order.on 'done', doneSpy
                fillSpy = sinon.spy()
                order.on 'fill', fillSpy
                tradeSpy = sinon.spy()
                order.on 'trade', tradeSpy
                
                order.match(@order).should.be.false

                doneSpy.should.have.been.calledOnce
                @doneSpy.should.not.have.been.called

                fillSpy.should.have.been.calledOnce
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount100).should.equal 0
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount500).should.equal 0
                order.offerAmount.compareTo(Amount.ZERO).should.equal 0
                order.bidAmount.compareTo(Amount.ZERO).should.equal 0

                @fillSpy.should.have.been.calledOnce
                @fillSpy.firstCall.args[0].bidAmount.compareTo(amount100).should.equal 0
                @fillSpy.firstCall.args[0].offerAmount.compareTo(amount500).should.equal 0
                @order.bidAmount.compareTo(amount100).should.equal 0
                @order.offerAmount.compareTo(amount500).should.equal 0

                tradeSpy.should.not.have.been.called
                @tradeSpy.should.have.been.calledOnce
                @tradeSpy.firstCall.args[0].bid.should.equal order
                @tradeSpy.firstCall.args[0].offer.should.equal @order
                @tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
                @tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal 0

          describe 'and the right order is offering less than the left order is bidding', ->
              it 'should trade the amount the right order is offering, emit fill events and a trade event and return true', ->
                order = new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  bidPrice: amountPoint2
                  bidAmount: amount1500
                doneSpy = sinon.spy()
                order.on 'done', doneSpy
                fillSpy = sinon.spy()
                order.on 'fill', fillSpy
                tradeSpy = sinon.spy()
                order.on 'trade', tradeSpy
                
                order.match(@order).should.be.true

                doneSpy.should.not.have.been.called
                @doneSpy.should.have.been.calledOnce

                fillSpy.should.have.been.calledOnce
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal 0
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal 0
                order.offerAmount.compareTo(amount100).should.equal 0
                order.bidAmount.compareTo(amount500).should.equal 0

                @fillSpy.should.have.been.calledOnce
                @fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal 0
                @fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal 0
                @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
                @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

                tradeSpy.should.not.have.been.called
                @tradeSpy.should.have.been.calledOnce
                @tradeSpy.firstCall.args[0].bid.should.equal order
                @tradeSpy.firstCall.args[0].offer.should.equal @order
                @tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
                @tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal 0

        describe 'and the left order is an offer', ->
          describe 'and the right order is offering exactly the amount the left order is offering', ->
              it 'should trade the amount the right order is offering, emit a fill events and a trade event and return false', ->
                order = new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: amount5
                  offerAmount: amount200
                doneSpy = sinon.spy()
                order.on 'done', doneSpy
                fillSpy = sinon.spy()
                order.on 'fill', fillSpy
                tradeSpy = sinon.spy()
                order.on 'trade', tradeSpy
                
                order.match(@order).should.be.false

                doneSpy.should.have.been.calledOnce
                @doneSpy.should.have.been.calledOnce

                fillSpy.should.have.been.calledOnce
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal 0
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal 0
                order.offerAmount.compareTo(Amount.ZERO).should.equal 0
                order.bidAmount.compareTo(Amount.ZERO).should.equal 0

                @fillSpy.should.have.been.calledOnce
                @fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal 0
                @fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal 0
                @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
                @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

                tradeSpy.should.not.have.been.called
                @tradeSpy.should.have.been.calledOnce
                @tradeSpy.firstCall.args[0].bid.should.equal order
                @tradeSpy.firstCall.args[0].offer.should.equal @order
                @tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
                @tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal 0

          describe 'and the right order is offering more than the left order is offering', ->
              it 'should trade the amount the left order is offering, emit a fill events and a trade event and return false', ->
                order = new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: amount5
                  offerAmount: amount100
                doneSpy = sinon.spy()
                order.on 'done', doneSpy
                fillSpy = sinon.spy()
                order.on 'fill', fillSpy
                tradeSpy = sinon.spy()
                order.on 'trade', tradeSpy
                
                order.match(@order).should.be.false

                doneSpy.should.have.been.calledOnce
                @doneSpy.should.not.have.been.called

                fillSpy.should.have.been.calledOnce
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount100).should.equal 0
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount500).should.equal 0
                order.offerAmount.compareTo(Amount.ZERO).should.equal 0
                order.bidAmount.compareTo(Amount.ZERO).should.equal 0

                @fillSpy.should.have.been.calledOnce
                @fillSpy.firstCall.args[0].bidAmount.compareTo(amount100).should.equal 0
                @fillSpy.firstCall.args[0].offerAmount.compareTo(amount500).should.equal 0
                @order.bidAmount.compareTo(amount100).should.equal 0
                @order.offerAmount.compareTo(amount500).should.equal 0

                tradeSpy.should.not.have.been.called
                @tradeSpy.should.have.been.calledOnce
                @tradeSpy.firstCall.args[0].bid.should.equal order
                @tradeSpy.firstCall.args[0].offer.should.equal @order
                @tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
                @tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal 0

          describe 'and the right order is offering less than the left order is offering', ->
              it 'should trade the amount the right order is offering, emit fill events and a trade event and return true', ->
                order = new Order
                  id: '2'
                  timestamp: '2'
                  account: 'Paul'
                  bidCurrency: 'EUR'
                  offerCurrency: 'BTC'
                  offerPrice: amount5
                  offerAmount: amount300
                doneSpy = sinon.spy()
                order.on 'done', doneSpy
                fillSpy = sinon.spy()
                order.on 'fill', fillSpy
                tradeSpy = sinon.spy()
                order.on 'trade', tradeSpy
                
                order.match(@order).should.be.true

                doneSpy.should.not.have.been.called
                @doneSpy.should.have.been.calledOnce

                fillSpy.should.have.been.calledOnce
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal 0
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal 0
                order.offerAmount.compareTo(amount100).should.equal 0
                order.bidAmount.compareTo(amount500).should.equal 0

                @fillSpy.should.have.been.calledOnce
                @fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal 0
                @fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal 0
                @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
                @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

                tradeSpy.should.not.have.been.called
                @tradeSpy.should.have.been.calledOnce
                @tradeSpy.firstCall.args[0].bid.should.equal order
                @tradeSpy.firstCall.args[0].offer.should.equal @order
                @tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
                @tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal 0

      describe 'and the new (left) price is the better', ->
        describe 'and the left order is an offer', ->              
          describe 'and the right order is offering exactly the amount that the left order is offering multiplied by the right order price', ->
            it 'should trade the amount the right order is offering at the right order price, emit fill events and a trade event and return false', ->
              order = new Order
                id: '2'
                timestamp: '2'
                account: 'Paul'
                bidCurrency: 'EUR'
                offerCurrency: 'BTC'
                offerPrice: amount4
                offerAmount: amount200
              doneSpy = sinon.spy()
              order.on 'done', doneSpy
              fillSpy = sinon.spy()
              order.on 'fill', fillSpy
              tradeSpy = sinon.spy()
              order.on 'trade', tradeSpy
              
              order.match(@order).should.be.false

              doneSpy.should.have.been.calledOnce
              @doneSpy.should.have.been.calledOnce

              fillSpy.should.have.been.calledOnce
              fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal 0
              fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal 0
              order.offerAmount.compareTo(Amount.ZERO).should.equal 0
              order.bidAmount.compareTo(Amount.ZERO).should.equal 0

              @fillSpy.should.have.been.calledOnce
              @fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal 0
              @fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal 0
              @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
              @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

              tradeSpy.should.not.have.been.called
              @tradeSpy.should.have.been.calledOnce
              @tradeSpy.firstCall.args[0].bid.should.equal order
              @tradeSpy.firstCall.args[0].offer.should.equal @order
              @tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
              @tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal 0

          describe 'and the right order is offering more than the left order is offering multiplied by the right order price', ->
            it 'should trade the amount the left order is offering at the right order price, emit fill events and a trade event and return false', ->
              order = new Order
                id: '2'
                timestamp: '2'
                account: 'Paul'
                bidCurrency: 'EUR'
                offerCurrency: 'BTC'
                offerPrice: amount4
                offerAmount: amount100
              doneSpy = sinon.spy()
              order.on 'done', doneSpy
              fillSpy = sinon.spy()
              order.on 'fill', fillSpy
              tradeSpy = sinon.spy()
              order.on 'trade', tradeSpy
              
              order.match(@order).should.be.false

              doneSpy.should.have.been.calledOnce
              @doneSpy.should.not.have.been.called

              fillSpy.should.have.been.calledOnce
              fillSpy.firstCall.args[0].offerAmount.compareTo(amount100).should.equal 0
              fillSpy.firstCall.args[0].bidAmount.compareTo(amount500).should.equal 0
              order.offerAmount.compareTo(Amount.ZERO).should.equal 0
              order.bidAmount.compareTo(Amount.ZERO).should.equal 0

              @fillSpy.should.have.been.calledOnce
              @fillSpy.firstCall.args[0].bidAmount.compareTo(amount100).should.equal 0
              @fillSpy.firstCall.args[0].offerAmount.compareTo(amount500).should.equal 0
              @order.bidAmount.compareTo(amount100).should.equal 0
              @order.offerAmount.compareTo(amount500).should.equal 0

              tradeSpy.should.not.have.been.called
              @tradeSpy.should.have.been.calledOnce
              @tradeSpy.firstCall.args[0].bid.should.equal order
              @tradeSpy.firstCall.args[0].offer.should.equal @order
              @tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
              @tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal 0

          describe 'and the right order is offering less than the left order is offering multiplied by the right order price', ->
            it 'should trade the amount the right order is offering at the right order price, emit fill events and a trade event and return true', ->
              order = new Order
                id: '2'
                timestamp: '2'
                account: 'Paul'
                bidCurrency: 'EUR'
                offerCurrency: 'BTC'
                offerPrice: amount4
                offerAmount: amount300
              doneSpy = sinon.spy()
              order.on 'done', doneSpy
              fillSpy = sinon.spy()
              order.on 'fill', fillSpy
              tradeSpy = sinon.spy()
              order.on 'trade', tradeSpy
              
              order.match(@order).should.be.true

              doneSpy.should.not.have.been.called
              @doneSpy.should.have.been.calledOnce

              fillSpy.should.have.been.calledOnce
              fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal 0
              fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal 0
              order.offerAmount.compareTo(amount100).should.equal 0
              order.bidAmount.compareTo(amount400).should.equal 0

              @fillSpy.should.have.been.calledOnce
              @fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal 0
              @fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal 0
              @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
              @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

              tradeSpy.should.not.have.been.called
              @tradeSpy.should.have.been.calledOnce
              @tradeSpy.firstCall.args[0].bid.should.equal order
              @tradeSpy.firstCall.args[0].offer.should.equal @order
              @tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
              @tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal 0

        describe 'and the left order is a bid', ->
          describe 'and the right order is offering exactly the amount that the left order is bidding', ->
            it 'should trade the amount the right order is offering at the right order price, emit fill events and a trade event and retrun false', ->
              order = new Order
                id: '2'
                timestamp: '2'
                account: 'Paul'
                bidCurrency: 'EUR'
                offerCurrency: 'BTC'
                bidPrice: amountPoint25
                bidAmount: amount1000
              doneSpy = sinon.spy()
              order.on 'done', doneSpy
              fillSpy = sinon.spy()
              order.on 'fill', fillSpy
              tradeSpy = sinon.spy()
              order.on 'trade', tradeSpy
              
              order.match(@order).should.be.false

              doneSpy.should.have.been.calledOnce
              @doneSpy.should.have.been.calledOnce

              fillSpy.should.have.been.calledOnce
              fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal 0
              fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal 0
              order.offerAmount.compareTo(Amount.ZERO).should.equal 0
              order.bidAmount.compareTo(Amount.ZERO).should.equal 0

              @fillSpy.should.have.been.calledOnce
              @fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal 0
              @fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal 0
              @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
              @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

              tradeSpy.should.not.have.been.called
              @tradeSpy.should.have.been.calledOnce
              @tradeSpy.firstCall.args[0].bid.should.equal order
              @tradeSpy.firstCall.args[0].offer.should.equal @order
              @tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
              @tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal 0
              
          describe 'and the right order is offering more than the left order is bidding', ->
            it 'should trade the amount the left order is bidding at the right order price, emit fill events and a trade event and return false', ->
              order = new Order
                id: '2'
                timestamp: '2'
                account: 'Paul'
                bidCurrency: 'EUR'
                offerCurrency: 'BTC'
                bidPrice: amountPoint25
                bidAmount: amount500
              doneSpy = sinon.spy()
              order.on 'done', doneSpy
              fillSpy = sinon.spy()
              order.on 'fill', fillSpy
              tradeSpy = sinon.spy()
              order.on 'trade', tradeSpy
              
              order.match(@order).should.be.false

              doneSpy.should.have.been.calledOnce
              @doneSpy.should.not.have.been.called

              fillSpy.should.have.been.calledOnce
              fillSpy.firstCall.args[0].offerAmount.compareTo(amount100).should.equal 0
              fillSpy.firstCall.args[0].bidAmount.compareTo(amount500).should.equal 0
              order.offerAmount.compareTo(Amount.ZERO).should.equal 0
              order.bidAmount.compareTo(Amount.ZERO).should.equal 0

              @fillSpy.should.have.been.calledOnce
              @fillSpy.firstCall.args[0].bidAmount.compareTo(amount100).should.equal 0
              @fillSpy.firstCall.args[0].offerAmount.compareTo(amount500).should.equal 0
              @order.bidAmount.compareTo(amount100).should.equal 0
              @order.offerAmount.compareTo(amount500).should.equal 0

              tradeSpy.should.not.have.been.called
              @tradeSpy.should.have.been.calledOnce
              @tradeSpy.firstCall.args[0].bid.should.equal order
              @tradeSpy.firstCall.args[0].offer.should.equal @order
              @tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
              @tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal 0

          describe 'and the right order is offering less than the left order is bidding', ->
            it 'should trade the amount the right order is offering at the right order price, emit fill events and a trade event and return true', ->
              order = new Order
                id: '2'
                timestamp: '2'
                account: 'Paul'
                bidCurrency: 'EUR'
                offerCurrency: 'BTC'
                bidPrice: amountPoint25
                bidAmount: amount1500
              doneSpy = sinon.spy()
              order.on 'done', doneSpy
              fillSpy = sinon.spy()
              order.on 'fill', fillSpy
              tradeSpy = sinon.spy()
              order.on 'trade', tradeSpy
              
              order.match(@order).should.be.true

              doneSpy.should.not.have.been.called
              @doneSpy.should.have.been.calledOnce

              fillSpy.should.have.been.calledOnce
              fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal 0
              fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal 0
              order.offerAmount.compareTo(amount125).should.equal 0
              order.bidAmount.compareTo(amount500).should.equal 0

              @fillSpy.should.have.been.calledOnce
              @fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal 0
              @fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal 0
              @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
              @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

              tradeSpy.should.not.have.been.called
              @tradeSpy.should.have.been.calledOnce
              @tradeSpy.firstCall.args[0].bid.should.equal order
              @tradeSpy.firstCall.args[0].offer.should.equal @order
              @tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal 0
              @tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal 0
            
    describe 'where the existing (right) order is a bid', ->
      beforeEach ->
        @order = new Order
          id: '1'
          timestamp: '1'
          account: 'Peter'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          bidPrice: amount5     # 0.2
          bidAmount: amount200  # 1000
        @doneSpy = sinon.spy()
        @order.on 'done', @doneSpy
        @fillSpy = sinon.spy()
        @order.on 'fill', @fillSpy
        @tradeSpy = sinon.spy()
        @order.on 'trade', @tradeSpy

      describe 'and the new (left) price is better', ->
        describe 'and the left order is an offer', ->
          describe 'and the right order is bidding exactly the amount that the left order is offering', ->
            it 'should trade the amount the right order is bidding at the right order price, emit fill events and a trade event and return false', ->
              order = new Order
                id: '2'
                timestamp: '2'
                account: 'Paul'
                bidCurrency: 'EUR'
                offerCurrency: 'BTC'
                offerPrice: amount4
                offerAmount: amount200
              doneSpy = sinon.spy()
              order.on 'done', doneSpy
              fillSpy = sinon.spy()
              order.on 'fill', fillSpy
              tradeSpy = sinon.spy()
              order.on 'trade', tradeSpy
              
              order.match(@order).should.be.false

              doneSpy.should.have.been.calledOnce
              @doneSpy.should.have.been.calledOnce

              fillSpy.should.have.been.calledOnce
              fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal 0
              fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal 0
              order.offerAmount.compareTo(Amount.ZERO).should.equal 0
              order.bidAmount.compareTo(Amount.ZERO).should.equal 0

              @fillSpy.should.have.been.calledOnce
              @fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal 0
              @fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal 0
              @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
              @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

              tradeSpy.should.not.have.been.called
              @tradeSpy.should.have.been.calledOnce
              @tradeSpy.firstCall.args[0].bid.should.equal @order
              @tradeSpy.firstCall.args[0].offer.should.equal order
              @tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal 0
              @tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal 0

          describe 'and the right order is bidding more than the left order is offering', ->
            it 'should trade the amount the left order is offering at the right order price, emit fill events and a trade event and return false', ->
              order = new Order
                id: '2'
                timestamp: '2'
                account: 'Paul'
                bidCurrency: 'EUR'
                offerCurrency: 'BTC'
                offerPrice: amount4
                offerAmount: amount100
              doneSpy = sinon.spy()
              order.on 'done', doneSpy
              fillSpy = sinon.spy()
              order.on 'fill', fillSpy
              tradeSpy = sinon.spy()
              order.on 'trade', tradeSpy
              
              order.match(@order).should.be.false

              doneSpy.should.have.been.calledOnce
              @doneSpy.should.not.have.been.called

              fillSpy.should.have.been.calledOnce
              fillSpy.firstCall.args[0].offerAmount.compareTo(amount100).should.equal 0
              fillSpy.firstCall.args[0].bidAmount.compareTo(amount500).should.equal 0
              order.offerAmount.compareTo(Amount.ZERO).should.equal 0
              order.bidAmount.compareTo(Amount.ZERO).should.equal 0

              @fillSpy.should.have.been.calledOnce
              @fillSpy.firstCall.args[0].bidAmount.compareTo(amount100).should.equal 0
              @fillSpy.firstCall.args[0].offerAmount.compareTo(amount500).should.equal 0
              @order.bidAmount.compareTo(amount100).should.equal 0
              @order.offerAmount.compareTo(amount500).should.equal 0

              tradeSpy.should.not.have.been.called
              @tradeSpy.should.have.been.calledOnce
              @tradeSpy.firstCall.args[0].bid.should.equal @order
              @tradeSpy.firstCall.args[0].offer.should.equal order
              @tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal 0
              @tradeSpy.firstCall.args[0].amount.compareTo(amount100).should.equal 0

          describe 'and the right order is bidding less than the left order is offering', ->
            it 'should trade the amount the right order is bidding at the right order price, emit fill events and a trade event and return true', ->
              order = new Order
                id: '2'
                timestamp: '2'
                account: 'Paul'
                bidCurrency: 'EUR'
                offerCurrency: 'BTC'
                offerPrice: amount4
                offerAmount: amount300
              doneSpy = sinon.spy()
              order.on 'done', doneSpy
              fillSpy = sinon.spy()
              order.on 'fill', fillSpy
              tradeSpy = sinon.spy()
              order.on 'trade', tradeSpy
              
              order.match(@order).should.be.true

              doneSpy.should.not.have.been.called
              @doneSpy.should.have.been.calledOnce

              fillSpy.should.have.been.calledOnce
              fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal 0
              fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal 0
              order.offerAmount.compareTo(amount100).should.equal 0
              order.bidAmount.compareTo(amount400).should.equal 0

              @fillSpy.should.have.been.calledOnce
              @fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal 0
              @fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal 0
              @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
              @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

              tradeSpy.should.not.have.been.called
              @tradeSpy.should.have.been.calledOnce
              @tradeSpy.firstCall.args[0].bid.should.equal @order
              @tradeSpy.firstCall.args[0].offer.should.equal order
              @tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal 0
              @tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal 0

        describe 'and the left order is a bid', ->
          describe 'and the right order is bidding exactly the amount that the left order is bidding multiplied by the right order price', ->
            it 'should trade the amount the right order is bidding at the right order price, emit fill events and a trade event and return false', ->
              order = new Order
                id: '2'
                timestamp: '2'
                account: 'Paul'
                bidCurrency: 'EUR'
                offerCurrency: 'BTC'
                bidPrice: amountPoint25
                bidAmount: amount1000
              doneSpy = sinon.spy()
              order.on 'done', doneSpy
              fillSpy = sinon.spy()
              order.on 'fill', fillSpy
              tradeSpy = sinon.spy()
              order.on 'trade', tradeSpy
              
              order.match(@order).should.be.false

              doneSpy.should.have.been.calledOnce
              @doneSpy.should.have.been.calledOnce

              fillSpy.should.have.been.calledOnce
              fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal 0
              fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal 0
              order.offerAmount.compareTo(Amount.ZERO).should.equal 0
              order.bidAmount.compareTo(Amount.ZERO).should.equal 0

              @fillSpy.should.have.been.calledOnce
              @fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal 0
              @fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal 0
              @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
              @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

              tradeSpy.should.not.have.been.called
              @tradeSpy.should.have.been.calledOnce
              @tradeSpy.firstCall.args[0].bid.should.equal @order
              @tradeSpy.firstCall.args[0].offer.should.equal order
              @tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal 0
              @tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal 0

          describe 'and the right order is bidding more than the left order is bidding multiplied by the right order price', ->
            it 'should trade the amount the left order is bidding at the right order price, emit fill events and a trade event and return false', ->
              order = new Order
                id: '2'
                timestamp: '2'
                account: 'Paul'
                bidCurrency: 'EUR'
                offerCurrency: 'BTC'
                bidPrice: amountPoint25
                bidAmount: amount500
              doneSpy = sinon.spy()
              order.on 'done', doneSpy
              fillSpy = sinon.spy()
              order.on 'fill', fillSpy
              tradeSpy = sinon.spy()
              order.on 'trade', tradeSpy
              
              order.match(@order).should.be.false

              doneSpy.should.have.been.calledOnce
              @doneSpy.should.not.have.been.called

              fillSpy.should.have.been.calledOnce
              fillSpy.firstCall.args[0].offerAmount.compareTo(amount100).should.equal 0
              fillSpy.firstCall.args[0].bidAmount.compareTo(amount500).should.equal 0
              order.offerAmount.compareTo(Amount.ZERO).should.equal 0
              order.bidAmount.compareTo(Amount.ZERO).should.equal 0

              @fillSpy.should.have.been.calledOnce
              @fillSpy.firstCall.args[0].bidAmount.compareTo(amount100).should.equal 0
              @fillSpy.firstCall.args[0].offerAmount.compareTo(amount500).should.equal 0
              @order.bidAmount.compareTo(amount100).should.equal 0
              @order.offerAmount.compareTo(amount500).should.equal 0

              tradeSpy.should.not.have.been.called
              @tradeSpy.should.have.been.calledOnce
              @tradeSpy.firstCall.args[0].bid.should.equal @order
              @tradeSpy.firstCall.args[0].offer.should.equal order
              @tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal 0
              @tradeSpy.firstCall.args[0].amount.compareTo(amount100).should.equal 0
              
          describe 'and the right order is bidding less than the left order is bidding multiplied by the right order price', ->
            it 'should trade the amount the right order is bidding at the right order price, emit fill events and a trade event and return true', ->
              order = new Order
                id: '2'
                timestamp: '2'
                account: 'Paul'
                bidCurrency: 'EUR'
                offerCurrency: 'BTC'
                bidPrice: amountPoint25
                bidAmount: amount1500
              doneSpy = sinon.spy()
              order.on 'done', doneSpy
              fillSpy = sinon.spy()
              order.on 'fill', fillSpy
              tradeSpy = sinon.spy()
              order.on 'trade', tradeSpy
              
              order.match(@order).should.be.true

              doneSpy.should.not.have.been.called
              @doneSpy.should.have.been.calledOnce

              fillSpy.should.have.been.calledOnce
              fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal 0
              fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal 0
              order.offerAmount.compareTo(amount125).should.equal 0
              order.bidAmount.compareTo(amount500).should.equal 0

              @fillSpy.should.have.been.calledOnce
              @fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal 0
              @fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal 0
              @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
              @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

              tradeSpy.should.not.have.been.called
              @tradeSpy.should.have.been.calledOnce
              @tradeSpy.firstCall.args[0].bid.should.equal @order
              @tradeSpy.firstCall.args[0].offer.should.equal order
              @tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal 0
              @tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal 0

  describe '#add', ->
    beforeEach ->
      @bidOrder = newBidOrder amountPoint2
      @higherBidOrder = newBidOrder amount1
      @evenHigherBidOrder = newBidOrder amount2
      @equalBidOrder = newBidOrder amountPoint2
      @secondEqualBidOrder = newBidOrder amountPoint2
      @offerOrder = newOfferOrder amount5
      @higherOfferOrder = newOfferOrder amount1
      @evenHigherOfferOrder = newOfferOrder amountPoint5
      @equalOfferOrder = newOfferOrder amount5
      @secondEqualOfferOrder = newOfferOrder amount5

    describe 'only bids', ->
      describe 'on a book entry with no lower or higher orders', ->
        describe 'an entry with a higher bid price', ->
          it 'should set the higher entry to the Order being added and set the parent on the added Order', ->
            @bidOrder.add @higherBidOrder
            expect(@bidOrder.parent).to.not.be.ok
            expect(@bidOrder.lower).to.not.be.ok
            @bidOrder.higher.should.equal @higherBidOrder
            @higherBidOrder.parent.should.equal @bidOrder
            expect(@higherBidOrder.lower).to.not.be.ok
            expect(@higherBidOrder.higher).to.not.be.ok

        describe 'an entry with the same or lower bid price', ->
          it 'should set the lower entry to the Order being added and set the parent on the added Order', ->
            @bidOrder.add @equalBidOrder
            expect(@bidOrder.parent).to.not.be.ok
            @bidOrder.lower.should.equal @equalBidOrder
            expect(@bidOrder.higher).to.not.be.ok
            @equalBidOrder.parent.should.equal @bidOrder
            expect(@equalBidOrder.lower).to.not.be.ok
            expect(@equalBidOrder.higher).to.not.be.ok

      describe 'on a book entry with both higher and lower orders', ->
        beforeEach ->
          @bidOrder.add @equalBidOrder
          @bidOrder.add @higherBidOrder
          # override the book entry add methods so we can check if they get called
          @lowerAddSpy = sinon.spy()
          @higherAddSpy = sinon.spy()
          @equalBidOrder.add = @lowerAddSpy
          @higherBidOrder.add = @higherAddSpy

        describe 'an entry with a higher bid price', ->
          it 'should call the add method of the higher Order', ->
            @bidOrder.add @evenHigherBidOrder
            @lowerAddSpy.should.not.have.been.called
            @higherAddSpy.should.have.been.calledWith @evenHigherBidOrder

        describe 'an entry with the same or lower bid price', ->
          it 'should call the add method of the lower Order', ->
            @bidOrder.add @secondEqualBidOrder
            @lowerAddSpy.should.have.been.calledWith @secondEqualBidOrder
            @higherAddSpy.should.not.have.been.called

    describe 'only offers', ->
      describe 'on a book entry with no lower or higher orders', ->
        describe 'an entry with a higher bid price', ->
          it 'should set the higher entry to the Order being added and set the parent on the added Order', ->
            @offerOrder.add @higherOfferOrder
            expect(@offerOrder.parent).to.not.be.ok
            expect(@offerOrder.lower).to.not.be.ok
            @offerOrder.higher.should.equal @higherOfferOrder
            @higherOfferOrder.parent.should.equal @offerOrder
            expect(@higherOfferOrder.lower).to.not.be.ok
            expect(@higherOfferOrder.higher).to.not.be.ok

        describe 'an entry with the same or lower bid price', ->
          it 'should set the lower entry to the Order being added and set the parent on the added Order', ->
            @offerOrder.add @equalOfferOrder
            expect(@offerOrder.parent).to.not.be.ok
            @offerOrder.lower.should.equal @equalOfferOrder
            expect(@offerOrder.higher).to.not.be.ok
            @equalOfferOrder.parent.should.equal @offerOrder
            expect(@equalOfferOrder.lower).to.not.be.ok
            expect(@equalOfferOrder.higher).to.not.be.ok

      describe 'on a book entry with both higher and lower orders', ->
        beforeEach ->
          @offerOrder.add @equalOfferOrder
          @offerOrder.add @higherOfferOrder
          # override the book entry add methods so we can check if they get called
          @lowerAddSpy = sinon.spy()
          @higherAddSpy = sinon.spy()
          @equalOfferOrder.add = @lowerAddSpy
          @higherOfferOrder.add = @higherAddSpy

        describe 'an entry with a higher bid price', ->
          it 'should call the add method of the higher Order', ->
            @offerOrder.add @evenHigherOfferOrder
            @lowerAddSpy.should.not.have.been.called
            @higherAddSpy.should.have.been.calledWith @evenHigherOfferOrder

        describe 'an entry with the same or lower bid price', ->
          it 'should call the add method of the lower Order', ->
            @offerOrder.add @secondEqualOfferOrder
            @lowerAddSpy.should.have.been.calledWith @secondEqualOfferOrder
            @higherAddSpy.should.not.have.been.called

    describe 'an offer to bids', ->
      describe 'on a book entry with no lower or higher orders', ->
        describe 'an entry with a higher bid price', ->
          it 'should set the higher entry to the Order being added and set the parent on the added Order', ->
            @bidOrder.add @higherOfferOrder
            expect(@bidOrder.parent).to.not.be.ok
            expect(@bidOrder.lower).to.not.be.ok
            @bidOrder.higher.should.equal @higherOfferOrder
            @higherOfferOrder.parent.should.equal @bidOrder
            expect(@higherOfferOrder.lower).to.not.be.ok
            expect(@higherOfferOrder.higher).to.not.be.ok

        describe 'an entry with the same or lower bid price', ->
          it 'should set the lower entry to the Order being added and set the parent on the added Order', ->
            @bidOrder.add @equalOfferOrder
            expect(@bidOrder.parent).to.not.be.ok
            @bidOrder.lower.should.equal @equalOfferOrder
            expect(@bidOrder.higher).to.not.be.ok
            @equalOfferOrder.parent.should.equal @bidOrder
            expect(@equalOfferOrder.lower).to.not.be.ok
            expect(@equalOfferOrder.higher).to.not.be.ok

      describe 'on a book entry with both higher and lower orders', ->
        beforeEach ->
          @bidOrder.add @equalBidOrder
          @bidOrder.add @higherBidOrder
          # override the book entry add methods so we can check if they get called
          @lowerAddSpy = sinon.spy()
          @higherAddSpy = sinon.spy()
          @equalBidOrder.add = @lowerAddSpy
          @higherBidOrder.add = @higherAddSpy

        describe 'an entry with a higher bid price', ->
          it 'should call the add method of the higher Order', ->
            @bidOrder.add @evenHigherOfferOrder
            @lowerAddSpy.should.not.have.been.called
            @higherAddSpy.should.have.been.calledWith @evenHigherOfferOrder

        describe 'an entry with the same or lower bid price', ->
          it 'should call the add method of the lower Order', ->
            @bidOrder.add @secondEqualOfferOrder
            @lowerAddSpy.should.have.been.calledWith @secondEqualOfferOrder
            @higherAddSpy.should.not.have.been.called

    describe 'a bid to offers', ->
      describe 'on a book entry with no lower or higher orders', ->
        describe 'an entry with a higher bid price', ->
          it 'should set the higher entry to the Order being added and set the parent on the added Order', ->
            @offerOrder.add @higherBidOrder
            expect(@offerOrder.parent).to.not.be.ok
            expect(@offerOrder.lower).to.not.be.ok
            @offerOrder.higher.should.equal @higherBidOrder
            @higherBidOrder.parent.should.equal @offerOrder
            expect(@higherBidOrder.lower).to.not.be.ok
            expect(@higherBidOrder.higher).to.not.be.ok

        describe 'an entry with the same or lower bid price', ->
          it 'should set the lower entry to the Order being added and set the parent on the added Order', ->
            @offerOrder.add @equalBidOrder
            expect(@offerOrder.parent).to.not.be.ok
            @offerOrder.lower.should.equal @equalBidOrder
            expect(@offerOrder.higher).to.not.be.ok
            @equalBidOrder.parent.should.equal @offerOrder
            expect(@equalBidOrder.lower).to.not.be.ok
            expect(@equalBidOrder.higher).to.not.be.ok

      describe 'on a book entry with both higher and lower orders', ->
        beforeEach ->
          @offerOrder.add @equalOfferOrder
          @offerOrder.add @higherOfferOrder
          # override the book entry add methods so we can check if they get called
          @lowerAddSpy = sinon.spy()
          @higherAddSpy = sinon.spy()
          @equalOfferOrder.add = @lowerAddSpy
          @higherOfferOrder.add = @higherAddSpy

        describe 'an entry with a higher bid price', ->
          it 'should call the add method of the higher Order', ->
            @offerOrder.add @evenHigherBidOrder
            @lowerAddSpy.should.not.have.been.called
            @higherAddSpy.should.have.been.calledWith @evenHigherBidOrder

        describe 'an entry with the same or lower bid price', ->
          it 'should call the add method of the lower Order', ->
            @offerOrder.add @secondEqualBidOrder
            @lowerAddSpy.should.have.been.calledWith @secondEqualBidOrder
            @higherAddSpy.should.not.have.been.called

  describe '#addLowest', ->
    describe 'with no lower Order', ->
      it 'should set the lower Order to the given Order regardless of the bidPrice', ->
        order1 = newBidOrder amount1
        order2 = newBidOrder amount2
        order1.addLowest order2
        order1.lower.should.equal order2
        order2.parent.should.equal order1

    describe 'with a lower Order', ->
      it 'should call addLowest with the given Order regardless of the bidPrice', ->
        order1 = newBidOrder amount1
        order2 = newBidOrder amount2
        order3 = newBidOrder amount3
        order2.add order1
        addLowestSpy = sinon.spy()
        order1.addLowest = addLowestSpy
        order2.addLowest order3
        addLowestSpy.should.have.been.calledWith(order3)

  describe '#delete', ->
    beforeEach ->
      @bidOrder1 = newBidOrder amount1
      @bidOrder2 = newBidOrder amount2
      @bidOrder3 = newBidOrder amount3
      @bidOrder4 = newBidOrder amount4
      @bidOrder5 = newBidOrder amount5
      @bidOrder6 = newBidOrder amount6
      @bidOrder7 = newBidOrder amount7
      @bidOrder8 = newBidOrder amount8

    describe 'an Order with a lower parent but no lower or higher', ->
      it 'should delete the parent higher Order', ->
        @bidOrder2.add @bidOrder3
        @bidOrder2.add @bidOrder1
        @bidOrder3.delete()
        @bidOrder2.lower.should.equal @bidOrder1
        expect(@bidOrder2.higher).to.not.be.ok

    describe 'an Order with a higher parent but no lower or higher', ->
      it 'should delete the parent lower Order', ->
        @bidOrder2.add @bidOrder3
        @bidOrder2.add @bidOrder1
        @bidOrder1.delete()
        expect(@bidOrder2.lower).to.not.be.ok
        @bidOrder2.higher.should.equal @bidOrder3

    describe 'an Order with a lower parent and a lower but no higher Order', ->
      it 'should set the parent higher to the lower Order and return the lower Order', ->
        @bidOrder4.add @bidOrder6
        @bidOrder4.add @bidOrder5
        @bidOrder4.add @bidOrder3
        order = @bidOrder6.delete()
        order.should.equal @bidOrder5
        @bidOrder4.lower.should.equal @bidOrder3
        @bidOrder5.parent.should.equal @bidOrder4
        @bidOrder4.higher.should.equal @bidOrder5

    describe 'an Order with a lower parent and a higher but no lower Order', ->
      it 'should set the parent higher to the higher Order and return the higher Order', ->
        @bidOrder4.add @bidOrder6
        @bidOrder4.add @bidOrder7
        @bidOrder4.add @bidOrder3
        order = @bidOrder6.delete()
        order.should.equal @bidOrder7
        @bidOrder4.lower.should.equal @bidOrder3
        @bidOrder7.parent.should.equal @bidOrder4
        @bidOrder4.higher.should.equal @bidOrder7

    describe 'an Order with a lower parent and both higher and lower BookEntries', ->
      it 'should set the parent higher to the higher Order, call addLowest on the higher Order with the lower Order and return the higher Order', ->
        addLowestSpy = sinon.spy()
        @bidOrder7.addLowest = addLowestSpy
        @bidOrder4.add @bidOrder6
        @bidOrder4.add @bidOrder7
        @bidOrder4.add @bidOrder5
        @bidOrder4.add @bidOrder3
        order = @bidOrder6.delete()
        order.should.equal @bidOrder7
        @bidOrder4.lower.should.equal @bidOrder3
        @bidOrder7.parent.should.equal @bidOrder4
        @bidOrder4.higher.should.equal @bidOrder7
        addLowestSpy.should.have.been.calledWith @bidOrder5

    describe 'an Order with a higher parent and a lower but no higher Order', ->
      it 'should set the parent lower to the lower Order and return the lower Order', ->
        @bidOrder4.add @bidOrder2
        @bidOrder4.add @bidOrder1
        @bidOrder4.add @bidOrder5
        order = @bidOrder2.delete()
        order.should.equal @bidOrder1
        @bidOrder4.lower.should.equal @bidOrder1
        @bidOrder1.parent.should.equal @bidOrder4
        @bidOrder4.higher.should.equal @bidOrder5

    describe 'an Order with a higher parent and a higher but no lower Order', ->
      it 'should set the parent lower to the higher Order and return the higher Order', ->
        @bidOrder4.add @bidOrder2
        @bidOrder4.add @bidOrder3
        @bidOrder4.add @bidOrder5
        order = @bidOrder2.delete()
        order.should.equal @bidOrder3
        @bidOrder4.lower.should.equal @bidOrder3
        @bidOrder3.parent.should.equal @bidOrder4
        @bidOrder4.higher.should.equal @bidOrder5

    describe 'an Order with a higher parent and both higher and lower BookEntries', ->
      it 'should set the parent lower to the higher Order, call addLowest on the higher Order with the lower Order and return the higher Order', ->
        addLowestSpy = sinon.spy()
        @bidOrder3.addLowest = addLowestSpy
        @bidOrder4.add @bidOrder2
        @bidOrder4.add @bidOrder3
        @bidOrder4.add @bidOrder5
        @bidOrder4.add @bidOrder1
        order = @bidOrder2.delete()
        order.should.equal @bidOrder3
        @bidOrder4.lower.should.equal @bidOrder3
        @bidOrder3.parent.should.equal @bidOrder4
        @bidOrder4.higher.should.equal @bidOrder5
        addLowestSpy.should.have.been.calledWith @bidOrder1

    describe 'an Order with no parent and a lower but no higher Order', ->
      it 'should return the lower Order', ->
        @bidOrder4.add @bidOrder2
        order = @bidOrder4.delete()
        order.should.equal @bidOrder2
        expect(@bidOrder2.parent).to.not.be.ok

    describe 'an Order with no parent and a higher but no lower Order', ->
      it 'should return the higher Order', ->
        @bidOrder4.add @bidOrder6
        order = @bidOrder4.delete()
        order.should.equal @bidOrder6
        expect(@bidOrder6.parent).to.not.be.ok

    describe 'an Order with no parent and both higher and lower BookEntries', ->
      it 'should call addLowest on the higher Order with the lower Order and return the higher Order', ->
        addLowestSpy = sinon.spy()
        @bidOrder6.addLowest = addLowestSpy
        @bidOrder4.add @bidOrder2
        @bidOrder4.add @bidOrder6
        order = @bidOrder4.delete()
        order.should.equal @bidOrder6
        expect(@bidOrder6.parent).to.not.be.ok
        addLowestSpy.should.have.been.calledWith @bidOrder2

  describe '#getHighest', ->
    describe 'with no higher Order', ->
      it 'should return itself', ->
        order = newBidOrder amount1
        order.getHighest().should.equal order

    describe 'with a higher Order', ->
      it 'should call getHighest on the higher entry and return the result', ->
        order1 = newBidOrder amount1
        order2 = newBidOrder amount2
        order1.add order2
        order2.getHighest = sinon.stub().returns 'stub'
        order1.getHighest().should.equal 'stub'

  describe '#export', ->
    it 'should return a JSON stringifiable object containing a snapshot of the order', ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount50
      json = JSON.stringify order.export()
      object = JSON.parse json
      order.id.should.equal object.id
      order.timestamp.should.equal object.timestamp
      order.account.should.equal object.account
      order.bidCurrency.should.equal object.bidCurrency
      order.offerCurrency.should.equal object.offerCurrency
      order.bidPrice.compareTo(new Amount object.bidPrice).should.equal 0
      order.bidAmount.compareTo(new Amount object.bidAmount).should.equal 0
      expect(object.offerPrice).to.not.be.ok
      expect(object.offerAmount).to.not.be.ok
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'
        offerPrice: amount100
        offerAmount: amount50
      json = JSON.stringify order.export()
      object = JSON.parse json
      order.id.should.equal object.id
      order.timestamp.should.equal object.timestamp
      order.account.should.equal object.account
      order.bidCurrency.should.equal object.bidCurrency
      order.offerCurrency.should.equal object.offerCurrency
      order.offerPrice.compareTo(new Amount object.offerPrice).should.equal 0
      order.offerAmount.compareTo(new Amount object.offerAmount).should.equal 0
      expect(object.bidPrice).to.not.be.ok
      expect(object.bidAmount).to.not.be.ok

  describe '#exportList', ->
    it.skip 'should push exported orders onto the supplied array starting with itself and working back through lower orders', ->
      #
      #                       1
      #                      / \
      #                     /   \
      #                    /     \
      #                   /       \
      #                  /         \
      #                 3           2
      #                / \         / \
      #               /   \       /   \
      #              7     6     5     4
      #             / \   / \   / \   / \
      #            8   9 10 11 12 13 14 15
      #
      order1 = newBidOrder amount50
      order2 = newBidOrder amount51
      order1.add order2
      order3 = newBidOrder amount49
      order1.add order3
      order4 = newBidOrder amount52
      order1.add order4
      order5 = newBidOrder amount50Point5
      order1.add order5
      order6 = newBidOrder amount49Point5
      order1.add order6
      order7 = newBidOrder amount48Point5
      order1.add order7
      order8 = newBidOrder amount48Point5 # is equal to but should be placed lower than order 7
      order1.add order8
      order9 = newBidOrder amount48Point75
      order1.add order9
      order10 = newBidOrder amount49Point5 # is equal to but should be placed lower than order 6
      order1.add order10
      order11 = newBidOrder amount49Point75
      order1.add order11
      order12 = newBidOrder amount50Point5 # is equal to but should be placed lower than order 5
      order1.add order12
      order13 = newBidOrder amount50Point75
      order1.add order13
      order14 = newBidOrder amount52 # is equal to but should be placed lower than order 4
      order1.add order14
      order15 = newBidOrder amount53
      order1.add order15
      array = []
      order15.exportList array
      json = JSON.stringify array
      array = JSON.parse json
      array.should.deep.equal [
        order15.export()
        order4.export()
        order14.export()
        order2.export()
        order13.export()
        order5.export()
        order12.export()
        order1.export()
        order11.export()
        order6.export()
        order10.export()
        order3.export()
        order9.export()
        order7.export()
        order8.export()
      ]




