/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var os = require('os'), path = require('path');
var Builder = require('shark').build;
var Home    = __dirname + '/..';

var __APPNAME__ = 'iservice';

/**
 * @强制参数 
 */
var _force  = Builder.parseProperties(Home + '/_private.properties');
var _test   = Builder.parseProperties(Home + '/_test.properties');

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
      _force[pattern[0]] = true;
      break;

    default:
      _force[pattern[0]] = pattern[1];
      break;
  }
});
/* }}} */

/* {{{ private function _extend() */
var _extend = function (a, b) {
  var m = require('shark').extend.clone(a);
  for (var i in b) {
    m[i] = b[i];
  }
  return m;
};
/* }}} */

var _props  = path.normalize(Home + '/default-' + os.hostname() + '-' + os.arch() + '.properties');
if (!path.existsSync(_props) || 1) {
  var builder = Builder.init(null, Home, _extend({
    'dir.root'      : Home,
    'log.root'      : path.normalize(Home + '/log'),

    /**<    元数据配置  */
    'mysql.default.host'        : 'localhost',
    'mysql.default.port'        : 3306,
    'mysql.default.user'        : 'root',
    'mysql.default.password'    : '',
    'mysql.default.dbname'      : 'meta_iservice_config',

    /**<    zookeeper配置   */
    'zookeeper.default.host'    : 'localhost:2181,127.0.0.1:2181',
    'zookeeper.default.root'    : '/',
    'zookeeper.default.user'    : 'anonymouse',
    'zookeeper.default.pass'    : '123456',

    'public.ui.dir'  : __dirname + '/../public',

    'svn.ui.dir'     : __dirname + '/../run/svn',

  }, _force));

  builder.makeconf('build/tpl/default.properties', _props);
  builder.makedir('run/svn');
}

var _me = Builder.init(_props, Home, _test);

/* {{{ task_make_test() */
var task_make_test = function () {
  _me.makedir('test/unit/etc');
  _me.makedir('test/unit/tmp');

  _me.makeconf('build/test', 'test/unit/etc/');
  _me.makeconf('build/tpl/rest.ini', 'test/unit/etc/rest.ini', {
    'statusfile' : path.normalize(__dirname + '/../test/unit/tmp/status'),
  });

  _me.makeconf('build/tpl/ui.ini', 'test/unit/etc/ui.ini', {
    'log.root'    : __dirname + '/../test/unit/tmp',
    'svn.ui.dir'  : __dirname + '/../test/unit/tmp',
  });

};

/* }}} */

/* {{{ task_make_bin() */

var task_make_bin = function () {
  _me.makedir('bin');
  _me.makedir(_me.$('log.root'));
  _me.makeconf('node_modules/shark/resource/script/appctl.sh',   'bin/' + __APPNAME__, {
    'app.name'  : __APPNAME__,
    'pid.file'  : _me.$('pid.file', Home + '/run/' + __APPNAME__ + '.pid'),
    '200.file'  : _me.$('200.file', ''),
    'properties': _me.$('propfile', _props),
    'node.bin'  : _me.$('node.bin', process.execPath),
  });
  Builder.setmode('bin/' + __APPNAME__, 0755);

  _me.makeconf('node_modules/shark/resource/script/logrotate.sh', 'bin/logrotate', {
    'app.name'      : __APPNAME__,
    'log.expire'    : _me.$('log.expire', 0),
  });
  Builder.setmode('bin/logrotate', 0755);
};
/* }}} */

task_make_test();
task_make_bin();
process.exit(0);

