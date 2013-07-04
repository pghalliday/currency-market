(function() {
  var Submit;

  module.exports = Submit = (function() {
    function Submit(params) {
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
