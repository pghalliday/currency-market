module.exports = class Bid
  constructor: (params) ->
    @price = params.price
    @amount = params.amount
    @total = params.price.multiply(params.amount)
    