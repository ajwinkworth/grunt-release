/*
 * grunt-release
 * https://github.com/geddesign/grunt-release
 *
 * Copyright (c) 2013 Dave Geddes
 * Licensed under the MIT license.
 */

var shell = require('shelljs');

module.exports = function(grunt){
  grunt.registerMultiTask('release', 'bump version, git tag, git push, npm publish', function(type){
    var options = this.options({
      bump: true,
      add: true,
      commit: true,
      tag: true,
      push: true,
      pushTags: true,
      npm : true,
      config: true,
      subfolder: "./"
    });

    var pkgFile = grunt.config('pkgFile') || subfolder + 'package.json';
    var pkg = grunt.file.readJSON(pkgFile);
    var previousVersion = pkg.version;
    var newVersion = pkg.version = getNextVersion(previousVersion, type);

    if (options.bump) bump();
    if (options.add) add();
    if (options.commit) commit();
    if (options.tag) tag();
    if (options.push) push();
    if (options.pushTags) pushTags();
    if (options.npm) publish();
    if (options.config) addConfig(newVersion);

    function addConfig() {
      grunt.config('pkg_version', newVersion);
    }

    function add(){
      run('(cd '+ subfolder +' && git add .'); //+ pkgFile);
    }

    function commit(){
      run('(cd '+ subfolder +' && git commit ' + pkgFile + '-a -m "release ' + newVersion + '")', pkgFile + ' committed');
    }

    function tag(){
      run('(cd '+ subfolder +' && git tag ' + newVersion + ' -m "Version ' + newVersion + '")', 'New git tag created: ' + newVersion);
    }

    function push(){
      run('(cd '+ subfolder +' && git push grunt', 'pushed to github)');
    }

    function pushTags(){
      run('git push --tags grunt', 'pushed new tag '+ newVersion +' to github');
    }

    function publish(){
      run('npm publish', 'published '+ newVersion +' to npm');
    }

    function run(cmd, msg){
      shell.exec(cmd, {silent:true});
      if (msg) grunt.log.ok(msg);
    }

    function push(){
      shell.exec('(cd '+ subfolder +' && git push grunt)');
      grunt.log.ok('pushed to github');
    }

    // write updated package.json
    function bump(){
      grunt.file.write(subfolder + pkgFile, JSON.stringify(pkg, null, '  ') + '\n');
      grunt.log.ok('Version bumped to ' + newVersion);
    }

    function getNextVersion (version, versionType) {
      var type = {
        patch: 2,
        minor: 1,
        major: 0
      };

      var parts = version.split('.');
      var idx = type[versionType || 'patch'];

      parts[idx] = parseInt(parts[idx], 10) + 1;
      while(++idx < parts.length) {
        parts[idx] = 0;
      }
      return parts.join('.');
    };
  })
};