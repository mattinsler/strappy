var path = require('path'),
    fs = require('fs');

global.project = {
  environment: process.env.NODE_ENV || 'development'
};

function fixPath(file, dir) {
  var target = path.normalize(file);
  if (target[0] !== '/') {
    target = path.join(dir || process.env.PWD, target);
  }
  return target;
}

// file or function to run
function bootstrap(application) {
  if (typeof(application) === 'string') {
    application = fixPath(application);
    global.project.dir = path.dirname(application);
  } else {
    global.project.dir = process.env.PWD;
  }
  
  var done;
  if (typeof(application) === 'string') {
    done = function(args) {
      return require(application)(args);
    };
  } else if (typeof(application) === 'function') {
    done = application;
  }

  var configs = [];
  var lastDir = global.project.dir;
  
  function next() {
    for (var x = 0; x < arguments.length; ++x) {
      configs.push(path.join(lastDir, arguments[x]));
    }
    if (configs.length == 0) {
      return done({});
    }
    
    var file = configs.splice(0, 1)[0];
    lastDir = path.dirname(file);
    if (path.existsSync(file + '.js')) {
      console.log('Processing ' + file);
      require(file)(next);
    } else {
      next();
    }
  }

  return new (function() {
    this.withConfig = function(configFile) {
      configFile = fixPath(configFile, process.env.PWD);
      var file = /\.js$/.test(configFile) ? configFile.substring(0, configFile.length - 3) : configFile;
      configs.push(file);
      configs.push(file + '.' + project.environment);      
      return this;
    };
    this.run = function() {
      if (configs.length == 0) {
        this.withConfig('./config');
        this.withConfig('./conf/config');
      }
      next();
    };
  })();
}

module.exports = bootstrap;