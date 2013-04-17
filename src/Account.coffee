module.exports = class Account
  constructor: ->
    @currencies = Object.create null
    @bids = Object.create null