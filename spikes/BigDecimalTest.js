var BigDecimal = require('BigDecimal').BigDecimal;
var ROUND_HALF_UP = require('BigDecimal').RoundingMode.HALF_UP();
var SCALE = 25;

var n50 = new BigDecimal('1');
var n5000 = new BigDecimal('100');
var nResult = n50.divide(n5000, SCALE, ROUND_HALF_UP).stripTrailingZeros();
console.log(nResult.toString());
console.log(nResult.compareTo(new BigDecimal('0.01')));
