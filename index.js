'use strict';

var exec = require('child_process').exec
  , mkdirp = require('mkdirp');

module.exports = gifer;

function command (array) {
  return array.join(' ');
}

function gifer (input, output, opts, callback) {
  if (!input) throw new Error('input required');
  if (!output) throw new Error('output required');

  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  } else {
    opts = opts || {};
  }

  var rate = opts.rate || 10
    , delay = opts.delay || 100 / rate;

  var tmpdir = './tmp/';

  function finalize (err, callback) {
    exec(command(['rm -rf', tmpdir]));
    callback(err);
  }

  mkdirp(tmpdir, function (err) {
    if (err) return callback(err);

    exec(command(['ffmpeg', '-i', input, '-r', String(rate), tmpdir + '%04d.png']), function (err) {
      if (err) return finalize(err);

      exec(command(['gm mogrify', '-format', 'gif', tmpdir + '*.png']), function (err) {
        if (err) return finalize(err);

        exec(command(['gifsicle', '-O2', '--delay', String(delay), '--loop', '--colors 256', tmpdir + '*.gif', '>', output]), function (err) {
          if (err) return finalize(err);

          finalize(null, callback);
        });
      });
    });
  });
}