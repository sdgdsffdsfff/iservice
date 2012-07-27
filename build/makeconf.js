/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var os = require('os'), path = require('path');

var Builder = require('shark').build;

var Home    = __dirname + '/../';

/**
 * @强制参数 
 */
var _force  = {};

/* {{{ process argv parse */

process.argv.slice(2).forEach(function (arg) {
  if (!(/^\-D/.test(arg))) {
    return;
  }

  var pattern   = arg.slice(2).split('=');
  switch (pattern.length) {
    case 0:
      break;

    case 1:
      _force[pattern[0]]    = true;
      break;

    default:
      _force[pattern[0]]    = pattern[1];
      break;
  }
});
/* }}} */

var _props  = path.normalize(Home + 'default-' + os.hostname() + '-' + os.arch() + '.properties');
if (!path.existsSync(_props) || 1) {
  Builder.init(null, Home, {
    'dir.root'      : Home,
    'log.root'      : Home + 'log/',
  }).makeconf('build/tpl/default.properties', _props);
}

var _me = Builder.init(_props, Home, _force);

/* {{{ task_make_test() */
var task_make_test = function () {
  _me.makedir('test/unit/etc');
  _me.makedir('test/unit/tmp');
};

/* }}} */

/* {{{ task_make_bin() */

var task_make_bin = function () {
  _me.makedir('bin');
  _me.makedir(_me.$('log.root'));
  _me.makeconf('node_modules/shark/resource/script/appctl.sh',   'bin/appctl', {
    'app.name'        : 'iservice',
    'nodejs.bin'      : _me.$('nodejs.bin', '/usr/local/bin/node'),
  });
  Builder.setmode('bin/appctl', 0755);

  _me.makeconf('node_modules/shark/resource/script/logrotate.sh',   'bin/logrotate');
  Builder.setmode('bin/logrotate', 0755);
};
/* }}} */

task_make_test();
task_make_bin();
process.exit(0);
