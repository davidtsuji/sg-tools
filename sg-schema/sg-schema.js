
;(function(){

	var sgSchemaClass = function(){ }

	sgSchemaClass.prototype = {

		constructor: sgSchemaClass,

		cast : function(_value, _castType, _default, _values) {

			var $this = this
			  , parsedValue
			  , valueType
			  , value
			  , values = typeof _values == 'object' && _values.constructor == Array ? _values : [];

			if ( ! _.isUndefined(_value) && ! _.isNull(_value)) valueType = _value.constructor

			if (valueType === _castType) {

				value = _value;

			} else {

				switch(true) {

					case _castType == Array && ! _.isNull(_value) && ! _.isUndefined(_value):

						value = [_value];

					break;

					case _castType == Boolean:

						try {

							value = /^(true|1|y|yes)$/i.test(_value.toString()) ? true : undefined

						}catch(e) {}

						value = _.isBoolean(value) ? value : ( ! _.isUndefined(_default) && ! _.isNull(_default) ? _default : false )

					break;

					case _castType == Date:

						try {

							value = new Date(_value);
							value = isNaN(value.getTime()) ? null : value;

						} catch(e) {}

					break;

					case _castType == String:

						try {

							value = JSON.stringify(_value);
							if ( _.isUndefined(value) ) throw '';

						} catch(e) {

							try { value = _value.toString() } catch(e){}

						}

					break;

					default:

						try { value = $this.cast(JSON.parse(_value), _castType) } catch(e) {}

					break;

				}

			}

			if (values.length > 0 && ! _.contains(values, value)) value = values[0];

			return _.isUndefined(value) || _.isNull(value) || value == 'null' ? _default : value;

		},

		getSchemaProperties : function(_properties) {

			var $this = this
			  , properties

			properties               = $this.cast(_properties, Object, { _type : _properties });
			properties._type         = _.has(properties, '_type') ? properties._type : Object;
			properties._optional     = $this.cast(properties['_optional'], Boolean, false);
			properties._default      = properties['_default'];
			properties._values       = $this.cast(properties['_values'], Array, []);
			properties._typeAsString = $this.cast(properties._type, String, '').match(/^function ([^\(]*)\(\)/)[1];
			properties._typeDefault  = $this.defaults[properties._typeAsString];

			return properties;

		},

		parseResult : function(_result, _data, _disableAutoDefauts) {

			var $this = this
			  , properties
			  , objectData
			  , defaultData
			  , dataIsEmpty

			_.each(_result, function(_properties, _key) {

				properties = $this.getSchemaProperties(_properties);

				objectData  = {};
				defaultData = ! _.isUndefined(properties._default) || _disableAutoDefauts ? properties._default : properties._typeDefault;
				dataIsEmpty = _data[_key];

				_.each(_.keys(properties), function(_key){

					if (/^[^_]/.test(_key)) objectData[_key] = properties[_key];

				});

				if (properties._optional == false || (properties._optional == true && ! _.isUndefined(_data[_key]))) {

					_result[_key] = _.isEmpty(objectData)
					              ? $this.cast(_data[_key], properties._type, defaultData, properties._values)
					              : $this.parseResult(objectData, $this.cast(_data[_key], Object, {}), defaultData, _disableAutoDefauts);


				} else {

					delete _result[_key];

				}

			});

			return _result;

		},

		apply : function(_schema, _data, _disableAutoDefauts) {

			var $this = this
			  , schema = $.extend(true, {}, _schema || {})

			return $this.parseResult(schema, _data, _disableAutoDefauts);

		}

	}

	window.sg = window['sg'] || {};
	sg.schema = new sgSchemaClass();

	sg.schema.defaults = {

		'Array'   : [],
		'Boolean' : false,
		'Date'    : new Date(),
		'Number'  : 0,
		'Object'  : {},
		'String'  : '',

	}

})();
