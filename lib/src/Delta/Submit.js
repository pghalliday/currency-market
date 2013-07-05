(function() {
  var Amount, Submit, convert;

  Amount = require('../Amount');

  convert = function(halfTrade) {
    var commission, credit, debit, remainder, transaction;
    remainder = halfTrade.remainder;
    if (remainder) {
      remainder.bidAmount = new Amount(remainder.bidAmount);
      remainder.offerAmount = new Amount(remainder.offerAmount);
    }
    transaction = halfTrade.transaction;
    debit = transaction.debit;
    debit.amount = new Amount(debit.amount);
    debit.funds = new Amount(debit.funds);
    debit.lockedFunds = new Amount(debit.lockedFunds);
    credit = transaction.credit;
    credit.amount = new Amount(credit.amount);
    credit.funds = new Amount(credit.funds);
    commission = credit.commission;
    if (commission) {
      commission.amount = new Amount(commission.amount);
      return commission.funds = new Amount(commission.funds);
    }
  };

  module.exports = Submit = (function() {
    function Submit(params) {
      var exported, trade, trades, _i, _len;
      exported = params.exported;
      if (exported) {
        params = exported;
        params.lockedFunds = new Amount(params.lockedFunds);
        trades = params.trades;
        if (trades) {
          for (_i = 0, _len = trades.length; _i < _len; _i++) {
            trade = trades[_i];
            convert(trade.left);
            convert(trade.right);
          }
        }
      }
      this.lockedFunds = params.lockedFunds;
      this.nextHigherOrderSequence = params.nextHigherOrderSequence;
      this.trades = params.trades;
    }

    return Submit;

  })();

}).call(this);
