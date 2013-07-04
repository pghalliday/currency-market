chai = require 'chai'
chai.should()
expect = chai.expect

Submit = require '../../src/Operation/Submit'

describe 'Submit', ->
  it 'should error if no bid currency is supplied', ->
    expect ->
      submit = new Submit
        offerCurrency: 'BTC'
    .to.throw 'Must supply a bid currency'

  it 'should error if no offer currency is supplied', ->
    expect ->
      submit = new Submit
        bidCurrency: 'EUR'
    .to.throw 'Must supply an offer currency'

  it 'should error if neither a bid or offer price is supplied', ->
    expect ->
      submit = new Submit
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'
    .to.throw 'Must supply a bid or offer price'

  describe 'with a bid price', ->
    it 'should error if no bid amount is supplied', ->
      expect ->
        submit = new Submit
          bidCurrency: 'EUR'
          offerCurrency: 'BTC'
          bidPrice: '100'
      .to.throw 'Must supply a bid amount with a bid price'

    it 'should instantiate recording the bid currency, offer currency, bid price and bid amount', ->
      submit = new Submit
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'
        bidPrice: '100'
        bidAmount: '50'
      submit.bidCurrency.should.equal 'EUR'
      submit.offerCurrency.should.equal 'BTC'
      submit.bidPrice.should.equal '100'
      submit.bidAmount.should.equal '50'

  describe 'with an offer price', ->
    it 'should error if no offer amount is supplied', ->
      expect ->
        submit = new Submit
          bidCurrency: 'EUR'
          offerCurrency: 'BTC'
          offerPrice: '100'
      .to.throw 'Must supply an offer amount with an offer price'

    it 'should instantiate recording the bid currency, offer currency, bid price and bid amount', ->
      submit = new Submit
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'
        offerPrice: '100'
        offerAmount: '50'
      submit.bidCurrency.should.equal 'EUR'
      submit.offerCurrency.should.equal 'BTC'
      submit.offerPrice.should.equal '100'
      submit.offerAmount.should.equal '50'
