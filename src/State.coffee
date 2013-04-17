module.exports = class State
  constructor: ->
    @accounts = Object.create null
    @markets = Object.create null
