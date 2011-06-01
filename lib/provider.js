var Class = require('resig-class'),
    _ = require('underscore');

var Provider = Class.extend({
  init: function(options) {
    this._options = options;
    this._cache = [];
  },
  
  _getConfigValue: function(key) {
    var value = global.config[key];
    if (!value) {
      value = global.config;
      key.split('.').forEach(function(piece) {
        if (!value) {return;}
        value = value[piece];
      });
    }
    return value;
  },
  
  _checkDependencies: function() {
    for (var configKey in this._options) {
      var options = this._options[configKey];
      var key = typeof(options) === 'string' ? options : options.key;
      if (!key) {
        throw new Error('No key present in Provider constructor for ' + configKey);
      }
      var value = this._getConfigValue(key);
      if (!value && !options.optional) {
        throw new Error('Provider requires missing configuration key ' + key + ' for ' + configKey);
      }
      
      this[configKey] = value;
    }
  },
  
  _provide: function() {
    throw new Error('Providers must override the _provide method');
  },
  
  get: function() {
    var args = arguments;
    // figure out a way to key into this._cache
    _(this.cache).each(function(item) {
      if (_.isEqual(item.args, args)) {
        return item.value;
      }
    });
    
    this._checkDependencies();
    var value = this._provide.apply(this, arguments);
    this._cache.push({args: args, value: value});
    return value;
  }
});

Provider.create = function(constructor) {
  return Provider.extend({
    init: function() {
      this._super();
    },
    
    _provide: function() {
      return new constructor();
    }
  });
};

module.exports = Provider;