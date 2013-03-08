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
      config_var: "pkg_version",
      subfolder: "./"
    });

    pwd = shell.pwd()
    var subfolder = options.subfolder;
    changeDir();

    var pkgFile = grunt.config('pkgFile') || 'package.json';
    console.log(pkgFile);
    var pkg = grunt.file.readJSON(pkgFile);
    var previousVersion = pkg.version;
    var currentVersion = previousVersion;
    var newVersion = pkg.version = getNextVersion(previousVersion, type);

    if (options.bump) bump();
    if (options.add) add();
    if (options.commit) commit();
    if (options.tag) tag();
    if (options.push) push();
    if (options.pushTags) pushTags();
    if (options.npm) publish();
    if (options.config) addConfig();

    changeDirBack()

    function changeDirBack() {
      shell.cd(pwd);
    }

    function addConfig() {
      grunt.config(options.config_var, currentVersion);
    }

    function changeDir() {
      shell.cd(subfolder);
    }

    function add(){
      run('git add .'); //+ pkgFile);
    }

    function commit(){
      run('git commit -a -m "release ' + currentVersion + '"', pkgFile + ' committed');
    }

    function tag(){
      run('git tag ' + currentVersion + ' -m "Version ' + currentVersion + '"', 'New git tag created: ' + currentVersion);
    }

    function push(){
      run('git push grunt', 'pushed to remote: grunt');
    }

    function pushTags(){
      run('git push --tags grunt', 'pushed new tag '+ currentVersion +' to remote: grunt');
    }

    function publish(){
      run('npm publish', 'published '+ currentVersion +' to npm');
    }

    function run(cmd, msg){
      shell.exec(cmd, {silent:true});
      if (msg) grunt.log.ok(msg);
    }

    function push(){
      shell.exec('git push grunt');
      grunt.log.ok('pushed to github');
    }

    // write updated package.json
    function bump(){
      grunt.file.write(pkgFile, JSON.stringify(pkg, null, '  ') + '\n');
      grunt.log.ok('Version bumped to ' + newVersion);
      currentVersion = newVersion;
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