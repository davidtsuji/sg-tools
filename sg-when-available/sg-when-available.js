;(function(){

	var timers = {}
	  , maxTimer = 3000
	  , multiplier = 1.03

	$.sgWhenAvailable = function(_element, _callback){

		timers[_element] = typeof timers[_element] == 'object'
						 ? timers[_element]
						 : { timeout : 0, timer : 100, element : [], numTimesChecked : 0 }

		var check = function() {

			timers[_element].element = $(_element);

			if (timers[_element].element.length > 0) {

				if (typeof _callback == 'function') {

					_callback.apply(timers[_element].element);
					
				}

				return;

			}

			timers[_element].timer = Math.min(timers[_element].timer * multiplier, maxTimer);
			timers[_element].timeout = setTimeout(check, timers[_element].timer);

		}

		clearTimeout(timers[_element].timeout);
		timers[_element].timeout = setTimeout(check, timers[_element].timer);

	};

})();