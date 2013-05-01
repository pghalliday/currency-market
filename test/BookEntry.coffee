chai = require 'chai'
chai.should()
expect = chai.expect
assert = chai.assert
sinon = require 'sinon'
sinonChai = require 'sinon-chai'
chai.use sinonChai

BookEntry = require '../src/BookEntry'
Order = require '../src/Order'
Amount = require '../src/Amount'

amountPoint2 = new Amount '0.2'
amountPoint5 = new Amount '0.5'
amount1 = new Amount '1'
amount2 = new Amount '2'
amount3 = new Amount '3'
amount4 = new Amount '4'
amount5 = new Amount '5'
amount6 = new Amount '6'
amount7 = new Amount '7'
amount8 = new Amount '8'
amount200 = new Amount '200'

newBid = (bidPrice, id) ->
  new Order
    id: id || '1'
    timestamp: '1'
    account: 'Peter'
    bidCurrency: 'EUR'
    offerCurrency: 'BTC'
    bidPrice: bidPrice
    bidAmount: amount200

newBidBookEntry = (bidPrice, id) ->
  new BookEntry 
    order: newBid bidPrice, id

newOffer = (offerPrice, id) ->
  new Order
    id: id || '1'
    timestamp: '1'
    account: 'Peter'
    bidCurrency: 'EUR'
    offerCurrency: 'BTC'
    offerPrice: offerPrice
    offerAmount: amount200

newOfferBookEntry = (offerPrice, id) ->
  new BookEntry
    order: newOffer offerPrice, id

describe 'BookEntry', ->

  it 'should intialise with an order and undefined parent, lower and higher entries', ->
    order = new Order
      id: '1'
      timestamp: '1'
      account: 'Peter'
      bidCurrency: 'EUR'
      offerCurrency: 'BTC'
      bidPrice: amountPoint2
      bidAmount: amount200
    bookEntry = new BookEntry
      order: order
    bookEntry.order.should.equal order
    expect(bookEntry.parent).to.not.be.ok
    expect(bookEntry.lower).to.not.be.ok
    expect(bookEntry.higher).to.not.be.ok

  it 'should throw an error if no order is supplied', ->
    expect =>
      bookEntry = new BookEntry
        random: ''
    .to.throw 'Must supply an order'

  describe '#add', ->
    beforeEach ->
      @bidBookEntry = newBidBookEntry amountPoint2
      @higherBidBookEntry = newBidBookEntry amount1
      @evenHigherBidBookEntry = newBidBookEntry amount2
      @equalBidBookEntry = newBidBookEntry amountPoint2
      @secondEqualBidBookEntry = newBidBookEntry amountPoint2
      @offerBookEntry = newOfferBookEntry amount5
      @higherOfferBookEntry = newOfferBookEntry amount1
      @evenHigherOfferBookEntry = newOfferBookEntry amountPoint5
      @equalOfferBookEntry = newOfferBookEntry amount5
      @secondEqualOfferBookEntry = newOfferBookEntry amount5

    describe 'only bids', ->
      describe 'on a book entry with no lower or higher entries', ->
        describe 'an entry with a higher bid price', ->
          it 'should set the higher entry to the BookEntry being added and set the parent on the added BookEntry', ->
            @bidBookEntry.add @higherBidBookEntry
            expect(@bidBookEntry.parent).to.not.be.ok
            expect(@bidBookEntry.lower).to.not.be.ok
            @bidBookEntry.higher.should.equal @higherBidBookEntry
            @higherBidBookEntry.parent.should.equal @bidBookEntry
            expect(@higherBidBookEntry.lower).to.not.be.ok
            expect(@higherBidBookEntry.higher).to.not.be.ok

        describe 'an entry with the same or lower bid price', ->
          it 'should set the lower entry to the BookEntry being added and set the parent on the added BookEntry', ->
            @bidBookEntry.add @equalBidBookEntry
            expect(@bidBookEntry.parent).to.not.be.ok
            @bidBookEntry.lower.should.equal @equalBidBookEntry
            expect(@bidBookEntry.higher).to.not.be.ok
            @equalBidBookEntry.parent.should.equal @bidBookEntry
            expect(@equalBidBookEntry.lower).to.not.be.ok
            expect(@equalBidBookEntry.higher).to.not.be.ok

      describe 'on a book entry with both higher and lower entries', ->
        beforeEach ->
          @bidBookEntry.add @equalBidBookEntry
          @bidBookEntry.add @higherBidBookEntry
          # override the book entry add methods so we can check if they get called
          @lowerAddSpy = sinon.spy()
          @higherAddSpy = sinon.spy()
          @equalBidBookEntry.add = @lowerAddSpy
          @higherBidBookEntry.add = @higherAddSpy

        describe 'an entry with a higher bid price', ->
          it 'should call the add method of the higher BookEntry', ->
            @bidBookEntry.add @evenHigherBidBookEntry
            @lowerAddSpy.should.not.have.been.called
            @higherAddSpy.should.have.been.calledWith @evenHigherBidBookEntry

        describe 'an entry with the same or lower bid price', ->
          it 'should call the add method of the lower BookEntry', ->
            @bidBookEntry.add @secondEqualBidBookEntry
            @lowerAddSpy.should.have.been.calledWith @secondEqualBidBookEntry
            @higherAddSpy.should.not.have.been.called

    describe 'only offers', ->
      describe 'on a book entry with no lower or higher entries', ->
        describe 'an entry with a higher bid price', ->
          it 'should set the higher entry to the BookEntry being added and set the parent on the added BookEntry', ->
            @offerBookEntry.add @higherOfferBookEntry
            expect(@offerBookEntry.parent).to.not.be.ok
            expect(@offerBookEntry.lower).to.not.be.ok
            @offerBookEntry.higher.should.equal @higherOfferBookEntry
            @higherOfferBookEntry.parent.should.equal @offerBookEntry
            expect(@higherOfferBookEntry.lower).to.not.be.ok
            expect(@higherOfferBookEntry.higher).to.not.be.ok

        describe 'an entry with the same or lower bid price', ->
          it 'should set the lower entry to the BookEntry being added and set the parent on the added BookEntry', ->
            @offerBookEntry.add @equalOfferBookEntry
            expect(@offerBookEntry.parent).to.not.be.ok
            @offerBookEntry.lower.should.equal @equalOfferBookEntry
            expect(@offerBookEntry.higher).to.not.be.ok
            @equalOfferBookEntry.parent.should.equal @offerBookEntry
            expect(@equalOfferBookEntry.lower).to.not.be.ok
            expect(@equalOfferBookEntry.higher).to.not.be.ok

      describe 'on a book entry with both higher and lower entries', ->
        beforeEach ->
          @offerBookEntry.add @equalOfferBookEntry
          @offerBookEntry.add @higherOfferBookEntry
          # override the book entry add methods so we can check if they get called
          @lowerAddSpy = sinon.spy()
          @higherAddSpy = sinon.spy()
          @equalOfferBookEntry.add = @lowerAddSpy
          @higherOfferBookEntry.add = @higherAddSpy

        describe 'an entry with a higher bid price', ->
          it 'should call the add method of the higher BookEntry', ->
            @offerBookEntry.add @evenHigherOfferBookEntry
            @lowerAddSpy.should.not.have.been.called
            @higherAddSpy.should.have.been.calledWith @evenHigherOfferBookEntry

        describe 'an entry with the same or lower bid price', ->
          it 'should call the add method of the lower BookEntry', ->
            @offerBookEntry.add @secondEqualOfferBookEntry
            @lowerAddSpy.should.have.been.calledWith @secondEqualOfferBookEntry
            @higherAddSpy.should.not.have.been.called

    describe 'an offer to bids', ->
      describe 'on a book entry with no lower or higher entries', ->
        describe 'an entry with a higher bid price', ->
          it 'should set the higher entry to the BookEntry being added and set the parent on the added BookEntry', ->
            @bidBookEntry.add @higherOfferBookEntry
            expect(@bidBookEntry.parent).to.not.be.ok
            expect(@bidBookEntry.lower).to.not.be.ok
            @bidBookEntry.higher.should.equal @higherOfferBookEntry
            @higherOfferBookEntry.parent.should.equal @bidBookEntry
            expect(@higherOfferBookEntry.lower).to.not.be.ok
            expect(@higherOfferBookEntry.higher).to.not.be.ok

        describe 'an entry with the same or lower bid price', ->
          it 'should set the lower entry to the BookEntry being added and set the parent on the added BookEntry', ->
            @bidBookEntry.add @equalOfferBookEntry
            expect(@bidBookEntry.parent).to.not.be.ok
            @bidBookEntry.lower.should.equal @equalOfferBookEntry
            expect(@bidBookEntry.higher).to.not.be.ok
            @equalOfferBookEntry.parent.should.equal @bidBookEntry
            expect(@equalOfferBookEntry.lower).to.not.be.ok
            expect(@equalOfferBookEntry.higher).to.not.be.ok

      describe 'on a book entry with both higher and lower entries', ->
        beforeEach ->
          @bidBookEntry.add @equalBidBookEntry
          @bidBookEntry.add @higherBidBookEntry
          # override the book entry add methods so we can check if they get called
          @lowerAddSpy = sinon.spy()
          @higherAddSpy = sinon.spy()
          @equalBidBookEntry.add = @lowerAddSpy
          @higherBidBookEntry.add = @higherAddSpy

        describe 'an entry with a higher bid price', ->
          it 'should call the add method of the higher BookEntry', ->
            @bidBookEntry.add @evenHigherOfferBookEntry
            @lowerAddSpy.should.not.have.been.called
            @higherAddSpy.should.have.been.calledWith @evenHigherOfferBookEntry

        describe 'an entry with the same or lower bid price', ->
          it 'should call the add method of the lower BookEntry', ->
            @bidBookEntry.add @secondEqualOfferBookEntry
            @lowerAddSpy.should.have.been.calledWith @secondEqualOfferBookEntry
            @higherAddSpy.should.not.have.been.called

    describe 'a bid to offers', ->
      describe 'on a book entry with no lower or higher entries', ->
        describe 'an entry with a higher bid price', ->
          it 'should set the higher entry to the BookEntry being added and set the parent on the added BookEntry', ->
            @offerBookEntry.add @higherBidBookEntry
            expect(@offerBookEntry.parent).to.not.be.ok
            expect(@offerBookEntry.lower).to.not.be.ok
            @offerBookEntry.higher.should.equal @higherBidBookEntry
            @higherBidBookEntry.parent.should.equal @offerBookEntry
            expect(@higherBidBookEntry.lower).to.not.be.ok
            expect(@higherBidBookEntry.higher).to.not.be.ok

        describe 'an entry with the same or lower bid price', ->
          it 'should set the lower entry to the BookEntry being added and set the parent on the added BookEntry', ->
            @offerBookEntry.add @equalBidBookEntry
            expect(@offerBookEntry.parent).to.not.be.ok
            @offerBookEntry.lower.should.equal @equalBidBookEntry
            expect(@offerBookEntry.higher).to.not.be.ok
            @equalBidBookEntry.parent.should.equal @offerBookEntry
            expect(@equalBidBookEntry.lower).to.not.be.ok
            expect(@equalBidBookEntry.higher).to.not.be.ok

      describe 'on a book entry with both higher and lower entries', ->
        beforeEach ->
          @offerBookEntry.add @equalOfferBookEntry
          @offerBookEntry.add @higherOfferBookEntry
          # override the book entry add methods so we can check if they get called
          @lowerAddSpy = sinon.spy()
          @higherAddSpy = sinon.spy()
          @equalOfferBookEntry.add = @lowerAddSpy
          @higherOfferBookEntry.add = @higherAddSpy

        describe 'an entry with a higher bid price', ->
          it 'should call the add method of the higher BookEntry', ->
            @offerBookEntry.add @evenHigherBidBookEntry
            @lowerAddSpy.should.not.have.been.called
            @higherAddSpy.should.have.been.calledWith @evenHigherBidBookEntry

        describe 'an entry with the same or lower bid price', ->
          it 'should call the add method of the lower BookEntry', ->
            @offerBookEntry.add @secondEqualBidBookEntry
            @lowerAddSpy.should.have.been.calledWith @secondEqualBidBookEntry
            @higherAddSpy.should.not.have.been.called

  describe '#addLowest', ->
    describe 'with no lower BookEntry', ->
      it 'should set the lower BookEntry to the given BookEntry regardless of the bidPrice', ->
        bookEntry1 = newBidBookEntry amount1
        bookEntry2 = newBidBookEntry amount2
        bookEntry1.addLowest bookEntry2
        bookEntry1.lower.should.equal bookEntry2
        bookEntry2.parent.should.equal bookEntry1

    describe 'with a lower BookEntry', ->
      it 'should call addLowest with the given BookEntry regardless of the bidPrice', ->
        bookEntry1 = newBidBookEntry amount1
        bookEntry2 = newBidBookEntry amount2
        bookEntry3 = newBidBookEntry amount3
        bookEntry2.add bookEntry1
        addLowestSpy = sinon.spy()
        bookEntry1.addLowest = addLowestSpy
        bookEntry2.addLowest bookEntry3
        addLowestSpy.should.have.been.calledWith(bookEntry3)

  describe '#delete', ->
    beforeEach ->
      @bidBookEntry1 = newBidBookEntry amount1
      @bidBookEntry2 = newBidBookEntry amount2
      @bidBookEntry3 = newBidBookEntry amount3
      @bidBookEntry4 = newBidBookEntry amount4
      @bidBookEntry5 = newBidBookEntry amount5
      @bidBookEntry6 = newBidBookEntry amount6
      @bidBookEntry7 = newBidBookEntry amount7
      @bidBookEntry8 = newBidBookEntry amount8

    describe 'a BookEntry with a lower parent but no lower or higher', ->
      it 'should delete the parent higher BookEntry', ->
        @bidBookEntry2.add @bidBookEntry3
        @bidBookEntry2.add @bidBookEntry1
        @bidBookEntry3.delete()
        @bidBookEntry2.lower.should.equal @bidBookEntry1
        expect(@bidBookEntry2.higher).to.not.be.ok

    describe 'a BookEntry with a higher parent but no lower or higher', ->
      it 'should delete the parent lower BookEntry', ->
        @bidBookEntry2.add @bidBookEntry3
        @bidBookEntry2.add @bidBookEntry1
        @bidBookEntry1.delete()
        expect(@bidBookEntry2.lower).to.not.be.ok
        @bidBookEntry2.higher.should.equal @bidBookEntry3

    describe 'a BookEntry with a lower parent and a lower but no higher BookEntry', ->
      it 'should set the parent higher to the lower BookEntry and return the lower BookEntry', ->
        @bidBookEntry4.add @bidBookEntry6
        @bidBookEntry4.add @bidBookEntry5
        @bidBookEntry4.add @bidBookEntry3
        bookEntry = @bidBookEntry6.delete()
        bookEntry.should.equal @bidBookEntry5
        @bidBookEntry4.lower.should.equal @bidBookEntry3
        @bidBookEntry5.parent.should.equal @bidBookEntry4
        @bidBookEntry4.higher.should.equal @bidBookEntry5

    describe 'a BookEntry with a lower parent and a higher but no lower BookEntry', ->
      it 'should set the parent higher to the higher BookEntry and return the higher BookEntry', ->
        @bidBookEntry4.add @bidBookEntry6
        @bidBookEntry4.add @bidBookEntry7
        @bidBookEntry4.add @bidBookEntry3
        bookEntry = @bidBookEntry6.delete()
        bookEntry.should.equal @bidBookEntry7
        @bidBookEntry4.lower.should.equal @bidBookEntry3
        @bidBookEntry7.parent.should.equal @bidBookEntry4
        @bidBookEntry4.higher.should.equal @bidBookEntry7

    describe 'a BookEntry with a lower parent and both higher and lower BookEntries', ->
      it 'should set the parent higher to the higher BookEntry, call addLowest on the higher BookEntry with the lower BookEntry and return the higher BookEntry', ->
        addLowestSpy = sinon.spy()
        @bidBookEntry7.addLowest = addLowestSpy
        @bidBookEntry4.add @bidBookEntry6
        @bidBookEntry4.add @bidBookEntry7
        @bidBookEntry4.add @bidBookEntry5
        @bidBookEntry4.add @bidBookEntry3
        bookEntry = @bidBookEntry6.delete()
        bookEntry.should.equal @bidBookEntry7
        @bidBookEntry4.lower.should.equal @bidBookEntry3
        @bidBookEntry7.parent.should.equal @bidBookEntry4
        @bidBookEntry4.higher.should.equal @bidBookEntry7
        addLowestSpy.should.have.been.calledWith @bidBookEntry5

    describe 'a BookEntry with a higher parent and a lower but no higher BookEntry', ->
      it 'should set the parent lower to the lower BookEntry and return the lower BookEntry', ->
        @bidBookEntry4.add @bidBookEntry2
        @bidBookEntry4.add @bidBookEntry1
        @bidBookEntry4.add @bidBookEntry5
        bookEntry = @bidBookEntry2.delete()
        bookEntry.should.equal @bidBookEntry1
        @bidBookEntry4.lower.should.equal @bidBookEntry1
        @bidBookEntry1.parent.should.equal @bidBookEntry4
        @bidBookEntry4.higher.should.equal @bidBookEntry5

    describe 'a BookEntry with a higher parent and a higher but no lower BookEntry', ->
      it 'should set the parent lower to the higher BookEntry and return the higher BookEntry', ->
        @bidBookEntry4.add @bidBookEntry2
        @bidBookEntry4.add @bidBookEntry3
        @bidBookEntry4.add @bidBookEntry5
        bookEntry = @bidBookEntry2.delete()
        bookEntry.should.equal @bidBookEntry3
        @bidBookEntry4.lower.should.equal @bidBookEntry3
        @bidBookEntry3.parent.should.equal @bidBookEntry4
        @bidBookEntry4.higher.should.equal @bidBookEntry5

    describe 'a BookEntry with a higher parent and both higher and lower BookEntries', ->
      it 'should set the parent lower to the higher BookEntry, call addLowest on the higher BookEntry with the lower BookEntry and return the higher BookEntry', ->
        addLowestSpy = sinon.spy()
        @bidBookEntry3.addLowest = addLowestSpy
        @bidBookEntry4.add @bidBookEntry2
        @bidBookEntry4.add @bidBookEntry3
        @bidBookEntry4.add @bidBookEntry5
        @bidBookEntry4.add @bidBookEntry1
        bookEntry = @bidBookEntry2.delete()
        bookEntry.should.equal @bidBookEntry3
        @bidBookEntry4.lower.should.equal @bidBookEntry3
        @bidBookEntry3.parent.should.equal @bidBookEntry4
        @bidBookEntry4.higher.should.equal @bidBookEntry5
        addLowestSpy.should.have.been.calledWith @bidBookEntry1

    describe 'a BookEntry with no parent and a lower but no higher BookEntry', ->
      it 'should return the lower BookEntry', ->
        @bidBookEntry4.add @bidBookEntry2
        bookEntry = @bidBookEntry4.delete()
        bookEntry.should.equal @bidBookEntry2
        expect(@bidBookEntry2.parent).to.not.be.ok

    describe 'a BookEntry with no parent and a higher but no lower BookEntry', ->
      it 'should return the higher BookEntry', ->
        @bidBookEntry4.add @bidBookEntry6
        bookEntry = @bidBookEntry4.delete()
        bookEntry.should.equal @bidBookEntry6
        expect(@bidBookEntry6.parent).to.not.be.ok

    describe 'a BookEntry with no parent and both higher and lower BookEntries', ->
      it 'should call addLowest on the higher BookEntry with the lower BookEntry and return the higher BookEntry', ->
        addLowestSpy = sinon.spy()
        @bidBookEntry6.addLowest = addLowestSpy
        @bidBookEntry4.add @bidBookEntry2
        @bidBookEntry4.add @bidBookEntry6
        bookEntry = @bidBookEntry4.delete()
        bookEntry.should.equal @bidBookEntry6
        expect(@bidBookEntry6.parent).to.not.be.ok
        addLowestSpy.should.have.been.calledWith @bidBookEntry2

  describe '#getHighest', ->
    describe 'with no higher BookEntry', ->
      it 'should return itself', ->
        bookEntry = newBidBookEntry amount1
        bookEntry.getHighest().should.equal bookEntry

    describe 'with a higher BookEntry', ->
      it 'should call getHighest on the higher entry and return the result', ->
        bookEntry1 = newBidBookEntry amount1
        bookEntry2 = newBidBookEntry amount2
        bookEntry1.add bookEntry2
        bookEntry2.getHighest = sinon.stub().returns 'stub'
        bookEntry1.getHighest().should.equal 'stub'

  describe '#equals', ->
    beforeEach ->
      @bidBookEntry1a = newBidBookEntry amount1
      @bidBookEntry1b = newBidBookEntry amount1
      @bidBookEntry2a = newBidBookEntry amount2
      @bidBookEntry2b = newBidBookEntry amount2
      @bidBookEntry3a = newBidBookEntry amount3
      @bidBookEntry3b = newBidBookEntry amount3
      @bidBookEntry4a = newBidBookEntry amount4
      @bidBookEntry4b = newBidBookEntry amount4
      @bidBookEntry5a = newBidBookEntry amount5
      @bidBookEntry5b = newBidBookEntry amount5
      @bidBookEntry6a = newBidBookEntry amount6
      @bidBookEntry6b = newBidBookEntry amount6
      @bidBookEntry7a = newBidBookEntry amount7
      @bidBookEntry7b = newBidBookEntry amount7
      @bidBookEntry8a = newBidBookEntry amount8
      @bidBookEntry8b = newBidBookEntry amount8

    it 'should return true if 2 trees are the same', ->
      @bidBookEntry4a.equals(@bidBookEntry4b).should.be.true

      @bidBookEntry4a.add @bidBookEntry5a
      @bidBookEntry4b.add @bidBookEntry5b
      @bidBookEntry4a.equals(@bidBookEntry4b).should.be.true

      @bidBookEntry4a.add @bidBookEntry3a
      @bidBookEntry4b.add @bidBookEntry3b
      @bidBookEntry4a.equals(@bidBookEntry4b).should.be.true

      @bidBookEntry4a.add @bidBookEntry2a
      @bidBookEntry4b.add @bidBookEntry2b
      @bidBookEntry4a.equals(@bidBookEntry4b).should.be.true

      @bidBookEntry4a.add @bidBookEntry1a
      @bidBookEntry4b.add @bidBookEntry1b
      @bidBookEntry4a.equals(@bidBookEntry4b).should.be.true

      @bidBookEntry4a.add @bidBookEntry8a
      @bidBookEntry4b.add @bidBookEntry8b
      @bidBookEntry4a.equals(@bidBookEntry4b).should.be.true

      @bidBookEntry4a.add @bidBookEntry6a
      @bidBookEntry4b.add @bidBookEntry6b
      @bidBookEntry4a.equals(@bidBookEntry4b).should.be.true

      @bidBookEntry4a.add @bidBookEntry7a
      @bidBookEntry4b.add @bidBookEntry7b
      @bidBookEntry4a.equals(@bidBookEntry4b).should.be.true

    it 'should return false if the trees are different', ->
      @bidBookEntry4a.equals(@bidBookEntry5b).should.be.false

      @bidBookEntry4a.add @bidBookEntry5a
      @bidBookEntry4a.equals(@bidBookEntry4b).should.be.false
      @bidBookEntry4b.equals(@bidBookEntry4a).should.be.false

      @bidBookEntry4b.add @bidBookEntry6b
      @bidBookEntry4a.equals(@bidBookEntry4b).should.be.false
      @bidBookEntry4b.equals(@bidBookEntry4a).should.be.false

      @bidBookEntry3a.add @bidBookEntry2a
      @bidBookEntry3a.equals(@bidBookEntry3b).should.be.false
      @bidBookEntry3b.equals(@bidBookEntry3a).should.be.false

      @bidBookEntry3b.add @bidBookEntry1b
      @bidBookEntry3a.equals(@bidBookEntry3b).should.be.false
      @bidBookEntry3b.equals(@bidBookEntry3a).should.be.false

  describe '#export', ->
    it 'should export the tree as a JSON stringifiable object that can be used to initialise a new tree in the exact same state and populate a new entries collection keyed by order ID', ->
      orders = Object.create null
      orders['1'] = newBid amount1, '1'
      bookEntry1 = new BookEntry 
        order: orders['1']
      orders['2'] = newBid amount2, '2'
      bookEntry2 = new BookEntry 
        order: orders['2']
      orders['3'] = newBid amount3, '3'
      bookEntry3 = new BookEntry 
        order: orders['3']
      orders['4'] = newBid amount4, '4'
      bookEntry4 = new BookEntry 
        order: orders['4']
      orders['5'] = newBid amount5, '5'
      bookEntry5 = new BookEntry 
        order: orders['5']
      orders['6'] = newBid amount6, '6'
      bookEntry6 = new BookEntry 
        order: orders['6']
      orders['7'] = newBid amount7, '7'
      bookEntry7 = new BookEntry 
        order: orders['7']
      orders['8'] = newBid amount8, '8'
      bookEntry8 = new BookEntry 
        order: orders['8']

      bookEntry4.add bookEntry2
      bookEntry4.add bookEntry6
      bookEntry4.add bookEntry3
      bookEntry4.add bookEntry1
      bookEntry4.add bookEntry5
      bookEntry4.add bookEntry7
      bookEntry4.add bookEntry8

      entries = Object.create null
      state = bookEntry4.export()
      json = JSON.stringify state
      bookEntry = new BookEntry
        state: JSON.parse json
        orders: orders
        entries: entries
      entries['1'].order.should.equal orders['1']
      entries['1'].equals(bookEntry1).should.be.true
      entries['2'].order.should.equal orders['2']
      entries['2'].equals(bookEntry2).should.be.true
      entries['3'].order.should.equal orders['3']
      entries['3'].equals(bookEntry3).should.be.true
      entries['4'].order.should.equal orders['4']
      entries['4'].equals(bookEntry4).should.be.true
      entries['5'].order.should.equal orders['5']
      entries['5'].equals(bookEntry5).should.be.true
      entries['6'].order.should.equal orders['6']
      entries['6'].equals(bookEntry6).should.be.true
      entries['7'].order.should.equal orders['7']
      entries['7'].equals(bookEntry7).should.be.true
      entries['8'].order.should.equal orders['8']
      entries['8'].equals(bookEntry8).should.be.true
      bookEntry.equals(bookEntry4).should.be.true
