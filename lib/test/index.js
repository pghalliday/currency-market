(function() {
  var Amount, CurrencyMarket, Delta, Engine, Operation, State, chai;

  chai = require('chai');

  chai.should();

  CurrencyMarket = require('../src');

  Engine = CurrencyMarket.Engine;

  State = CurrencyMarket.State;

  Operation = CurrencyMarket.Operation;

  Delta = CurrencyMarket.Delta;

  Amount = CurrencyMarket.Amount;

  describe('CurrencyMarket', function() {
    return it.skip('should be possible to construct an Engine, export the engine state to a State, apply an Operation and apply the resulting Delta to the State', function() {
      var commission, delta, engine, operation, state;
      commission = {
        account: 'commission',
        calculate: function(params) {
          return {
            amount: Amount.ONE,
            reference: 'Flat 1'
          };
        }
      };
      engine = new Engine({
        commission: commission
      });
      operation = new Operation({
        reference: 'hello',
        sequence: 0,
        timestamp: 1371737390976,
        account: 'Peter',
        deposit: {
          currency: 'EUR',
          amount: new Amount('500')
        }
      });
      engine.apply(new Operation({
        json: JSON.stringify(operation)
      }));
      operation = new Operation({
        reference: 'hello',
        sequence: 1,
        timestamp: 1371737390976,
        account: 'Paul',
        deposit: {
          currency: 'BTC',
          amount: new Amount('50')
        }
      });
      engine.apply(new Operation({
        json: JSON.stringify(operation)
      }));
      engine = new Engine({
        commission: commission,
        json: JSON.stringify(engine)
      });
      state = new State({
        json: JSON.stringify(engine)
      });
      operation = new Operation({
        reference: 'hello',
        sequence: 2,
        timestamp: 1371737390976,
        account: 'Peter',
        submit: {
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: new Amount('0.1'),
          offerAmount: new Amount('500')
        }
      });
      delta = engine.apply(new Operation({
        json: JSON.stringify(operation)
      }));
      state.apply(new Delta({
        json: JSON.stringify(delta)
      }));
      operation = new Operation({
        reference: 'hello',
        sequence: 3,
        timestamp: 1371737390976,
        account: 'Paul',
        submit: {
          bidCurrency: 'EUR',
          offerCurrency: 'BTC',
          offerPrice: new Amount('10'),
          offerAmount: new Amount('50')
        }
      });
      delta = engine.apply(new Operation({
        json: JSON.stringify(operation)
      }));
      state.apply(new Delta({
        json: JSON.stringify(delta)
      }));
      state = new State({
        json: JSON.stringify(state)
      });
      state.getAccount('Peter').getBalance('EUR').funds.compareTo(Amount.ZERO).should.equal(0);
      state.getAccount('Peter').getBalance('BTC').funds.compareTo(new Amount('49')).should.equal(0);
      state.getAccount('Paul').getBalance('EUR').funds.compareTo(new Amount('499')).should.equal(0);
      state.getAccount('Paul').getBalance('BTC').funds.compareTo(Amount.ZERO).should.equal(0);
      state.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
      return state.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
    });
  });

}).call(this);
