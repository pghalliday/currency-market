(function() {
  var Account, Amount, Book, Order, amount1, amount100, amount1000, amount100000, amount101, amount125, amount150, amount1500, amount15000, amount175, amount19800, amount199, amount19900, amount2, amount200, amount2000, amount20000, amount25, amount250, amount275, amount3, amount300, amount375, amount4, amount400, amount48Point5, amount48Point75, amount49, amount495, amount49Point5, amount49Point75, amount5, amount50, amount500, amount5000, amount50Point5, amount50Point75, amount51, amount52, amount53, amount6, amount60, amount7, amount75, amount7500, amount8, amount99, amount99000, amount995, amount99500, amountMinus100, amountMinus50, amountPoint01, amountPoint2, amountPoint25, amountPoint5, assert, chai, expect, sinon, sinonChai;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  sinon = require('sinon');

  sinonChai = require('sinon-chai');

  chai.use(sinonChai);

  Order = require('../../src/Engine/Order');

  Amount = require('../../src/Amount');

  Account = require('../../src/Engine/Account');

  Book = require('../../src/Engine/Book');

  amountPoint01 = new Amount('0.01');

  amountPoint2 = new Amount('0.2');

  amountPoint25 = new Amount('0.25');

  amountPoint5 = new Amount('0.5');

  amount1 = new Amount('1');

  amount2 = new Amount('2');

  amount3 = new Amount('3');

  amount4 = new Amount('4');

  amount5 = new Amount('5');

  amount6 = new Amount('6');

  amount7 = new Amount('7');

  amount8 = new Amount('8');

  amount25 = new Amount('25');

  amount48Point5 = new Amount('48.5');

  amount48Point75 = new Amount('48.75');

  amount49 = new Amount('49');

  amount49Point5 = new Amount('49.5');

  amount49Point75 = new Amount('49.75');

  amount50 = new Amount('50');

  amount50Point5 = new Amount('50.5');

  amount50Point75 = new Amount('50.75');

  amount51 = new Amount('51');

  amount52 = new Amount('52');

  amount53 = new Amount('53');

  amount75 = new Amount('75');

  amount60 = new Amount('60');

  amount99 = new Amount('99');

  amount100 = new Amount('100');

  amount101 = new Amount('101');

  amount125 = new Amount('125');

  amount150 = new Amount('150');

  amount175 = new Amount('175');

  amount199 = new Amount('199');

  amount200 = new Amount('200');

  amount250 = new Amount('250');

  amount275 = new Amount('275');

  amount300 = new Amount('300');

  amount375 = new Amount('375');

  amount400 = new Amount('400');

  amount495 = new Amount('495');

  amount500 = new Amount('500');

  amount995 = new Amount('995');

  amount1000 = new Amount('1000');

  amount1500 = new Amount('1500');

  amount2000 = new Amount('2000');

  amount5000 = new Amount('5000');

  amount7500 = new Amount('7500');

  amount15000 = new Amount('15000');

  amount19800 = new Amount('19800');

  amount19900 = new Amount('19900');

  amount20000 = new Amount('20000');

  amount99000 = new Amount('99000');

  amount99500 = new Amount('99500');

  amount100000 = new Amount('100000');

  amountMinus50 = new Amount('-50');

  amountMinus100 = new Amount('-100');

  describe('Order', function() {
    beforeEach(function() {
      var sequence, timestamp,
        _this = this;

      sequence = 0;
      timestamp = 1371737390976;
      this.bookBTCEUR = new Book({
        bidCurrency: 'BTC',
        offerCurrency: 'EUR'
      });
      this.bookEURBTC = new Book({
        bidCurrency: 'EUR',
        offerCurrency: 'BTC'
      });
      this.commissionAccount = new Account({
        id: 'commission'
      });
      this.balanceCommissionBTC = this.commissionAccount.getBalance('BTC');
      this.balanceCommissionEUR = this.commissionAccount.getBalance('EUR');
      this.accountPeter = new Account({
        id: 'Peter',
        commission: {
          account: this.commissionAccount,
          calculate: function(params) {
            var commission;

            return commission = {
              amount: amount1,
              reference: 'Peter commission level'
            };
          }
        }
      });
      this.accountPeter.deposit({
        currency: 'EUR',
        amount: amount100000
      });
      this.balancePeterBTC = this.accountPeter.getBalance('BTC');
      this.balancePeterEUR = this.accountPeter.getBalance('EUR');
      this.peterBidBTC = function(params) {
        var order;

        order = new Order({
          sequence: sequence++,
          timestamp: timestamp++,
          account: _this.accountPeter,
          book: _this.bookBTCEUR,
          bidPrice: params.price,
          bidAmount: params.amount
        });
        if (!params.skipSubmit) {
          _this.accountPeter.submit(order);
          _this.bookBTCEUR.submit(order);
        }
        return order;
      };
      this.peterOfferEUR = function(params) {
        var order;

        order = new Order({
          sequence: sequence++,
          timestamp: timestamp++,
          account: _this.accountPeter,
          book: _this.bookBTCEUR,
          offerPrice: params.price,
          offerAmount: params.amount
        });
        if (!params.skipSubmit) {
          _this.accountPeter.submit(order);
          _this.bookBTCEUR.submit(order);
        }
        return order;
      };
      this.accountPaul = new Account({
        id: 'Paul',
        commission: {
          account: this.commissionAccount,
          calculate: function(params) {
            var commission;

            return commission = {
              amount: amount5,
              reference: 'Paul commission level'
            };
          }
        }
      });
      this.accountPaul.deposit({
        currency: 'BTC',
        amount: amount20000
      });
      this.balancePaulBTC = this.accountPaul.getBalance('BTC');
      this.balancePaulEUR = this.accountPaul.getBalance('EUR');
      this.paulBidEUR = function(params) {
        var order;

        order = new Order({
          sequence: sequence++,
          timestamp: timestamp++,
          account: _this.accountPaul,
          book: _this.bookEURBTC,
          bidPrice: params.price,
          bidAmount: params.amount
        });
        if (!params.skipSubmit) {
          _this.accountPaul.submit(order);
          _this.bookEURBTC.submit(order);
        }
        return order;
      };
      return this.paulOfferBTC = function(params) {
        var order;

        order = new Order({
          sequence: sequence++,
          timestamp: timestamp++,
          account: _this.accountPaul,
          book: _this.bookEURBTC,
          offerPrice: params.price,
          offerAmount: params.amount
        });
        if (!params.skipSubmit) {
          _this.accountPaul.submit(order);
          _this.bookEURBTC.submit(order);
        }
        return order;
      };
    });
    it('should throw an error if the sequence is missing', function() {
      var account, book;

      book = new Book({
        bidCurrency: 'BTC',
        offerCurrency: 'EUR'
      });
      account = new Account({
        id: 'Peter'
      });
      return expect(function() {
        var order;

        return order = new Order({
          timestamp: 1371737390976,
          account: account,
          book: book,
          bidPrice: amount100,
          bidAmount: amount50
        });
      }).to["throw"]('Order must have a sequence');
    });
    it('should throw an error if the timestamp is missing', function() {
      var account, book;

      book = new Book({
        bidCurrency: 'BTC',
        offerCurrency: 'EUR'
      });
      account = new Account({
        id: 'Peter'
      });
      return expect(function() {
        var order;

        return order = new Order({
          sequence: 0,
          account: account,
          book: book,
          bidPrice: amount100,
          bidAmount: amount50
        });
      }).to["throw"]('Order must have a timestamp');
    });
    it('should throw an error if the account is missing', function() {
      var account, book;

      book = new Book({
        bidCurrency: 'BTC',
        offerCurrency: 'EUR'
      });
      account = new Account({
        id: 'Peter'
      });
      return expect(function() {
        var order;

        return order = new Order({
          sequence: 0,
          timestamp: 1371737390976,
          book: book,
          bidPrice: amount100,
          bidAmount: amount50
        });
      }).to["throw"]('Order must be associated with an account');
    });
    it('should throw an error if the book is missing', function() {
      var account;

      account = new Account({
        id: 'Peter'
      });
      return expect(function() {
        var order;

        return order = new Order({
          sequence: 0,
          timestamp: 1371737390976,
          account: account,
          bidPrice: amount100,
          bidAmount: amount50
        });
      }).to["throw"]('Order must be associated with a book');
    });
    it('should throw an error if only a bid price is given as it is not enough information to calculate the other fields a bid', function() {
      var account, book;

      book = new Book({
        bidCurrency: 'BTC',
        offerCurrency: 'EUR'
      });
      account = new Account({
        id: 'Peter'
      });
      return expect(function() {
        var order;

        return order = new Order({
          sequence: 0,
          timestamp: 1371737390976,
          account: account,
          book: book,
          bidPrice: amount100
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if only an offer price is given as it is not enough information to calculate the other fields a bid', function() {
      var account, book;

      book = new Book({
        bidCurrency: 'BTC',
        offerCurrency: 'EUR'
      });
      account = new Account({
        id: 'Peter'
      });
      return expect(function() {
        var order;

        return order = new Order({
          sequence: 0,
          timestamp: 1371737390976,
          account: account,
          book: book,
          offerPrice: amount100
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if only a bid amount is given as it is not enough information to calculate the other fields a bid', function() {
      var account, book;

      book = new Book({
        bidCurrency: 'BTC',
        offerCurrency: 'EUR'
      });
      account = new Account({
        id: 'Peter'
      });
      return expect(function() {
        var order;

        return order = new Order({
          sequence: 0,
          timestamp: 1371737390976,
          account: account,
          book: book,
          bidAmount: amount100
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if only a offer amount is given as it is not enough information to calculate the other fields a bid', function() {
      var account, book;

      book = new Book({
        bidCurrency: 'BTC',
        offerCurrency: 'EUR'
      });
      account = new Account({
        id: 'Peter'
      });
      return expect(function() {
        var order;

        return order = new Order({
          sequence: 0,
          timestamp: 1371737390976,
          account: account,
          book: book,
          offerAmount: amount100
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if both the bid price, bid amount and offer price are given as we do not want to trust the calculations of others', function() {
      var account, book;

      book = new Book({
        bidCurrency: 'BTC',
        offerCurrency: 'EUR'
      });
      account = new Account({
        id: 'Peter'
      });
      return expect(function() {
        var order;

        return order = new Order({
          sequence: 0,
          timestamp: 1371737390976,
          account: account,
          book: book,
          bidPrice: amount100,
          offerPrice: amount50,
          bidAmount: amount50
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if both the offer price, offer amount and bid price are given as we do not want to trust the calculations of others', function() {
      var account, book;

      book = new Book({
        bidCurrency: 'BTC',
        offerCurrency: 'EUR'
      });
      account = new Account({
        id: 'Peter'
      });
      return expect(function() {
        var order;

        return order = new Order({
          sequence: 0,
          timestamp: 1371737390976,
          account: account,
          book: book,
          bidPrice: amount100,
          offerPrice: amount50,
          offerAmount: amount50
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if the bid price, offer amount and bid amount are given as we do not want to trust the calculations of others', function() {
      var account, book;

      book = new Book({
        bidCurrency: 'BTC',
        offerCurrency: 'EUR'
      });
      account = new Account({
        id: 'Peter'
      });
      return expect(function() {
        var order;

        return order = new Order({
          sequence: 0,
          timestamp: 1371737390976,
          account: account,
          book: book,
          bidPrice: amount100,
          offerAmount: amount60,
          bidAmount: amount50
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if the offer price, offer amount and bid amount are given as we do not want to trust the calculations of others', function() {
      var account, book;

      book = new Book({
        bidCurrency: 'BTC',
        offerCurrency: 'EUR'
      });
      account = new Account({
        id: 'Peter'
      });
      return expect(function() {
        var order;

        return order = new Order({
          sequence: 0,
          timestamp: 1371737390976,
          account: account,
          book: book,
          offerPrice: amount100,
          offerAmount: amount60,
          bidAmount: amount50
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if only amounts are specified as we need to know which amount to satisfy if the order is excuted at a better price', function() {
      var account, book;

      book = new Book({
        bidCurrency: 'BTC',
        offerCurrency: 'EUR'
      });
      account = new Account({
        id: 'Peter'
      });
      return expect(function() {
        var order;

        return order = new Order({
          sequence: 0,
          timestamp: 1371737390976,
          account: account,
          book: book,
          bidAmount: amount100,
          offerAmount: amount50
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if a bid amount and offer price are specified as we need to know which amount to satisfy if the order is excuted at a better price', function() {
      var account, book;

      book = new Book({
        bidCurrency: 'BTC',
        offerCurrency: 'EUR'
      });
      account = new Account({
        id: 'Peter'
      });
      return expect(function() {
        var order;

        return order = new Order({
          sequence: 0,
          timestamp: 1371737390976,
          account: account,
          book: book,
          bidAmount: amount100,
          offerPrice: amount50
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if an offer amount and bid price are specified as we need to know which amount to satisfy if the order is excuted at a better price', function() {
      var account, book;

      book = new Book({
        bidCurrency: 'BTC',
        offerCurrency: 'EUR'
      });
      account = new Account({
        id: 'Peter'
      });
      return expect(function() {
        var order;

        return order = new Order({
          sequence: 0,
          timestamp: 1371737390976,
          account: account,
          book: book,
          offerAmount: amount100,
          bidPrice: amount50
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if the bid amount is negative', function() {
      var _this = this;

      return expect(function() {
        return _this.peterBidBTC({
          price: amount100,
          amount: amountMinus50
        });
      }).to["throw"]('bid amount cannot be negative');
    });
    it('should throw an error if the bid price is negative', function() {
      var _this = this;

      return expect(function() {
        return _this.peterBidBTC({
          price: amountMinus100,
          amount: amount50
        });
      }).to["throw"]('bid price cannot be negative');
    });
    it('should throw an error if the offer amount is negative', function() {
      var _this = this;

      return expect(function() {
        return _this.peterOfferEUR({
          price: amount100,
          amount: amountMinus50
        });
      }).to["throw"]('offer amount cannot be negative');
    });
    it('should throw an error if the offer price is negative', function() {
      var _this = this;

      return expect(function() {
        return _this.peterOfferEUR({
          price: amountMinus100,
          amount: amount50
        });
      }).to["throw"]('offer price cannot be negative');
    });
    it('should record the sequence, timestamp, account, book, price and amounts and set an undefined parent, lower and higher orders', function() {
      var order;

      order = this.peterBidBTC({
        price: amount100,
        amount: amount50
      });
      order.sequence.should.equal(0);
      order.timestamp.should.equal(1371737390976);
      order.account.should.equal(this.accountPeter);
      order.book.should.equal(this.bookBTCEUR);
      order.bidPrice.compareTo(amount100).should.equal(0);
      order.bidAmount.compareTo(amount50).should.equal(0);
      order.offerAmount.compareTo(amount5000).should.equal(0);
      expect(order.parent).to.not.be.ok;
      expect(order.lower).to.not.be.ok;
      expect(order.higher).to.not.be.ok;
      order = this.peterOfferEUR({
        price: amountPoint01,
        amount: amount5000
      });
      order.sequence.should.equal(1);
      order.timestamp.should.equal(1371737390977);
      order.account.should.equal(this.accountPeter);
      order.book.should.equal(this.bookBTCEUR);
      order.offerPrice.compareTo(amountPoint01).should.equal(0);
      order.offerAmount.compareTo(amount5000).should.equal(0);
      return order.bidAmount.compareTo(amount50).should.equal(0);
    });
    describe('#match', function() {
      describe('where the existing (right) order is an offer', function() {
        beforeEach(function() {
          return this.order = this.peterOfferEUR({
            price: amountPoint2,
            amount: amount1000
          });
        });
        describe('and the new (left) price is same', function() {
          describe('and the left order is a bid', function() {
            describe('and the right order is offering exactly the amount the left order is bidding', function() {
              return it('should trade the amount the right order is offering, emit a trade event and return false to indicate that no higher trades can be filled by the left order', function() {
                var order, result;

                order = this.paulBidEUR({
                  price: amountPoint2,
                  amount: amount1000
                });
                result = order.match(this.order);
                result.complete.should.be["true"];
                expect(this.bookBTCEUR.next()).to.not.be.ok;
                expect(this.accountPeter.orders[0]).to.not.be.ok;
                expect(this.bookEURBTC.next()).to.not.be.ok;
                expect(this.accountPaul.orders[1]).to.not.be.ok;
                this.balancePaulBTC.funds.compareTo(amount19800).should.equal(0);
                this.balancePaulEUR.funds.compareTo(amount995).should.equal(0);
                this.balanceCommissionEUR.funds.compareTo(amount5).should.equal(0);
                this.balancePeterEUR.funds.compareTo(amount99000).should.equal(0);
                this.balancePeterBTC.funds.compareTo(amount199).should.equal(0);
                this.balanceCommissionBTC.funds.compareTo(amount1).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                result.trade.timestamp.should.equal(order.timestamp);
                result.trade.left.sequence.should.equal(order.sequence);
                result.trade.left.newBidAmount.compareTo(order.bidAmount).should.equal(0);
                result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal(0);
                result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.reference.should.equal('Paul commission level');
                result.trade.right.sequence.should.equal(this.order.sequence);
                result.trade.right.newOfferAmount.compareTo(this.order.offerAmount).should.equal(0);
                result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal(0);
                result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.reference.should.equal('Peter commission level');
                result.trade.price.compareTo(this.order.offerPrice).should.equal(0);
                return result.trade.amount.compareTo(amount1000).should.equal(0);
              });
            });
            describe('and the right order is offering more than the left order is bidding', function() {
              return it('should trade the amount the left order is offering, emit fill events and a trade event and return false to indicate that higher trades may still be filled by the left order', function() {
                var order, result;

                order = this.paulBidEUR({
                  price: amountPoint2,
                  amount: amount500
                });
                result = order.match(this.order);
                result.complete.should.be["true"];
                this.bookBTCEUR.next().should.equal(this.order);
                this.accountPeter.orders[0].should.equal(this.order);
                expect(this.bookEURBTC.next()).to.not.be.ok;
                expect(this.accountPaul.orders[1]).to.not.be.ok;
                this.balancePaulBTC.funds.compareTo(amount19900).should.equal(0);
                this.balancePaulEUR.funds.compareTo(amount495).should.equal(0);
                this.balanceCommissionEUR.funds.compareTo(amount5).should.equal(0);
                this.balancePeterEUR.funds.compareTo(amount99500).should.equal(0);
                this.balancePeterBTC.funds.compareTo(amount99).should.equal(0);
                this.balanceCommissionBTC.funds.compareTo(amount1).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.bidAmount.compareTo(amount100).should.equal(0);
                this.order.offerAmount.compareTo(amount500).should.equal(0);
                result.trade.timestamp.should.equal(order.timestamp);
                result.trade.left.sequence.should.equal(order.sequence);
                result.trade.left.newBidAmount.compareTo(order.bidAmount).should.equal(0);
                result.trade.left.balanceDeltas.debit.amount.compareTo(amount100).should.equal(0);
                result.trade.left.balanceDeltas.credit.amount.compareTo(amount495).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.reference.should.equal('Paul commission level');
                result.trade.right.sequence.should.equal(this.order.sequence);
                result.trade.right.newOfferAmount.compareTo(this.order.offerAmount).should.equal(0);
                result.trade.right.balanceDeltas.debit.amount.compareTo(amount500).should.equal(0);
                result.trade.right.balanceDeltas.credit.amount.compareTo(amount99).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.reference.should.equal('Peter commission level');
                result.trade.price.compareTo(this.order.offerPrice).should.equal(0);
                return result.trade.amount.compareTo(amount500).should.equal(0);
              });
            });
            return describe('and the right order is offering less than the left order is bidding', function() {
              return it('should trade the amount the right order is offering, emit fill events and a trade event and return true', function() {
                var order, result;

                order = this.paulBidEUR({
                  price: amountPoint2,
                  amount: amount1500
                });
                result = order.match(this.order);
                result.complete.should.be["false"];
                expect(this.bookBTCEUR.next()).to.not.be.ok;
                expect(this.accountPeter.orders[0]).to.not.be.ok;
                this.bookEURBTC.next().should.equal(order);
                this.accountPaul.orders[1].should.equal(order);
                this.balancePaulBTC.funds.compareTo(amount19800).should.equal(0);
                this.balancePaulEUR.funds.compareTo(amount995).should.equal(0);
                this.balanceCommissionEUR.funds.compareTo(amount5).should.equal(0);
                this.balancePeterEUR.funds.compareTo(amount99000).should.equal(0);
                this.balancePeterBTC.funds.compareTo(amount199).should.equal(0);
                this.balanceCommissionBTC.funds.compareTo(amount1).should.equal(0);
                order.offerAmount.compareTo(amount100).should.equal(0);
                order.bidAmount.compareTo(amount500).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                result.trade.timestamp.should.equal(order.timestamp);
                result.trade.left.sequence.should.equal(order.sequence);
                result.trade.left.newBidAmount.compareTo(order.bidAmount).should.equal(0);
                result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal(0);
                result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.reference.should.equal('Paul commission level');
                result.trade.right.sequence.should.equal(this.order.sequence);
                result.trade.right.newOfferAmount.compareTo(this.order.offerAmount).should.equal(0);
                result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal(0);
                result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.reference.should.equal('Peter commission level');
                result.trade.price.compareTo(this.order.offerPrice).should.equal(0);
                return result.trade.amount.compareTo(amount1000).should.equal(0);
              });
            });
          });
          return describe('and the left order is an offer', function() {
            describe('and the right order is offering exactly the amount the left order is offering', function() {
              return it('should trade the amount the right order is offering, emit a fill events and a trade event and return false', function() {
                var order, result;

                order = this.paulOfferBTC({
                  price: amount5,
                  amount: amount200
                });
                result = order.match(this.order);
                result.complete.should.be["true"];
                expect(this.bookBTCEUR.next()).to.not.be.ok;
                expect(this.accountPeter.orders[0]).to.not.be.ok;
                expect(this.bookEURBTC.next()).to.not.be.ok;
                expect(this.accountPaul.orders[1]).to.not.be.ok;
                this.balancePaulBTC.funds.compareTo(amount19800).should.equal(0);
                this.balancePaulEUR.funds.compareTo(amount995).should.equal(0);
                this.balanceCommissionEUR.funds.compareTo(amount5).should.equal(0);
                this.balancePeterEUR.funds.compareTo(amount99000).should.equal(0);
                this.balancePeterBTC.funds.compareTo(amount199).should.equal(0);
                this.balanceCommissionBTC.funds.compareTo(amount1).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                result.trade.timestamp.should.equal(order.timestamp);
                result.trade.left.sequence.should.equal(order.sequence);
                result.trade.left.newOfferAmount.compareTo(order.offerAmount).should.equal(0);
                result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal(0);
                result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.reference.should.equal('Paul commission level');
                result.trade.right.sequence.should.equal(this.order.sequence);
                result.trade.right.newOfferAmount.compareTo(this.order.offerAmount).should.equal(0);
                result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal(0);
                result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.reference.should.equal('Peter commission level');
                result.trade.price.compareTo(this.order.offerPrice).should.equal(0);
                return result.trade.amount.compareTo(amount1000).should.equal(0);
              });
            });
            describe('and the right order is offering more than the left order is offering', function() {
              return it('should trade the amount the left order is offering, emit a fill events and a trade event and return false', function() {
                var order, result;

                order = this.paulOfferBTC({
                  price: amount5,
                  amount: amount100
                });
                result = order.match(this.order);
                result.complete.should.be["true"];
                this.bookBTCEUR.next().should.equal(this.order);
                this.accountPeter.orders[0].should.equal(this.order);
                expect(this.bookEURBTC.next()).to.not.be.ok;
                expect(this.accountPaul.orders[1]).to.not.be.ok;
                this.balancePaulBTC.funds.compareTo(amount19900).should.equal(0);
                this.balancePaulEUR.funds.compareTo(amount495).should.equal(0);
                this.balanceCommissionEUR.funds.compareTo(amount5).should.equal(0);
                this.balancePeterEUR.funds.compareTo(amount99500).should.equal(0);
                this.balancePeterBTC.funds.compareTo(amount99).should.equal(0);
                this.balanceCommissionBTC.funds.compareTo(amount1).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.bidAmount.compareTo(amount100).should.equal(0);
                this.order.offerAmount.compareTo(amount500).should.equal(0);
                result.trade.timestamp.should.equal(order.timestamp);
                result.trade.left.sequence.should.equal(order.sequence);
                result.trade.left.newOfferAmount.compareTo(order.offerAmount).should.equal(0);
                result.trade.left.balanceDeltas.debit.amount.compareTo(amount100).should.equal(0);
                result.trade.left.balanceDeltas.credit.amount.compareTo(amount495).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.reference.should.equal('Paul commission level');
                result.trade.right.sequence.should.equal(this.order.sequence);
                result.trade.right.newOfferAmount.compareTo(this.order.offerAmount).should.equal(0);
                result.trade.right.balanceDeltas.debit.amount.compareTo(amount500).should.equal(0);
                result.trade.right.balanceDeltas.credit.amount.compareTo(amount99).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.reference.should.equal('Peter commission level');
                result.trade.price.compareTo(this.order.offerPrice).should.equal(0);
                return result.trade.amount.compareTo(amount500).should.equal(0);
              });
            });
            return describe('and the right order is offering less than the left order is offering', function() {
              return it('should trade the amount the right order is offering, emit fill events and a trade event and return true', function() {
                var order, result;

                order = this.paulOfferBTC({
                  price: amount5,
                  amount: amount300
                });
                result = order.match(this.order);
                result.complete.should.be["false"];
                expect(this.bookBTCEUR.next()).to.not.be.ok;
                expect(this.accountPeter.orders[0]).to.not.be.ok;
                this.bookEURBTC.next().should.equal(order);
                this.accountPaul.orders[1].should.equal(order);
                this.balancePaulBTC.funds.compareTo(amount19800).should.equal(0);
                this.balancePaulEUR.funds.compareTo(amount995).should.equal(0);
                this.balanceCommissionEUR.funds.compareTo(amount5).should.equal(0);
                this.balancePeterEUR.funds.compareTo(amount99000).should.equal(0);
                this.balancePeterBTC.funds.compareTo(amount199).should.equal(0);
                this.balanceCommissionBTC.funds.compareTo(amount1).should.equal(0);
                order.offerAmount.compareTo(amount100).should.equal(0);
                order.bidAmount.compareTo(amount500).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                result.trade.timestamp.should.equal(order.timestamp);
                result.trade.left.sequence.should.equal(order.sequence);
                result.trade.left.newOfferAmount.compareTo(order.offerAmount).should.equal(0);
                result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal(0);
                result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.reference.should.equal('Paul commission level');
                result.trade.right.sequence.should.equal(this.order.sequence);
                result.trade.right.newOfferAmount.compareTo(this.order.offerAmount).should.equal(0);
                result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal(0);
                result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.reference.should.equal('Peter commission level');
                result.trade.price.compareTo(this.order.offerPrice).should.equal(0);
                return result.trade.amount.compareTo(amount1000).should.equal(0);
              });
            });
          });
        });
        return describe('and the new (left) price is the better', function() {
          describe('and the left order is an offer', function() {
            describe('and the right order is offering exactly the amount that the left order is offering multiplied by the right order price', function() {
              return it('should trade the amount the right order is offering at the right order price, emit fill events and a trade event and return false', function() {
                var order, result;

                order = this.paulOfferBTC({
                  price: amount4,
                  amount: amount200
                });
                result = order.match(this.order);
                result.complete.should.be["true"];
                expect(this.bookBTCEUR.next()).to.not.be.ok;
                expect(this.accountPeter.orders[0]).to.not.be.ok;
                expect(this.bookEURBTC.next()).to.not.be.ok;
                expect(this.accountPaul.orders[1]).to.not.be.ok;
                this.balancePaulBTC.funds.compareTo(amount19800).should.equal(0);
                this.balancePaulEUR.funds.compareTo(amount995).should.equal(0);
                this.balanceCommissionEUR.funds.compareTo(amount5).should.equal(0);
                this.balancePeterEUR.funds.compareTo(amount99000).should.equal(0);
                this.balancePeterBTC.funds.compareTo(amount199).should.equal(0);
                this.balanceCommissionBTC.funds.compareTo(amount1).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                result.trade.timestamp.should.equal(order.timestamp);
                result.trade.left.sequence.should.equal(order.sequence);
                result.trade.left.newOfferAmount.compareTo(order.offerAmount).should.equal(0);
                result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal(0);
                result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.reference.should.equal('Paul commission level');
                result.trade.right.sequence.should.equal(this.order.sequence);
                result.trade.right.newOfferAmount.compareTo(this.order.offerAmount).should.equal(0);
                result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal(0);
                result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.reference.should.equal('Peter commission level');
                result.trade.price.compareTo(this.order.offerPrice).should.equal(0);
                return result.trade.amount.compareTo(amount1000).should.equal(0);
              });
            });
            describe('and the right order is offering more than the left order is offering multiplied by the right order price', function() {
              return it('should trade the amount the left order is offering at the right order price, emit fill events and a trade event and return false', function() {
                var order, result;

                order = this.paulOfferBTC({
                  price: amount4,
                  amount: amount100
                });
                result = order.match(this.order);
                result.complete.should.be["true"];
                this.bookBTCEUR.next().should.equal(this.order);
                this.accountPeter.orders[0].should.equal(this.order);
                expect(this.bookEURBTC.next()).to.not.be.ok;
                expect(this.accountPaul.orders[1]).to.not.be.ok;
                this.balancePaulBTC.funds.compareTo(amount19900).should.equal(0);
                this.balancePaulEUR.funds.compareTo(amount495).should.equal(0);
                this.balanceCommissionEUR.funds.compareTo(amount5).should.equal(0);
                this.balancePeterEUR.funds.compareTo(amount99500).should.equal(0);
                this.balancePeterBTC.funds.compareTo(amount99).should.equal(0);
                this.balanceCommissionBTC.funds.compareTo(amount1).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.bidAmount.compareTo(amount100).should.equal(0);
                this.order.offerAmount.compareTo(amount500).should.equal(0);
                result.trade.timestamp.should.equal(order.timestamp);
                result.trade.left.sequence.should.equal(order.sequence);
                result.trade.left.newOfferAmount.compareTo(order.offerAmount).should.equal(0);
                result.trade.left.balanceDeltas.debit.amount.compareTo(amount100).should.equal(0);
                result.trade.left.balanceDeltas.credit.amount.compareTo(amount495).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.reference.should.equal('Paul commission level');
                result.trade.right.sequence.should.equal(this.order.sequence);
                result.trade.right.newOfferAmount.compareTo(this.order.offerAmount).should.equal(0);
                result.trade.right.balanceDeltas.debit.amount.compareTo(amount500).should.equal(0);
                result.trade.right.balanceDeltas.credit.amount.compareTo(amount99).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.reference.should.equal('Peter commission level');
                result.trade.price.compareTo(this.order.offerPrice).should.equal(0);
                return result.trade.amount.compareTo(amount500).should.equal(0);
              });
            });
            return describe('and the right order is offering less than the left order is offering multiplied by the right order price', function() {
              return it('should trade the amount the right order is offering at the right order price, emit fill events and a trade event and return true', function() {
                var order, result;

                order = this.paulOfferBTC({
                  price: amount4,
                  amount: amount300
                });
                result = order.match(this.order);
                result.complete.should.be["false"];
                expect(this.bookBTCEUR.next()).to.not.be.ok;
                expect(this.accountPeter.orders[0]).to.not.be.ok;
                this.bookEURBTC.next().should.equal(order);
                this.accountPaul.orders[1].should.equal(order);
                this.balancePaulBTC.funds.compareTo(amount19800).should.equal(0);
                this.balancePaulEUR.funds.compareTo(amount995).should.equal(0);
                this.balanceCommissionEUR.funds.compareTo(amount5).should.equal(0);
                this.balancePeterEUR.funds.compareTo(amount99000).should.equal(0);
                this.balancePeterBTC.funds.compareTo(amount199).should.equal(0);
                this.balanceCommissionBTC.funds.compareTo(amount1).should.equal(0);
                order.offerAmount.compareTo(amount100).should.equal(0);
                order.bidAmount.compareTo(amount400).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                result.trade.timestamp.should.equal(order.timestamp);
                result.trade.left.sequence.should.equal(order.sequence);
                result.trade.left.newOfferAmount.compareTo(order.offerAmount).should.equal(0);
                result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal(0);
                result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.reference.should.equal('Paul commission level');
                result.trade.right.sequence.should.equal(this.order.sequence);
                result.trade.right.newOfferAmount.compareTo(this.order.offerAmount).should.equal(0);
                result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal(0);
                result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.reference.should.equal('Peter commission level');
                result.trade.price.compareTo(this.order.offerPrice).should.equal(0);
                return result.trade.amount.compareTo(amount1000).should.equal(0);
              });
            });
          });
          return describe('and the left order is a bid', function() {
            describe('and the right order is offering exactly the amount that the left order is bidding', function() {
              return it('should trade the amount the right order is offering at the right order price, emit fill events and a trade event and retrun false', function() {
                var order, result;

                order = this.paulBidEUR({
                  price: amountPoint25,
                  amount: amount1000
                });
                result = order.match(this.order);
                result.complete.should.be["true"];
                expect(this.bookBTCEUR.next()).to.not.be.ok;
                expect(this.accountPeter.orders[0]).to.not.be.ok;
                expect(this.bookEURBTC.next()).to.not.be.ok;
                expect(this.accountPaul.orders[1]).to.not.be.ok;
                this.balancePaulBTC.funds.compareTo(amount19800).should.equal(0);
                this.balancePaulEUR.funds.compareTo(amount995).should.equal(0);
                this.balanceCommissionEUR.funds.compareTo(amount5).should.equal(0);
                this.balancePeterEUR.funds.compareTo(amount99000).should.equal(0);
                this.balancePeterBTC.funds.compareTo(amount199).should.equal(0);
                this.balanceCommissionBTC.funds.compareTo(amount1).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                result.trade.timestamp.should.equal(order.timestamp);
                result.trade.left.sequence.should.equal(order.sequence);
                result.trade.left.newBidAmount.compareTo(order.bidAmount).should.equal(0);
                result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal(0);
                result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.reference.should.equal('Paul commission level');
                result.trade.right.sequence.should.equal(this.order.sequence);
                result.trade.right.newOfferAmount.compareTo(this.order.offerAmount).should.equal(0);
                result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal(0);
                result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.reference.should.equal('Peter commission level');
                result.trade.price.compareTo(this.order.offerPrice).should.equal(0);
                return result.trade.amount.compareTo(amount1000).should.equal(0);
              });
            });
            describe('and the right order is offering more than the left order is bidding', function() {
              return it('should trade the amount the left order is bidding at the right order price, emit fill events and a trade event and return false', function() {
                var order, result;

                order = this.paulBidEUR({
                  price: amountPoint25,
                  amount: amount500
                });
                result = order.match(this.order);
                result.complete.should.be["true"];
                this.bookBTCEUR.next().should.equal(this.order);
                this.accountPeter.orders[0].should.equal(this.order);
                expect(this.bookEURBTC.next()).to.not.be.ok;
                expect(this.accountPaul.orders[1]).to.not.be.ok;
                this.balancePaulBTC.funds.compareTo(amount19900).should.equal(0);
                this.balancePaulEUR.funds.compareTo(amount495).should.equal(0);
                this.balanceCommissionEUR.funds.compareTo(amount5).should.equal(0);
                this.balancePeterEUR.funds.compareTo(amount99500).should.equal(0);
                this.balancePeterBTC.funds.compareTo(amount99).should.equal(0);
                this.balanceCommissionBTC.funds.compareTo(amount1).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.bidAmount.compareTo(amount100).should.equal(0);
                this.order.offerAmount.compareTo(amount500).should.equal(0);
                result.trade.timestamp.should.equal(order.timestamp);
                result.trade.left.sequence.should.equal(order.sequence);
                result.trade.left.newBidAmount.compareTo(order.bidAmount).should.equal(0);
                result.trade.left.balanceDeltas.debit.amount.compareTo(amount100).should.equal(0);
                result.trade.left.balanceDeltas.credit.amount.compareTo(amount495).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.reference.should.equal('Paul commission level');
                result.trade.right.sequence.should.equal(this.order.sequence);
                result.trade.right.newOfferAmount.compareTo(this.order.offerAmount).should.equal(0);
                result.trade.right.balanceDeltas.debit.amount.compareTo(amount500).should.equal(0);
                result.trade.right.balanceDeltas.credit.amount.compareTo(amount99).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.reference.should.equal('Peter commission level');
                result.trade.price.compareTo(this.order.offerPrice).should.equal(0);
                return result.trade.amount.compareTo(amount500).should.equal(0);
              });
            });
            return describe('and the right order is offering less than the left order is bidding', function() {
              return it('should trade the amount the right order is offering at the right order price, emit fill events and a trade event and return true', function() {
                var order, result;

                order = this.paulBidEUR({
                  price: amountPoint25,
                  amount: amount1500
                });
                result = order.match(this.order);
                result.complete.should.be["false"];
                expect(this.bookBTCEUR.next()).to.not.be.ok;
                expect(this.accountPeter.orders[0]).to.not.be.ok;
                this.bookEURBTC.next().should.equal(order);
                this.accountPaul.orders[1].should.equal(order);
                this.balancePaulBTC.funds.compareTo(amount19800).should.equal(0);
                this.balancePaulEUR.funds.compareTo(amount995).should.equal(0);
                this.balanceCommissionEUR.funds.compareTo(amount5).should.equal(0);
                this.balancePeterEUR.funds.compareTo(amount99000).should.equal(0);
                this.balancePeterBTC.funds.compareTo(amount199).should.equal(0);
                this.balanceCommissionBTC.funds.compareTo(amount1).should.equal(0);
                order.offerAmount.compareTo(amount125).should.equal(0);
                order.bidAmount.compareTo(amount500).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                result.trade.timestamp.should.equal(order.timestamp);
                result.trade.left.sequence.should.equal(order.sequence);
                result.trade.left.newBidAmount.compareTo(order.bidAmount).should.equal(0);
                result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal(0);
                result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.reference.should.equal('Paul commission level');
                result.trade.right.sequence.should.equal(this.order.sequence);
                result.trade.right.newOfferAmount.compareTo(this.order.offerAmount).should.equal(0);
                result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal(0);
                result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.reference.should.equal('Peter commission level');
                result.trade.price.compareTo(this.order.offerPrice).should.equal(0);
                return result.trade.amount.compareTo(amount1000).should.equal(0);
              });
            });
          });
        });
      });
      return describe('where the existing (right) order is a bid', function() {
        beforeEach(function() {
          return this.order = this.peterBidBTC({
            price: amount5,
            amount: amount200
          });
        });
        return describe('and the new (left) price is better', function() {
          describe('and the left order is an offer', function() {
            describe('and the right order is bidding exactly the amount that the left order is offering', function() {
              return it('should trade the amount the right order is bidding at the right order price, emit fill events and a trade event and return false', function() {
                var order, result;

                order = this.paulOfferBTC({
                  price: amount4,
                  amount: amount200
                });
                result = order.match(this.order);
                result.complete.should.be["true"];
                expect(this.bookBTCEUR.next()).to.not.be.ok;
                expect(this.accountPeter.orders[0]).to.not.be.ok;
                expect(this.bookEURBTC.next()).to.not.be.ok;
                expect(this.accountPaul.orders[1]).to.not.be.ok;
                this.balancePaulBTC.funds.compareTo(amount19800).should.equal(0);
                this.balancePaulEUR.funds.compareTo(amount995).should.equal(0);
                this.balanceCommissionEUR.funds.compareTo(amount5).should.equal(0);
                this.balancePeterEUR.funds.compareTo(amount99000).should.equal(0);
                this.balancePeterBTC.funds.compareTo(amount199).should.equal(0);
                this.balanceCommissionBTC.funds.compareTo(amount1).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                result.trade.timestamp.should.equal(order.timestamp);
                result.trade.left.sequence.should.equal(order.sequence);
                result.trade.left.newOfferAmount.compareTo(order.offerAmount).should.equal(0);
                result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal(0);
                result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.reference.should.equal('Paul commission level');
                result.trade.right.sequence.should.equal(this.order.sequence);
                result.trade.right.newBidAmount.compareTo(this.order.bidAmount).should.equal(0);
                result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal(0);
                result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.reference.should.equal('Peter commission level');
                result.trade.price.compareTo(this.order.bidPrice).should.equal(0);
                return result.trade.amount.compareTo(amount200).should.equal(0);
              });
            });
            describe('and the right order is bidding more than the left order is offering', function() {
              return it('should trade the amount the left order is offering at the right order price, emit fill events and a trade event and return false', function() {
                var order, result;

                order = this.paulOfferBTC({
                  price: amount4,
                  amount: amount100
                });
                result = order.match(this.order);
                result.complete.should.be["true"];
                this.bookBTCEUR.next().should.equal(this.order);
                this.accountPeter.orders[0].should.equal(this.order);
                expect(this.bookEURBTC.next()).to.not.be.ok;
                expect(this.accountPaul.orders[1]).to.not.be.ok;
                this.balancePaulBTC.funds.compareTo(amount19900).should.equal(0);
                this.balancePaulEUR.funds.compareTo(amount495).should.equal(0);
                this.balanceCommissionEUR.funds.compareTo(amount5).should.equal(0);
                this.balancePeterEUR.funds.compareTo(amount99500).should.equal(0);
                this.balancePeterBTC.funds.compareTo(amount99).should.equal(0);
                this.balanceCommissionBTC.funds.compareTo(amount1).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.bidAmount.compareTo(amount100).should.equal(0);
                this.order.offerAmount.compareTo(amount500).should.equal(0);
                result.trade.timestamp.should.equal(order.timestamp);
                result.trade.left.sequence.should.equal(order.sequence);
                result.trade.left.newOfferAmount.compareTo(order.offerAmount).should.equal(0);
                result.trade.left.balanceDeltas.debit.amount.compareTo(amount100).should.equal(0);
                result.trade.left.balanceDeltas.credit.amount.compareTo(amount495).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.reference.should.equal('Paul commission level');
                result.trade.right.sequence.should.equal(this.order.sequence);
                result.trade.right.newBidAmount.compareTo(this.order.bidAmount).should.equal(0);
                result.trade.right.balanceDeltas.debit.amount.compareTo(amount500).should.equal(0);
                result.trade.right.balanceDeltas.credit.amount.compareTo(amount99).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.reference.should.equal('Peter commission level');
                result.trade.price.compareTo(this.order.bidPrice).should.equal(0);
                return result.trade.amount.compareTo(amount100).should.equal(0);
              });
            });
            return describe('and the right order is bidding less than the left order is offering', function() {
              return it('should trade the amount the right order is bidding at the right order price, emit fill events and a trade event and return true', function() {
                var order, result;

                order = this.paulOfferBTC({
                  price: amount4,
                  amount: amount300
                });
                result = order.match(this.order);
                result.complete.should.be["false"];
                expect(this.bookBTCEUR.next()).to.not.be.ok;
                expect(this.accountPeter.orders[0]).to.not.be.ok;
                this.bookEURBTC.next().should.equal(order);
                this.accountPaul.orders[1].should.equal(order);
                this.balancePaulBTC.funds.compareTo(amount19800).should.equal(0);
                this.balancePaulEUR.funds.compareTo(amount995).should.equal(0);
                this.balanceCommissionEUR.funds.compareTo(amount5).should.equal(0);
                this.balancePeterEUR.funds.compareTo(amount99000).should.equal(0);
                this.balancePeterBTC.funds.compareTo(amount199).should.equal(0);
                this.balanceCommissionBTC.funds.compareTo(amount1).should.equal(0);
                order.offerAmount.compareTo(amount100).should.equal(0);
                order.bidAmount.compareTo(amount400).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                result.trade.timestamp.should.equal(order.timestamp);
                result.trade.left.sequence.should.equal(order.sequence);
                result.trade.left.newOfferAmount.compareTo(order.offerAmount).should.equal(0);
                result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal(0);
                result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.reference.should.equal('Paul commission level');
                result.trade.right.sequence.should.equal(this.order.sequence);
                result.trade.right.newBidAmount.compareTo(this.order.bidAmount).should.equal(0);
                result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal(0);
                result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.reference.should.equal('Peter commission level');
                result.trade.price.compareTo(this.order.bidPrice).should.equal(0);
                return result.trade.amount.compareTo(amount200).should.equal(0);
              });
            });
          });
          return describe('and the left order is a bid', function() {
            describe('and the right order is bidding exactly the amount that the left order is bidding multiplied by the right order price', function() {
              return it('should trade the amount the right order is bidding at the right order price, emit fill events and a trade event and return false', function() {
                var order, result;

                order = this.paulBidEUR({
                  price: amountPoint25,
                  amount: amount1000
                });
                result = order.match(this.order);
                result.complete.should.be["true"];
                expect(this.bookBTCEUR.next()).to.not.be.ok;
                expect(this.accountPeter.orders[0]).to.not.be.ok;
                expect(this.bookEURBTC.next()).to.not.be.ok;
                expect(this.accountPaul.orders[1]).to.not.be.ok;
                this.balancePaulBTC.funds.compareTo(amount19800).should.equal(0);
                this.balancePaulEUR.funds.compareTo(amount995).should.equal(0);
                this.balanceCommissionEUR.funds.compareTo(amount5).should.equal(0);
                this.balancePeterEUR.funds.compareTo(amount99000).should.equal(0);
                this.balancePeterBTC.funds.compareTo(amount199).should.equal(0);
                this.balanceCommissionBTC.funds.compareTo(amount1).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                result.trade.timestamp.should.equal(order.timestamp);
                result.trade.left.sequence.should.equal(order.sequence);
                result.trade.left.newBidAmount.compareTo(order.bidAmount).should.equal(0);
                result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal(0);
                result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.reference.should.equal('Paul commission level');
                result.trade.right.sequence.should.equal(this.order.sequence);
                result.trade.right.newBidAmount.compareTo(this.order.bidAmount).should.equal(0);
                result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal(0);
                result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.reference.should.equal('Peter commission level');
                result.trade.price.compareTo(this.order.bidPrice).should.equal(0);
                return result.trade.amount.compareTo(amount200).should.equal(0);
              });
            });
            describe('and the right order is bidding more than the left order is bidding multiplied by the right order price', function() {
              return it('should trade the amount the left order is bidding at the right order price, emit fill events and a trade event and return false', function() {
                var order, result;

                order = this.paulBidEUR({
                  price: amountPoint25,
                  amount: amount500
                });
                result = order.match(this.order);
                result.complete.should.be["true"];
                this.bookBTCEUR.next().should.equal(this.order);
                this.accountPeter.orders[0].should.equal(this.order);
                expect(this.bookEURBTC.next()).to.not.be.ok;
                expect(this.accountPaul.orders[1]).to.not.be.ok;
                this.balancePaulBTC.funds.compareTo(amount19900).should.equal(0);
                this.balancePaulEUR.funds.compareTo(amount495).should.equal(0);
                this.balanceCommissionEUR.funds.compareTo(amount5).should.equal(0);
                this.balancePeterEUR.funds.compareTo(amount99500).should.equal(0);
                this.balancePeterBTC.funds.compareTo(amount99).should.equal(0);
                this.balanceCommissionBTC.funds.compareTo(amount1).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.bidAmount.compareTo(amount100).should.equal(0);
                this.order.offerAmount.compareTo(amount500).should.equal(0);
                result.trade.timestamp.should.equal(order.timestamp);
                result.trade.left.sequence.should.equal(order.sequence);
                result.trade.left.newBidAmount.compareTo(order.bidAmount).should.equal(0);
                result.trade.left.balanceDeltas.debit.amount.compareTo(amount100).should.equal(0);
                result.trade.left.balanceDeltas.credit.amount.compareTo(amount495).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.reference.should.equal('Paul commission level');
                result.trade.right.sequence.should.equal(this.order.sequence);
                result.trade.right.newBidAmount.compareTo(this.order.bidAmount).should.equal(0);
                result.trade.right.balanceDeltas.debit.amount.compareTo(amount500).should.equal(0);
                result.trade.right.balanceDeltas.credit.amount.compareTo(amount99).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.reference.should.equal('Peter commission level');
                result.trade.price.compareTo(this.order.bidPrice).should.equal(0);
                return result.trade.amount.compareTo(amount100).should.equal(0);
              });
            });
            return describe('and the right order is bidding less than the left order is bidding multiplied by the right order price', function() {
              return it('should trade the amount the right order is bidding at the right order price, emit fill events and a trade event and return true', function() {
                var order, result;

                order = this.paulBidEUR({
                  price: amountPoint25,
                  amount: amount1500
                });
                result = order.match(this.order);
                result.complete.should.be["false"];
                expect(this.bookBTCEUR.next()).to.not.be.ok;
                expect(this.accountPeter.orders[0]).to.not.be.ok;
                this.bookEURBTC.next().should.equal(order);
                this.accountPaul.orders[1].should.equal(order);
                this.balancePaulBTC.funds.compareTo(amount19800).should.equal(0);
                this.balancePaulEUR.funds.compareTo(amount995).should.equal(0);
                this.balanceCommissionEUR.funds.compareTo(amount5).should.equal(0);
                this.balancePeterEUR.funds.compareTo(amount99000).should.equal(0);
                this.balancePeterBTC.funds.compareTo(amount199).should.equal(0);
                this.balanceCommissionBTC.funds.compareTo(amount1).should.equal(0);
                order.offerAmount.compareTo(amount125).should.equal(0);
                order.bidAmount.compareTo(amount500).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                result.trade.timestamp.should.equal(order.timestamp);
                result.trade.left.sequence.should.equal(order.sequence);
                result.trade.left.newBidAmount.compareTo(order.bidAmount).should.equal(0);
                result.trade.left.balanceDeltas.debit.amount.compareTo(amount200).should.equal(0);
                result.trade.left.balanceDeltas.credit.amount.compareTo(amount995).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.amount.compareTo(amount5).should.equal(0);
                result.trade.left.balanceDeltas.credit.commission.reference.should.equal('Paul commission level');
                result.trade.right.sequence.should.equal(this.order.sequence);
                result.trade.right.newBidAmount.compareTo(this.order.bidAmount).should.equal(0);
                result.trade.right.balanceDeltas.debit.amount.compareTo(amount1000).should.equal(0);
                result.trade.right.balanceDeltas.credit.amount.compareTo(amount199).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.amount.compareTo(amount1).should.equal(0);
                result.trade.right.balanceDeltas.credit.commission.reference.should.equal('Peter commission level');
                result.trade.price.compareTo(this.order.bidPrice).should.equal(0);
                return result.trade.amount.compareTo(amount200).should.equal(0);
              });
            });
          });
        });
      });
    });
    describe('#add', function() {
      beforeEach(function() {
        this.bidOrder = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amountPoint2
        });
        this.higherBidOrder = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount1
        });
        this.evenHigherBidOrder = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount2
        });
        this.equalBidOrder = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amountPoint2
        });
        this.secondEqualBidOrder = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amountPoint2
        });
        this.offerOrder = this.paulOfferBTC({
          skipSubmit: true,
          amount: amount100,
          price: amount5
        });
        this.higherOfferOrder = this.paulOfferBTC({
          skipSubmit: true,
          amount: amount100,
          price: amount1
        });
        this.evenHigherOfferOrder = this.paulOfferBTC({
          skipSubmit: true,
          amount: amount100,
          price: amountPoint5
        });
        this.equalOfferOrder = this.paulOfferBTC({
          skipSubmit: true,
          amount: amount100,
          price: amount5
        });
        return this.secondEqualOfferOrder = this.paulOfferBTC({
          skipSubmit: true,
          amount: amount100,
          price: amount5
        });
      });
      describe('only bids', function() {
        describe('on a book entry with no lower or higher orders', function() {
          describe('an entry with a higher bid price', function() {
            return it('should set the higher entry to the Order being added, set the parent on the added Order and return the next higher order or undefined if there is none', function() {
              var nextHigher;

              nextHigher = this.bidOrder.add(this.higherBidOrder);
              expect(nextHigher).to.not.be.ok;
              expect(this.bidOrder.parent).to.not.be.ok;
              expect(this.bidOrder.lower).to.not.be.ok;
              this.bidOrder.higher.should.equal(this.higherBidOrder);
              this.higherBidOrder.parent.should.equal(this.bidOrder);
              expect(this.higherBidOrder.lower).to.not.be.ok;
              return expect(this.higherBidOrder.higher).to.not.be.ok;
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should set the lower entry to the Order being added, set the parent on the added Order and return the next higher order or undefined if there is none', function() {
              var nextHigher;

              nextHigher = this.bidOrder.add(this.equalBidOrder);
              nextHigher.should.equal(this.bidOrder);
              expect(this.bidOrder.parent).to.not.be.ok;
              this.bidOrder.lower.should.equal(this.equalBidOrder);
              expect(this.bidOrder.higher).to.not.be.ok;
              this.equalBidOrder.parent.should.equal(this.bidOrder);
              expect(this.equalBidOrder.lower).to.not.be.ok;
              return expect(this.equalBidOrder.higher).to.not.be.ok;
            });
          });
        });
        return describe('on a book entry with both higher and lower orders', function() {
          beforeEach(function() {
            this.bidOrder.add(this.equalBidOrder);
            this.bidOrder.add(this.higherBidOrder);
            this.lowerAddSpy = sinon.spy(this.equalBidOrder.add.bind(this.equalBidOrder));
            this.higherAddSpy = sinon.spy(this.higherBidOrder.add.bind(this.higherBidOrder));
            this.equalBidOrder.add = this.lowerAddSpy;
            return this.higherBidOrder.add = this.higherAddSpy;
          });
          describe('an entry with a higher bid price', function() {
            return it('should call the add method of the higher Order and return the next higher order or undefined if there is none', function() {
              var nextHigher;

              nextHigher = this.bidOrder.add(this.evenHigherBidOrder);
              expect(nextHigher).to.not.be.ok;
              this.lowerAddSpy.should.not.have.been.called;
              return this.higherAddSpy.should.have.been.calledWith(this.evenHigherBidOrder);
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should call the add method of the lower Order and return the next higher order or undefined if there is none', function() {
              var nextHigher;

              nextHigher = this.bidOrder.add(this.secondEqualBidOrder);
              nextHigher.should.equal(this.equalBidOrder);
              this.lowerAddSpy.should.have.been.calledWith(this.secondEqualBidOrder);
              return this.higherAddSpy.should.not.have.been.called;
            });
          });
        });
      });
      describe('only offers', function() {
        describe('on a book entry with no lower or higher orders', function() {
          describe('an entry with a higher bid price', function() {
            return it('should set the higher entry to the Order being added, set the parent on the added Order and return the next higher order or undefined if there is none', function() {
              var nextHigher;

              nextHigher = this.offerOrder.add(this.higherOfferOrder);
              expect(nextHigher).to.not.be.ok;
              expect(this.offerOrder.parent).to.not.be.ok;
              expect(this.offerOrder.lower).to.not.be.ok;
              this.offerOrder.higher.should.equal(this.higherOfferOrder);
              this.higherOfferOrder.parent.should.equal(this.offerOrder);
              expect(this.higherOfferOrder.lower).to.not.be.ok;
              return expect(this.higherOfferOrder.higher).to.not.be.ok;
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should set the lower entry to the Order being added, set the parent on the added Order and return the next higher order or undefined if there is none', function() {
              var nextHigher;

              nextHigher = this.offerOrder.add(this.equalOfferOrder);
              nextHigher.should.equal(this.offerOrder);
              expect(this.offerOrder.parent).to.not.be.ok;
              this.offerOrder.lower.should.equal(this.equalOfferOrder);
              expect(this.offerOrder.higher).to.not.be.ok;
              this.equalOfferOrder.parent.should.equal(this.offerOrder);
              expect(this.equalOfferOrder.lower).to.not.be.ok;
              return expect(this.equalOfferOrder.higher).to.not.be.ok;
            });
          });
        });
        return describe('on a book entry with both higher and lower orders', function() {
          beforeEach(function() {
            this.offerOrder.add(this.equalOfferOrder);
            this.offerOrder.add(this.higherOfferOrder);
            this.lowerAddSpy = sinon.spy(this.equalOfferOrder.add.bind(this.equalOfferOrder));
            this.higherAddSpy = sinon.spy(this.higherOfferOrder.add.bind(this.higherOfferOrder));
            this.equalOfferOrder.add = this.lowerAddSpy;
            return this.higherOfferOrder.add = this.higherAddSpy;
          });
          describe('an entry with a higher bid price', function() {
            return it('should call the add method of the higher Order and return the next higher order or undefined if there is none', function() {
              var nextHigher;

              nextHigher = this.offerOrder.add(this.evenHigherOfferOrder);
              expect(nextHigher).to.not.be.ok;
              this.lowerAddSpy.should.not.have.been.called;
              return this.higherAddSpy.should.have.been.calledWith(this.evenHigherOfferOrder);
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should call the add method of the lower Order and return the next higher order or undefined if there is none', function() {
              var nextHigher;

              nextHigher = this.offerOrder.add(this.secondEqualOfferOrder);
              nextHigher.should.equal(this.equalOfferOrder);
              this.lowerAddSpy.should.have.been.calledWith(this.secondEqualOfferOrder);
              return this.higherAddSpy.should.not.have.been.called;
            });
          });
        });
      });
      describe('an offer to bids', function() {
        describe('on a book entry with no lower or higher orders', function() {
          describe('an entry with a higher bid price', function() {
            return it('should set the higher entry to the Order being added, set the parent on the added Order and return the next higher order or undefined if there is none', function() {
              var nextHigher;

              nextHigher = this.bidOrder.add(this.higherOfferOrder);
              expect(nextHigher).to.not.be.ok;
              expect(this.bidOrder.parent).to.not.be.ok;
              expect(this.bidOrder.lower).to.not.be.ok;
              this.bidOrder.higher.should.equal(this.higherOfferOrder);
              this.higherOfferOrder.parent.should.equal(this.bidOrder);
              expect(this.higherOfferOrder.lower).to.not.be.ok;
              return expect(this.higherOfferOrder.higher).to.not.be.ok;
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should set the lower entry to the Order being added, set the parent on the added Order and return the next higher order or undefined if there is none', function() {
              var nextHigher;

              nextHigher = this.bidOrder.add(this.equalOfferOrder);
              nextHigher.should.equal(this.bidOrder);
              expect(this.bidOrder.parent).to.not.be.ok;
              this.bidOrder.lower.should.equal(this.equalOfferOrder);
              expect(this.bidOrder.higher).to.not.be.ok;
              this.equalOfferOrder.parent.should.equal(this.bidOrder);
              expect(this.equalOfferOrder.lower).to.not.be.ok;
              return expect(this.equalOfferOrder.higher).to.not.be.ok;
            });
          });
        });
        return describe('on a book entry with both higher and lower orders', function() {
          beforeEach(function() {
            this.bidOrder.add(this.equalBidOrder);
            this.bidOrder.add(this.higherBidOrder);
            this.lowerAddSpy = sinon.spy(this.equalBidOrder.add.bind(this.equalBidOrder));
            this.higherAddSpy = sinon.spy(this.higherBidOrder.add.bind(this.higherBidOrder));
            this.equalBidOrder.add = this.lowerAddSpy;
            return this.higherBidOrder.add = this.higherAddSpy;
          });
          describe('an entry with a higher bid price', function() {
            return it('should call the add method of the higher Order and return the next higher order or undefined if there is none', function() {
              var nextHigher;

              nextHigher = this.bidOrder.add(this.evenHigherOfferOrder);
              expect(nextHigher).to.not.be.ok;
              this.lowerAddSpy.should.not.have.been.called;
              return this.higherAddSpy.should.have.been.calledWith(this.evenHigherOfferOrder);
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should call the add method of the lower Order and return the next higher order or undefined if there is none', function() {
              var nextHigher;

              nextHigher = this.bidOrder.add(this.secondEqualOfferOrder);
              nextHigher.should.equal(this.equalBidOrder);
              this.lowerAddSpy.should.have.been.calledWith(this.secondEqualOfferOrder);
              return this.higherAddSpy.should.not.have.been.called;
            });
          });
        });
      });
      return describe('a bid to offers', function() {
        describe('on a book entry with no lower or higher orders', function() {
          describe('an entry with a higher bid price', function() {
            return it('should set the higher entry to the Order being added, set the parent on the added Order and return the next higher order or undefined if there is none', function() {
              var nextHigher;

              nextHigher = this.offerOrder.add(this.higherBidOrder);
              expect(nextHigher).to.not.be.ok;
              expect(this.offerOrder.parent).to.not.be.ok;
              expect(this.offerOrder.lower).to.not.be.ok;
              this.offerOrder.higher.should.equal(this.higherBidOrder);
              this.higherBidOrder.parent.should.equal(this.offerOrder);
              expect(this.higherBidOrder.lower).to.not.be.ok;
              return expect(this.higherBidOrder.higher).to.not.be.ok;
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should set the lower entry to the Order being added, set the parent on the added Order and return the next higher order or undefined if there is none', function() {
              var nextHigher;

              nextHigher = this.offerOrder.add(this.equalBidOrder);
              nextHigher.should.equal(this.offerOrder);
              expect(this.offerOrder.parent).to.not.be.ok;
              this.offerOrder.lower.should.equal(this.equalBidOrder);
              expect(this.offerOrder.higher).to.not.be.ok;
              this.equalBidOrder.parent.should.equal(this.offerOrder);
              expect(this.equalBidOrder.lower).to.not.be.ok;
              return expect(this.equalBidOrder.higher).to.not.be.ok;
            });
          });
        });
        return describe('on a book entry with both higher and lower orders', function() {
          beforeEach(function() {
            this.offerOrder.add(this.equalOfferOrder);
            this.offerOrder.add(this.higherOfferOrder);
            this.lowerAddSpy = sinon.spy(this.equalOfferOrder.add.bind(this.equalOfferOrder));
            this.higherAddSpy = sinon.spy(this.higherOfferOrder.add.bind(this.higherOfferOrder));
            this.equalOfferOrder.add = this.lowerAddSpy;
            return this.higherOfferOrder.add = this.higherAddSpy;
          });
          describe('an entry with a higher bid price', function() {
            return it('should call the add method of the higher Order and return the next higher order or undefined if there is none', function() {
              var nextHigher;

              nextHigher = this.offerOrder.add(this.evenHigherBidOrder);
              expect(nextHigher).to.not.be.ok;
              this.lowerAddSpy.should.not.have.been.called;
              return this.higherAddSpy.should.have.been.calledWith(this.evenHigherBidOrder);
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should call the add method of the lower Order and return the next higher order or undefined if there is none', function() {
              var nextHigher;

              nextHigher = this.offerOrder.add(this.secondEqualBidOrder);
              nextHigher.should.equal(this.equalOfferOrder);
              this.lowerAddSpy.should.have.been.calledWith(this.secondEqualBidOrder);
              return this.higherAddSpy.should.not.have.been.called;
            });
          });
        });
      });
    });
    describe('#delete', function() {
      beforeEach(function() {
        this.bidOrder1 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount1
        });
        this.bidOrder2 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount2
        });
        this.bidOrder3 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount3
        });
        this.bidOrder4 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount4
        });
        this.bidOrder5 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount5
        });
        this.bidOrder6 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount6
        });
        this.bidOrder7 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount7
        });
        return this.bidOrder8 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount8
        });
      });
      describe('an Order with a lower parent but no lower or higher', function() {
        return it('should delete the parent higher Order', function() {
          this.bidOrder2.add(this.bidOrder3);
          this.bidOrder2.add(this.bidOrder1);
          this.bidOrder3["delete"]();
          this.bidOrder2.lower.should.equal(this.bidOrder1);
          return expect(this.bidOrder2.higher).to.not.be.ok;
        });
      });
      describe('an Order with a higher parent but no lower or higher', function() {
        return it('should delete the parent lower Order', function() {
          this.bidOrder2.add(this.bidOrder3);
          this.bidOrder2.add(this.bidOrder1);
          this.bidOrder1["delete"]();
          expect(this.bidOrder2.lower).to.not.be.ok;
          return this.bidOrder2.higher.should.equal(this.bidOrder3);
        });
      });
      describe('an Order with a lower parent and a lower but no higher Order', function() {
        return it('should set the parent higher to the lower Order and return the lower Order', function() {
          var order;

          this.bidOrder4.add(this.bidOrder6);
          this.bidOrder4.add(this.bidOrder5);
          this.bidOrder4.add(this.bidOrder3);
          order = this.bidOrder6["delete"]();
          order.should.equal(this.bidOrder5);
          this.bidOrder4.lower.should.equal(this.bidOrder3);
          this.bidOrder5.parent.should.equal(this.bidOrder4);
          return this.bidOrder4.higher.should.equal(this.bidOrder5);
        });
      });
      describe('an Order with a lower parent and a higher but no lower Order', function() {
        return it('should set the parent higher to the higher Order and return the higher Order', function() {
          var order;

          this.bidOrder4.add(this.bidOrder6);
          this.bidOrder4.add(this.bidOrder7);
          this.bidOrder4.add(this.bidOrder3);
          order = this.bidOrder6["delete"]();
          order.should.equal(this.bidOrder7);
          this.bidOrder4.lower.should.equal(this.bidOrder3);
          this.bidOrder7.parent.should.equal(this.bidOrder4);
          return this.bidOrder4.higher.should.equal(this.bidOrder7);
        });
      });
      describe('an Order with a lower parent and both higher and lower BookEntries', function() {
        return it('should set the parent higher to the higher Order, call addLowest on the higher Order with the lower Order and return the higher Order', function() {
          var addLowestSpy, order;

          addLowestSpy = sinon.spy();
          this.bidOrder7.addLowest = addLowestSpy;
          this.bidOrder4.add(this.bidOrder6);
          this.bidOrder4.add(this.bidOrder7);
          this.bidOrder4.add(this.bidOrder5);
          this.bidOrder4.add(this.bidOrder3);
          order = this.bidOrder6["delete"]();
          order.should.equal(this.bidOrder7);
          this.bidOrder4.lower.should.equal(this.bidOrder3);
          this.bidOrder7.parent.should.equal(this.bidOrder4);
          this.bidOrder4.higher.should.equal(this.bidOrder7);
          return addLowestSpy.should.have.been.calledWith(this.bidOrder5);
        });
      });
      describe('an Order with a higher parent and a lower but no higher Order', function() {
        return it('should set the parent lower to the lower Order and return the lower Order', function() {
          var order;

          this.bidOrder4.add(this.bidOrder2);
          this.bidOrder4.add(this.bidOrder1);
          this.bidOrder4.add(this.bidOrder5);
          order = this.bidOrder2["delete"]();
          order.should.equal(this.bidOrder1);
          this.bidOrder4.lower.should.equal(this.bidOrder1);
          this.bidOrder1.parent.should.equal(this.bidOrder4);
          return this.bidOrder4.higher.should.equal(this.bidOrder5);
        });
      });
      describe('an Order with a higher parent and a higher but no lower Order', function() {
        return it('should set the parent lower to the higher Order and return the higher Order', function() {
          var order;

          this.bidOrder4.add(this.bidOrder2);
          this.bidOrder4.add(this.bidOrder3);
          this.bidOrder4.add(this.bidOrder5);
          order = this.bidOrder2["delete"]();
          order.should.equal(this.bidOrder3);
          this.bidOrder4.lower.should.equal(this.bidOrder3);
          this.bidOrder3.parent.should.equal(this.bidOrder4);
          return this.bidOrder4.higher.should.equal(this.bidOrder5);
        });
      });
      describe('an Order with a higher parent and both higher and lower BookEntries', function() {
        return it('should set the parent lower to the higher Order, call addLowest on the higher Order with the lower Order and return the higher Order', function() {
          var addLowestSpy, order;

          addLowestSpy = sinon.spy();
          this.bidOrder3.addLowest = addLowestSpy;
          this.bidOrder4.add(this.bidOrder2);
          this.bidOrder4.add(this.bidOrder3);
          this.bidOrder4.add(this.bidOrder5);
          this.bidOrder4.add(this.bidOrder1);
          order = this.bidOrder2["delete"]();
          order.should.equal(this.bidOrder3);
          this.bidOrder4.lower.should.equal(this.bidOrder3);
          this.bidOrder3.parent.should.equal(this.bidOrder4);
          this.bidOrder4.higher.should.equal(this.bidOrder5);
          return addLowestSpy.should.have.been.calledWith(this.bidOrder1);
        });
      });
      describe('an Order with no parent and a lower but no higher Order', function() {
        return it('should return the lower Order', function() {
          var order;

          this.bidOrder4.add(this.bidOrder2);
          order = this.bidOrder4["delete"]();
          order.should.equal(this.bidOrder2);
          return expect(this.bidOrder2.parent).to.not.be.ok;
        });
      });
      describe('an Order with no parent and a higher but no lower Order', function() {
        return it('should return the higher Order', function() {
          var order;

          this.bidOrder4.add(this.bidOrder6);
          order = this.bidOrder4["delete"]();
          order.should.equal(this.bidOrder6);
          return expect(this.bidOrder6.parent).to.not.be.ok;
        });
      });
      return describe('an Order with no parent and both higher and lower BookEntries', function() {
        return it('should call addLowest on the higher Order with the lower Order and return the higher Order', function() {
          var addLowestSpy, order;

          addLowestSpy = sinon.spy();
          this.bidOrder6.addLowest = addLowestSpy;
          this.bidOrder4.add(this.bidOrder2);
          this.bidOrder4.add(this.bidOrder6);
          order = this.bidOrder4["delete"]();
          order.should.equal(this.bidOrder6);
          expect(this.bidOrder6.parent).to.not.be.ok;
          return addLowestSpy.should.have.been.calledWith(this.bidOrder2);
        });
      });
    });
    describe('#getHighest', function() {
      describe('with no higher Order', function() {
        return it('should return itself', function() {
          var order;

          order = this.paulBidEUR({
            skipSubmit: true,
            amount: amount100,
            price: amount1
          });
          return order.getHighest().should.equal(order);
        });
      });
      return describe('with a higher Order', function() {
        return it('should call getHighest on the higher entry and return the result', function() {
          var order1, order2;

          order1 = this.paulBidEUR({
            skipSubmit: true,
            amount: amount100,
            price: amount1
          });
          order2 = this.paulBidEUR({
            skipSubmit: true,
            amount: amount100,
            price: amount2
          });
          order1.add(order2);
          order2.getHighest = sinon.stub().returns('stub');
          return order1.getHighest().should.equal('stub');
        });
      });
    });
    describe('#export', function() {
      return it('should return a JSON stringifiable object containing a snapshot of the order', function() {
        var json, object, order;

        order = this.paulBidEUR({
          skipSubmit: true,
          price: amount100,
          amount: amount50
        });
        json = JSON.stringify(order["export"]());
        object = JSON.parse(json);
        order.sequence.should.equal(object.sequence);
        order.timestamp.should.equal(object.timestamp);
        order.account.id.should.equal(object.account);
        order.book.bidCurrency.should.equal(object.bidCurrency);
        order.book.offerCurrency.should.equal(object.offerCurrency);
        order.bidPrice.compareTo(new Amount(object.bidPrice)).should.equal(0);
        order.bidAmount.compareTo(new Amount(object.bidAmount)).should.equal(0);
        expect(object.offerPrice).to.not.be.ok;
        expect(object.offerAmount).to.not.be.ok;
        order = this.paulOfferBTC({
          skipSubmit: true,
          price: amount100,
          amount: amount50
        });
        json = JSON.stringify(order["export"]());
        object = JSON.parse(json);
        order.sequence.should.equal(object.sequence);
        order.timestamp.should.equal(object.timestamp);
        order.account.id.should.equal(object.account);
        order.book.bidCurrency.should.equal(object.bidCurrency);
        order.book.offerCurrency.should.equal(object.offerCurrency);
        order.offerPrice.compareTo(new Amount(object.offerPrice)).should.equal(0);
        order.offerAmount.compareTo(new Amount(object.offerAmount)).should.equal(0);
        expect(object.bidPrice).to.not.be.ok;
        return expect(object.bidAmount).to.not.be.ok;
      });
    });
    return describe('#next', function() {
      return it('should return the next order in a tree if there is one', function() {
        var order1, order10, order11, order12, order13, order14, order15, order2, order3, order4, order5, order6, order7, order8, order9;

        order1 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount50
        });
        order2 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount51
        });
        order1.add(order2);
        order3 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount49
        });
        order1.add(order3);
        order4 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount52
        });
        order1.add(order4);
        order5 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount50Point5
        });
        order1.add(order5);
        order6 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount49Point5
        });
        order1.add(order6);
        order7 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount48Point5
        });
        order1.add(order7);
        order8 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount48Point5
        });
        order1.add(order8);
        order9 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount48Point75
        });
        order1.add(order9);
        order10 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount49Point5
        });
        order1.add(order10);
        order11 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount49Point75
        });
        order1.add(order11);
        order12 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount50Point5
        });
        order1.add(order12);
        order13 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount50Point75
        });
        order1.add(order13);
        order14 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount52
        });
        order1.add(order14);
        order15 = this.paulBidEUR({
          skipSubmit: true,
          amount: amount100,
          price: amount53
        });
        order1.add(order15);
        order15.next().should.equal(order4);
        order4.next().should.equal(order14);
        order14.next().should.equal(order2);
        order2.next().should.equal(order13);
        order13.next().should.equal(order5);
        order5.next().should.equal(order12);
        order12.next().should.equal(order1);
        order1.next().should.equal(order11);
        order11.next().should.equal(order6);
        order6.next().should.equal(order10);
        order10.next().should.equal(order3);
        order3.next().should.equal(order9);
        order9.next().should.equal(order7);
        order7.next().should.equal(order8);
        return expect(order8.next()).to.not.be.ok;
      });
    });
  });

}).call(this);
