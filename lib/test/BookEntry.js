(function() {
  var Amount, BookEntry, Order, amount1, amount2, amount200, amount3, amount4, amount5, amount6, amount7, amount8, amountPoint2, assert, chai, expect, newBookEntry, sinon, sinonChai;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  sinon = require('sinon');

  sinonChai = require('sinon-chai');

  chai.use(sinonChai);

  BookEntry = require('../src/BookEntry');

  Order = require('../src/Order');

  Amount = require('../src/Amount');

  amountPoint2 = new Amount('0.2');

  amount1 = new Amount('1');

  amount2 = new Amount('2');

  amount3 = new Amount('3');

  amount4 = new Amount('4');

  amount5 = new Amount('5');

  amount6 = new Amount('6');

  amount7 = new Amount('7');

  amount8 = new Amount('8');

  amount200 = new Amount('200');

  newBookEntry = function(bidPrice, id) {
    return new BookEntry({
      order: new Order({
        id: id || '1',
        timestamp: '1',
        account: 'Peter',
        bidCurrency: 'EUR',
        offerCurrency: 'BTC',
        bidPrice: bidPrice,
        bidAmount: amount200
      })
    });
  };

  describe('BookEntry', function() {
    it('should intialise with an order and undefined parent, lower and higher entries', function() {
      var bookEntry, order;

      order = new Order({
        id: '1',
        timestamp: '1',
        account: 'Peter',
        bidCurrency: 'EUR',
        offerCurrency: 'BTC',
        bidPrice: amountPoint2,
        bidAmount: amount200
      });
      bookEntry = new BookEntry({
        order: order
      });
      bookEntry.order.should.equal(order);
      expect(bookEntry.parent).to.not.be.ok;
      expect(bookEntry.lower).to.not.be.ok;
      return expect(bookEntry.higher).to.not.be.ok;
    });
    it('should throw an error if no order is supplied', function() {
      var _this = this;

      return expect(function() {
        var bookEntry;

        return bookEntry = new BookEntry({
          random: ''
        });
      }).to["throw"]('Must supply an order');
    });
    describe('#add', function() {
      beforeEach(function() {
        this.bookEntry = newBookEntry(amountPoint2);
        this.higherBookEntry = newBookEntry(amount1);
        this.evenHigherBookEntry = newBookEntry(amount2);
        this.equalBookEntry = newBookEntry(amountPoint2);
        return this.secondEqualBookEntry = newBookEntry(amountPoint2);
      });
      describe('on a book entry with no lower or higher entries', function() {
        describe('an entry with a higher bid price', function() {
          return it('should set the higher entry to the BookEntry being added and set the parent on the added BookEntry', function() {
            this.bookEntry.add(this.higherBookEntry);
            expect(this.bookEntry.parent).to.not.be.ok;
            expect(this.bookEntry.lower).to.not.be.ok;
            this.bookEntry.higher.should.equal(this.higherBookEntry);
            this.higherBookEntry.parent.should.equal(this.bookEntry);
            expect(this.higherBookEntry.lower).to.not.be.ok;
            return expect(this.higherBookEntry.higher).to.not.be.ok;
          });
        });
        return describe('an entry with the same or lower bid price', function() {
          return it('should set the lower entry to the BookEntry being added and set the parent on the added BookEntry', function() {
            this.bookEntry.add(this.equalBookEntry);
            expect(this.bookEntry.parent).to.not.be.ok;
            this.bookEntry.lower.should.equal(this.equalBookEntry);
            expect(this.bookEntry.higher).to.not.be.ok;
            this.equalBookEntry.parent.should.equal(this.bookEntry);
            expect(this.equalBookEntry.lower).to.not.be.ok;
            return expect(this.equalBookEntry.higher).to.not.be.ok;
          });
        });
      });
      return describe('on a book entry with both higher and lower entries', function() {
        beforeEach(function() {
          this.bookEntry.add(this.equalBookEntry);
          this.bookEntry.add(this.higherBookEntry);
          this.lowerAddSpy = sinon.spy();
          this.higherAddSpy = sinon.spy();
          this.equalBookEntry.add = this.lowerAddSpy;
          return this.higherBookEntry.add = this.higherAddSpy;
        });
        describe('an entry with a higher bid price', function() {
          return it('should call the add method of the higher BookEntry', function() {
            this.bookEntry.add(this.evenHigherBookEntry);
            this.lowerAddSpy.should.not.have.been.called;
            return this.higherAddSpy.should.have.been.calledWith(this.evenHigherBookEntry);
          });
        });
        return describe('an entry with the same or lower bid price', function() {
          return it('should call the add method of the lower BookEntry', function() {
            this.bookEntry.add(this.secondEqualBookEntry);
            this.lowerAddSpy.should.have.been.calledWith(this.secondEqualBookEntry);
            return this.higherAddSpy.should.not.have.been.called;
          });
        });
      });
    });
    describe('#addLowest', function() {
      describe('with no lower BookEntry', function() {
        return it('should set the lower BookEntry to the given BookEntry regardless of the bidPrice', function() {
          var bookEntry1, bookEntry2;

          bookEntry1 = newBookEntry(amount1);
          bookEntry2 = newBookEntry(amount2);
          bookEntry1.addLowest(bookEntry2);
          bookEntry1.lower.should.equal(bookEntry2);
          return bookEntry2.parent.should.equal(bookEntry1);
        });
      });
      return describe('with a lower BookEntry', function() {
        return it('should call addLowest with the given BookEntry regardless of the bidPrice', function() {
          var addLowestSpy, bookEntry1, bookEntry2, bookEntry3;

          bookEntry1 = newBookEntry(amount1);
          bookEntry2 = newBookEntry(amount2);
          bookEntry3 = newBookEntry(amount3);
          bookEntry2.add(bookEntry1);
          addLowestSpy = sinon.spy();
          bookEntry1.addLowest = addLowestSpy;
          bookEntry2.addLowest(bookEntry3);
          return addLowestSpy.should.have.been.calledWith(bookEntry3);
        });
      });
    });
    describe('#delete', function() {
      beforeEach(function() {
        this.bookEntry1 = newBookEntry(amount1);
        this.bookEntry2 = newBookEntry(amount2);
        this.bookEntry3 = newBookEntry(amount3);
        this.bookEntry4 = newBookEntry(amount4);
        this.bookEntry5 = newBookEntry(amount5);
        this.bookEntry6 = newBookEntry(amount6);
        this.bookEntry7 = newBookEntry(amount7);
        return this.bookEntry8 = newBookEntry(amount8);
      });
      describe('a BookEntry with a lower parent but no lower or higher', function() {
        return it('should delete the parent higher BookEntry', function() {
          this.bookEntry2.add(this.bookEntry3);
          this.bookEntry2.add(this.bookEntry1);
          this.bookEntry3["delete"]();
          this.bookEntry2.lower.should.equal(this.bookEntry1);
          return expect(this.bookEntry2.higher).to.not.be.ok;
        });
      });
      describe('a BookEntry with a higher parent but no lower or higher', function() {
        return it('should delete the parent lower BookEntry', function() {
          this.bookEntry2.add(this.bookEntry3);
          this.bookEntry2.add(this.bookEntry1);
          this.bookEntry1["delete"]();
          expect(this.bookEntry2.lower).to.not.be.ok;
          return this.bookEntry2.higher.should.equal(this.bookEntry3);
        });
      });
      describe('a BookEntry with a lower parent and a lower but no higher BookEntry', function() {
        return it('should set the parent higher to the lower BookEntry and return the lower BookEntry', function() {
          var bookEntry;

          this.bookEntry4.add(this.bookEntry6);
          this.bookEntry4.add(this.bookEntry5);
          this.bookEntry4.add(this.bookEntry3);
          bookEntry = this.bookEntry6["delete"]();
          bookEntry.should.equal(this.bookEntry5);
          this.bookEntry4.lower.should.equal(this.bookEntry3);
          this.bookEntry5.parent.should.equal(this.bookEntry4);
          return this.bookEntry4.higher.should.equal(this.bookEntry5);
        });
      });
      describe('a BookEntry with a lower parent and a higher but no lower BookEntry', function() {
        return it('should set the parent higher to the higher BookEntry and return the higher BookEntry', function() {
          var bookEntry;

          this.bookEntry4.add(this.bookEntry6);
          this.bookEntry4.add(this.bookEntry7);
          this.bookEntry4.add(this.bookEntry3);
          bookEntry = this.bookEntry6["delete"]();
          bookEntry.should.equal(this.bookEntry7);
          this.bookEntry4.lower.should.equal(this.bookEntry3);
          this.bookEntry7.parent.should.equal(this.bookEntry4);
          return this.bookEntry4.higher.should.equal(this.bookEntry7);
        });
      });
      describe('a BookEntry with a lower parent and both higher and lower BookEntries', function() {
        return it('should set the parent higher to the higher BookEntry, call addLowest on the higher BookEntry with the lower BookEntry and return the higher BookEntry', function() {
          var addLowestSpy, bookEntry;

          addLowestSpy = sinon.spy();
          this.bookEntry7.addLowest = addLowestSpy;
          this.bookEntry4.add(this.bookEntry6);
          this.bookEntry4.add(this.bookEntry7);
          this.bookEntry4.add(this.bookEntry5);
          this.bookEntry4.add(this.bookEntry3);
          bookEntry = this.bookEntry6["delete"]();
          bookEntry.should.equal(this.bookEntry7);
          this.bookEntry4.lower.should.equal(this.bookEntry3);
          this.bookEntry7.parent.should.equal(this.bookEntry4);
          this.bookEntry4.higher.should.equal(this.bookEntry7);
          return addLowestSpy.should.have.been.calledWith(this.bookEntry5);
        });
      });
      describe('a BookEntry with a higher parent and a lower but no higher BookEntry', function() {
        return it('should set the parent lower to the lower BookEntry and return the lower BookEntry', function() {
          var bookEntry;

          this.bookEntry4.add(this.bookEntry2);
          this.bookEntry4.add(this.bookEntry1);
          this.bookEntry4.add(this.bookEntry5);
          bookEntry = this.bookEntry2["delete"]();
          bookEntry.should.equal(this.bookEntry1);
          this.bookEntry4.lower.should.equal(this.bookEntry1);
          this.bookEntry1.parent.should.equal(this.bookEntry4);
          return this.bookEntry4.higher.should.equal(this.bookEntry5);
        });
      });
      describe('a BookEntry with a higher parent and a higher but no lower BookEntry', function() {
        return it('should set the parent lower to the higher BookEntry and return the higher BookEntry', function() {
          var bookEntry;

          this.bookEntry4.add(this.bookEntry2);
          this.bookEntry4.add(this.bookEntry3);
          this.bookEntry4.add(this.bookEntry5);
          bookEntry = this.bookEntry2["delete"]();
          bookEntry.should.equal(this.bookEntry3);
          this.bookEntry4.lower.should.equal(this.bookEntry3);
          this.bookEntry3.parent.should.equal(this.bookEntry4);
          return this.bookEntry4.higher.should.equal(this.bookEntry5);
        });
      });
      describe('a BookEntry with a higher parent and both higher and lower BookEntries', function() {
        return it('should set the parent lower to the higher BookEntry, call addLowest on the higher BookEntry with the lower BookEntry and return the higher BookEntry', function() {
          var addLowestSpy, bookEntry;

          addLowestSpy = sinon.spy();
          this.bookEntry3.addLowest = addLowestSpy;
          this.bookEntry4.add(this.bookEntry2);
          this.bookEntry4.add(this.bookEntry3);
          this.bookEntry4.add(this.bookEntry5);
          this.bookEntry4.add(this.bookEntry1);
          bookEntry = this.bookEntry2["delete"]();
          bookEntry.should.equal(this.bookEntry3);
          this.bookEntry4.lower.should.equal(this.bookEntry3);
          this.bookEntry3.parent.should.equal(this.bookEntry4);
          this.bookEntry4.higher.should.equal(this.bookEntry5);
          return addLowestSpy.should.have.been.calledWith(this.bookEntry1);
        });
      });
      describe('a BookEntry with no parent and a lower but no higher BookEntry', function() {
        return it('should return the lower BookEntry', function() {
          var bookEntry;

          this.bookEntry4.add(this.bookEntry2);
          bookEntry = this.bookEntry4["delete"]();
          bookEntry.should.equal(this.bookEntry2);
          return expect(this.bookEntry2.parent).to.not.be.ok;
        });
      });
      describe('a BookEntry with no parent and a higher but no lower BookEntry', function() {
        return it('should return the higher BookEntry', function() {
          var bookEntry;

          this.bookEntry4.add(this.bookEntry6);
          bookEntry = this.bookEntry4["delete"]();
          bookEntry.should.equal(this.bookEntry6);
          return expect(this.bookEntry6.parent).to.not.be.ok;
        });
      });
      return describe('a BookEntry with no parent and both higher and lower BookEntries', function() {
        return it('should call addLowest on the higher BookEntry with the lower BookEntry and return the higher BookEntry', function() {
          var addLowestSpy, bookEntry;

          addLowestSpy = sinon.spy();
          this.bookEntry6.addLowest = addLowestSpy;
          this.bookEntry4.add(this.bookEntry2);
          this.bookEntry4.add(this.bookEntry6);
          bookEntry = this.bookEntry4["delete"]();
          bookEntry.should.equal(this.bookEntry6);
          expect(this.bookEntry6.parent).to.not.be.ok;
          return addLowestSpy.should.have.been.calledWith(this.bookEntry2);
        });
      });
    });
    describe('#getHighest', function() {
      describe('with no higher BookEntry', function() {
        return it('should return itself', function() {
          var bookEntry;

          bookEntry = newBookEntry(amount1);
          return bookEntry.getHighest().should.equal(bookEntry);
        });
      });
      return describe('with a higher BookEntry', function() {
        return it('should call getHighest on the higher entry and return the result', function() {
          var bookEntry1, bookEntry2;

          bookEntry1 = newBookEntry(amount1);
          bookEntry2 = newBookEntry(amount2);
          bookEntry1.add(bookEntry2);
          bookEntry2.getHighest = sinon.stub().returns('stub');
          return bookEntry1.getHighest().should.equal('stub');
        });
      });
    });
    describe('#equals', function() {
      beforeEach(function() {
        this.bookEntry1a = newBookEntry(amount1);
        this.bookEntry1b = newBookEntry(amount1);
        this.bookEntry2a = newBookEntry(amount2);
        this.bookEntry2b = newBookEntry(amount2);
        this.bookEntry3a = newBookEntry(amount3);
        this.bookEntry3b = newBookEntry(amount3);
        this.bookEntry4a = newBookEntry(amount4);
        this.bookEntry4b = newBookEntry(amount4);
        this.bookEntry5a = newBookEntry(amount5);
        this.bookEntry5b = newBookEntry(amount5);
        this.bookEntry6a = newBookEntry(amount6);
        this.bookEntry6b = newBookEntry(amount6);
        this.bookEntry7a = newBookEntry(amount7);
        this.bookEntry7b = newBookEntry(amount7);
        this.bookEntry8a = newBookEntry(amount8);
        return this.bookEntry8b = newBookEntry(amount8);
      });
      it('should return true if 2 trees are the same', function() {
        this.bookEntry4a.equals(this.bookEntry4b).should.be["true"];
        this.bookEntry4a.add(this.bookEntry5a);
        this.bookEntry4b.add(this.bookEntry5b);
        this.bookEntry4a.equals(this.bookEntry4b).should.be["true"];
        this.bookEntry4a.add(this.bookEntry3a);
        this.bookEntry4b.add(this.bookEntry3b);
        this.bookEntry4a.equals(this.bookEntry4b).should.be["true"];
        this.bookEntry4a.add(this.bookEntry2a);
        this.bookEntry4b.add(this.bookEntry2b);
        this.bookEntry4a.equals(this.bookEntry4b).should.be["true"];
        this.bookEntry4a.add(this.bookEntry1a);
        this.bookEntry4b.add(this.bookEntry1b);
        this.bookEntry4a.equals(this.bookEntry4b).should.be["true"];
        this.bookEntry4a.add(this.bookEntry8a);
        this.bookEntry4b.add(this.bookEntry8b);
        this.bookEntry4a.equals(this.bookEntry4b).should.be["true"];
        this.bookEntry4a.add(this.bookEntry6a);
        this.bookEntry4b.add(this.bookEntry6b);
        this.bookEntry4a.equals(this.bookEntry4b).should.be["true"];
        this.bookEntry4a.add(this.bookEntry7a);
        this.bookEntry4b.add(this.bookEntry7b);
        return this.bookEntry4a.equals(this.bookEntry4b).should.be["true"];
      });
      return it('should return false if the trees are different', function() {
        this.bookEntry4a.equals(this.bookEntry5b).should.be["false"];
        this.bookEntry4a.add(this.bookEntry5a);
        this.bookEntry4a.equals(this.bookEntry4b).should.be["false"];
        this.bookEntry4b.equals(this.bookEntry4a).should.be["false"];
        this.bookEntry4b.add(this.bookEntry6b);
        this.bookEntry4a.equals(this.bookEntry4b).should.be["false"];
        this.bookEntry4b.equals(this.bookEntry4a).should.be["false"];
        this.bookEntry3a.add(this.bookEntry2a);
        this.bookEntry3a.equals(this.bookEntry3b).should.be["false"];
        this.bookEntry3b.equals(this.bookEntry3a).should.be["false"];
        this.bookEntry3b.add(this.bookEntry1b);
        this.bookEntry3a.equals(this.bookEntry3b).should.be["false"];
        return this.bookEntry3b.equals(this.bookEntry3a).should.be["false"];
      });
    });
    return describe('#export', function() {
      return it('should export the tree as a JSON stringifiable object that can be used to initialise a new tree in the exact same state and populate a new entries collection keyed by order ID', function() {
        var bookEntry, bookEntry1, bookEntry2, bookEntry3, bookEntry4, bookEntry5, bookEntry6, bookEntry7, bookEntry8, entries, json, state;

        bookEntry1 = newBookEntry(amount1, '1');
        bookEntry2 = newBookEntry(amount2, '2');
        bookEntry3 = newBookEntry(amount3, '3');
        bookEntry4 = newBookEntry(amount4, '4');
        bookEntry5 = newBookEntry(amount5, '5');
        bookEntry6 = newBookEntry(amount6, '6');
        bookEntry7 = newBookEntry(amount7, '7');
        bookEntry8 = newBookEntry(amount8, '8');
        bookEntry4.add(bookEntry2);
        bookEntry4.add(bookEntry6);
        bookEntry4.add(bookEntry3);
        bookEntry4.add(bookEntry1);
        bookEntry4.add(bookEntry5);
        bookEntry4.add(bookEntry7);
        bookEntry4.add(bookEntry8);
        entries = Object.create(null);
        state = bookEntry4["export"]();
        json = JSON.stringify(state);
        bookEntry = new BookEntry({
          state: JSON.parse(json),
          entries: entries
        });
        bookEntry.equals(bookEntry4).should.be["true"];
        entries['1'].equals(bookEntry1).should.be["true"];
        entries['2'].equals(bookEntry2).should.be["true"];
        entries['3'].equals(bookEntry3).should.be["true"];
        entries['4'].equals(bookEntry4).should.be["true"];
        entries['5'].equals(bookEntry5).should.be["true"];
        entries['6'].equals(bookEntry6).should.be["true"];
        entries['7'].equals(bookEntry7).should.be["true"];
        return entries['8'].equals(bookEntry8).should.be["true"];
      });
    });
  });

}).call(this);
