chai = require 'chai'
chai.should()
expect = chai.expect
assert = chai.assert
sinon = require 'sinon'
sinonChai = require 'sinon-chai'
chai.use sinonChai

Order = require '../../src/Engine/Order'
Amount = require '../../src/Amount'
Account = require '../../src/Engine/Account'
Book = require '../../src/Engine/Book'

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
amount175 = new Amount '175'
amount199 = new Amount '199'
amount200 = new Amount '200'
amount250 = new Amount '250'
amount275 = new Amount '275'
amount300 = new Amount '300'
amount375 = new Amount '375'
amount400 = new Amount '400'
amount495 = new Amount '495'
amount500 = new Amount '500'
amount995 = new Amount '995'
amount1000 = new Amount '1000'
amount1500 = new Amount '1500'
amount2000 = new Amount '2000'
amount5000 = new Amount '5000'
amount7500 = new Amount '7500'
amount15000 = new Amount '15000'
amount19800 = new Amount '19800'
amount19900 = new Amount '19900'
amount20000 = new Amount '20000'
amount99000 = new Amount '99000'
amount99500 = new Amount '99500'
amount100000 = new Amount '100000'

amountMinus50 = new Amount '-50'
amountMinus100 = new Amount '-100'

describe 'Order', ->
  beforeEach ->
    sequence = 0
    timestamp = 1371737390976

    @bookBTCEUR = new Book
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
    @bookEURBTC = new Book
      bidCurrency: 'EUR'
      offerCurrency: 'BTC'
      
    @commissionAccount = new Account
      id: 'commission'
    @balanceCommissionBTC = @commissionAccount.getBalance 'BTC'
    @balanceCommissionEUR = @commissionAccount.getBalance 'EUR'

    @accountPeter = new Account
      id: 'Peter'
      commission:
        account: @commissionAccount
        calculate: (params) =>
          commission = 
            amount: amount1
            reference: 'Peter commission level'
    @accountPeter.deposit
      currency: 'EUR'
      amount: amount100000
    @balancePeterBTC = @accountPeter.getBalance 'BTC'
    @balancePeterEUR = @accountPeter.getBalance 'EUR'

    @peterBidBTC = (params) =>
      order = new Order
        sequence: sequence++
        timestamp: timestamp++
        account: @accountPeter
        book: @bookBTCEUR
        bidPrice: params.price
        bidAmount: params.amount
      if !params.skipSubmit
        @accountPeter.submit order
        @bookBTCEUR.submit order
      return order
    @peterOfferEUR = (params) =>
      order = new Order
        sequence: sequence++
        timestamp: timestamp++
        account: @accountPeter
        book: @bookBTCEUR
        offerPrice: params.price
        offerAmount: params.amount
      if !params.skipSubmit
        @accountPeter.submit order
        @bookBTCEUR.submit order
      return order

    @accountPaul = new Account
      id: 'Paul'
      commission:
        account: @commissionAccount
        calculate: (params) =>
          commission = 
            amount: amount5
            reference: 'Paul commission level'
    @accountPaul.deposit
      currency: 'BTC'
      amount: amount20000
    @balancePaulBTC = @accountPaul.getBalance 'BTC'
    @balancePaulEUR = @accountPaul.getBalance 'EUR'

    @paulBidEUR = (params) =>
      order = new Order
        sequence: sequence++
        timestamp: timestamp++
        account: @accountPaul
        book: @bookEURBTC
        bidPrice: params.price
        bidAmount: params.amount
      if !params.skipSubmit
        @accountPaul.submit order
        @bookEURBTC.submit order
      return order
    @paulOfferBTC = (params) =>
      order = new Order
        sequence: sequence++
        timestamp: timestamp++
        account: @accountPaul
        book: @bookEURBTC
        offerPrice: params.price
        offerAmount: params.amount    
      if !params.skipSubmit
        @accountPaul.submit order
        @bookEURBTC.submit order
      return order

  it 'should throw an error if the sequence is missing', ->
    book = new Book
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
    account = new Account
      id: 'Peter'
    expect ->
      order = new Order
        timestamp: 1371737390976
        account: account
        book: book
        bidPrice: amount100
        bidAmount: amount50
    .to.throw 'Order must have a sequence'

  it 'should throw an error if the timestamp is missing', ->
    book = new Book
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
    account = new Account
      id: 'Peter'
    expect ->
      order = new Order
        sequence: 0
        account: account
        book: book
        bidPrice: amount100
        bidAmount: amount50
    .to.throw 'Order must have a timestamp'

  it 'should throw an error if the account is missing', ->
    book = new Book
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
    account = new Account
      id: 'Peter'
    expect ->
      order = new Order
        sequence: 0
        timestamp: 1371737390976
        book: book
        bidPrice: amount100
        bidAmount: amount50
    .to.throw 'Order must be associated with an account'

  it 'should throw an error if the book is missing', ->
    account = new Account
      id: 'Peter'
    expect ->
      order = new Order
        sequence: 0
        timestamp: 1371737390976
        account: account
        bidPrice: amount100
        bidAmount: amount50
    .to.throw 'Order must be associated with a book'

  it 'should throw an error if only a bid price is given as it is not enough information to calculate the other fields a bid', ->
    book = new Book
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
    account = new Account
      id: 'Peter'
    expect ->
      order = new Order
        sequence: 0
        timestamp: 1371737390976
        account: account
        book: book
        bidPrice: amount100
    .to.throw 'Must specify either bid amount and price or offer amount and price'

  it 'should throw an error if only an offer price is given as it is not enough information to calculate the other fields a bid', ->
    book = new Book
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
    account = new Account
      id: 'Peter'
    expect ->
      order = new Order
        sequence: 0
        timestamp: 1371737390976
        account: account
        book: book
        offerPrice: amount100
    .to.throw 'Must specify either bid amount and price or offer amount and price'

  it 'should throw an error if only a bid amount is given as it is not enough information to calculate the other fields a bid', ->
    book = new Book
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
    account = new Account
      id: 'Peter'
    expect ->
      order = new Order
        sequence: 0
        timestamp: 1371737390976
        account: account
        book: book
        bidAmount: amount100
    .to.throw 'Must specify either bid amount and price or offer amount and price'

  it 'should throw an error if only a offer amount is given as it is not enough information to calculate the other fields a bid', ->
    book = new Book
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
    account = new Account
      id: 'Peter'
    expect ->
      order = new Order
        sequence: 0
        timestamp: 1371737390976
        account: account
        book: book
        offerAmount: amount100
    .to.throw 'Must specify either bid amount and price or offer amount and price'

  it 'should throw an error if both the bid price, bid amount and offer price are given as we do not want to trust the calculations of others', ->
    book = new Book
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
    account = new Account
      id: 'Peter'
    expect ->
      order = new Order
        sequence: 0
        timestamp: 1371737390976
        account: account
        book: book
        bidPrice: amount100
        offerPrice: amount50
        bidAmount: amount50
    .to.throw 'Must specify either bid amount and price or offer amount and price'

  it 'should throw an error if both the offer price, offer amount and bid price are given as we do not want to trust the calculations of others', ->
    book = new Book
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
    account = new Account
      id: 'Peter'
    expect ->
      order = new Order
        sequence: 0
        timestamp: 1371737390976
        account: account
        book: book
        bidPrice: amount100
        offerPrice: amount50
        offerAmount: amount50
    .to.throw 'Must specify either bid amount and price or offer amount and price'

  it 'should throw an error if the bid price, offer amount and bid amount are given as we do not want to trust the calculations of others', ->
    book = new Book
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
    account = new Account
      id: 'Peter'
    expect ->
      order = new Order
        sequence: 0
        timestamp: 1371737390976
        account: account
        book: book
        bidPrice: amount100
        offerAmount: amount60
        bidAmount: amount50
    .to.throw 'Must specify either bid amount and price or offer amount and price'

  it 'should throw an error if the offer price, offer amount and bid amount are given as we do not want to trust the calculations of others', ->
    book = new Book
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
    account = new Account
      id: 'Peter'
    expect ->
      order = new Order
        sequence: 0
        timestamp: 1371737390976
        account: account
        book: book
        offerPrice: amount100
        offerAmount: amount60
        bidAmount: amount50
    .to.throw 'Must specify either bid amount and price or offer amount and price'

  it 'should throw an error if only amounts are specified as we need to know which amount to satisfy if the order is excuted at a better price', ->
    book = new Book
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
    account = new Account
      id: 'Peter'
    expect ->
      order = new Order
        sequence: 0
        timestamp: 1371737390976
        account: account
        book: book
        bidAmount: amount100
        offerAmount: amount50
    .to.throw 'Must specify either bid amount and price or offer amount and price'

  it 'should throw an error if a bid amount and offer price are specified as we need to know which amount to satisfy if the order is excuted at a better price', ->
    book = new Book
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
    account = new Account
      id: 'Peter'
    expect ->
      order = new Order
        sequence: 0
        timestamp: 1371737390976
        account: account
        book: book
        bidAmount: amount100
        offerPrice: amount50
    .to.throw 'Must specify either bid amount and price or offer amount and price'

  it 'should throw an error if an offer amount and bid price are specified as we need to know which amount to satisfy if the order is excuted at a better price', ->
    book = new Book
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
    account = new Account
      id: 'Peter'
    expect ->
      order = new Order
        sequence: 0
        timestamp: 1371737390976
        account: account
        book: book
        offerAmount: amount100
        bidPrice: amount50
    .to.throw 'Must specify either bid amount and price or offer amount and price'

  it 'should throw an error if the bid amount is negative', ->
    expect =>
      @peterBidBTC
        price: amount100
        amount: amountMinus50
    .to.throw 'bid amount cannot be negative'

  it 'should throw an error if the bid price is negative', ->
    expect =>
      @peterBidBTC
        price: amountMinus100
        amount: amount50
    .to.throw 'bid price cannot be negative'

  it 'should throw an error if the offer amount is negative', ->
    expect =>
      @peterOfferEUR
        price: amount100
        amount: amountMinus50
    .to.throw 'offer amount cannot be negative'

  it 'should throw an error if the offer price is negative', ->
    expect =>
      @peterOfferEUR
        price: amountMinus100
        amount: amount50
    .to.throw 'offer price cannot be negative'

  it 'should record the sequence, timestamp, account, book, price and amounts and set an undefined parent, lower and higher orders', ->
    order = @peterBidBTC
      price: amount100
      amount: amount50
    order.sequence.should.equal 0
    order.timestamp.should.equal 1371737390976
    order.account.should.equal @accountPeter
    order.book.should.equal @bookBTCEUR
    order.bidPrice.compareTo(amount100).should.equal 0
    order.bidAmount.compareTo(amount50).should.equal 0
    order.offerAmount.compareTo(amount5000).should.equal 0
    expect(order.parent).to.not.be.ok
    expect(order.lower).to.not.be.ok
    expect(order.higher).to.not.be.ok
    order = @peterOfferEUR
      price: amountPoint01
      amount: amount5000
    order.sequence.should.equal 1
    order.timestamp.should.equal 1371737390977
    order.account.should.equal @accountPeter
    order.book.should.equal @bookBTCEUR
    order.offerPrice.compareTo(amountPoint01).should.equal 0
    order.offerAmount.compareTo(amount5000).should.equal 0
    order.bidAmount.compareTo(amount50).should.equal 0

  describe '#match', ->
    describe 'where the existing (right) order is an offer', ->
      beforeEach ->
        @order = @peterOfferEUR
          price: amountPoint2   # 5
          amount: amount1000 # 200

      describe 'and the new (left) price is same', ->
        describe 'and the left order is a bid', ->
          describe 'and the right order is offering exactly the amount the left order is bidding', ->
            it 'should trade the amount the right order is offering, emit a trade event and return false to indicate that no higher trades can be filled by the left order', ->
              order = @paulBidEUR
                price: amountPoint2
                amount: amount1000

              result = order.match @order
              result.complete.should.be.true

              expect(@bookBTCEUR.next()).to.not.be.ok
              expect(@accountPeter.orders[0]).to.not.be.ok

              expect(@bookEURBTC.next()).to.not.be.ok
              expect(@accountPaul.orders[1]).to.not.be.ok

              @balancePaulBTC.funds.compareTo(amount19800).should.equal 0
              @balancePaulEUR.funds.compareTo(amount995).should.equal 0
              @balanceCommissionEUR.funds.compareTo(amount5).should.equal 0

              @balancePeterEUR.funds.compareTo(amount99000).should.equal 0
              @balancePeterBTC.funds.compareTo(amount199).should.equal 0
              @balanceCommissionBTC.funds.compareTo(amount1).should.equal 0

              order.offerAmount.compareTo(Amount.ZERO).should.equal 0
              order.bidAmount.compareTo(Amount.ZERO).should.equal 0

              @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
              @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

              result.trade.timestamp.should.equal order.timestamp
              result.trade.left.sequence.should.equal order.sequence
              result.trade.left.newBidAmount.compareTo(order.bidAmount).should.equal 0
              result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal 0
              result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.reference.should.equal 'Paul commission level'
              result.trade.right.sequence.should.equal @order.sequence
              result.trade.right.newOfferAmount.compareTo(@order.offerAmount).should.equal 0
              result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal 0
              result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.reference.should.equal 'Peter commission level'
              result.trade.price.compareTo(@order.offerPrice).should.equal 0
              result.trade.amount.compareTo(amount1000).should.equal 0

          describe 'and the right order is offering more than the left order is bidding', ->
            it 'should trade the amount the left order is offering, emit fill events and a trade event and return false to indicate that higher trades may still be filled by the left order', ->
              order = @paulBidEUR
                price: amountPoint2
                amount: amount500

              result = order.match @order
              result.complete.should.be.true

              @bookBTCEUR.next().should.equal @order
              @accountPeter.orders[0].should.equal @order

              expect(@bookEURBTC.next()).to.not.be.ok
              expect(@accountPaul.orders[1]).to.not.be.ok

              @balancePaulBTC.funds.compareTo(amount19900).should.equal 0
              @balancePaulEUR.funds.compareTo(amount495).should.equal 0
              @balanceCommissionEUR.funds.compareTo(amount5).should.equal 0

              @balancePeterEUR.funds.compareTo(amount99500).should.equal 0
              @balancePeterBTC.funds.compareTo(amount99).should.equal 0
              @balanceCommissionBTC.funds.compareTo(amount1).should.equal 0

              order.offerAmount.compareTo(Amount.ZERO).should.equal 0
              order.bidAmount.compareTo(Amount.ZERO).should.equal 0

              @order.bidAmount.compareTo(amount100).should.equal 0
              @order.offerAmount.compareTo(amount500).should.equal 0

              result.trade.timestamp.should.equal order.timestamp
              result.trade.left.sequence.should.equal order.sequence
              result.trade.left.newBidAmount.compareTo(order.bidAmount).should.equal 0
              result.trade.left.balanceDeltas.debit.amount.compareTo(amount100).should.equal 0
              result.trade.left.balanceDeltas.credit.amount.compareTo(amount495).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.reference.should.equal 'Paul commission level'
              result.trade.right.sequence.should.equal @order.sequence
              result.trade.right.newOfferAmount.compareTo(@order.offerAmount).should.equal 0
              result.trade.right.balanceDeltas.debit.amount.compareTo(amount500).should.equal 0
              result.trade.right.balanceDeltas.credit.amount.compareTo(amount99).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.reference.should.equal 'Peter commission level'
              result.trade.price.compareTo(@order.offerPrice).should.equal 0
              result.trade.amount.compareTo(amount500).should.equal 0

          describe 'and the right order is offering less than the left order is bidding', ->
            it 'should trade the amount the right order is offering, emit fill events and a trade event and return true', ->
              order = @paulBidEUR
                price: amountPoint2
                amount: amount1500

              result = order.match @order
              result.complete.should.be.false

              expect(@bookBTCEUR.next()).to.not.be.ok
              expect(@accountPeter.orders[0]).to.not.be.ok

              @bookEURBTC.next().should.equal order
              @accountPaul.orders[1].should.equal order

              @balancePaulBTC.funds.compareTo(amount19800).should.equal 0
              @balancePaulEUR.funds.compareTo(amount995).should.equal 0
              @balanceCommissionEUR.funds.compareTo(amount5).should.equal 0

              @balancePeterEUR.funds.compareTo(amount99000).should.equal 0
              @balancePeterBTC.funds.compareTo(amount199).should.equal 0
              @balanceCommissionBTC.funds.compareTo(amount1).should.equal 0

              order.offerAmount.compareTo(amount100).should.equal 0
              order.bidAmount.compareTo(amount500).should.equal 0

              @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
              @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

              result.trade.timestamp.should.equal order.timestamp
              result.trade.left.sequence.should.equal order.sequence
              result.trade.left.newBidAmount.compareTo(order.bidAmount).should.equal 0
              result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal 0
              result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.reference.should.equal 'Paul commission level'
              result.trade.right.sequence.should.equal @order.sequence
              result.trade.right.newOfferAmount.compareTo(@order.offerAmount).should.equal 0
              result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal 0
              result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.reference.should.equal 'Peter commission level'
              result.trade.price.compareTo(@order.offerPrice).should.equal 0
              result.trade.amount.compareTo(amount1000).should.equal 0

        describe 'and the left order is an offer', ->
          describe 'and the right order is offering exactly the amount the left order is offering', ->
            it 'should trade the amount the right order is offering, emit a fill events and a trade event and return false', ->
              order = @paulOfferBTC
                price: amount5
                amount: amount200

              result = order.match @order
              result.complete.should.be.true

              expect(@bookBTCEUR.next()).to.not.be.ok
              expect(@accountPeter.orders[0]).to.not.be.ok

              expect(@bookEURBTC.next()).to.not.be.ok
              expect(@accountPaul.orders[1]).to.not.be.ok

              @balancePaulBTC.funds.compareTo(amount19800).should.equal 0
              @balancePaulEUR.funds.compareTo(amount995).should.equal 0
              @balanceCommissionEUR.funds.compareTo(amount5).should.equal 0

              @balancePeterEUR.funds.compareTo(amount99000).should.equal 0
              @balancePeterBTC.funds.compareTo(amount199).should.equal 0
              @balanceCommissionBTC.funds.compareTo(amount1).should.equal 0

              order.offerAmount.compareTo(Amount.ZERO).should.equal 0
              order.bidAmount.compareTo(Amount.ZERO).should.equal 0

              @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
              @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

              result.trade.timestamp.should.equal order.timestamp
              result.trade.left.sequence.should.equal order.sequence
              result.trade.left.newOfferAmount.compareTo(order.offerAmount).should.equal 0
              result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal 0
              result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.reference.should.equal 'Paul commission level'
              result.trade.right.sequence.should.equal @order.sequence
              result.trade.right.newOfferAmount.compareTo(@order.offerAmount).should.equal 0
              result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal 0
              result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.reference.should.equal 'Peter commission level'
              result.trade.price.compareTo(@order.offerPrice).should.equal 0
              result.trade.amount.compareTo(amount1000).should.equal 0

          describe 'and the right order is offering more than the left order is offering', ->
            it 'should trade the amount the left order is offering, emit a fill events and a trade event and return false', ->
              order = @paulOfferBTC
                price: amount5
                amount: amount100

              result = order.match @order
              result.complete.should.be.true

              @bookBTCEUR.next().should.equal @order
              @accountPeter.orders[0].should.equal @order

              expect(@bookEURBTC.next()).to.not.be.ok
              expect(@accountPaul.orders[1]).to.not.be.ok

              @balancePaulBTC.funds.compareTo(amount19900).should.equal 0
              @balancePaulEUR.funds.compareTo(amount495).should.equal 0
              @balanceCommissionEUR.funds.compareTo(amount5).should.equal 0

              @balancePeterEUR.funds.compareTo(amount99500).should.equal 0
              @balancePeterBTC.funds.compareTo(amount99).should.equal 0
              @balanceCommissionBTC.funds.compareTo(amount1).should.equal 0

              order.offerAmount.compareTo(Amount.ZERO).should.equal 0
              order.bidAmount.compareTo(Amount.ZERO).should.equal 0

              @order.bidAmount.compareTo(amount100).should.equal 0
              @order.offerAmount.compareTo(amount500).should.equal 0

              result.trade.timestamp.should.equal order.timestamp
              result.trade.left.sequence.should.equal order.sequence
              result.trade.left.newOfferAmount.compareTo(order.offerAmount).should.equal 0
              result.trade.left.balanceDeltas.debit.amount.compareTo(amount100).should.equal 0
              result.trade.left.balanceDeltas.credit.amount.compareTo(amount495).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.reference.should.equal 'Paul commission level'
              result.trade.right.sequence.should.equal @order.sequence
              result.trade.right.newOfferAmount.compareTo(@order.offerAmount).should.equal 0
              result.trade.right.balanceDeltas.debit.amount.compareTo(amount500).should.equal 0
              result.trade.right.balanceDeltas.credit.amount.compareTo(amount99).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.reference.should.equal 'Peter commission level'
              result.trade.price.compareTo(@order.offerPrice).should.equal 0
              result.trade.amount.compareTo(amount500).should.equal 0                

          describe 'and the right order is offering less than the left order is offering', ->
            it 'should trade the amount the right order is offering, emit fill events and a trade event and return true', ->
              order = @paulOfferBTC
                price: amount5
                amount: amount300

              result = order.match @order
              result.complete.should.be.false

              expect(@bookBTCEUR.next()).to.not.be.ok
              expect(@accountPeter.orders[0]).to.not.be.ok

              @bookEURBTC.next().should.equal order
              @accountPaul.orders[1].should.equal order

              @balancePaulBTC.funds.compareTo(amount19800).should.equal 0
              @balancePaulEUR.funds.compareTo(amount995).should.equal 0
              @balanceCommissionEUR.funds.compareTo(amount5).should.equal 0

              @balancePeterEUR.funds.compareTo(amount99000).should.equal 0
              @balancePeterBTC.funds.compareTo(amount199).should.equal 0
              @balanceCommissionBTC.funds.compareTo(amount1).should.equal 0

              order.offerAmount.compareTo(amount100).should.equal 0
              order.bidAmount.compareTo(amount500).should.equal 0

              @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
              @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

              result.trade.timestamp.should.equal order.timestamp
              result.trade.left.sequence.should.equal order.sequence
              result.trade.left.newOfferAmount.compareTo(order.offerAmount).should.equal 0
              result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal 0
              result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.reference.should.equal 'Paul commission level'
              result.trade.right.sequence.should.equal @order.sequence
              result.trade.right.newOfferAmount.compareTo(@order.offerAmount).should.equal 0
              result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal 0
              result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.reference.should.equal 'Peter commission level'
              result.trade.price.compareTo(@order.offerPrice).should.equal 0
              result.trade.amount.compareTo(amount1000).should.equal 0                

      describe 'and the new (left) price is the better', ->
        describe 'and the left order is an offer', ->              
          describe 'and the right order is offering exactly the amount that the left order is offering multiplied by the right order price', ->
            it 'should trade the amount the right order is offering at the right order price, emit fill events and a trade event and return false', ->
              order = @paulOfferBTC
                price: amount4
                amount: amount200

              result = order.match @order
              result.complete.should.be.true

              expect(@bookBTCEUR.next()).to.not.be.ok
              expect(@accountPeter.orders[0]).to.not.be.ok

              expect(@bookEURBTC.next()).to.not.be.ok
              expect(@accountPaul.orders[1]).to.not.be.ok

              @balancePaulBTC.funds.compareTo(amount19800).should.equal 0
              @balancePaulEUR.funds.compareTo(amount995).should.equal 0
              @balanceCommissionEUR.funds.compareTo(amount5).should.equal 0

              @balancePeterEUR.funds.compareTo(amount99000).should.equal 0
              @balancePeterBTC.funds.compareTo(amount199).should.equal 0
              @balanceCommissionBTC.funds.compareTo(amount1).should.equal 0

              order.offerAmount.compareTo(Amount.ZERO).should.equal 0
              order.bidAmount.compareTo(Amount.ZERO).should.equal 0

              @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
              @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

              result.trade.timestamp.should.equal order.timestamp
              result.trade.left.sequence.should.equal order.sequence
              result.trade.left.newOfferAmount.compareTo(order.offerAmount).should.equal 0
              result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal 0
              result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.reference.should.equal 'Paul commission level'
              result.trade.right.sequence.should.equal @order.sequence
              result.trade.right.newOfferAmount.compareTo(@order.offerAmount).should.equal 0
              result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal 0
              result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.reference.should.equal 'Peter commission level'
              result.trade.price.compareTo(@order.offerPrice).should.equal 0
              result.trade.amount.compareTo(amount1000).should.equal 0                

          describe 'and the right order is offering more than the left order is offering multiplied by the right order price', ->
            it 'should trade the amount the left order is offering at the right order price, emit fill events and a trade event and return false', ->
              order = @paulOfferBTC
                price: amount4
                amount: amount100

              result = order.match @order
              result.complete.should.be.true

              @bookBTCEUR.next().should.equal @order
              @accountPeter.orders[0].should.equal @order

              expect(@bookEURBTC.next()).to.not.be.ok
              expect(@accountPaul.orders[1]).to.not.be.ok

              @balancePaulBTC.funds.compareTo(amount19900).should.equal 0
              @balancePaulEUR.funds.compareTo(amount495).should.equal 0
              @balanceCommissionEUR.funds.compareTo(amount5).should.equal 0

              @balancePeterEUR.funds.compareTo(amount99500).should.equal 0
              @balancePeterBTC.funds.compareTo(amount99).should.equal 0
              @balanceCommissionBTC.funds.compareTo(amount1).should.equal 0

              order.offerAmount.compareTo(Amount.ZERO).should.equal 0
              order.bidAmount.compareTo(Amount.ZERO).should.equal 0

              @order.bidAmount.compareTo(amount100).should.equal 0
              @order.offerAmount.compareTo(amount500).should.equal 0

              result.trade.timestamp.should.equal order.timestamp
              result.trade.left.sequence.should.equal order.sequence
              result.trade.left.newOfferAmount.compareTo(order.offerAmount).should.equal 0
              result.trade.left.balanceDeltas.debit.amount.compareTo(amount100).should.equal 0
              result.trade.left.balanceDeltas.credit.amount.compareTo(amount495).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.reference.should.equal 'Paul commission level'
              result.trade.right.sequence.should.equal @order.sequence
              result.trade.right.newOfferAmount.compareTo(@order.offerAmount).should.equal 0
              result.trade.right.balanceDeltas.debit.amount.compareTo(amount500).should.equal 0
              result.trade.right.balanceDeltas.credit.amount.compareTo(amount99).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.reference.should.equal 'Peter commission level'
              result.trade.price.compareTo(@order.offerPrice).should.equal 0
              result.trade.amount.compareTo(amount500).should.equal 0                

          describe 'and the right order is offering less than the left order is offering multiplied by the right order price', ->
            it 'should trade the amount the right order is offering at the right order price, emit fill events and a trade event and return true', ->
              order = @paulOfferBTC
                price: amount4
                amount: amount300

              result = order.match @order
              result.complete.should.be.false

              expect(@bookBTCEUR.next()).to.not.be.ok
              expect(@accountPeter.orders[0]).to.not.be.ok

              @bookEURBTC.next().should.equal order
              @accountPaul.orders[1].should.equal order

              @balancePaulBTC.funds.compareTo(amount19800).should.equal 0
              @balancePaulEUR.funds.compareTo(amount995).should.equal 0
              @balanceCommissionEUR.funds.compareTo(amount5).should.equal 0

              @balancePeterEUR.funds.compareTo(amount99000).should.equal 0
              @balancePeterBTC.funds.compareTo(amount199).should.equal 0
              @balanceCommissionBTC.funds.compareTo(amount1).should.equal 0

              order.offerAmount.compareTo(amount100).should.equal 0
              order.bidAmount.compareTo(amount400).should.equal 0

              @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
              @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

              result.trade.timestamp.should.equal order.timestamp
              result.trade.left.sequence.should.equal order.sequence
              result.trade.left.newOfferAmount.compareTo(order.offerAmount).should.equal 0
              result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal 0
              result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.reference.should.equal 'Paul commission level'
              result.trade.right.sequence.should.equal @order.sequence
              result.trade.right.newOfferAmount.compareTo(@order.offerAmount).should.equal 0
              result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal 0
              result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.reference.should.equal 'Peter commission level'
              result.trade.price.compareTo(@order.offerPrice).should.equal 0
              result.trade.amount.compareTo(amount1000).should.equal 0                

        describe 'and the left order is a bid', ->
          describe 'and the right order is offering exactly the amount that the left order is bidding', ->
            it 'should trade the amount the right order is offering at the right order price, emit fill events and a trade event and retrun false', ->
              order = @paulBidEUR
                price: amountPoint25
                amount: amount1000

              result = order.match @order
              result.complete.should.be.true

              expect(@bookBTCEUR.next()).to.not.be.ok
              expect(@accountPeter.orders[0]).to.not.be.ok

              expect(@bookEURBTC.next()).to.not.be.ok
              expect(@accountPaul.orders[1]).to.not.be.ok

              @balancePaulBTC.funds.compareTo(amount19800).should.equal 0
              @balancePaulEUR.funds.compareTo(amount995).should.equal 0
              @balanceCommissionEUR.funds.compareTo(amount5).should.equal 0

              @balancePeterEUR.funds.compareTo(amount99000).should.equal 0
              @balancePeterBTC.funds.compareTo(amount199).should.equal 0
              @balanceCommissionBTC.funds.compareTo(amount1).should.equal 0

              order.offerAmount.compareTo(Amount.ZERO).should.equal 0
              order.bidAmount.compareTo(Amount.ZERO).should.equal 0

              @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
              @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

              result.trade.timestamp.should.equal order.timestamp
              result.trade.left.sequence.should.equal order.sequence
              result.trade.left.newBidAmount.compareTo(order.bidAmount).should.equal 0
              result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal 0
              result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.reference.should.equal 'Paul commission level'
              result.trade.right.sequence.should.equal @order.sequence
              result.trade.right.newOfferAmount.compareTo(@order.offerAmount).should.equal 0
              result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal 0
              result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.reference.should.equal 'Peter commission level'
              result.trade.price.compareTo(@order.offerPrice).should.equal 0
              result.trade.amount.compareTo(amount1000).should.equal 0                
              
          describe 'and the right order is offering more than the left order is bidding', ->
            it 'should trade the amount the left order is bidding at the right order price, emit fill events and a trade event and return false', ->
              order = @paulBidEUR
                price: amountPoint25
                amount: amount500

              result = order.match @order
              result.complete.should.be.true

              @bookBTCEUR.next().should.equal @order
              @accountPeter.orders[0].should.equal @order

              expect(@bookEURBTC.next()).to.not.be.ok
              expect(@accountPaul.orders[1]).to.not.be.ok

              @balancePaulBTC.funds.compareTo(amount19900).should.equal 0
              @balancePaulEUR.funds.compareTo(amount495).should.equal 0
              @balanceCommissionEUR.funds.compareTo(amount5).should.equal 0

              @balancePeterEUR.funds.compareTo(amount99500).should.equal 0
              @balancePeterBTC.funds.compareTo(amount99).should.equal 0
              @balanceCommissionBTC.funds.compareTo(amount1).should.equal 0

              order.offerAmount.compareTo(Amount.ZERO).should.equal 0
              order.bidAmount.compareTo(Amount.ZERO).should.equal 0

              @order.bidAmount.compareTo(amount100).should.equal 0
              @order.offerAmount.compareTo(amount500).should.equal 0

              result.trade.timestamp.should.equal order.timestamp
              result.trade.left.sequence.should.equal order.sequence
              result.trade.left.newBidAmount.compareTo(order.bidAmount).should.equal 0
              result.trade.left.balanceDeltas.debit.amount.compareTo(amount100).should.equal 0
              result.trade.left.balanceDeltas.credit.amount.compareTo(amount495).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.reference.should.equal 'Paul commission level'
              result.trade.right.sequence.should.equal @order.sequence
              result.trade.right.newOfferAmount.compareTo(@order.offerAmount).should.equal 0
              result.trade.right.balanceDeltas.debit.amount.compareTo(amount500).should.equal 0
              result.trade.right.balanceDeltas.credit.amount.compareTo(amount99).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.reference.should.equal 'Peter commission level'
              result.trade.price.compareTo(@order.offerPrice).should.equal 0
              result.trade.amount.compareTo(amount500).should.equal 0                

          describe 'and the right order is offering less than the left order is bidding', ->
            it 'should trade the amount the right order is offering at the right order price, emit fill events and a trade event and return true', ->
              order = @paulBidEUR
                price: amountPoint25
                amount: amount1500

              result = order.match @order
              result.complete.should.be.false

              expect(@bookBTCEUR.next()).to.not.be.ok
              expect(@accountPeter.orders[0]).to.not.be.ok

              @bookEURBTC.next().should.equal order
              @accountPaul.orders[1].should.equal order

              @balancePaulBTC.funds.compareTo(amount19800).should.equal 0
              @balancePaulEUR.funds.compareTo(amount995).should.equal 0
              @balanceCommissionEUR.funds.compareTo(amount5).should.equal 0

              @balancePeterEUR.funds.compareTo(amount99000).should.equal 0
              @balancePeterBTC.funds.compareTo(amount199).should.equal 0
              @balanceCommissionBTC.funds.compareTo(amount1).should.equal 0

              order.offerAmount.compareTo(amount125).should.equal 0
              order.bidAmount.compareTo(amount500).should.equal 0

              @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
              @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

              result.trade.timestamp.should.equal order.timestamp
              result.trade.left.sequence.should.equal order.sequence
              result.trade.left.newBidAmount.compareTo(order.bidAmount).should.equal 0
              result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal 0
              result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.reference.should.equal 'Paul commission level'
              result.trade.right.sequence.should.equal @order.sequence
              result.trade.right.newOfferAmount.compareTo(@order.offerAmount).should.equal 0
              result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal 0
              result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.reference.should.equal 'Peter commission level'
              result.trade.price.compareTo(@order.offerPrice).should.equal 0
              result.trade.amount.compareTo(amount1000).should.equal 0                
            
    describe 'where the existing (right) order is a bid', ->
      beforeEach ->
        @order = @peterBidBTC
          price: amount5   # 0.2
          amount: amount200 # 1000

      describe 'and the new (left) price is better', ->
        describe 'and the left order is an offer', ->
          describe 'and the right order is bidding exactly the amount that the left order is offering', ->
            it 'should trade the amount the right order is bidding at the right order price, emit fill events and a trade event and return false', ->
              order = @paulOfferBTC
                price: amount4
                amount: amount200

              result = order.match @order
              result.complete.should.be.true

              expect(@bookBTCEUR.next()).to.not.be.ok
              expect(@accountPeter.orders[0]).to.not.be.ok

              expect(@bookEURBTC.next()).to.not.be.ok
              expect(@accountPaul.orders[1]).to.not.be.ok

              @balancePaulBTC.funds.compareTo(amount19800).should.equal 0
              @balancePaulEUR.funds.compareTo(amount995).should.equal 0
              @balanceCommissionEUR.funds.compareTo(amount5).should.equal 0

              @balancePeterEUR.funds.compareTo(amount99000).should.equal 0
              @balancePeterBTC.funds.compareTo(amount199).should.equal 0
              @balanceCommissionBTC.funds.compareTo(amount1).should.equal 0

              order.offerAmount.compareTo(Amount.ZERO).should.equal 0
              order.bidAmount.compareTo(Amount.ZERO).should.equal 0
              @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
              @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

              result.trade.timestamp.should.equal order.timestamp
              result.trade.left.sequence.should.equal order.sequence
              result.trade.left.newOfferAmount.compareTo(order.offerAmount).should.equal 0
              result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal 0
              result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.reference.should.equal 'Paul commission level'
              result.trade.right.sequence.should.equal @order.sequence
              result.trade.right.newBidAmount.compareTo(@order.bidAmount).should.equal 0
              result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal 0
              result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.reference.should.equal 'Peter commission level'
              result.trade.price.compareTo(@order.bidPrice).should.equal 0
              result.trade.amount.compareTo(amount200).should.equal 0                

          describe 'and the right order is bidding more than the left order is offering', ->
            it 'should trade the amount the left order is offering at the right order price, emit fill events and a trade event and return false', ->
              order = @paulOfferBTC
                price: amount4
                amount: amount100

              result = order.match @order
              result.complete.should.be.true

              @bookBTCEUR.next().should.equal @order
              @accountPeter.orders[0].should.equal @order

              expect(@bookEURBTC.next()).to.not.be.ok
              expect(@accountPaul.orders[1]).to.not.be.ok

              @balancePaulBTC.funds.compareTo(amount19900).should.equal 0
              @balancePaulEUR.funds.compareTo(amount495).should.equal 0
              @balanceCommissionEUR.funds.compareTo(amount5).should.equal 0

              @balancePeterEUR.funds.compareTo(amount99500).should.equal 0
              @balancePeterBTC.funds.compareTo(amount99).should.equal 0
              @balanceCommissionBTC.funds.compareTo(amount1).should.equal 0

              order.offerAmount.compareTo(Amount.ZERO).should.equal 0
              order.bidAmount.compareTo(Amount.ZERO).should.equal 0

              @order.bidAmount.compareTo(amount100).should.equal 0
              @order.offerAmount.compareTo(amount500).should.equal 0

              result.trade.timestamp.should.equal order.timestamp
              result.trade.left.sequence.should.equal order.sequence
              result.trade.left.newOfferAmount.compareTo(order.offerAmount).should.equal 0
              result.trade.left.balanceDeltas.debit.amount.compareTo(amount100).should.equal 0
              result.trade.left.balanceDeltas.credit.amount.compareTo(amount495).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.reference.should.equal 'Paul commission level'
              result.trade.right.sequence.should.equal @order.sequence
              result.trade.right.newBidAmount.compareTo(@order.bidAmount).should.equal 0
              result.trade.right.balanceDeltas.debit.amount.compareTo(amount500).should.equal 0
              result.trade.right.balanceDeltas.credit.amount.compareTo(amount99).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.reference.should.equal 'Peter commission level'
              result.trade.price.compareTo(@order.bidPrice).should.equal 0
              result.trade.amount.compareTo(amount100).should.equal 0                

          describe 'and the right order is bidding less than the left order is offering', ->
            it 'should trade the amount the right order is bidding at the right order price, emit fill events and a trade event and return true', ->
              order = @paulOfferBTC
                price: amount4
                amount: amount300

              result = order.match @order
              result.complete.should.be.false

              expect(@bookBTCEUR.next()).to.not.be.ok
              expect(@accountPeter.orders[0]).to.not.be.ok

              @bookEURBTC.next().should.equal order
              @accountPaul.orders[1].should.equal order

              @balancePaulBTC.funds.compareTo(amount19800).should.equal 0
              @balancePaulEUR.funds.compareTo(amount995).should.equal 0
              @balanceCommissionEUR.funds.compareTo(amount5).should.equal 0

              @balancePeterEUR.funds.compareTo(amount99000).should.equal 0
              @balancePeterBTC.funds.compareTo(amount199).should.equal 0
              @balanceCommissionBTC.funds.compareTo(amount1).should.equal 0

              order.offerAmount.compareTo(amount100).should.equal 0
              order.bidAmount.compareTo(amount400).should.equal 0

              @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
              @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

              result.trade.timestamp.should.equal order.timestamp
              result.trade.left.sequence.should.equal order.sequence
              result.trade.left.newOfferAmount.compareTo(order.offerAmount).should.equal 0
              result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal 0
              result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.reference.should.equal 'Paul commission level'
              result.trade.right.sequence.should.equal @order.sequence
              result.trade.right.newBidAmount.compareTo(@order.bidAmount).should.equal 0
              result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal 0
              result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.reference.should.equal 'Peter commission level'
              result.trade.price.compareTo(@order.bidPrice).should.equal 0
              result.trade.amount.compareTo(amount200).should.equal 0                

        describe 'and the left order is a bid', ->
          describe 'and the right order is bidding exactly the amount that the left order is bidding multiplied by the right order price', ->
            it 'should trade the amount the right order is bidding at the right order price, emit fill events and a trade event and return false', ->
              order = @paulBidEUR
                price: amountPoint25
                amount: amount1000

              result = order.match @order
              result.complete.should.be.true

              expect(@bookBTCEUR.next()).to.not.be.ok
              expect(@accountPeter.orders[0]).to.not.be.ok

              expect(@bookEURBTC.next()).to.not.be.ok
              expect(@accountPaul.orders[1]).to.not.be.ok

              @balancePaulBTC.funds.compareTo(amount19800).should.equal 0
              @balancePaulEUR.funds.compareTo(amount995).should.equal 0
              @balanceCommissionEUR.funds.compareTo(amount5).should.equal 0

              @balancePeterEUR.funds.compareTo(amount99000).should.equal 0
              @balancePeterBTC.funds.compareTo(amount199).should.equal 0
              @balanceCommissionBTC.funds.compareTo(amount1).should.equal 0

              order.offerAmount.compareTo(Amount.ZERO).should.equal 0
              order.bidAmount.compareTo(Amount.ZERO).should.equal 0

              @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
              @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

              result.trade.timestamp.should.equal order.timestamp
              result.trade.left.sequence.should.equal order.sequence
              result.trade.left.newBidAmount.compareTo(order.bidAmount).should.equal 0
              result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal 0
              result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.reference.should.equal 'Paul commission level'
              result.trade.right.sequence.should.equal @order.sequence
              result.trade.right.newBidAmount.compareTo(@order.bidAmount).should.equal 0
              result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal 0
              result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.reference.should.equal 'Peter commission level'
              result.trade.price.compareTo(@order.bidPrice).should.equal 0
              result.trade.amount.compareTo(amount200).should.equal 0                

          describe 'and the right order is bidding more than the left order is bidding multiplied by the right order price', ->
            it 'should trade the amount the left order is bidding at the right order price, emit fill events and a trade event and return false', ->
              order = @paulBidEUR
                price: amountPoint25
                amount: amount500

              result = order.match @order
              result.complete.should.be.true

              @bookBTCEUR.next().should.equal @order
              @accountPeter.orders[0].should.equal @order

              expect(@bookEURBTC.next()).to.not.be.ok
              expect(@accountPaul.orders[1]).to.not.be.ok

              @balancePaulBTC.funds.compareTo(amount19900).should.equal 0
              @balancePaulEUR.funds.compareTo(amount495).should.equal 0
              @balanceCommissionEUR.funds.compareTo(amount5).should.equal 0

              @balancePeterEUR.funds.compareTo(amount99500).should.equal 0
              @balancePeterBTC.funds.compareTo(amount99).should.equal 0
              @balanceCommissionBTC.funds.compareTo(amount1).should.equal 0

              order.offerAmount.compareTo(Amount.ZERO).should.equal 0
              order.bidAmount.compareTo(Amount.ZERO).should.equal 0

              @order.bidAmount.compareTo(amount100).should.equal 0
              @order.offerAmount.compareTo(amount500).should.equal 0

              result.trade.timestamp.should.equal order.timestamp
              result.trade.left.sequence.should.equal order.sequence
              result.trade.left.newBidAmount.compareTo(order.bidAmount).should.equal 0
              result.trade.left.balanceDeltas.debit.amount.compareTo(amount100).should.equal 0
              result.trade.left.balanceDeltas.credit.amount.compareTo(amount495).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.reference.should.equal 'Paul commission level'
              result.trade.right.sequence.should.equal @order.sequence
              result.trade.right.newBidAmount.compareTo(@order.bidAmount).should.equal 0
              result.trade.right.balanceDeltas.debit.amount.compareTo(amount500).should.equal 0
              result.trade.right.balanceDeltas.credit.amount.compareTo(amount99).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.reference.should.equal 'Peter commission level'
              result.trade.price.compareTo(@order.bidPrice).should.equal 0
              result.trade.amount.compareTo(amount100).should.equal 0                
              
          describe 'and the right order is bidding less than the left order is bidding multiplied by the right order price', ->
            it 'should trade the amount the right order is bidding at the right order price, emit fill events and a trade event and return true', ->
              order = @paulBidEUR
                price: amountPoint25
                amount: amount1500

              result = order.match @order
              result.complete.should.be.false

              expect(@bookBTCEUR.next()).to.not.be.ok
              expect(@accountPeter.orders[0]).to.not.be.ok

              @bookEURBTC.next().should.equal order
              @accountPaul.orders[1].should.equal order

              @balancePaulBTC.funds.compareTo(amount19800).should.equal 0
              @balancePaulEUR.funds.compareTo(amount995).should.equal 0
              @balanceCommissionEUR.funds.compareTo(amount5).should.equal 0

              @balancePeterEUR.funds.compareTo(amount99000).should.equal 0
              @balancePeterBTC.funds.compareTo(amount199).should.equal 0
              @balanceCommissionBTC.funds.compareTo(amount1).should.equal 0

              order.offerAmount.compareTo(amount125).should.equal 0
              order.bidAmount.compareTo(amount500).should.equal 0
              @order.bidAmount.compareTo(Amount.ZERO).should.equal 0
              @order.offerAmount.compareTo(Amount.ZERO).should.equal 0

              result.trade.timestamp.should.equal order.timestamp
              result.trade.left.sequence.should.equal order.sequence
              result.trade.left.newBidAmount.compareTo(order.bidAmount).should.equal 0
              result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal 0
              result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal 0
              result.trade.left.balanceDeltas.credit.commission.reference.should.equal 'Paul commission level'
              result.trade.right.sequence.should.equal @order.sequence
              result.trade.right.newBidAmount.compareTo(@order.bidAmount).should.equal 0
              result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal 0
              result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal 0
              result.trade.right.balanceDeltas.credit.commission.reference.should.equal 'Peter commission level'
              result.trade.price.compareTo(@order.bidPrice).should.equal 0
              result.trade.amount.compareTo(amount200).should.equal 0                

  describe '#add', ->
    beforeEach ->
      @bidOrder = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amountPoint2
      @higherBidOrder = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount1
      @evenHigherBidOrder = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount2
      @equalBidOrder = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amountPoint2
      @secondEqualBidOrder = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amountPoint2
      @offerOrder = @paulOfferBTC
        skipSubmit: true
        amount: amount100
        price: amount5
      @higherOfferOrder = @paulOfferBTC
        skipSubmit: true
        amount: amount100
        price: amount1
      @evenHigherOfferOrder = @paulOfferBTC
        skipSubmit: true
        amount: amount100
        price: amountPoint5
      @equalOfferOrder = @paulOfferBTC
        skipSubmit: true
        amount: amount100
        price: amount5
      @secondEqualOfferOrder = @paulOfferBTC
        skipSubmit: true
        amount: amount100
        price: amount5

    describe 'only bids', ->
      describe 'on a book entry with no lower or higher orders', ->
        describe 'an entry with a higher bid price', ->
          it 'should set the higher entry to the Order being added, set the parent on the added Order and return the next higher order or undefined if there is none', ->
            nextHigher = @bidOrder.add @higherBidOrder
            expect(nextHigher).to.not.be.ok
            expect(@bidOrder.parent).to.not.be.ok
            expect(@bidOrder.lower).to.not.be.ok
            @bidOrder.higher.should.equal @higherBidOrder
            @higherBidOrder.parent.should.equal @bidOrder
            expect(@higherBidOrder.lower).to.not.be.ok
            expect(@higherBidOrder.higher).to.not.be.ok

        describe 'an entry with the same or lower bid price', ->
          it 'should set the lower entry to the Order being added, set the parent on the added Order and return the next higher order or undefined if there is none', ->
            nextHigher = @bidOrder.add @equalBidOrder
            nextHigher.should.equal @bidOrder
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
          @lowerAddSpy = sinon.spy @equalBidOrder.add.bind @equalBidOrder
          @higherAddSpy = sinon.spy @higherBidOrder.add.bind @higherBidOrder
          @equalBidOrder.add = @lowerAddSpy
          @higherBidOrder.add = @higherAddSpy

        describe 'an entry with a higher bid price', ->
          it 'should call the add method of the higher Order and return the next higher order or undefined if there is none', ->
            nextHigher = @bidOrder.add @evenHigherBidOrder
            expect(nextHigher).to.not.be.ok
            @lowerAddSpy.should.not.have.been.called
            @higherAddSpy.should.have.been.calledWith @evenHigherBidOrder

        describe 'an entry with the same or lower bid price', ->
          it 'should call the add method of the lower Order and return the next higher order or undefined if there is none', ->
            nextHigher = @bidOrder.add @secondEqualBidOrder
            nextHigher.should.equal @equalBidOrder
            @lowerAddSpy.should.have.been.calledWith @secondEqualBidOrder
            @higherAddSpy.should.not.have.been.called

    describe 'only offers', ->
      describe 'on a book entry with no lower or higher orders', ->
        describe 'an entry with a higher bid price', ->
          it 'should set the higher entry to the Order being added, set the parent on the added Order and return the next higher order or undefined if there is none', ->
            nextHigher = @offerOrder.add @higherOfferOrder
            expect(nextHigher).to.not.be.ok
            expect(@offerOrder.parent).to.not.be.ok
            expect(@offerOrder.lower).to.not.be.ok
            @offerOrder.higher.should.equal @higherOfferOrder
            @higherOfferOrder.parent.should.equal @offerOrder
            expect(@higherOfferOrder.lower).to.not.be.ok
            expect(@higherOfferOrder.higher).to.not.be.ok

        describe 'an entry with the same or lower bid price', ->
          it 'should set the lower entry to the Order being added, set the parent on the added Order and return the next higher order or undefined if there is none', ->
            nextHigher = @offerOrder.add @equalOfferOrder
            nextHigher.should.equal @offerOrder
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
          @lowerAddSpy = sinon.spy @equalOfferOrder.add.bind @equalOfferOrder
          @higherAddSpy = sinon.spy @higherOfferOrder.add.bind @higherOfferOrder
          @equalOfferOrder.add = @lowerAddSpy
          @higherOfferOrder.add = @higherAddSpy

        describe 'an entry with a higher bid price', ->
          it 'should call the add method of the higher Order and return the next higher order or undefined if there is none', ->
            nextHigher = @offerOrder.add @evenHigherOfferOrder
            expect(nextHigher).to.not.be.ok
            @lowerAddSpy.should.not.have.been.called
            @higherAddSpy.should.have.been.calledWith @evenHigherOfferOrder

        describe 'an entry with the same or lower bid price', ->
          it 'should call the add method of the lower Order and return the next higher order or undefined if there is none', ->
            nextHigher = @offerOrder.add @secondEqualOfferOrder
            nextHigher.should.equal @equalOfferOrder
            @lowerAddSpy.should.have.been.calledWith @secondEqualOfferOrder
            @higherAddSpy.should.not.have.been.called

    describe 'an offer to bids', ->
      describe 'on a book entry with no lower or higher orders', ->
        describe 'an entry with a higher bid price', ->
          it 'should set the higher entry to the Order being added, set the parent on the added Order and return the next higher order or undefined if there is none', ->
            nextHigher = @bidOrder.add @higherOfferOrder
            expect(nextHigher).to.not.be.ok
            expect(@bidOrder.parent).to.not.be.ok
            expect(@bidOrder.lower).to.not.be.ok
            @bidOrder.higher.should.equal @higherOfferOrder
            @higherOfferOrder.parent.should.equal @bidOrder
            expect(@higherOfferOrder.lower).to.not.be.ok
            expect(@higherOfferOrder.higher).to.not.be.ok

        describe 'an entry with the same or lower bid price', ->
          it 'should set the lower entry to the Order being added, set the parent on the added Order and return the next higher order or undefined if there is none', ->
            nextHigher = @bidOrder.add @equalOfferOrder
            nextHigher.should.equal @bidOrder
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
          @lowerAddSpy = sinon.spy @equalBidOrder.add.bind @equalBidOrder
          @higherAddSpy = sinon.spy @higherBidOrder.add.bind @higherBidOrder
          @equalBidOrder.add = @lowerAddSpy
          @higherBidOrder.add = @higherAddSpy

        describe 'an entry with a higher bid price', ->
          it 'should call the add method of the higher Order and return the next higher order or undefined if there is none', ->
            nextHigher = @bidOrder.add @evenHigherOfferOrder
            expect(nextHigher).to.not.be.ok
            @lowerAddSpy.should.not.have.been.called
            @higherAddSpy.should.have.been.calledWith @evenHigherOfferOrder

        describe 'an entry with the same or lower bid price', ->
          it 'should call the add method of the lower Order and return the next higher order or undefined if there is none', ->
            nextHigher = @bidOrder.add @secondEqualOfferOrder
            nextHigher.should.equal @equalBidOrder
            @lowerAddSpy.should.have.been.calledWith @secondEqualOfferOrder
            @higherAddSpy.should.not.have.been.called

    describe 'a bid to offers', ->
      describe 'on a book entry with no lower or higher orders', ->
        describe 'an entry with a higher bid price', ->
          it 'should set the higher entry to the Order being added, set the parent on the added Order and return the next higher order or undefined if there is none', ->
            nextHigher = @offerOrder.add @higherBidOrder
            expect(nextHigher).to.not.be.ok
            expect(@offerOrder.parent).to.not.be.ok
            expect(@offerOrder.lower).to.not.be.ok
            @offerOrder.higher.should.equal @higherBidOrder
            @higherBidOrder.parent.should.equal @offerOrder
            expect(@higherBidOrder.lower).to.not.be.ok
            expect(@higherBidOrder.higher).to.not.be.ok

        describe 'an entry with the same or lower bid price', ->
          it 'should set the lower entry to the Order being added, set the parent on the added Order and return the next higher order or undefined if there is none', ->
            nextHigher = @offerOrder.add @equalBidOrder
            nextHigher.should.equal @offerOrder
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
          @lowerAddSpy = sinon.spy @equalOfferOrder.add.bind @equalOfferOrder
          @higherAddSpy = sinon.spy @higherOfferOrder.add.bind @higherOfferOrder
          @equalOfferOrder.add = @lowerAddSpy
          @higherOfferOrder.add = @higherAddSpy

        describe 'an entry with a higher bid price', ->
          it 'should call the add method of the higher Order and return the next higher order or undefined if there is none', ->
            nextHigher = @offerOrder.add @evenHigherBidOrder
            expect(nextHigher).to.not.be.ok
            @lowerAddSpy.should.not.have.been.called
            @higherAddSpy.should.have.been.calledWith @evenHigherBidOrder

        describe 'an entry with the same or lower bid price', ->
          it 'should call the add method of the lower Order and return the next higher order or undefined if there is none', ->
            nextHigher = @offerOrder.add @secondEqualBidOrder
            nextHigher.should.equal @equalOfferOrder
            @lowerAddSpy.should.have.been.calledWith @secondEqualBidOrder
            @higherAddSpy.should.not.have.been.called

  describe '#delete', ->
    beforeEach ->
      @bidOrder1 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount1
      @bidOrder2 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount2
      @bidOrder3 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount3
      @bidOrder4 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount4
      @bidOrder5 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount5
      @bidOrder6 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount6
      @bidOrder7 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount7
      @bidOrder8 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount8

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
        order = @paulBidEUR
          skipSubmit: true
          amount: amount100
          price: amount1
        order.getHighest().should.equal order

    describe 'with a higher Order', ->
      it 'should call getHighest on the higher entry and return the result', ->
        order1 = @paulBidEUR
          skipSubmit: true
          amount: amount100
          price: amount1
        order2 = @paulBidEUR
          skipSubmit: true
          amount: amount100
          price: amount2
        order1.add order2
        order2.getHighest = sinon.stub().returns 'stub'
        order1.getHighest().should.equal 'stub'

  describe '#export', ->
    it 'should return a JSON stringifiable object containing a snapshot of the order', ->
      order = @paulBidEUR
        skipSubmit: true
        price: amount100
        amount: amount50
      json = JSON.stringify order.export()
      object = JSON.parse json
      order.sequence.should.equal object.sequence
      order.timestamp.should.equal object.timestamp
      order.account.id.should.equal object.account
      order.book.bidCurrency.should.equal object.bidCurrency
      order.book.offerCurrency.should.equal object.offerCurrency
      order.bidPrice.compareTo(new Amount object.bidPrice).should.equal 0
      order.bidAmount.compareTo(new Amount object.bidAmount).should.equal 0
      expect(object.offerPrice).to.not.be.ok
      expect(object.offerAmount).to.not.be.ok
      order = @paulOfferBTC
        skipSubmit: true
        price: amount100
        amount: amount50
      json = JSON.stringify order.export()
      object = JSON.parse json
      order.sequence.should.equal object.sequence
      order.timestamp.should.equal object.timestamp
      order.account.id.should.equal object.account
      order.book.bidCurrency.should.equal object.bidCurrency
      order.book.offerCurrency.should.equal object.offerCurrency
      order.offerPrice.compareTo(new Amount object.offerPrice).should.equal 0
      order.offerAmount.compareTo(new Amount object.offerAmount).should.equal 0
      expect(object.bidPrice).to.not.be.ok
      expect(object.bidAmount).to.not.be.ok

  describe '#next', ->
    it 'should return the next order in a tree if there is one', ->
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
      order1 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount50
      order2 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount51
      order1.add order2
      order3 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount49
      order1.add order3
      order4 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount52
      order1.add order4
      order5 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount50Point5
      order1.add order5
      order6 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount49Point5
      order1.add order6
      order7 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount48Point5
      order1.add order7
      order8 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount48Point5 # is equal to but should be placed lower than order 7
      order1.add order8
      order9 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount48Point75
      order1.add order9
      order10 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount49Point5 # is equal to but should be placed lower than order 6
      order1.add order10
      order11 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount49Point75
      order1.add order11
      order12 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount50Point5 # is equal to but should be placed lower than order 5
      order1.add order12
      order13 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount50Point75
      order1.add order13
      order14 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount52 # is equal to but should be placed lower than order 4
      order1.add order14
      order15 = @paulBidEUR
        skipSubmit: true
        amount: amount100
        price: amount53
      order1.add order15

      order15.next().should.equal order4
      order4.next().should.equal order14
      order14.next().should.equal order2
      order2.next().should.equal order13
      order13.next().should.equal order5
      order5.next().should.equal order12
      order12.next().should.equal order1
      order1.next().should.equal order11
      order11.next().should.equal order6
      order6.next().should.equal order10
      order10.next().should.equal order3
      order3.next().should.equal order9
      order9.next().should.equal order7
      order7.next().should.equal order8
      expect(order8.next()).to.not.be.ok




