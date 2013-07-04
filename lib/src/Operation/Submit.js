(function() {
  var Amount, Submit;

  Amount = require('../Amount');

  module.exports = Submit = (function() {
    function Submit(params) {
      var bidAmount, bidPrice, exported, offerAmount, offerPrice;

      exported = params.exported;
      if (exported) {
        params = exported;
        bidPrice = exported.bidPrice;
        bidAmount = exported.bidAmount;
        offerPrice = exported.offerPrice;
        offerAmount = exported.offerAmount;
        params.bidPrice = bidPrice ? new Amount(bidPrice) : void 0;
        params.bidAmount = bidAmount ? new Amount(bidAmount) : void 0;
        params.offerPrice = offerPrice ? new Amount(offerPrice) : void 0;
        params.offerAmount = offerAmount ? new Amount(offerAmount) : void 0;
      }
      this.bidCurrency = params.bidCurrency || (function() {
        throw new Error('Must supply a bid currency');
      })();
      this.offerCurrency = params.offerCurrency || (function() {
        throw new Error('Must supply an offer currency');
      })();
      this.bidPrice = params.bidPrice;
      this.offerPrice = params.offerPrice;
      if (this.bidPrice) {
        this.bidAmount = params.bidAmount || (function() {
          throw new Error('Must supply a bid amount with a bid price');
        })();
      } else if (this.offerPrice) {
        this.offerAmount = params.offerAmount || (function() {
          throw new Error('Must supply an offer amount with an offer price');
        })();
      } else {
        throw new Error('Must supply a bid or offer price');
      }
    }

    return Submit;

  })();

}).call(this);
