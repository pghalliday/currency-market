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
amount1 = new Amount '1'
amount2 = new Amount '2'
amount3 = new Amount '3'
amount4 = new Amount '4'
amount5 = new Amount '5'
amount6 = new Amount '6'
amount7 = new Amount '7'
amount8 = new Amount '8'
amount200 = new Amount '200'

newBookEntry = (bidPrice, id) ->
  new BookEntry
    order: new Order
      id: id || '1'
      timestamp: '1'
      account: 'Peter'
      bidCurrency: 'EUR'
      offerCurrency: 'BTC'
      bidPrice: bidPrice
      bidAmount: amount200

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
      @bookEntry = newBookEntry amountPoint2
      @higherBookEntry = newBookEntry amount1
      @evenHigherBookEntry = newBookEntry amount2
      @equalBookEntry = newBookEntry amountPoint2
      @secondEqualBookEntry = newBookEntry amountPoint2

    describe 'on a book entry with no lower or higher entries', ->
      describe 'an entry with a higher bid price', ->
        it 'should set the higher entry to the BookEntry being added and set the parent on the added BookEntry', ->
          @bookEntry.add @higherBookEntry
          expect(@bookEntry.parent).to.not.be.ok
          expect(@bookEntry.lower).to.not.be.ok
          @bookEntry.higher.should.equal @higherBookEntry
          @higherBookEntry.parent.should.equal @bookEntry
          expect(@higherBookEntry.lower).to.not.be.ok
          expect(@higherBookEntry.higher).to.not.be.ok

      describe 'an entry with the same or lower bid price', ->
        it 'should set the lower entry to the BookEntry being added and set the parent on the added BookEntry', ->
          @bookEntry.add @equalBookEntry
          expect(@bookEntry.parent).to.not.be.ok
          @bookEntry.lower.should.equal @equalBookEntry
          expect(@bookEntry.higher).to.not.be.ok
          @equalBookEntry.parent.should.equal @bookEntry
          expect(@equalBookEntry.lower).to.not.be.ok
          expect(@equalBookEntry.higher).to.not.be.ok

    describe 'on a book entry with both higher and lower entries', ->
      beforeEach ->
        @bookEntry.add @equalBookEntry
        @bookEntry.add @higherBookEntry
        # override the book entry add methods so we can check if they get called
        @lowerAddSpy = sinon.spy()
        @higherAddSpy = sinon.spy()
        @equalBookEntry.add = @lowerAddSpy
        @higherBookEntry.add = @higherAddSpy

      describe 'an entry with a higher bid price', ->
        it 'should call the add method of the higher BookEntry', ->
          @bookEntry.add @evenHigherBookEntry
          @lowerAddSpy.should.not.have.been.called
          @higherAddSpy.should.have.been.calledWith @evenHigherBookEntry

      describe 'an entry with the same or lower bid price', ->
        it 'should call the add method of the lower BookEntry', ->
          @bookEntry.add @secondEqualBookEntry
          @lowerAddSpy.should.have.been.calledWith @secondEqualBookEntry
          @higherAddSpy.should.not.have.been.called

  describe '#addLowest', ->
    describe 'with no lower BookEntry', ->
      it 'should set the lower BookEntry to the given BookEntry regardless of the bidPrice', ->
        bookEntry1 = newBookEntry amount1
        bookEntry2 = newBookEntry amount2
        bookEntry1.addLowest bookEntry2
        bookEntry1.lower.should.equal bookEntry2
        bookEntry2.parent.should.equal bookEntry1

    describe 'with a lower BookEntry', ->
      it 'should call addLowest with the given BookEntry regardless of the bidPrice', ->
        bookEntry1 = newBookEntry amount1
        bookEntry2 = newBookEntry amount2
        bookEntry3 = newBookEntry amount3
        bookEntry2.add bookEntry1
        addLowestSpy = sinon.spy()
        bookEntry1.addLowest = addLowestSpy
        bookEntry2.addLowest bookEntry3
        addLowestSpy.should.have.been.calledWith(bookEntry3)

  describe '#delete', ->
    beforeEach ->
      @bookEntry1 = newBookEntry amount1
      @bookEntry2 = newBookEntry amount2
      @bookEntry3 = newBookEntry amount3
      @bookEntry4 = newBookEntry amount4
      @bookEntry5 = newBookEntry amount5
      @bookEntry6 = newBookEntry amount6
      @bookEntry7 = newBookEntry amount7
      @bookEntry8 = newBookEntry amount8

    describe 'a BookEntry with a lower parent but no lower or higher', ->
      it 'should delete the parent higher BookEntry', ->
        @bookEntry2.add @bookEntry3
        @bookEntry2.add @bookEntry1
        @bookEntry3.delete()
        @bookEntry2.lower.should.equal @bookEntry1
        expect(@bookEntry2.higher).to.not.be.ok

    describe 'a BookEntry with a higher parent but no lower or higher', ->
      it 'should delete the parent lower BookEntry', ->
        @bookEntry2.add @bookEntry3
        @bookEntry2.add @bookEntry1
        @bookEntry1.delete()
        expect(@bookEntry2.lower).to.not.be.ok
        @bookEntry2.higher.should.equal @bookEntry3

    describe 'a BookEntry with a lower parent and a lower but no higher BookEntry', ->
      it 'should set the parent higher to the lower BookEntry and return the lower BookEntry', ->
        @bookEntry4.add @bookEntry6
        @bookEntry4.add @bookEntry5
        @bookEntry4.add @bookEntry3
        bookEntry = @bookEntry6.delete()
        bookEntry.should.equal @bookEntry5
        @bookEntry4.lower.should.equal @bookEntry3
        @bookEntry5.parent.should.equal @bookEntry4
        @bookEntry4.higher.should.equal @bookEntry5

    describe 'a BookEntry with a lower parent and a higher but no lower BookEntry', ->
      it 'should set the parent higher to the higher BookEntry and return the higher BookEntry', ->
        @bookEntry4.add @bookEntry6
        @bookEntry4.add @bookEntry7
        @bookEntry4.add @bookEntry3
        bookEntry = @bookEntry6.delete()
        bookEntry.should.equal @bookEntry7
        @bookEntry4.lower.should.equal @bookEntry3
        @bookEntry7.parent.should.equal @bookEntry4
        @bookEntry4.higher.should.equal @bookEntry7

    describe 'a BookEntry with a lower parent and both higher and lower BookEntries', ->
      it 'should set the parent higher to the higher BookEntry, call addLowest on the higher BookEntry with the lower BookEntry and return the higher BookEntry', ->
        addLowestSpy = sinon.spy()
        @bookEntry7.addLowest = addLowestSpy
        @bookEntry4.add @bookEntry6
        @bookEntry4.add @bookEntry7
        @bookEntry4.add @bookEntry5
        @bookEntry4.add @bookEntry3
        bookEntry = @bookEntry6.delete()
        bookEntry.should.equal @bookEntry7
        @bookEntry4.lower.should.equal @bookEntry3
        @bookEntry7.parent.should.equal @bookEntry4
        @bookEntry4.higher.should.equal @bookEntry7
        addLowestSpy.should.have.been.calledWith @bookEntry5

    describe 'a BookEntry with a higher parent and a lower but no higher BookEntry', ->
      it 'should set the parent lower to the lower BookEntry and return the lower BookEntry', ->
        @bookEntry4.add @bookEntry2
        @bookEntry4.add @bookEntry1
        @bookEntry4.add @bookEntry5
        bookEntry = @bookEntry2.delete()
        bookEntry.should.equal @bookEntry1
        @bookEntry4.lower.should.equal @bookEntry1
        @bookEntry1.parent.should.equal @bookEntry4
        @bookEntry4.higher.should.equal @bookEntry5

    describe 'a BookEntry with a higher parent and a higher but no lower BookEntry', ->
      it 'should set the parent lower to the higher BookEntry and return the higher BookEntry', ->
        @bookEntry4.add @bookEntry2
        @bookEntry4.add @bookEntry3
        @bookEntry4.add @bookEntry5
        bookEntry = @bookEntry2.delete()
        bookEntry.should.equal @bookEntry3
        @bookEntry4.lower.should.equal @bookEntry3
        @bookEntry3.parent.should.equal @bookEntry4
        @bookEntry4.higher.should.equal @bookEntry5

    describe 'a BookEntry with a higher parent and both higher and lower BookEntries', ->
      it 'should set the parent lower to the higher BookEntry, call addLowest on the higher BookEntry with the lower BookEntry and return the higher BookEntry', ->
        addLowestSpy = sinon.spy()
        @bookEntry3.addLowest = addLowestSpy
        @bookEntry4.add @bookEntry2
        @bookEntry4.add @bookEntry3
        @bookEntry4.add @bookEntry5
        @bookEntry4.add @bookEntry1
        bookEntry = @bookEntry2.delete()
        bookEntry.should.equal @bookEntry3
        @bookEntry4.lower.should.equal @bookEntry3
        @bookEntry3.parent.should.equal @bookEntry4
        @bookEntry4.higher.should.equal @bookEntry5
        addLowestSpy.should.have.been.calledWith @bookEntry1

    describe 'a BookEntry with no parent and a lower but no higher BookEntry', ->
      it 'should return the lower BookEntry', ->
        @bookEntry4.add @bookEntry2
        bookEntry = @bookEntry4.delete()
        bookEntry.should.equal @bookEntry2
        expect(@bookEntry2.parent).to.not.be.ok

    describe 'a BookEntry with no parent and a higher but no lower BookEntry', ->
      it 'should return the higher BookEntry', ->
        @bookEntry4.add @bookEntry6
        bookEntry = @bookEntry4.delete()
        bookEntry.should.equal @bookEntry6
        expect(@bookEntry6.parent).to.not.be.ok

    describe 'a BookEntry with no parent and both higher and lower BookEntries', ->
      it 'should call addLowest on the higher BookEntry with the lower BookEntry and return the higher BookEntry', ->
        addLowestSpy = sinon.spy()
        @bookEntry6.addLowest = addLowestSpy
        @bookEntry4.add @bookEntry2
        @bookEntry4.add @bookEntry6
        bookEntry = @bookEntry4.delete()
        bookEntry.should.equal @bookEntry6
        expect(@bookEntry6.parent).to.not.be.ok
        addLowestSpy.should.have.been.calledWith @bookEntry2

  describe '#getHighest', ->
    describe 'with no higher BookEntry', ->
      it 'should return itself', ->
        bookEntry = newBookEntry amount1
        bookEntry.getHighest().should.equal bookEntry

    describe 'with a higher BookEntry', ->
      it 'should call getHighest on the higher entry and return the result', ->
        bookEntry1 = newBookEntry amount1
        bookEntry2 = newBookEntry amount2
        bookEntry1.add bookEntry2
        bookEntry2.getHighest = sinon.stub().returns 'stub'
        bookEntry1.getHighest().should.equal 'stub'

  describe '#equals', ->
    beforeEach ->
      @bookEntry1a = newBookEntry amount1
      @bookEntry1b = newBookEntry amount1
      @bookEntry2a = newBookEntry amount2
      @bookEntry2b = newBookEntry amount2
      @bookEntry3a = newBookEntry amount3
      @bookEntry3b = newBookEntry amount3
      @bookEntry4a = newBookEntry amount4
      @bookEntry4b = newBookEntry amount4
      @bookEntry5a = newBookEntry amount5
      @bookEntry5b = newBookEntry amount5
      @bookEntry6a = newBookEntry amount6
      @bookEntry6b = newBookEntry amount6
      @bookEntry7a = newBookEntry amount7
      @bookEntry7b = newBookEntry amount7
      @bookEntry8a = newBookEntry amount8
      @bookEntry8b = newBookEntry amount8

    it 'should return true if 2 trees are the same', ->
      @bookEntry4a.equals(@bookEntry4b).should.be.true

      @bookEntry4a.add @bookEntry5a
      @bookEntry4b.add @bookEntry5b
      @bookEntry4a.equals(@bookEntry4b).should.be.true

      @bookEntry4a.add @bookEntry3a
      @bookEntry4b.add @bookEntry3b
      @bookEntry4a.equals(@bookEntry4b).should.be.true

      @bookEntry4a.add @bookEntry2a
      @bookEntry4b.add @bookEntry2b
      @bookEntry4a.equals(@bookEntry4b).should.be.true

      @bookEntry4a.add @bookEntry1a
      @bookEntry4b.add @bookEntry1b
      @bookEntry4a.equals(@bookEntry4b).should.be.true

      @bookEntry4a.add @bookEntry8a
      @bookEntry4b.add @bookEntry8b
      @bookEntry4a.equals(@bookEntry4b).should.be.true

      @bookEntry4a.add @bookEntry6a
      @bookEntry4b.add @bookEntry6b
      @bookEntry4a.equals(@bookEntry4b).should.be.true

      @bookEntry4a.add @bookEntry7a
      @bookEntry4b.add @bookEntry7b
      @bookEntry4a.equals(@bookEntry4b).should.be.true

    it 'should return false if the trees are different', ->
      @bookEntry4a.equals(@bookEntry5b).should.be.false

      @bookEntry4a.add @bookEntry5a
      @bookEntry4a.equals(@bookEntry4b).should.be.false
      @bookEntry4b.equals(@bookEntry4a).should.be.false

      @bookEntry4b.add @bookEntry6b
      @bookEntry4a.equals(@bookEntry4b).should.be.false
      @bookEntry4b.equals(@bookEntry4a).should.be.false

      @bookEntry3a.add @bookEntry2a
      @bookEntry3a.equals(@bookEntry3b).should.be.false
      @bookEntry3b.equals(@bookEntry3a).should.be.false

      @bookEntry3b.add @bookEntry1b
      @bookEntry3a.equals(@bookEntry3b).should.be.false
      @bookEntry3b.equals(@bookEntry3a).should.be.false

  describe '#export', ->
    it 'should export the tree as a JSON stringifiable object that can be used to initialise a new tree in the exact same state and populate a new entries collection keyed by order ID', ->
      bookEntry1 = newBookEntry amount1, '1'
      bookEntry2 = newBookEntry amount2, '2'
      bookEntry3 = newBookEntry amount3, '3'
      bookEntry4 = newBookEntry amount4, '4'
      bookEntry5 = newBookEntry amount5, '5'
      bookEntry6 = newBookEntry amount6, '6'
      bookEntry7 = newBookEntry amount7, '7'
      bookEntry8 = newBookEntry amount8, '8'

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
        entries: entries
      bookEntry.equals(bookEntry4).should.be.true
      entries['1'].equals(bookEntry1).should.be.true
      entries['2'].equals(bookEntry2).should.be.true
      entries['3'].equals(bookEntry3).should.be.true
      entries['4'].equals(bookEntry4).should.be.true
      entries['5'].equals(bookEntry5).should.be.true
      entries['6'].equals(bookEntry6).should.be.true
      entries['7'].equals(bookEntry7).should.be.true
      entries['8'].equals(bookEntry8).should.be.true
