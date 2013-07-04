(function() {
  var Account, Amount, Engine, State, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  State = require('../../src/State');

  Account = require('../../src/State/Account');

  Engine = require('../../src/Engine');

  Amount = require('../../src/Amount');

  describe('State', function() {
    beforeEach(function() {
      var _this = this;

      this.sequence = 0;
      this.timestamp = 1371737390976;
      this.engine = new Engine({
        commission: {
          account: 'commission',
          calculate: function(params) {
            return {
              amount: Amount.ONE,
              reference: 'Flat 1'
            };
          }
        }
      });
      this.deposit = function(params) {
        return _this.engine.apply({
          reference: '550e8400-e29b-41d4-a716-446655440000',
          account: params.account,
          sequence: _this.sequence++,
          timestamp: _this.timestamp++,
          deposit: {
            currency: params.currency,
            amount: params.amount
          }
        });
      };
      this.withdraw = function(params) {
        return _this.engine.apply({
          reference: '550e8400-e29b-41d4-a716-446655440000',
          account: params.account,
          sequence: _this.sequence++,
          timestamp: _this.timestamp++,
          withdraw: {
            currency: params.currency,
            amount: params.amount
          }
        });
      };
      this.submitOffer = function(params) {
        return _this.engine.apply({
          reference: '550e8400-e29b-41d4-a716-446655440000',
          account: params.account,
          sequence: _this.sequence++,
          timestamp: _this.timestamp++,
          submit: {
            bidCurrency: params.bidCurrency,
            offerCurrency: params.offerCurrency,
            offerPrice: params.price,
            offerAmount: params.amount
          }
        });
      };
      this.submitBid = function(params) {
        return _this.engine.apply({
          reference: '550e8400-e29b-41d4-a716-446655440000',
          account: params.account,
          sequence: _this.sequence++,
          timestamp: _this.timestamp++,
          submit: {
            bidCurrency: params.bidCurrency,
            offerCurrency: params.offerCurrency,
            bidPrice: params.price,
            bidAmount: params.amount
          }
        });
      };
      this.cancel = function(params) {
        return _this.engine.apply({
          reference: '550e8400-e29b-41d4-a716-446655440000',
          account: params.account,
          sequence: _this.sequence++,
          timestamp: _this.timestamp++,
          cancel: {
            sequence: params.sequence
          }
        });
      };
      this.deposit({
        account: 'Peter',
        currency: 'EUR',
        amount: '10000'
      });
      this.deposit({
        account: 'Peter',
        currency: 'BTC',
        amount: '50'
      });
      this.deposit({
        account: 'Paul',
        currency: 'EUR',
        amount: '2500'
      });
      this.deposit({
        account: 'Paul',
        currency: 'BTC',
        amount: '200'
      });
      this.submitOffer({
        account: 'Peter',
        offerCurrency: 'EUR',
        bidCurrency: 'BTC',
        price: '0.04',
        amount: '5000'
      });
      this.submitOffer({
        account: 'Peter',
        offerCurrency: 'EUR',
        bidCurrency: 'BTC',
        price: '0.03',
        amount: '2000'
      });
      this.submitBid({
        account: 'Paul',
        offerCurrency: 'BTC',
        bidCurrency: 'EUR',
        price: '0.02',
        amount: '2500'
      });
      this.submitBid({
        account: 'Paul',
        offerCurrency: 'BTC',
        bidCurrency: 'EUR',
        price: '0.01',
        amount: '1000'
      });
      return this.checkState = function(state) {
        var accountPaul, accountPeter, balancePaulBTC, balancePaulEUR, balancePeterBTC, balancePeterEUR, bookBTCEUR, bookEURBTC, orderPaul6, orderPaul7, orderPeter4, orderPeter5, ordersPaul, ordersPeter;

        accountPeter = state.getAccount('Peter');
        balancePeterEUR = accountPeter.getBalance('EUR');
        balancePeterEUR.funds.should.equal('10000');
        balancePeterEUR.lockedFunds.should.equal('7000');
        balancePeterBTC = accountPeter.getBalance('BTC');
        balancePeterBTC.funds.should.equal('50');
        balancePeterBTC.lockedFunds.should.equal('0');
        ordersPeter = accountPeter.orders;
        orderPeter4 = ordersPeter[4];
        orderPeter4.sequence.should.equal(4);
        orderPeter4.timestamp.should.equal(1371737390976 + 4);
        orderPeter4.account.should.equal('Peter');
        orderPeter4.offerCurrency.should.equal('EUR');
        orderPeter4.bidCurrency.should.equal('BTC');
        orderPeter4.offerPrice.should.equal('0.04');
        orderPeter4.offerAmount.should.equal('5000');
        orderPeter5 = ordersPeter[5];
        orderPeter5.sequence.should.equal(5);
        orderPeter5.timestamp.should.equal(1371737390976 + 5);
        orderPeter5.account.should.equal('Peter');
        orderPeter5.offerCurrency.should.equal('EUR');
        orderPeter5.bidCurrency.should.equal('BTC');
        orderPeter5.offerPrice.should.equal('0.03');
        orderPeter5.offerAmount.should.equal('2000');
        accountPaul = state.getAccount('Paul');
        balancePaulEUR = accountPaul.getBalance('EUR');
        balancePaulEUR.funds.should.equal('2500');
        balancePaulEUR.lockedFunds.should.equal('0');
        balancePaulBTC = accountPaul.getBalance('BTC');
        balancePaulBTC.funds.should.equal('200');
        balancePaulBTC.lockedFunds.should.equal('60');
        ordersPaul = accountPaul.orders;
        orderPaul6 = ordersPaul[6];
        orderPaul6.sequence.should.equal(6);
        orderPaul6.timestamp.should.equal(1371737390976 + 6);
        orderPaul6.account.should.equal('Paul');
        orderPaul6.offerCurrency.should.equal('BTC');
        orderPaul6.bidCurrency.should.equal('EUR');
        orderPaul6.bidPrice.should.equal('0.02');
        orderPaul6.bidAmount.should.equal('2500');
        orderPaul7 = ordersPaul[7];
        orderPaul7.sequence.should.equal(7);
        orderPaul7.timestamp.should.equal(1371737390976 + 7);
        orderPaul7.account.should.equal('Paul');
        orderPaul7.offerCurrency.should.equal('BTC');
        orderPaul7.bidCurrency.should.equal('EUR');
        orderPaul7.bidPrice.should.equal('0.01');
        orderPaul7.bidAmount.should.equal('1000');
        bookEURBTC = state.getBook({
          bidCurrency: 'EUR',
          offerCurrency: 'BTC'
        });
        bookEURBTC[0].should.equal(orderPaul6);
        bookEURBTC[1].should.equal(orderPaul7);
        bookBTCEUR = state.getBook({
          bidCurrency: 'BTC',
          offerCurrency: 'EUR'
        });
        bookBTCEUR[0].should.equal(orderPeter5);
        return bookBTCEUR[1].should.equal(orderPeter4);
      };
    });
    describe('#getAccount', function() {
      it('should create a new account if it does not exist', function() {
        var account, state;

        state = new State();
        account = state.getAccount('Peter');
        return account.should.be.an.instanceOf(Account);
      });
      it('should return the corresponding account if it does exist', function() {
        var account1, account2, state;

        state = new State();
        account1 = state.getAccount('Peter');
        account2 = state.getAccount('Peter');
        return account2.should.equal(account1);
      });
      return it('should return different accounts for different IDs', function() {
        var accountPaul, accountPeter, state;

        state = new State();
        accountPeter = state.getAccount('Peter');
        accountPaul = state.getAccount('Paul');
        return accountPaul.should.not.equal(accountPeter);
      });
    });
    describe('#getBook', function() {
      it('should error if no bid currency is supplied', function() {
        var state;

        state = new State();
        return expect(function() {
          var book;

          return book = state.getBook({
            offerCurrency: 'BTC'
          });
        }).to["throw"]('Must supply a bid currency');
      });
      it('should error if no offer currency is supplied', function() {
        var state;

        state = new State();
        return expect(function() {
          var book;

          return book = state.getBook({
            bidCurrency: 'EUR'
          });
        }).to["throw"]('Must supply an offer currency');
      });
      it('should create a new orders array if it does not exist', function() {
        var book, state;

        state = new State();
        book = state.getBook({
          bidCurrency: 'EUR',
          offerCurrency: 'BTC'
        });
        return book.should.have.length(0);
      });
      it('should return the corresponding orders array if it does exist', function() {
        var book1, book2, state;

        state = new State();
        book1 = state.getBook({
          bidCurrency: 'EUR',
          offerCurrency: 'BTC'
        });
        book2 = state.getBook({
          bidCurrency: 'EUR',
          offerCurrency: 'BTC'
        });
        return book2.should.equal(book1);
      });
      return it('should return different arrays for different bid and offer currencies', function() {
        var book1, book2, state;

        state = new State();
        book1 = state.getBook({
          bidCurrency: 'EUR',
          offerCurrency: 'BTC'
        });
        book2 = state.getBook({
          bidCurrency: 'BTC',
          offerCurrency: 'EUR'
        });
        return book2.should.not.equal(book1);
      });
    });
    it('should instantiate from an engine state', function() {
      var state;

      state = new State(JSON.parse(JSON.stringify(this.engine)));
      return this.checkState(state);
    });
    describe('JSON.stringify', function() {
      return it('should be possible to instantiate an identical state from an exported JSON state', function() {
        var state1, state2;

        state1 = new State(JSON.parse(JSON.stringify(this.engine)));
        state2 = new State(JSON.parse(JSON.stringify(state1)));
        return this.checkState(state2);
      });
    });
    return describe('#apply', function() {
      it('should ignore deltas with a sequence lower than expected as such a delta will have already been applied', function() {
        var delta, state;

        delta = this.deposit({
          account: 'Peter',
          currency: 'EUR',
          amount: '5000'
        });
        state = new State(JSON.parse(JSON.stringify(this.engine)));
        state.getAccount('Peter').getBalance('EUR').funds.should.equal('15000');
        state.apply(delta);
        return state.getAccount('Peter').getBalance('EUR').funds.should.equal('15000');
      });
      it('should throw an error if a delta with a sequence higher than expected is applied as this will mean that it missed some', function() {
        var state,
          _this = this;

        this.deposit({
          account: 'Peter',
          currency: 'EUR',
          amount: '5000'
        });
        state = new State(JSON.parse(JSON.stringify(this.engine)));
        this.deposit({
          account: 'Peter',
          currency: 'EUR',
          amount: '2000'
        });
        return expect(function() {
          return state.apply(_this.deposit({
            account: 'Peter',
            currency: 'EUR',
            amount: '6000'
          }));
        }).to["throw"]('Unexpected delta');
      });
      it('should throw an error if an unknown operation is received', function() {
        var state;

        state = new State();
        return expect(function() {
          return state.apply({
            sequence: 0,
            operation: {
              account: 'Peter',
              sequence: 10,
              unknown: {
                blah: 'jvksjfv'
              }
            },
            result: 'success'
          });
        }).to["throw"]('Unknown operation');
      });
      return describe('deposit delta', function() {
        return it('should update the account balance accordingly', function() {
          var state;

          state = new State(JSON.parse(JSON.stringify(this.engine)));
          state.apply(this.deposit({
            account: 'Peter',
            currency: 'EUR',
            amount: '100'
          }));
          state.getAccount('Peter').getBalance('EUR').funds.should.equal('10100');
          state.apply(this.deposit({
            account: 'Peter',
            currency: 'EUR',
            amount: '150'
          }));
          state.getAccount('Peter').getBalance('EUR').funds.should.equal('10250');
          state.apply(this.deposit({
            account: 'Peter',
            currency: 'EUR',
            amount: '50'
          }));
          return state.getAccount('Peter').getBalance('EUR').funds.should.equal('10300');
        });
      });
    });
  });

}).call(this);
