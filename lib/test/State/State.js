(function() {
  var Account, Amount, Engine, State, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  State = require('../../src/State/State');

  Account = require('../../src/State/Account');

  Engine = require('../../src/Engine/Engine');

  Amount = require('../../src/Amount');

  describe('State', function() {
    beforeEach(function() {
      var _this = this;
      this.sequence = 0;
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
      return this.deposit = function(params) {
        return _this.engine.apply({
          reference: '550e8400-e29b-41d4-a716-446655440000',
          account: params.account,
          sequence: _this.sequence++,
          timestamp: 1371737390976,
          deposit: {
            currency: params.currency,
            amount: params.amount
          }
        });
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
    it('should instantiate from an engine state', function() {
      var state;
      this.deposit({
        account: 'Peter',
        currency: 'EUR',
        amount: '5000'
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
        amount: '75'
      });
      state = new State(this.engine["export"]());
      state.getAccount('Peter').getBalance('EUR').getFunds().should.equal('5000');
      state.getAccount('Peter').getBalance('BTC').getFunds().should.equal('50');
      state.getAccount('Paul').getBalance('EUR').getFunds().should.equal('2500');
      return state.getAccount('Paul').getBalance('BTC').getFunds().should.equal('75');
    });
    return describe('#apply', function() {
      it('should apply deltas with sequential IDs', function() {
        var state;
        state = new State(this.engine["export"]());
        state.apply(this.deposit({
          account: 'Peter',
          currency: 'EUR',
          amount: '100'
        }));
        state.getAccount('Peter').getBalance('EUR').getFunds().should.equal('100');
        state.apply(this.deposit({
          account: 'Peter',
          currency: 'EUR',
          amount: '150'
        }));
        state.getAccount('Peter').getBalance('EUR').getFunds().should.equal('250');
        state.apply(this.deposit({
          account: 'Peter',
          currency: 'EUR',
          amount: '50'
        }));
        return state.getAccount('Peter').getBalance('EUR').getFunds().should.equal('300');
      });
      it('should ignore deltas with a sequence lower than expected as such a delta will have already been applied', function() {
        var delta, state;
        delta = this.deposit({
          account: 'Peter',
          currency: 'EUR',
          amount: '5000'
        });
        state = new State(this.engine["export"]());
        state.getAccount('Peter').getBalance('EUR').getFunds().should.equal('5000');
        state.apply(delta);
        return state.getAccount('Peter').getBalance('EUR').getFunds().should.equal('5000');
      });
      it('should throw an error if a delta with a sequence higher than expected is applied as this will mean that it missed some', function() {
        var state,
          _this = this;
        this.deposit({
          account: 'Peter',
          currency: 'EUR',
          amount: '5000'
        });
        state = new State(this.engine["export"]());
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
      return it('should throw an error if an unknown operation is received', function() {
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
    });
  });

}).call(this);
