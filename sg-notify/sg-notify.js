;(function(){

	var sgNotifyClass = function() {

		var $this = this;

		$this.wrapper = $('<div class="sg-notify">');

		$(function(){

			if ($('body>div.sg-notify').length == 0) $('body').append($this.wrapper);

			$(document)
				.on('click', 'body:not(.sg-notify-loading) .sg-notify.show > section > i', function(){

					sg.notify.hide();

				});

		});

	}

	sgNotifyClass.prototype = {

		constructor: sgNotifyClass,

		show: function(_delay, _type, _message, _timeout) {
			  
			var timeout    = _.isNumber(_delay) ? arguments[3] : arguments[2]
			  , message    = _.isNumber(_delay) ? arguments[2] : arguments[1]
			  , type       = _.isNumber(_delay) ? arguments[1] : arguments[0]

			var $this    = this
			  , section  = $('<section class="animated bounceInUp">')
			  , back     = $('<div class="back animated">')
			  , aside    = $('<aside class="animated" />')
			  , icon     = $('<i class="animated" />')
			  , theme    = /\w:\w/.test(type) ? type.replace(/^[^:]+:/, '') : ''
			  , type     = type.replace(/:.+$/, '')
			  , spinner  = $('<div class="spinner12 animated"><div/><div/><div/><div/><div/><div/><div/><div/><div/><div/><div/><div/></div>')

			timeout = _.isNumber(timeout) ? timeout : 1e9;

			clearTimeout($this.delayShowTimeout);

			$this.delayShowTimeout = setTimeout(function(){

				$this.wrapper.addClass('show');

				section
					.append(icon)
					.addClass(theme || $this.defaults.theme)
					.addClass('section-type-' + type)

				if (message) section.append(back);
				if (message) section.append(aside);

				clearTimeout($this.hideTimeout);
				clearTimeout($this.delayShowTimeout);

				switch(true) {

					case (/success/.test(type)):

						$this.wrapper.removeClass('block');
						icon.addClass('icon-circle').html('<i class="icon-ok">')
						aside.html(message);

						$this.hideTimeout = setTimeout(function(){ $this.destroyExistingIcon() }, timeout == 1e9 ? $this.defaults.successTimeout : timeout);

					break;

					case (/fail|error/.test(type)):

						$this.wrapper.removeClass('block');
						icon.addClass('icon-circle').html('<i class="exclamation-point">!</i>')
						aside.html(message);

						$this.hideTimeout = setTimeout(function(){ $this.destroyExistingIcon() }, timeout);

					break;

					case (/loading|spinner/.test(type)):

						$('body').addClass('sg-notify-loading');
						$this.wrapper.addClass('block');
						section.append(spinner);
						aside.html(message || 'please wait')

						$this.hideTimeout = setTimeout(function(){ $this.destroyExistingIcon() }, timeout);

					break;

					default:

						$this.wrapper.removeClass('block');
						icon.addClass(type);
						aside.html(message);

						$this.hideTimeout = setTimeout(function(){ $this.destroyExistingIcon() }, timeout);

					break;

				}

				$this.destroyExistingIcon();
				$this.wrapper.append(section);

			}, _.isNumber(_delay) ? _delay : 0);

		},

		hide: function() {

			var $this = this;

			clearTimeout($this.delayShowTimeout);
			$this.wrapper.removeClass('show block').addClass('hiding');
			$this.destroyExistingIcon();

		},

		destroyExistingIcon: function() {

			var $this       = this
			  , section     = $this.wrapper.find('>section:not(.sg-notify-destroy)')
			  , numSections = $this.wrapper.find('>section')
			  , icon        = section.find('>i')
			  , aside       = section.find('>aside')
			  , back        = section.find('>.back')
			  , spinner     = section.find('>.spinner12')

			if (section.length > 0) {

				section.addClass('sg-notify-destroy')
				icon.addClass('fadeOutUp');
				spinner.addClass('fadeOutUp');
				aside.addClass('fadeOutUp');
				back.addClass('fadeOut');

				if (numSections <= 1) $this.wrapper.removeClass('show').addClass('hiding');

				setTimeout(function(){

					if ($this.wrapper.find('>section').length <= 1) {

						$this.wrapper.removeClass('block hiding show');

					}

					if (section.hasClass('section-type-loading')) {

						$('body').removeClass('sg-notify-loading');

					}

					section.remove();

				}, 1000);

			}

		}

	}
	
	window.sg = window['sg'] || {};
	sg.notify = new sgNotifyClass();

	sg.notify.defaults = {

		theme : 'light',
		successTimeout : 2000,

	}

})();
