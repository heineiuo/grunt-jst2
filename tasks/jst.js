/*
 * grunt-contrib-jst
 * http://gruntjs.com/
 *
 * Copyright (c) 2015 Tim Branyen, contributors
 * Licensed under the MIT license.
 */

'use strict';
var _ = require('lodash');
var chalk = require('chalk');
var declare = require('nsdeclare');
var fs = require('fs')
var path = require('path')

var escape = fs.readFileSync(path.join(__dirname, './lib/escape.js'), 'utf-8')

module.exports = function(grunt) {
  // filename conversion for templates
  var defaultProcessName = function(name) { return name; };

  grunt.registerMultiTask('jst', 'Compile underscore templates to JST file', function() {
    var lf = grunt.util.linefeed;

    var options = this.options({
      root: 'module.exports',
      namespace: 'JST',
      templateSettings: {},
      processContent: function (src) { return src; },
      separator: lf + lf
    });

    // assign filename transformation functions
    var processName = options.processName || defaultProcessName;

    var nsInfo;
    if (options.namespace !== false) {
      var declareOptions = {
        root: options.root,
        response: 'details'
      }
      nsInfo = declare(options.namespace, declareOptions);
    }

    this.files.forEach(function(f) {
      var destSource;
      var output = f.src.filter(function(filepath) {
          // Warn on and remove invalid source files (if nonull was set).
          if (!grunt.file.exists(filepath)) {
            grunt.log.warn('Source file ' + chalk.cyan(filepath) + ' not found.');
            return false;
          } else {
            return true;
          }
        }) // end filter
        .map(function(filepath) {
          var src = options.processContent(grunt.file.read(filepath));
          var compiled, filename;

          try {
            compiled = _.template(src, false, options.templateSettings).source;
            compiled = compiled.replace(/\_\.escape/g, 'escape')
          } catch (e) {
            grunt.log.error(e);
            grunt.fail.warn('JST ' + chalk.cyan(filepath) + ' failed to compile.');
          }

          if (options.prettify) {
            compiled = compiled.replace(/\n/g, '');
          }
          filename = processName(filepath);

          return options.root+'['+JSON.stringify(filename)+'] = '+compiled+';';
        }); // end map

      if (output.length < 1) {
        grunt.log.warn('Destination not written because compiled files were empty.');
      } else {
        // if (options.namespace !== false) {
        //   output.unshift(nsInfo.declaration);
        // }
        if (options.amd) {
          if (options.prettify) {
            output.forEach(function(line, index) {
              output[index] = "  " + line;
            });
          }
          output.unshift("define(function(){");
          if (options.namespace !== false) {
            // Namespace has not been explicitly set to false; the AMD
            // wrapper will return the object containing the template.
            output.push("  return " + nsInfo.namespace + ";");
          }
          output.push("});");
        }

        var outputCompiled = output.join(grunt.util.normalizelf(options.separator))

        // if (options.cmd) {
        //   destSource = 'define(function(require, exports, module) {\n ';
        //   if (options.underscore) {
        //       destSource += 'var _ = require(\'' + options.underscore + '\'); \n';
        //   }
        //   destSource += ' module.exports = {\n' + outputCompiled + '\n};\n});';
        // } else {
        //   destSource = outputCompiled
        // }
        destSource = escape
        destSource += '\r\n;\r\n'
        destSource += outputCompiled
        grunt.file.write(f.dest, destSource);
        grunt.log.writeln('File ' + chalk.cyan(f.dest) + ' created.');
      }
    });

  });
};
