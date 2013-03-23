$(function(){

	var UploadEventsClass = klass(function(_options){

		var options = _.isObject(_options) ? _options : {}

		this.theme = _.isString(options['theme']) ? options['theme'] : '';
		this.input = $(options['input']).length > 0 ? $(options['input']) : $();

	})
	.methods({

		progress : function(_event) {

			if ( ! _event.lengthComputable) return;

  			$('.sg-notify .progress > .bar').css('width', ((_event.loaded / _event.total) * 100) + '%');

		},

		load : function(_event) {

			if (_event.target['status'] != 200) return sg.notify.show('error', 'There was an error uploading your file');

			var file = JSON.parse(_event.target.response).file
			  , $input = this.input

			if ($input.length > 0 && window['$App'] && _.isObject($App['Main']) && _.isObject($App.Main['scope'])) {

				$App.Main.scope.$apply(function(){

					try {

						eval($input.attr('data-sg-upload-var') + '=\'' + file + '\'');
						
					} catch(e){}

				});

			}

  			sg.notify.show('success', 'uploaded');

  			if ($input.length > 0) $input.data('sg-uploaded-file', file);

		},

		loadend : function(_event) {


		},

		loadstart : function(_event) {

  			sg.notify.show('loading' + this.theme, '<div class="progress"><div class="bar" /></div>uploading');

		},

		error : function(_event) {

			sg.notify.show('error', 'There was an error uploading your file');

		},

		abort : function(_event) {

			sg.notify.show('error', 'Your upload was aborted');

		}
		
	});

	$('body').on('change', 'input[type=file][data-sg-upload-url]', function(_event){

		var $input = $(this)
		  , form = new FormData()
		  , xhr = new XMLHttpRequest()
		  , rx = new RegExp($input.attr('data-sg-upload-pattern') || '.+', 'i')
		  , file = this.files[0] || {}
		  , fileName = file['name'] || ''
		  , bytes = file['size'] || 0
		  , maxBytes = parseInt($input.attr('data-sg-upload-maxbytes')) > 0 ? parseInt($input.attr('data-sg-upload-maxbytes')) : 0
		  , notifyTheme = $('body>div.modal-backdrop').length > 0 ? ':dark' : ''
		  , controller
		  , userController = eval($input.attr('data-sg-upload-controller')) || {}
		  , uploader = UploadEventsClass.extend().methods(userController)
		  , uploadUrl = $input.attr('data-sg-upload-url') || ''
		  , events = ['load', 'loadend', 'loadstart', 'error', 'abort']
		  , invalidFileTypeMessage = $input.attr('data-sg-upload-invalid-pattern-message') || 'This type of file type is not allowed'
		  , maxBytesExceededMessage = $input.attr('data-sg-upload-maxbytes-exceeded') || 'This files is too big (max ' + numeral(maxBytes).format('0[.]0 b') + ')'

		if ( ! rx.test(fileName)) {

			alert(invalidFileTypeMessage);
			$input.val('');
			return;

		}

		if (bytes > maxBytes) {

			alert(maxBytesExceededMessage);
			$input.val('');
			return;

		}

		controller = new uploader({

			theme : notifyTheme,
			input : $input

		});

		form.append('file', file);

		xhr.open('POST', uploadUrl, true);
		xhr.upload.addEventListener('progress',  function(_eventType){
			controller['progress'](_eventType);
		});

		_.each(_.without(events, 'progress'), function(_eventType){

			xhr.addEventListener(_eventType,  function(_event){
				controller[_eventType](_event);
			});
			
		});

		xhr.send(form);

	})

});