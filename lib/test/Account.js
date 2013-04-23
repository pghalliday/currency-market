(function() {
  var Account, Balance, assert, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  Account = require('../src/Account');

  Balance = require('../src/Balance');

  describe('Account', function() {
    return it('should instantiate with a collection of balances matching the supported currencies', function() {
      var account;

      account = new Account({
        id: 'Peter',
        currencies: ['EUR', 'USD', 'BTC']
      });
      account.balances['EUR'].should.be.an.instanceOf(Balance);
      account.balances['USD'].should.be.an.instanceOf(Balance);
      return account.balances['BTC'].should.be.an.instanceOf(Balance);
    });
  });

}).call(this);
