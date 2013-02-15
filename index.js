var _ = require('underscore')
  , async = require('async')
  , glob = require('glob')

module.exports = function(_assets) {

	if ( ! _.isObject(_assets)) return;

	if (_.has(_assets, 'assets')) {

		var fs = require('fs')
		  , basePath = _.isObject(_assets['output']) && _.isString(_assets.output['base']) ? _assets.output.base : '.'

		_.each(_assets.assets, function(_asset, _type){

			_.each(_asset, function(_files, _fileName){

				var files = []
				  , q

				q = async.queue(function(_fileGlob, _callback){

					glob('.' + _fileGlob, function(_error, _file){

						if (_error) return _callback();

						files = files.concat(_file);
						_callback();

					});

				}, 1);

				q.drain = function() {

					if (files.length == 0) return;

					var minifiedFile = ''
					  , unminifiedFile = ''

					files = _.uniq(files);

					async.waterfall([

						function(_callback) {

							if (_type != 'js') return _callback();
							//if (/local/i.test(process.env.NODE_ENV)) return _callback();

							minifiedFile = require('uglify-js').minify(files).code

							_callback();

						},

						function(_callback) {

							if (_type != 'css') return _callback();

							require('recess')(files, { compile : true, compress : true }, function(_error, _css){

								var cssIsArray = _.isArray(_css)
								  , cssOutput = cssIsArray ? '' : _css.output;

								if (cssIsArray) {

									_.each(_css, function(_cssItem){

										cssOutput = cssOutput + _cssItem.output;

									});

								}

								minifiedFile = cssOutput;
								_callback();

							});

						},

						function(_callback) {

							_.each(files, function(_file){

								unminifiedFile = unminifiedFile + fs.readFileSync(_file);

							});

							_callback();

						}

					], function(){

						var fileName = _.isObject(_assets['output']) && _assets.output[_type+_fileName] || _fileName

						fs.writeFile(basePath + '/' + fileName + '.min.' + _type, minifiedFile);
						if (_type == 'js') fs.writeFile(basePath + '/' + fileName + '.'     + _type, unminifiedFile);

						console.log( fileName + '.' + _type + ' built');
						
					});

				}

				_.each(_files, function(_fileGlob){

					q.push(_fileGlob);

				});

			});

		});

	}

}