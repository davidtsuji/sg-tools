
;( function( $ ){

	$.fn.sgFormIsInvalid = function(){

		var $form = $( this )
		  , $validationMessages = $form.find( '.sg-validator-message:visible' )
		  , $scrollPane = $
		  , invalid

		invalid = $validationMessages.length > 0

		$form.addClass( 'ng-dirty' )

		if ( invalid ) {

			$validationMessages.removeClass('animated shake');
			$validationMessages[0].offsetWidth;
			$validationMessages.addClass('animated shake');

			$fieldToScrollTo = $validationMessages.filter( ':first' );

			if ( $fieldToScrollTo.length > 0 ) {

				var scrollPanes = [

					'.module-record-wrapper>.content'

				];

				_.each(scrollPanes, function(_pane){

					if ($fieldToScrollTo.closest(_pane).length > 0) $scrollPane = $(_pane);

				});

				$scrollPane.scrollTo(	$fieldToScrollTo, 450,
							{
								easing  : 'easeOutBack',
								offset  : {top:-100},
								onAfter : function(){

			 						var $validationMessageInput = $fieldToScrollTo.prev( ':input' )

			 						if ($validationMessageInput.length > 0 ) $validationMessageInput.focus()

								}
							});

			}

		}

		return invalid

	}

} )( window.jQuery );