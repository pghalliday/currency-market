(function() {
  var Amount, BookEntry, Order, amount1, amount2, amount200, amount3, amount4, amount5, amount6, amount7, amount8, amountPoint2, amountPoint5, assert, chai, expect, newBid, newBidBookEntry, newOffer, newOfferBookEntry, sinon, sinonChai;

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

  amountPoint5 = new Amount('0.5');

  amount1 = new Amount('1');

  amount2 = new Amount('2');

  amount3 = new Amount('3');

  amount4 = new Amount('4');

  amount5 = new Amount('5');

  amount6 = new Amount('6');

  amount7 = new Amount('7');

  amount8 = new Amount('8');

  amount200 = new Amount('200');

  newBid = function(bidPrice, id) {
    return new Order({
      id: id || '1',
      timestamp: '1',
      account: 'Peter',
      bidCurrency: 'EUR',
      offerCurrency: 'BTC',
      bidPrice: bidPrice,
      bidAmount: amount200
    });
  };

  newBidBookEntry = function(bidPrice, id) {
    return new BookEntry({
      order: newBid(bidPrice, id)
    });
  };

  newOffer = function(offerPrice, id) {
    return new Order({
      id: id || '1',
      timestamp: '1',
      account: 'Peter',
      bidCurrency: 'EUR',
      offerCurrency: 'BTC',
      offerPrice: offerPrice,
      offerAmount: amount200
    });
  };

  newOfferBookEntry = function(offerPrice, id) {
    return new BookEntry({
      order: newOffer(offerPrice, id)
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
        this.bidBookEntry = newBidBookEntry(amountPoint2);
        this.higherBidBookEntry = newBidBookEntry(amount1);
        this.evenHigherBidBookEntry = newBidBookEntry(amount2);
        this.equalBidBookEntry = newBidBookEntry(amountPoint2);
        this.secondEqualBidBookEntry = newBidBookEntry(amountPoint2);
        this.offerBookEntry = newOfferBookEntry(amount5);
        this.higherOfferBookEntry = newOfferBookEntry(amount1);
        this.evenHigherOfferBookEntry = newOfferBookEntry(amountPoint5);
        this.equalOfferBookEntry = newOfferBookEntry(amount5);
        return this.secondEqualOfferBookEntry = newOfferBookEntry(amount5);
      });
      describe('only bids', function() {
        describe('on a book entry with no lower or higher entries', function() {
          describe('an entry with a higher bid price', function() {
            return it('should set the higher entry to the BookEntry being added and set the parent on the added BookEntry', function() {
              this.bidBookEntry.add(this.higherBidBookEntry);
              expect(this.bidBookEntry.parent).to.not.be.ok;
              expect(this.bidBookEntry.lower).to.not.be.ok;
              this.bidBookEntry.higher.should.equal(this.higherBidBookEntry);
              this.higherBidBookEntry.parent.should.equal(this.bidBookEntry);
              expect(this.higherBidBookEntry.lower).to.not.be.ok;
              return expect(this.higherBidBookEntry.higher).to.not.be.ok;
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should set the lower entry to the BookEntry being added and set the parent on the added BookEntry', function() {
              this.bidBookEntry.add(this.equalBidBookEntry);
              expect(this.bidBookEntry.parent).to.not.be.ok;
              this.bidBookEntry.lower.should.equal(this.equalBidBookEntry);
              expect(this.bidBookEntry.higher).to.not.be.ok;
              this.equalBidBookEntry.parent.should.equal(this.bidBookEntry);
              expect(this.equalBidBookEntry.lower).to.not.be.ok;
              return expect(this.equalBidBookEntry.higher).to.not.be.ok;
            });
          });
        });
        return describe('on a book entry with both higher and lower entries', function() {
          beforeEach(function() {
            this.bidBookEntry.add(this.equalBidBookEntry);
            this.bidBookEntry.add(this.higherBidBookEntry);
            this.lowerAddSpy = sinon.spy();
            this.higherAddSpy = sinon.spy();
            this.equalBidBookEntry.add = this.lowerAddSpy;
            return this.higherBidBookEntry.add = this.higherAddSpy;
          });
          describe('an entry with a higher bid price', function() {
            return it('should call the add method of the higher BookEntry', function() {
              this.bidBookEntry.add(this.evenHigherBidBookEntry);
              this.lowerAddSpy.should.not.have.been.called;
              return this.higherAddSpy.should.have.been.calledWith(this.evenHigherBidBookEntry);
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should call the add method of the lower BookEntry', function() {
              this.bidBookEntry.add(this.secondEqualBidBookEntry);
              this.lowerAddSpy.should.have.been.calledWith(this.secondEqualBidBookEntry);
              return this.higherAddSpy.should.not.have.been.called;
            });
          });
        });
      });
      describe('only offers', function() {
        describe('on a book entry with no lower or higher entries', function() {
          describe('an entry with a higher bid price', function() {
            return it('should set the higher entry to the BookEntry being added and set the parent on the added BookEntry', function() {
              this.offerBookEntry.add(this.higherOfferBookEntry);
              expect(this.offerBookEntry.parent).to.not.be.ok;
              expect(this.offerBookEntry.lower).to.not.be.ok;
              this.offerBookEntry.higher.should.equal(this.higherOfferBookEntry);
              this.higherOfferBookEntry.parent.should.equal(this.offerBookEntry);
              expect(this.higherOfferBookEntry.lower).to.not.be.ok;
              return expect(this.higherOfferBookEntry.higher).to.not.be.ok;
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should set the lower entry to the BookEntry being added and set the parent on the added BookEntry', function() {
              this.offerBookEntry.add(this.equalOfferBookEntry);
              expect(this.offerBookEntry.parent).to.not.be.ok;
              this.offerBookEntry.lower.should.equal(this.equalOfferBookEntry);
              expect(this.offerBookEntry.higher).to.not.be.ok;
              this.equalOfferBookEntry.parent.should.equal(this.offerBookEntry);
              expect(this.equalOfferBookEntry.lower).to.not.be.ok;
              return expect(this.equalOfferBookEntry.higher).to.not.be.ok;
            });
          });
        });
        return describe('on a book entry with both higher and lower entries', function() {
          beforeEach(function() {
            this.offerBookEntry.add(this.equalOfferBookEntry);
            this.offerBookEntry.add(this.higherOfferBookEntry);
            this.lowerAddSpy = sinon.spy();
            this.higherAddSpy = sinon.spy();
            this.equalOfferBookEntry.add = this.lowerAddSpy;
            return this.higherOfferBookEntry.add = this.higherAddSpy;
          });
          describe('an entry with a higher bid price', function() {
            return it('should call the add method of the higher BookEntry', function() {
              this.offerBookEntry.add(this.evenHigherOfferBookEntry);
              this.lowerAddSpy.should.not.have.been.called;
              return this.higherAddSpy.should.have.been.calledWith(this.evenHigherOfferBookEntry);
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should call the add method of the lower BookEntry', function() {
              this.offerBookEntry.add(this.secondEqualOfferBookEntry);
              this.lowerAddSpy.should.have.been.calledWith(this.secondEqualOfferBookEntry);
              return this.higherAddSpy.should.not.have.been.called;
            });
          });
        });
      });
      describe('an offer to bids', function() {
        describe('on a book entry with no lower or higher entries', function() {
          describe('an entry with a higher bid price', function() {
            return it('should set the higher entry to the BookEntry being added and set the parent on the added BookEntry', function() {
              this.bidBookEntry.add(this.higherOfferBookEntry);
              expect(this.bidBookEntry.parent).to.not.be.ok;
              expect(this.bidBookEntry.lower).to.not.be.ok;
              this.bidBookEntry.higher.should.equal(this.higherOfferBookEntry);
              this.higherOfferBookEntry.parent.should.equal(this.bidBookEntry);
              expect(this.higherOfferBookEntry.lower).to.not.be.ok;
              return expect(this.higherOfferBookEntry.higher).to.not.be.ok;
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should set the lower entry to the BookEntry being added and set the parent on the added BookEntry', function() {
              this.bidBookEntry.add(this.equalOfferBookEntry);
              expect(this.bidBookEntry.parent).to.not.be.ok;
              this.bidBookEntry.lower.should.equal(this.equalOfferBookEntry);
              expect(this.bidBookEntry.higher).to.not.be.ok;
              this.equalOfferBookEntry.parent.should.equal(this.bidBookEntry);
              expect(this.equalOfferBookEntry.lower).to.not.be.ok;
              return expect(this.equalOfferBookEntry.higher).to.not.be.ok;
            });
          });
        });
        return describe('on a book entry with both higher and lower entries', function() {
          beforeEach(function() {
            this.bidBookEntry.add(this.equalBidBookEntry);
            this.bidBookEntry.add(this.higherBidBookEntry);
            this.lowerAddSpy = sinon.spy();
            this.higherAddSpy = sinon.spy();
            this.equalBidBookEntry.add = this.lowerAddSpy;
            return this.higherBidBookEntry.add = this.higherAddSpy;
          });
          describe('an entry with a higher bid price', function() {
            return it('should call the add method of the higher BookEntry', function() {
              this.bidBookEntry.add(this.evenHigherOfferBookEntry);
              this.lowerAddSpy.should.not.have.been.called;
              return this.higherAddSpy.should.have.been.calledWith(this.evenHigherOfferBookEntry);
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should call the add method of the lower BookEntry', function() {
              this.bidBookEntry.add(this.secondEqualOfferBookEntry);
              this.lowerAddSpy.should.have.been.calledWith(this.secondEqualOfferBookEntry);
              return this.higherAddSpy.should.not.have.been.called;
            });
          });
        });
      });
      return describe('a bid to offers', function() {
        describe('on a book entry with no lower or higher entries', function() {
          describe('an entry with a higher bid price', function() {
            return it('should set the higher entry to the BookEntry being added and set the parent on the added BookEntry', function() {
              this.offerBookEntry.add(this.higherBidBookEntry);
              expect(this.offerBookEntry.parent).to.not.be.ok;
              expect(this.offerBookEntry.lower).to.not.be.ok;
              this.offerBookEntry.higher.should.equal(this.higherBidBookEntry);
              this.higherBidBookEntry.parent.should.equal(this.offerBookEntry);
              expect(this.higherBidBookEntry.lower).to.not.be.ok;
              return expect(this.higherBidBookEntry.higher).to.not.be.ok;
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should set the lower entry to the BookEntry being added and set the parent on the added BookEntry', function() {
              this.offerBookEntry.add(this.equalBidBookEntry);
              expect(this.offerBookEntry.parent).to.not.be.ok;
              this.offerBookEntry.lower.should.equal(this.equalBidBookEntry);
              expect(this.offerBookEntry.higher).to.not.be.ok;
              this.equalBidBookEntry.parent.should.equal(this.offerBookEntry);
              expect(this.equalBidBookEntry.lower).to.not.be.ok;
              return expect(this.equalBidBookEntry.higher).to.not.be.ok;
            });
          });
        });
        return describe('on a book entry with both higher and lower entries', function() {
          beforeEach(function() {
            this.offerBookEntry.add(this.equalOfferBookEntry);
            this.offerBookEntry.add(this.higherOfferBookEntry);
            this.lowerAddSpy = sinon.spy();
            this.higherAddSpy = sinon.spy();
            this.equalOfferBookEntry.add = this.lowerAddSpy;
            return this.higherOfferBookEntry.add = this.higherAddSpy;
          });
          describe('an entry with a higher bid price', function() {
            return it('should call the add method of the higher BookEntry', function() {
              this.offerBookEntry.add(this.evenHigherBidBookEntry);
              this.lowerAddSpy.should.not.have.been.called;
              return this.higherAddSpy.should.have.been.calledWith(this.evenHigherBidBookEntry);
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should call the add method of the lower BookEntry', function() {
              this.offerBookEntry.add(this.secondEqualBidBookEntry);
              this.lowerAddSpy.should.have.been.calledWith(this.secondEqualBidBookEntry);
              return this.higherAddSpy.should.not.have.been.called;
            });
          });
        });
      });
    });
    describe('#addLowest', function() {
      describe('with no lower BookEntry', function() {
        return it('should set the lower BookEntry to the given BookEntry regardless of the bidPrice', function() {
          var bookEntry1, bookEntry2;

          bookEntry1 = newBidBookEntry(amount1);
          bookEntry2 = newBidBookEntry(amount2);
          bookEntry1.addLowest(bookEntry2);
          bookEntry1.lower.should.equal(bookEntry2);
          return bookEntry2.parent.should.equal(bookEntry1);
        });
      });
      return describe('with a lower BookEntry', function() {
        return it('should call addLowest with the given BookEntry regardless of the bidPrice', function() {
          var addLowestSpy, bookEntry1, bookEntry2, bookEntry3;

          bookEntry1 = newBidBookEntry(amount1);
          bookEntry2 = newBidBookEntry(amount2);
          bookEntry3 = newBidBookEntry(amount3);
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
        this.bidBookEntry1 = newBidBookEntry(amount1);
        this.bidBookEntry2 = newBidBookEntry(amount2);
        this.bidBookEntry3 = newBidBookEntry(amount3);
        this.bidBookEntry4 = newBidBookEntry(amount4);
        this.bidBookEntry5 = newBidBookEntry(amount5);
        this.bidBookEntry6 = newBidBookEntry(amount6);
        this.bidBookEntry7 = newBidBookEntry(amount7);
        return this.bidBookEntry8 = newBidBookEntry(amount8);
      });
      describe('a BookEntry with a lower parent but no lower or higher', function() {
        return it('should delete the parent higher BookEntry', function() {
          this.bidBookEntry2.add(this.bidBookEntry3);
          this.bidBookEntry2.add(this.bidBookEntry1);
          this.bidBookEntry3["delete"]();
          this.bidBookEntry2.lower.should.equal(this.bidBookEntry1);
          return expect(this.bidBookEntry2.higher).to.not.be.ok;
        });
      });
      describe('a BookEntry with a higher parent but no lower or higher', function() {
        return it('should delete the parent lower BookEntry', function() {
          this.bidBookEntry2.add(this.bidBookEntry3);
          this.bidBookEntry2.add(this.bidBookEntry1);
          this.bidBookEntry1["delete"]();
          expect(this.bidBookEntry2.lower).to.not.be.ok;
          return this.bidBookEntry2.higher.should.equal(this.bidBookEntry3);
        });
      });
      describe('a BookEntry with a lower parent and a lower but no higher BookEntry', function() {
        return it('should set the parent higher to the lower BookEntry and return the lower BookEntry', function() {
          var bookEntry;

          this.bidBookEntry4.add(this.bidBookEntry6);
          this.bidBookEntry4.add(this.bidBookEntry5);
          this.bidBookEntry4.add(this.bidBookEntry3);
          bookEntry = this.bidBookEntry6["delete"]();
          bookEntry.should.equal(this.bidBookEntry5);
          this.bidBookEntry4.lower.should.equal(this.bidBookEntry3);
          this.bidBookEntry5.parent.should.equal(this.bidBookEntry4);
          return this.bidBookEntry4.higher.should.equal(this.bidBookEntry5);
        });
      });
      describe('a BookEntry with a lower parent and a higher but no lower BookEntry', function() {
        return it('should set the parent higher to the higher BookEntry and return the higher BookEntry', function() {
          var bookEntry;

          this.bidBookEntry4.add(this.bidBookEntry6);
          this.bidBookEntry4.add(this.bidBookEntry7);
          this.bidBookEntry4.add(this.bidBookEntry3);
          bookEntry = this.bidBookEntry6["delete"]();
          bookEntry.should.equal(this.bidBookEntry7);
          this.bidBookEntry4.lower.should.equal(this.bidBookEntry3);
          this.bidBookEntry7.parent.should.equal(this.bidBookEntry4);
          return this.bidBookEntry4.higher.should.equal(this.bidBookEntry7);
        });
      });
      describe('a BookEntry with a lower parent and both higher and lower BookEntries', function() {
        return it('should set the parent higher to the higher BookEntry, call addLowest on the higher BookEntry with the lower BookEntry and return the higher BookEntry', function() {
          var addLowestSpy, bookEntry;

          addLowestSpy = sinon.spy();
          this.bidBookEntry7.addLowest = addLowestSpy;
          this.bidBookEntry4.add(this.bidBookEntry6);
          this.bidBookEntry4.add(this.bidBookEntry7);
          this.bidBookEntry4.add(this.bidBookEntry5);
          this.bidBookEntry4.add(this.bidBookEntry3);
          bookEntry = this.bidBookEntry6["delete"]();
          bookEntry.should.equal(this.bidBookEntry7);
          this.bidBookEntry4.lower.should.equal(this.bidBookEntry3);
          this.bidBookEntry7.parent.should.equal(this.bidBookEntry4);
          this.bidBookEntry4.higher.should.equal(this.bidBookEntry7);
          return addLowestSpy.should.have.been.calledWith(this.bidBookEntry5);
        });
      });
      describe('a BookEntry with a higher parent and a lower but no higher BookEntry', function() {
        return it('should set the parent lower to the lower BookEntry and return the lower BookEntry', function() {
          var bookEntry;

          this.bidBookEntry4.add(this.bidBookEntry2);
          this.bidBookEntry4.add(this.bidBookEntry1);
          this.bidBookEntry4.add(this.bidBookEntry5);
          bookEntry = this.bidBookEntry2["delete"]();
          bookEntry.should.equal(this.bidBookEntry1);
          this.bidBookEntry4.lower.should.equal(this.bidBookEntry1);
          this.bidBookEntry1.parent.should.equal(this.bidBookEntry4);
          return this.bidBookEntry4.higher.should.equal(this.bidBookEntry5);
        });
      });
      describe('a BookEntry with a higher parent and a higher but no lower BookEntry', function() {
        return it('should set the parent lower to the higher BookEntry and return the higher BookEntry', function() {
          var bookEntry;

          this.bidBookEntry4.add(this.bidBookEntry2);
          this.bidBookEntry4.add(this.bidBookEntry3);
          this.bidBookEntry4.add(this.bidBookEntry5);
          bookEntry = this.bidBookEntry2["delete"]();
          bookEntry.should.equal(this.bidBookEntry3);
          this.bidBookEntry4.lower.should.equal(this.bidBookEntry3);
          this.bidBookEntry3.parent.should.equal(this.bidBookEntry4);
          return this.bidBookEntry4.higher.should.equal(this.bidBookEntry5);
        });
      });
      describe('a BookEntry with a higher parent and both higher and lower BookEntries', function() {
        return it('should set the parent lower to the higher BookEntry, call addLowest on the higher BookEntry with the lower BookEntry and return the higher BookEntry', function() {
          var addLowestSpy, bookEntry;

          addLowestSpy = sinon.spy();
          this.bidBookEntry3.addLowest = addLowestSpy;
          this.bidBookEntry4.add(this.bidBookEntry2);
          this.bidBookEntry4.add(this.bidBookEntry3);
          this.bidBookEntry4.add(this.bidBookEntry5);
          this.bidBookEntry4.add(this.bidBookEntry1);
          bookEntry = this.bidBookEntry2["delete"]();
          bookEntry.should.equal(this.bidBookEntry3);
          this.bidBookEntry4.lower.should.equal(this.bidBookEntry3);
          this.bidBookEntry3.parent.should.equal(this.bidBookEntry4);
          this.bidBookEntry4.higher.should.equal(this.bidBookEntry5);
          return addLowestSpy.should.have.been.calledWith(this.bidBookEntry1);
        });
      });
      describe('a BookEntry with no parent and a lower but no higher BookEntry', function() {
        return it('should return the lower BookEntry', function() {
          var bookEntry;

          this.bidBookEntry4.add(this.bidBookEntry2);
          bookEntry = this.bidBookEntry4["delete"]();
          bookEntry.should.equal(this.bidBookEntry2);
          return expect(this.bidBookEntry2.parent).to.not.be.ok;
        });
      });
      describe('a BookEntry with no parent and a higher but no lower BookEntry', function() {
        return it('should return the higher BookEntry', function() {
          var bookEntry;

          this.bidBookEntry4.add(this.bidBookEntry6);
          bookEntry = this.bidBookEntry4["delete"]();
          bookEntry.should.equal(this.bidBookEntry6);
          return expect(this.bidBookEntry6.parent).to.not.be.ok;
        });
      });
      return describe('a BookEntry with no parent and both higher and lower BookEntries', function() {
        return it('should call addLowest on the higher BookEntry with the lower BookEntry and return the higher BookEntry', function() {
          var addLowestSpy, bookEntry;

          addLowestSpy = sinon.spy();
          this.bidBookEntry6.addLowest = addLowestSpy;
          this.bidBookEntry4.add(this.bidBookEntry2);
          this.bidBookEntry4.add(this.bidBookEntry6);
          bookEntry = this.bidBookEntry4["delete"]();
          bookEntry.should.equal(this.bidBookEntry6);
          expect(this.bidBookEntry6.parent).to.not.be.ok;
          return addLowestSpy.should.have.been.calledWith(this.bidBookEntry2);
        });
      });
    });
    describe('#getHighest', function() {
      describe('with no higher BookEntry', function() {
        return it('should return itself', function() {
          var bookEntry;

          bookEntry = newBidBookEntry(amount1);
          return bookEntry.getHighest().should.equal(bookEntry);
        });
      });
      return describe('with a higher BookEntry', function() {
        return it('should call getHighest on the higher entry and return the result', function() {
          var bookEntry1, bookEntry2;

          bookEntry1 = newBidBookEntry(amount1);
          bookEntry2 = newBidBookEntry(amount2);
          bookEntry1.add(bookEntry2);
          bookEntry2.getHighest = sinon.stub().returns('stub');
          return bookEntry1.getHighest().should.equal('stub');
        });
      });
    });
    describe('#equals', function() {
      beforeEach(function() {
        this.bidBookEntry1a = newBidBookEntry(amount1);
        this.bidBookEntry1b = newBidBookEntry(amount1);
        this.bidBookEntry2a = newBidBookEntry(amount2);
        this.bidBookEntry2b = newBidBookEntry(amount2);
        this.bidBookEntry3a = newBidBookEntry(amount3);
        this.bidBookEntry3b = newBidBookEntry(amount3);
        this.bidBookEntry4a = newBidBookEntry(amount4);
        this.bidBookEntry4b = newBidBookEntry(amount4);
        this.bidBookEntry5a = newBidBookEntry(amount5);
        this.bidBookEntry5b = newBidBookEntry(amount5);
        this.bidBookEntry6a = newBidBookEntry(amount6);
        this.bidBookEntry6b = newBidBookEntry(amount6);
        this.bidBookEntry7a = newBidBookEntry(amount7);
        this.bidBookEntry7b = newBidBookEntry(amount7);
        this.bidBookEntry8a = newBidBookEntry(amount8);
        return this.bidBookEntry8b = newBidBookEntry(amount8);
      });
      it('should return true if 2 trees are the same', function() {
        this.bidBookEntry4a.equals(this.bidBookEntry4b).should.be["true"];
        this.bidBookEntry4a.add(this.bidBookEntry5a);
        this.bidBookEntry4b.add(this.bidBookEntry5b);
        this.bidBookEntry4a.equals(this.bidBookEntry4b).should.be["true"];
        this.bidBookEntry4a.add(this.bidBookEntry3a);
        this.bidBookEntry4b.add(this.bidBookEntry3b);
        this.bidBookEntry4a.equals(this.bidBookEntry4b).should.be["true"];
        this.bidBookEntry4a.add(this.bidBookEntry2a);
        this.bidBookEntry4b.add(this.bidBookEntry2b);
        this.bidBookEntry4a.equals(this.bidBookEntry4b).should.be["true"];
        this.bidBookEntry4a.add(this.bidBookEntry1a);
        this.bidBookEntry4b.add(this.bidBookEntry1b);
        this.bidBookEntry4a.equals(this.bidBookEntry4b).should.be["true"];
        this.bidBookEntry4a.add(this.bidBookEntry8a);
        this.bidBookEntry4b.add(this.bidBookEntry8b);
        this.bidBookEntry4a.equals(this.bidBookEntry4b).should.be["true"];
        this.bidBookEntry4a.add(this.bidBookEntry6a);
        this.bidBookEntry4b.add(this.bidBookEntry6b);
        this.bidBookEntry4a.equals(this.bidBookEntry4b).should.be["true"];
        this.bidBookEntry4a.add(this.bidBookEntry7a);
        this.bidBookEntry4b.add(this.bidBookEntry7b);
        return this.bidBookEntry4a.equals(this.bidBookEntry4b).should.be["true"];
      });
      return it('should return false if the trees are different', function() {
        this.bidBookEntry4a.equals(this.bidBookEntry5b).should.be["false"];
        this.bidBookEntry4a.add(this.bidBookEntry5a);
        this.bidBookEntry4a.equals(this.bidBookEntry4b).should.be["false"];
        this.bidBookEntry4b.equals(this.bidBookEntry4a).should.be["false"];
        this.bidBookEntry4b.add(this.bidBookEntry6b);
        this.bidBookEntry4a.equals(this.bidBookEntry4b).should.be["false"];
        this.bidBookEntry4b.equals(this.bidBookEntry4a).should.be["false"];
        this.bidBookEntry3a.add(this.bidBookEntry2a);
        this.bidBookEntry3a.equals(this.bidBookEntry3b).should.be["false"];
        this.bidBookEntry3b.equals(this.bidBookEntry3a).should.be["false"];
        this.bidBookEntry3b.add(this.bidBookEntry1b);
        this.bidBookEntry3a.equals(this.bidBookEntry3b).should.be["false"];
        return this.bidBookEntry3b.equals(this.bidBookEntry3a).should.be["false"];
      });
    });
    return describe('#export', function() {
      return it('should export the tree as a JSON stringifiable object that can be used to initialise a new tree in the exact same state and populate a new entries collection keyed by order ID', function() {
        var bookEntry, bookEntry1, bookEntry2, bookEntry3, bookEntry4, bookEntry5, bookEntry6, bookEntry7, bookEntry8, entries, json, orders, state;

        orders = Object.create(null);
        orders['1'] = newBid(amount1, '1');
        bookEntry1 = new BookEntry({
          order: orders['1']
        });
        orders['2'] = newBid(amount2, '2');
        bookEntry2 = new BookEntry({
          order: orders['2']
        });
        orders['3'] = newBid(amount3, '3');
        bookEntry3 = new BookEntry({
          order: orders['3']
        });
        orders['4'] = newBid(amount4, '4');
        bookEntry4 = new BookEntry({
          order: orders['4']
        });
        orders['5'] = newBid(amount5, '5');
        bookEntry5 = new BookEntry({
          order: orders['5']
        });
        orders['6'] = newBid(amount6, '6');
        bookEntry6 = new BookEntry({
          order: orders['6']
        });
        orders['7'] = newBid(amount7, '7');
        bookEntry7 = new BookEntry({
          order: orders['7']
        });
        orders['8'] = newBid(amount8, '8');
        bookEntry8 = new BookEntry({
          order: orders['8']
        });
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
          orders: orders,
          entries: entries
        });
        entries['1'].order.should.equal(orders['1']);
        entries['1'].equals(bookEntry1).should.be["true"];
        entries['2'].order.should.equal(orders['2']);
        entries['2'].equals(bookEntry2).should.be["true"];
        entries['3'].order.should.equal(orders['3']);
        entries['3'].equals(bookEntry3).should.be["true"];
        entries['4'].order.should.equal(orders['4']);
        entries['4'].equals(bookEntry4).should.be["true"];
        entries['5'].order.should.equal(orders['5']);
        entries['5'].equals(bookEntry5).should.be["true"];
        entries['6'].order.should.equal(orders['6']);
        entries['6'].equals(bookEntry6).should.be["true"];
        entries['7'].order.should.equal(orders['7']);
        entries['7'].equals(bookEntry7).should.be["true"];
        entries['8'].order.should.equal(orders['8']);
        entries['8'].equals(bookEntry8).should.be["true"];
        return bookEntry.equals(bookEntry4).should.be["true"];
      });
    });
  });

}).call(this);
