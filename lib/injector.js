var Class = require('resig-class');

var Injector = Class.extend({
  init: function(config) {
    this.add(config);
  },
  
  add: function(config) {
    for (var key in config) {
      this[key] = config[key];
    }
  }
});

module.exports = Injector;