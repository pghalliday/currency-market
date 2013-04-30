(function() {
  var Amount, Order, amount100, amount1000, amount101, amount125, amount150, amount1500, amount200, amount25, amount3, amount300, amount4, amount400, amount5, amount50, amount500, amount5000, amount60, amount75, amount7500, amountMinus100, amountMinus50, amountPoint01, amountPoint2, amountPoint25, assert, chai, expect, sinon, sinonChai;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  sinon = require('sinon');

  sinonChai = require('sinon-chai');

  chai.use(sinonChai);

  Order = require('../src/Order');

  Amount = require('../src/Amount');

  amountPoint01 = new Amount('0.01');

  amountPoint2 = new Amount('0.2');

  amountPoint25 = new Amount('0.25');

  amount3 = new Amount('3');

  amount4 = new Amount('4');

  amount5 = new Amount('5');

  amount25 = new Amount('25');

  amount50 = new Amount('50');

  amount75 = new Amount('75');

  amount60 = new Amount('60');

  amount100 = new Amount('100');

  amount101 = new Amount('101');

  amount125 = new Amount('125');

  amount150 = new Amount('150');

  amount200 = new Amount('200');

  amount300 = new Amount('300');

  amount400 = new Amount('400');

  amount500 = new Amount('500');

  amount1000 = new Amount('1000');

  amount1500 = new Amount('1500');

  amount5000 = new Amount('5000');

  amount7500 = new Amount('7500');

  amountMinus50 = new Amount('-50');

  amountMinus100 = new Amount('-100');

  describe('Order', function() {
    it('should throw an error if the ID is missing', function() {
      return expect(function() {
        var order;

        return order = new Order({
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
        });
      }).to["throw"]('Order must have an ID');
    });
    it('should throw an error if the timestamp is missing', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
        });
      }).to["throw"]('Order must have a time stamp');
    });
    it('should throw an error if the account id is missing', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
        });
      }).to["throw"]('Order must be associated with an account');
    });
    it('should throw an error if the bid currency is missing', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
        });
      }).to["throw"]('Order must be associated with a bid currency');
    });
    it('should throw an error if the offer currency is missing', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          bidPrice: amount100,
          bidAmount: amount50
        });
      }).to["throw"]('Order must be associated with an offer currency');
    });
    it('should throw an error if only a bid price is given as it is not enough information to calculate the other fields a bid', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if only an offer price is given as it is not enough information to calculate the other fields a bid', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amount100
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if only a bid amount is given as it is not enough information to calculate the other fields a bid', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidAmount: amount100
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if only a offer amount is given as it is not enough information to calculate the other fields a bid', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerAmount: amount100
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if both the bid price and offer price are given as we do not want to trust the calculations of others', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          offerPrice: amount50,
          bidAmount: amount50
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if the bid price, offer amount and bid amount are given as we do not want to trust the calculations of others', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          offerAmount: amount60,
          bidAmount: amount50
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if the offer price, offer amount and bid amount are given as we do not want to trust the calculations of others', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amount100,
          offerAmount: amount60,
          bidAmount: amount50
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if only amounts are specified as we need to know which amount to satisfy if the order is excuted at a better price', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidAmount: amount100,
          offerAmount: amount50
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if a bid amount and offer price are specified as we need to know which amount to satisfy if the order is excuted at a better price', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidAmount: amount100,
          offerPrice: amount50
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if an offer amount and bid price are specified as we need to know which amount to satisfy if the order is excuted at a better price', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerAmount: amount100,
          bidPrice: amount50
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if the bid amount is negative', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amountMinus50
        });
      }).to["throw"]('bid amount cannot be negative');
    });
    it('should throw an error if the bid price is negative', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amountMinus100,
          bidAmount: amount50
        });
      }).to["throw"]('bid price cannot be negative');
    });
    it('should throw an error if the offer amount is negative', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amount100,
          offerAmount: amountMinus50
        });
      }).to["throw"]('offer amount cannot be negative');
    });
    it('should throw an error if the offer price is negative', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountMinus100,
          offerAmount: amount50
        });
      }).to["throw"]('offer price cannot be negative');
    });
    it('should record the id, timestamp, account name, bid currency and offer currency', function() {
      var order;

      order = new Order({
        id: '123456789',
        timestamp: '987654321',
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: amount100,
        bidAmount: amount50
      });
      order.id.should.equal('123456789');
      order.timestamp.should.equal('987654321');
      order.account.should.equal('name');
      order.bidCurrency.should.equal('BTC');
      return order.offerCurrency.should.equal('EUR');
    });
    it('should instantiate with a bid price and bid amount calculating the offer amount', function() {
      var order;

      order = new Order({
        id: '123456789',
        timestamp: '987654321',
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: amount100,
        bidAmount: amount50
      });
      order.bidPrice.compareTo(amount100).should.equal(0);
      order.bidAmount.compareTo(amount50).should.equal(0);
      return order.offerAmount.compareTo(amount5000).should.equal(0);
    });
    it('should instantiate with an offer price and offer amount calculating the bid amount', function() {
      var order;

      order = new Order({
        id: '123456789',
        timestamp: '987654321',
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        offerPrice: amount100,
        offerAmount: amount50
      });
      order.offerPrice.compareTo(amount100).should.equal(0);
      order.bidAmount.compareTo(amount5000).should.equal(0);
      return order.offerAmount.compareTo(amount50).should.equal(0);
    });
    describe('#equals', function() {
      it('should return true if the orders are identical', function() {
        var order1, order2;

        order1 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
        });
        order2 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
        });
        return order1.equals(order2).should.be["true"];
      });
      it('should return false if the orders have different IDs', function() {
        var order1, order2;

        order1 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
        });
        order2 = new Order({
          id: '123456790',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
        });
        return order1.equals(order2).should.be["false"];
      });
      it('should return false if the orders have different timestamps', function() {
        var order1, order2;

        order1 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
        });
        order2 = new Order({
          id: '123456789',
          timestamp: '987654322',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
        });
        return order1.equals(order2).should.be["false"];
      });
      it('should return false if the orders have different accounts', function() {
        var order1, order2;

        order1 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
        });
        order2 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'another name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
        });
        return order1.equals(order2).should.be["false"];
      });
      it('should return false if the orders have different bid currencies', function() {
        var order1, order2;

        order1 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
        });
        order2 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'USD',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
        });
        return order1.equals(order2).should.be["false"];
      });
      it('should return false if the orders have different offer currencies', function() {
        var order1, order2;

        order1 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
        });
        order2 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'USD',
          bidPrice: amount100,
          bidAmount: amount50
        });
        return order1.equals(order2).should.be["false"];
      });
      describe('with bid orders', function() {
        it('should return false if the orders have different prices', function() {
          var order1, order2;

          order1 = new Order({
            id: '123456789',
            timestamp: '987654321',
            account: 'name',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            bidPrice: amount100,
            bidAmount: amount50
          });
          order2 = new Order({
            id: '123456789',
            timestamp: '987654321',
            account: 'name',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            bidPrice: amount150,
            bidAmount: amount50
          });
          return order1.equals(order2).should.be["false"];
        });
        return it('should return false if the orders have different amounts', function() {
          var order1, order2;

          order1 = new Order({
            id: '123456789',
            timestamp: '987654321',
            account: 'name',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            bidPrice: amount100,
            bidAmount: amount50
          });
          order2 = new Order({
            id: '123456789',
            timestamp: '987654321',
            account: 'name',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            bidPrice: amount100,
            bidAmount: amount100
          });
          return order1.equals(order2).should.be["false"];
        });
      });
      return describe('with offer orders', function() {
        it('should return false if the orders have different prices', function() {
          var order1, order2;

          order1 = new Order({
            id: '123456789',
            timestamp: '987654321',
            account: 'name',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amount100,
            offerAmount: amount50
          });
          order2 = new Order({
            id: '123456789',
            timestamp: '987654321',
            account: 'name',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amount150,
            offerAmount: amount50
          });
          return order1.equals(order2).should.be["false"];
        });
        return it('should return false if the orders have different amounts', function() {
          var order1, order2;

          order1 = new Order({
            id: '123456789',
            timestamp: '987654321',
            account: 'name',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amount100,
            offerAmount: amount50
          });
          order2 = new Order({
            id: '123456789',
            timestamp: '987654321',
            account: 'name',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amount100,
            offerAmount: amount100
          });
          return order1.equals(order2).should.be["false"];
        });
      });
    });
    it('should return false if the orders are different types', function() {
      var order1, order2;

      order1 = new Order({
        id: '123456789',
        timestamp: '987654321',
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        offerPrice: amount100,
        offerAmount: amount50
      });
      order2 = new Order({
        id: '123456789',
        timestamp: '987654321',
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: amount100,
        bidAmount: amount100
      });
      return order1.equals(order2).should.be["false"];
    });
    describe('#match', function() {
      describe('where the existing (right) order is an offer', function() {
        beforeEach(function() {
          this.order = new Order({
            id: '1',
            timestamp: '1',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amountPoint2,
            offerAmount: amount1000
          });
          this.fillSpy = sinon.spy();
          this.order.on('fill', this.fillSpy);
          this.tradeSpy = sinon.spy();
          return this.order.on('trade', this.tradeSpy);
        });
        describe('and the new (left) price is same', function() {
          describe('and the left order is a bid', function() {
            describe('and the right order is offering exactly the amount the left order is bidding', function() {
              return it('should trade the amount the right order is offering, emit fill events and a trade event and return false to indicate that no higher trades can be filled by the left order', function() {
                var fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  bidPrice: amountPoint2,
                  bidAmount: amount1000
                });
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].order.should.equal(order);
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].order.should.equal(this.order);
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
              });
            });
            describe('and the right order is offering more than the left order is bidding', function() {
              return it('should trade the amount the left order is offering, emit fill events and a trade event and return false to indicate that higher trades may still be filled by the left order', function() {
                var fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  bidPrice: amountPoint2,
                  bidAmount: amount500
                });
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].order.should.equal(order);
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount100).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].order.should.equal(this.order);
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount500).should.equal(0);
                this.order.bidAmount.compareTo(amount100).should.equal(0);
                this.order.offerAmount.compareTo(amount500).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal(0);
              });
            });
            return describe('and the right order is offering less than the left order is bidding', function() {
              return it('should trade the amount the right order is offering, emit fill events and a trade event and return true', function() {
                var fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  bidPrice: amountPoint2,
                  bidAmount: amount1500
                });
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["true"];
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].order.should.equal(order);
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(amount100).should.equal(0);
                order.bidAmount.compareTo(amount500).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].order.should.equal(this.order);
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
              });
            });
          });
          return describe('and the left order is an offer', function() {
            describe('and the right order is offering exactly the amount the left order is offering', function() {
              return it('should trade the amount the right order is offering, emit a fill events and a trade event and return false', function() {
                var fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  offerPrice: amount5,
                  offerAmount: amount200
                });
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].order.should.equal(order);
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].order.should.equal(this.order);
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
              });
            });
            describe('and the right order is offering more than the left order is offering', function() {
              return it('should trade the amount the left order is offering, emit a fill events and a trade event and return false', function() {
                var fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  offerPrice: amount5,
                  offerAmount: amount100
                });
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].order.should.equal(order);
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount100).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].order.should.equal(this.order);
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount500).should.equal(0);
                this.order.bidAmount.compareTo(amount100).should.equal(0);
                this.order.offerAmount.compareTo(amount500).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal(0);
              });
            });
            return describe('and the right order is offering less than the left order is offering', function() {
              return it('should trade the amount the right order is offering, emit fill events and a trade event and return true', function() {
                var fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  offerPrice: amount5,
                  offerAmount: amount300
                });
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["true"];
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].order.should.equal(order);
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(amount100).should.equal(0);
                order.bidAmount.compareTo(amount500).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].order.should.equal(this.order);
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
              });
            });
          });
        });
        return describe('and the new (left) price is the better', function() {
          describe('and the left order is an offer', function() {
            describe('and the right order is offering exactly the amount that the left order is offering multiplied by the right order price', function() {
              return it('should trade the amount the right order is offering at the right order price, emit fill events and a trade event and return false', function() {
                var fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  offerPrice: amount4,
                  offerAmount: amount200
                });
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].order.should.equal(order);
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].order.should.equal(this.order);
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
              });
            });
            describe('and the right order is offering more than the left order is offering multiplied by the right order price', function() {
              return it('should trade the amount the left order is offering at the right order price, emit fill events and a trade event and return false', function() {
                var fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  offerPrice: amount4,
                  offerAmount: amount100
                });
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].order.should.equal(order);
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount100).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].order.should.equal(this.order);
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount500).should.equal(0);
                this.order.bidAmount.compareTo(amount100).should.equal(0);
                this.order.offerAmount.compareTo(amount500).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal(0);
              });
            });
            return describe('and the right order is offering less than the left order is offering multiplied by the right order price', function() {
              return it('should trade the amount the right order is offering at the right order price, emit fill events and a trade event and return true', function() {
                var fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  offerPrice: amount4,
                  offerAmount: amount300
                });
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["true"];
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].order.should.equal(order);
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(amount100).should.equal(0);
                order.bidAmount.compareTo(amount400).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].order.should.equal(this.order);
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
              });
            });
          });
          return describe('and the left order is a bid', function() {
            describe('and the right order is offering exactly the amount that the left order is bidding', function() {
              return it('should trade the amount the right order is offering at the right order price, emit fill events and a trade event and retrun false', function() {
                var fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  bidPrice: amountPoint25,
                  bidAmount: amount1000
                });
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].order.should.equal(order);
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].order.should.equal(this.order);
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
              });
            });
            describe('and the right order is offering more than the left order is bidding', function() {
              return it('should trade the amount the left order is bidding at the right order price, emit fill events and a trade event and return false', function() {
                var fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  bidPrice: amountPoint25,
                  bidAmount: amount500
                });
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].order.should.equal(order);
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount100).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].order.should.equal(this.order);
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount500).should.equal(0);
                this.order.bidAmount.compareTo(amount100).should.equal(0);
                this.order.offerAmount.compareTo(amount500).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal(0);
              });
            });
            return describe('and the right order is offering less than the left order is bidding', function() {
              return it('should trade the amount the right order is offering at the right order price, emit fill events and a trade event and return true', function() {
                var fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  bidPrice: amountPoint25,
                  bidAmount: amount1500
                });
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["true"];
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].order.should.equal(order);
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(amount125).should.equal(0);
                order.bidAmount.compareTo(amount500).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].order.should.equal(this.order);
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
              });
            });
          });
        });
      });
      return describe('where the existing (right) order is a bid', function() {
        beforeEach(function() {
          this.order = new Order({
            id: '1',
            timestamp: '1',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            bidPrice: amount5,
            bidAmount: amount200
          });
          this.fillSpy = sinon.spy();
          this.order.on('fill', this.fillSpy);
          this.tradeSpy = sinon.spy();
          return this.order.on('trade', this.tradeSpy);
        });
        return describe('and the new (left) price is better', function() {
          describe('and the left order is an offer', function() {
            describe('and the right order is bidding exactly the amount that the left order is offering', function() {
              return it('should trade the amount the right order is bidding at the right order price, emit fill events and a trade event and return false', function() {
                var fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  offerPrice: amount4,
                  offerAmount: amount200
                });
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].order.should.equal(order);
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].order.should.equal(this.order);
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal(0);
              });
            });
            describe('and the right order is bidding more than the left order is offering', function() {
              return it('should trade the amount the left order is offering at the right order price, emit fill events and a trade event and return false', function() {
                var fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  offerPrice: amount4,
                  offerAmount: amount100
                });
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].order.should.equal(order);
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount100).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].order.should.equal(this.order);
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount500).should.equal(0);
                this.order.bidAmount.compareTo(amount100).should.equal(0);
                this.order.offerAmount.compareTo(amount500).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount100).should.equal(0);
              });
            });
            return describe('and the right order is bidding less than the left order is offering', function() {
              return it('should trade the amount the right order is bidding at the right order price, emit fill events and a trade event and return true', function() {
                var fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  offerPrice: amount4,
                  offerAmount: amount300
                });
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["true"];
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].order.should.equal(order);
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(amount100).should.equal(0);
                order.bidAmount.compareTo(amount400).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].order.should.equal(this.order);
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal(0);
              });
            });
          });
          return describe('and the left order is a bid', function() {
            describe('and the right order is bidding exactly the amount that the left order is bidding multiplied by the right order price', function() {
              return it('should trade the amount the right order is bidding at the right order price, emit fill events and a trade event and return false', function() {
                var fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  bidPrice: amountPoint25,
                  bidAmount: amount1000
                });
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].order.should.equal(order);
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].order.should.equal(this.order);
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal(0);
              });
            });
            describe('and the right order is bidding more than the left order is bidding multiplied by the right order price', function() {
              return it('should trade the amount the left order is bidding at the right order price, emit fill events and a trade event and return false', function() {
                var fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  bidPrice: amountPoint25,
                  bidAmount: amount500
                });
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].order.should.equal(order);
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount100).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].order.should.equal(this.order);
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount500).should.equal(0);
                this.order.bidAmount.compareTo(amount100).should.equal(0);
                this.order.offerAmount.compareTo(amount500).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount100).should.equal(0);
              });
            });
            return describe('and the right order is bidding less than the left order is bidding multiplied by the right order price', function() {
              return it('should trade the amount the right order is bidding at the right order price, emit fill events and a trade event and return true', function() {
                var fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  bidPrice: amountPoint25,
                  bidAmount: amount1500
                });
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["true"];
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].order.should.equal(order);
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(amount125).should.equal(0);
                order.bidAmount.compareTo(amount500).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].order.should.equal(this.order);
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal(0);
              });
            });
          });
        });
      });
    });
    return describe('#export', function() {
      return it('should export the state of the order as a JSON stringifiable object that can be used to initialise a new order in the exact same state', function() {
        var json, newOrder, order, state;

        order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount100
        });
        state = order["export"]();
        json = JSON.stringify(state);
        newOrder = new Order({
          state: JSON.parse(json)
        });
        return newOrder.equals(order).should.be["true"];
      });
    });
  });

}).call(this);
