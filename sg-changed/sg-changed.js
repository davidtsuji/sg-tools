;(function(){

	var sgChangedClass = function() {

		var $this = this;

	}

	sgChangedClass.prototype = {

		constructor: sgChangedClass,

		end : function(_callback) {

			var $this = this;

			clearTimeout($this.timer);

			$this.timer = setTimeout(function(){

				_callback && _callback();

			}, $this.defaults.typeTimeout);

		}

	}
	
	window.sg = window['sg'] || {};
	sg.changed = new sgChangedClass();

	sg.changed.defaults = {

		typeTimeout : 1000,

	}

})();
