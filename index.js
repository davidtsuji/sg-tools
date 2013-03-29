var _      = require('underscore')
  , async  = require('async')
  , glob   = require('glob')
  , crypto = require('crypto')

var timer = {

	start : 0,

	glob : {

		start : 0,
		reading : [0]

	},

	css : {

		start : 0,
		reading : [0]

	},

	js : {

		start : 0,
		reading : [0]

	},

	fileConcat : {

		start : 0,
		reading : [0]

	}

}

var getAverageTimes = function(_times) {

	return Math.round(_.reduce(_times, function(_reading, _num){ return _reading + _num }, 0) / _times.length);

}

module.exports = function(_assets) {

	if ( ! _.isObject(_assets)) return;

	if (_.has(_assets, 'assets')) {

		console.log('\n');
		console.log('BUILDING ASSETS');
		console.log('----------------------------\n');

		var fs = require('fs')
		  , basePath = _.isObject(_assets['output']) && _.isString(_assets.output['base']) ? _assets.output.base : '.'

		timer.start = Date.now();

		var typeq = async.queue(function(_assetType, _tqcallback){

			var files = []
			  , q

			timer.glob.start = Date.now();

			q = async.queue(function(_fileGlob, _callback){

				glob('.' + _fileGlob, function(_error, _file){

					if (_error) return _callback();

					files = files.concat(_file);
					_callback();

				});

			}, 1);

			q.drain = function() {

				timer.glob.reading.push(Date.now() - timer.glob.start);

				if (files.length == 0) return _tqcallback();

				var minifiedFile = ''
				  , unminifiedFile = ''
				  , fileName = _.isObject(_assets['output']) && _assets.output[_assetType.type+_assetType.fileName] || _assetType.fileName

				files = _.uniq(files);

				async.waterfall([

					function(_callback) {

						var existingFile = basePath + '/' + fileName + '.' + _assetType.type
						  , existingFileContents = fs.existsSync(existingFile) ? fs.readFileSync(existingFile) : null
						  , existingFileHash = existingFileContents ? crypto.createHash('sha512').update(existingFileContents).digest('base64') : null

						timer.fileConcat.start = Date.now();

						_.each(files, function(_file){

							unminifiedFile = unminifiedFile + fs.readFileSync(_file) + '\n\n';

						});

						fs.writeFileSync(existingFile + '.new', unminifiedFile);

						timer.fileConcat.reading.push(Date.now() - timer.fileConcat.start);

						if ( existingFileHash != null && existingFileHash === crypto.createHash('sha512').update(fs.readFileSync(existingFile + '.new')).digest('base64')) {

							return _callback('unchanged');

						}

						_callback();

					},

					function(_callback) {

						if (_assetType.type != 'js') return _callback();

						timer.js.start = Date.now()
						minifiedFile = require('uglify-js').minify(files).code
						timer.js.reading.push(Date.now() - timer.js.start);

						_callback();

					},

					function(_callback) {

						if (_assetType.type != 'css') return _callback();

						timer.css.start = Date.now()

						require('recess')(files, { compile : true, compress : true }, function(_error, _css){

							var cssIsArray = _.isArray(_css)
							  , cssOutput = cssIsArray ? '' : _css.output;

							if (cssIsArray) {

								_.each(_css, function(_cssItem){

									cssOutput = cssOutput + _cssItem.output;

								});

							}
							
							timer.css.reading.push(Date.now() - timer.css.start);

							minifiedFile = cssOutput;
							_callback();

						});

					},

				], function(_error){

					var fileNameAndPath = basePath + '/' + fileName + '.' + _assetType.type
					  , minfileNameAndPath = basePath + '/' + fileName + '.min.' + _assetType.type

					if (_error && _error == 'unchanged') {

						console.log('unchanged', fileNameAndPath);
						_tqcallback();

						return;

					}

					fs.writeFileSync(minfileNameAndPath, minifiedFile);
					fs.writeFileSync(fileNameAndPath, unminifiedFile);

					console.log('built    ', fileNameAndPath);

					_tqcallback();

				});

			}

			_.each(_assetType.files, function(_fileGlob){

				q.push(_fileGlob);

			});

		}, 1);

		typeq.drain = function() {

			console.log('\n');
			console.log('STATS           average (ms)');
			console.log('----------------------------');
			console.log('glob           ', getAverageTimes(timer.glob.reading));
			console.log('fileConcat     ', getAverageTimes(timer.fileConcat.reading));
			console.log('js             ', getAverageTimes(timer.js.reading));
			console.log('css            ', getAverageTimes(timer.css.reading));
			console.log('----------------------------');
			console.log('total time     ', Date.now() - timer.start);
			console.log('\n');

			glob(basePath + '/*.new', function(_error, _files){

				if (_error) return;

				_.each(_files, function(_file) {

					fs.unlink(_file);

				});

			});

		}

		_.each(_assets.assets, function(_asset, _type){

			_.each(_asset, function(_files, _fileName){

				typeq.push({files: _files, fileName: _fileName, type : _type});

			});

		});

	}

}