
/*

var myschema = {

	name : 'string',
	ismale : { _type : 'boolean', _default : true, _optional : true },
	age : { _type : 'number' },
	height : 'number',

	address : {

		street : { _type : 'string', _default : '1 smith st' },
		postcode : { _type : 'number', _default : 4000, _optional : true },

		work : {

			suburb : 'string',
			somearray : { _type : 'array', _values : [1,2,3] },
			emptyobject : { _type : 'object', _values : [{a:'a'}, {b:'b'}] }

		}

	}

}

*/

;(function(){

	var sgSchemaClass = function(){

		this.typeRx        = /(string|number|boolean|array|object|date)/i;
		this.privateKeysRx = /(_type|_optional|_default|_values|_pattern|_format)/i

	}

	sgSchemaClass.prototype = {

		constructor: sgSchemaClass,

		_parseSchemaProperties : function(_schema) {

			var $this = this
			  , properties

			if (_.isString(_schema)) {

				properties = {

					_type     : $this.typeRx.test(_schema) ? _schema : 'string',
					_optional : false,
					_default  : '',
					_values	  : [],
					_format   : '',
					
				}

			} else if (_.isObject(_schema)) {

				properties = {

					_type     : $this.typeRx.test(_schema['_type']) ? _schema['_type'] : 'object',
					_optional : _.isBoolean(_schema['_optional']) ? _schema['_optional'] : false,
					_default  : ! _.isUndefined(_schema['_default']) ? _schema['_default'] : null,
					_format   : ! _.isUndefined(_schema['_format']) ? _schema['_format'] : '',
					_values   : ! _.isUndefined(_schema['_values'])
								? ( _.isString(_schema['_values'])
										? [_schema['_values']]
										: (_.isArray(_schema['_values']) ? _schema['_values'] : []) ) 
								: []
					
				}

			}

			if (_.isUndefined(properties)) return;

			if (properties._type == 'string') {

				properties._default = _.isString(properties['_default'])
									? properties['_default']
									: properties['_values'][0] || ''

			} else if (properties._type == 'number') {

				properties._default = _.isNumber(properties['_default'])
									? properties['_default']
									: properties['_values'][0] || 0

			} else if (properties._type == 'boolean') {

				properties._default = _.isBoolean(properties['_default'])
									? properties['_default']
									: properties['_values'][0] || false

			} else if (properties._type == 'array') {

				properties._default = _.isArray(properties['_default'])
									? properties['_default']
									: [properties['_values'][0]] || []

			} else if (properties._type == 'object') {

				properties._default = _.isObject(properties['_default']) && ! _.isEmpty(properties['_default'])
									? properties['_default']
									: properties['_values'][0] || {}

			}

			return properties;

		},

		_parseValue : function(_type, _value, _values, _format) {

			if (_.isString(_value) || _.isNumber(_value)) {

				if (_type == 'number') {

					_value = _.isNaN(parseFloat(_value)) ? 0 : parseFloat(_value);

				} else if (_type == 'string') {

					try {

						_value = _value.toString();

					} catch(e) {

						_value = null;

					}

				}  else if (_type == 'boolean') {

					_value = /^(true|1|yes)$/i.test(_value)

				} else if (_type == 'array') {

					try {

						_value = JSON.parse(_value);

					} catch(e) {

						_value = []

					}
					
				} else if (_type == 'object') {

					try {

						_value = JSON.parse(_value);

					} catch(e) {

						_value = {}

					}

				} else if (_type == 'date') {

					try {

						var dte = moment(_value)

						if (dte.isValid() == false) {

							dte = moment(_value, 'DD/MM/YYYY')

							if (dte.isValid() == false) throw Error('Cannot parse as moment date');

						}

						_value = dte.format(_format || '');

					} catch(e) {

						_value = new Date(_value);

					}

				}

				if (_values.length > 0) _value = _.where(_values, _value).length > 0 ? _value : undefined;

			}

			if (_type == 'boolean') {

				_value = _.isBoolean(_value) ? _value : _.isNumber(_value) && _value == 1

			}

			return _value;

		},

		_validateKeys : function(_result, _schema, _data) {

			var $this = this

			_.each(_.keys(_schema), function(_key) {

				var properties

				if ($this.privateKeysRx.test(_key)) return;

				properties = $this._parseSchemaProperties(_schema[_key]);

				if ( ! _.isObject(properties)) return _result[_key] = _schema[_key];

				if (properties._type == 'object' && ! ( _.isObject(_data[_key]) &&  ! _.isArray(_data[_key]) ) ) {

					if ( ! properties._optional || ! _.isUndefined(_data[_key])) {

						_data[_key]   = _.isObject(_data[_key]) && ! _.isEmpty(_data[_key]) ? _data[_key] : properties._default;
						_result[_key] = $this._validateKeys(_result[_key] || {}, _schema[_key], _data[_key]);

						if (_.isEmpty(_result[_key])) {

							_result[_key] = properties._default;

						}

					}

				} else if ( ! properties._optional || ! _.isUndefined(_data[_key])) {

					_data[_key] = $this._parseValue(properties._type, _data[_key], properties._values, properties._format);

					if ( /date/.test(properties._type)) {

						_result[_key] = _.isEmpty(_data[_key]) ? Date() : _data[_key];
						
					} else {

						_result[_key] = typeof _data[_key] == properties._type ? _data[_key] : properties._default;

					}

				}

			});

			return _result;

		},

		apply : function(_schema, _data) {

			var $this = this;

			if (_.isArray(_data)) {

				_.each(_data, function(_value, _key){

					_data[_key] = _.isEmpty(_schema) ? _value : $this._validateKeys({}, _schema, _value);

				});
				
			} else {

				_data = _.isEmpty(_schema) ? _data : $this._validateKeys({}, _schema, _data);

			}

			return _data;

		}

	}

	window.sg = window['sg'] || {};
	sg.schema = new sgSchemaClass();

	sg.schema.defaults = { }

})();
