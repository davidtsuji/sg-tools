!function ($) {

	var currentSpot
	  , wrapper
	  , anchorX
	  , anchorY
	  , spotMinWidth  = 15
	  , spotMinHeight = 15
	  , zIndexCounter = 20
	  , targetPosition

	$(document)
		.on('dragstart', '.sg-tagger-image', function(_event){

			_event.preventDefault();

		})
		.on('click.sg-tagger', function(_event){

			var target = $(_event.target)
			  , hideInputs = ! (target.is('.sg-tagger input') || target.is('.sg-tagger button') || target.is('.sg-tagger button i'))

			if (hideInputs) {
			
				$('.sg-tagger>.spot>aside>div.content>div.input>input').trigger('hide');

			}

		})
		.on('mousedown.sg-tagger', '.sg-tagger', function(_event){

			var target = $(_event.target);

			if (!target.is('.sg-tagger-image')) return;

			targetPosition = target.offset();

			zIndexCounter++;

			wrapper = $(this).closest('.sg-tagger');
			wrapper.find('>.spot').css('pointer-events', 'none');

			anchorX = _event.clientX - targetPosition.left;
			anchorY = _event.clientY - targetPosition.top;

			currentSpot = new sgTaggerSpot();

			currentSpot.css({'left': anchorX, 'top': anchorY, 'z-index': zIndexCounter});

			wrapper.prepend(currentSpot);

		})
		.on('mouseup.sg-tagger', function(_event){

			$('.sg-tagger>.spot').css('pointer-events', '').removeClass('creating active');

			if (!currentSpot || !wrapper) return;
			if (currentSpot.width() < spotMinWidth || currentSpot.height() < spotMinHeight) currentSpot.remove();

			currentSpot = wrapper = null;

		})
		.on('mousemove.sg-tagger', '.sg-tagger', function(_event){

			if (!currentSpot || !wrapper) return;

			var offsetX = (_event.clientX - targetPosition.left) - anchorX
			  , offsetY = (_event.clientY - targetPosition.top) - anchorY
			  , width   = Math.abs(offsetX)
			  , height  = Math.abs(offsetY)
			  , css     = { width: width, height: height}

			if (offsetX < 0) css.left = anchorX - width;
			if (offsetY < 0) css.top  = anchorY - height;

			currentSpot.css(css);

		})
		.on('mousedown.sg-tagger', '.sg-tagger>.spot', function(){

			zIndexCounter++;
			$(this).css('z-index', zIndexCounter);

		})
		.on('click.sg-tagger', '.sg-tagger>.spot>a.remove', function(){

			if ( ! confirm('Are you sure you want to remove this hotspot')) return;

			$(this).closest('.spot').remove();

		})
		.on('click.sg-tagger', '.sg-tagger>.spot>aside', function(_event){

			if ($(this).hasClass('editing') || $(_event.target).is('i') || $(_event.target).is('button')) return;

			_event.stopPropagation();

			var aside = $(this)
			  , inputWrapper = $('<div class="input input-append"><input type="text"><button type="button" class="btn btn-info"><i class="icon-ok"></i></button></div>')
			  , input = inputWrapper.find('>input')
			  , div = aside.find('>div.content')
			  , span = aside.find('>div.content>span')

			aside.addClass('editing');

			input.val(span.text());

			div.append(inputWrapper);

			input.focus().select()

		})
		.on('click.sg-tagger', '.sg-tagger>.spot>aside>div.content>div.input>button', function(){

			$(this).closest('aside').find('>div.content>div.input>input')
				.trigger('save');

		})
		.on('keyup.sg-tagger', '.sg-tagger>.spot>aside>div.content>div.input>input', function(_event){

			var $this = $(this);

			switch(_event.keyCode) {

				case 27: $this.trigger('hide'); break;
				case 13: $this.trigger('save'); break;

			}

		})
		.on('hide.sg-tagger', '.sg-tagger>.spot>aside>div.content>div.input>input', function(_event){

			var $this = $(this)
			  , aside = $this.closest('aside')
			  , inputWrapper = aside.find('div.input')

			aside.removeClass('editing');
			inputWrapper.remove();

		})
		.on('save.sg-tagger', '.sg-tagger>.spot>aside>div.content>div.input>input', function(_event){

			var $this = $(this)
			  , span = $this.closest('aside').find('>div.content>span')
			  , spot = $this.closest('.spot')

			span.text($this.val());
			spot[ $this.val() == '' ? 'removeClass' : 'addClass' ]('dirty');

			$this.trigger('hide');
			
		});
	
	var sgTaggerSpot = function(){

		var spot = $('<div class="spot active creating" style="pointer-events:none"><a class="remove"><i class="icon-remove-sign"></i></a><aside><div class="content"><span></span></div></aside></div>');

		spot
			.draggable({containment: 'parent', cancel:'aside'})
			.resizable({minWidth: spotMinWidth, minHeight: spotMinHeight})

		return spot;

	}

	var sgTagger = function(_element){ }

	sgTagger.prototype = {

		get : function(_callback) {

			var $this = $(this)
			  , spots = $this.find('>.spot')
			  , imageOffset = $this.offset()
			  , regions = []

			$.each(spots, function(i, o){

				var spot = $(o)
				  , spotOffset = spot.offset()
				  , region = {}

				region.link = spot.find('aside>div.content>span').text();
				region.height = spot.outerHeight();
				region.width = spot.outerWidth();
				region.x = spotOffset.left - imageOffset.left;
				region.y = spotOffset.top - imageOffset.top;

				regions.push(region);

			});

			_callback && _callback(regions);

		},

		add : function(_regions) {

			var $this = $(this)
			  , regions = _.isArray(_regions) ? _regions : [_regions]

			_.each(regions, function(_value){

				if ( ! _.isObject(_value)) return;
				if ( !(_value['width'] || _value['height'] || _value['x'] || _value['y']) ) return;

				var spot = new sgTaggerSpot();

				spot
					.addClass('dirty')
					.removeClass('active creating')
					.css({

						width: _value.width,
						height: _value.height,
						left: _value.x,
						top: _value.y,
						pointerEvents: 'inherit'

					})
					.find('div.content>span')
						.text(_value.link)

				$this.prepend(spot);

			});

		}

	}

	$.fn.sgTagger = function (option) {
		var args = arguments;
		return this.each(function () {
			var $this = $(this)
			  , data = $this.data('sgTagger')

			if (!data) $this.data('sgTagger', (data = new sgTagger(this)))
			if (typeof option == 'string') data[option].apply($this, Array.prototype.slice.call( args, 1 ));

		})
	}

	$.fn.sgTagger.Constructor = sgTagger;

}(window.jQuery);
