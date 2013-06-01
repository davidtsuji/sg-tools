

test('cast test', function() {

	var schema = {

		aString  : String,
		aNumber  : { _type : Number },
		aBoolean : Boolean,
		aArray   : Array,
		aObject  : Object,

	}
	
	var myBoolean = true
	  , myArray = [1,2,3]
	  , myString = 'test string'
	  , myNumber = 1
	  , myObject = {a: 'a'}
	  , myDate = new Date()



	ok( sg.schema.cast(myArray,   Array)   === myArray,   "myArray"   );
	ok( sg.schema.cast(myBoolean, Boolean) === myBoolean, "myBoolean" );
	ok( sg.schema.cast(myString,  String)  === myString,  "myString"  );
	ok( sg.schema.cast(myNumber,  Number)  === myNumber,  "myNumber"  );
	ok( sg.schema.cast(myObject,  Object)  === myObject,  "myObject"  );
	ok( sg.schema.cast(myDate,    Date)    === myDate,    "myDate"    );


	// # Array
	// Cast from different types
	ok( sg.schema.cast('1,2,3',   Array, [4,5,6]).constructor === Array,  "cast failed, so apply the default" );
	ok( sg.schema.cast('[1,2,3]', Array, [4,5,6]).constructor === Array,  "cast failed, so apply the default" );


	// # Boolean
	// Cast from different types
	ok( sg.schema.cast('true',    Boolean) === true,  "cast a String as a Boolean" );
	ok( sg.schema.cast('y',       Boolean) === true,  "cast a String as a Boolean" );
	ok( sg.schema.cast('yes',     Boolean) === true,  "cast a String as a Boolean" );
	ok( sg.schema.cast(1,         Boolean) === true,  "cast a Number as a Boolean" );
	ok( sg.schema.cast('n',       Boolean) === false, "cast a String as a Boolean" );
	ok( sg.schema.cast(0,         Boolean) === false, "cast a Number as a Boolean" );
	ok( sg.schema.cast(undefined, Boolean) === false, "cast a undefined as a Boolean" );
	ok( sg.schema.cast(null,      Boolean) === false, "cast a null as a Boolean" );


	// # Date
	// Cast from different types
	ok( sg.schema.cast('19 oct 1980', Date).toJSON() === '1980-10-18T14:00:00.000Z', "cast a String as a Date" );
	ok( sg.schema.cast('1980-10-18T14:00:00.000Z', Date).constructor === Date, "cast a String as a Date" );
	ok( sg.schema.cast('1980-10-18T14:00:00.000Z', Date).getTime() === 340725600000, "cast a String as a Date" );
	ok( sg.schema.cast('', Date) === undefined, "cast a String as a Date" );
	

	// # Number
	// Cast from different types
	ok( sg.schema.cast('1',       Number, 0) === 1,  "cast a String as a Number" );
	ok( sg.schema.cast('-11.5',   Number, 0) === -11.5,  "cast a String as a Number" );
	ok( sg.schema.cast('+11.5',   Number, 0) === 11.5,  "cast a String as a Number" );
	ok( sg.schema.cast('a1+11.5',  Number) === undefined,  "cast a String as a Number" );


	// # Object
	// Cast from different types
	ok( sg.schema.cast('{"a":{"b":"b"}}', Object).a.b === 'b',  "cast a String as an Object" );


	// # String
	// Cast from different types
	ok( sg.schema.cast(12, String) === '12', "cast a String as an Object" );
	ok( sg.schema.cast({a:'a'}, String) === '{"a":"a"}', "cast a String as an Object" );

});

test('schema test 1', function(){

	var aSchema = {

	 	name : { _type : String, _default : 'David' },
	 	age : Number,
	 	dob1 : Date,
	 	dob2 : Date,
	 	dob3 : 'Moment',
	 	dob4 : { _type : 'Moment', _dateFormat : 'DD MMM YYYY h:mm A' },
	 	dob5 : 'Moment',
	 	address : {

	 		street : { _type : String, _default : '' },
	 		postcode : { _type : Number, _default : '' },

	 		work : {

	 			country : String,

	 		}

	 	},

	 	favouriteColor1 : { _type : String, _values : [ 'red', 'green', 'blue' ] },
	 	favouriteColor2 : { _type : String, _values : [ 'red', 'green', 'blue' ], _default : 'orange' },
	 	favouriteColor3 : { _type : String, _values : [], _default : 'orange' },

	 	favouriteNumber1 : { _type : Number, _values : [ 1,2,3 ] },
	 	favouriteNumber2 : { _type : Number, _values : [ 1,2,3 ] },
	 	favouriteNumber3 : { _type : Number, _values : [ 1,2,3 ] },

	 	likesPorkBelly1 : { _type : Boolean, _values : [ true ] },
	 	likesPorkBelly2 : { _type : Boolean, _values : [ true ] },
	 	likesPorkBelly3 : { _type : Boolean, _values : [ true ] },

	}

	var anObject = {

		age : 33,

		dob1 : '19 Oct 1980',
		dob2 : new Date(),
		dob3 : '50 april 2020',
		dob4 : '27 Feb 2011 17:30:10',
		dob5 : 476590380000,

		address : {

			street : '1 smith street',
			postcode : '4000',

			work : {

				badKey : 'this should not exist',

			}

		},

		favouriteColor1 : 'black',
		favouriteColor2 : 'black',
		favouriteColor3 : null,
		
		favouriteNumber1 : 3,
		favouriteNumber2 : 4,
		favouriteNumber3 : '3',

		likesPorkBelly1 : false,
		likesPorkBelly2 : 'false',
		likesPorkBelly3 : null,

	};

	var anObjectWithaSchemaApplied = sg.schema.apply(aSchema, anObject);

	// console.log(JSON.stringify(anObjectWithaSchemaApplied.address));
	// console.log(anObjectWithaSchemaApplied);

	ok( anObjectWithaSchemaApplied.name === 'David' );
	ok( anObjectWithaSchemaApplied.age === 33, 'age should equal 33' );
	ok( anObjectWithaSchemaApplied.dob1.getTime() === 340725600000, 'dob should equal 340725600000' );
	ok( anObjectWithaSchemaApplied.dob2.toGMTString() === new Date().toGMTString(), 'dob should equal the current GMT String' );
	ok( anObjectWithaSchemaApplied.dob3.isValid() === false, 'dob is a moment object and is valid' );
	ok( anObjectWithaSchemaApplied.dob4 === '27 Feb 2011 5:30 PM', 'dob should equal 27 Feb 2011 5:30 PM' );
	ok( anObjectWithaSchemaApplied.dob5.format('D MMMM YYYY h:mm A') === '7 February 1985 12:13 PM', 'dob should equal 7 February 1985 12:13 PM' );
	ok( anObjectWithaSchemaApplied.address.constructor === Object, 'address constructor equals an Object' );
	ok( anObjectWithaSchemaApplied.address.street === '1 smith street', 'address.street equals a "1 smith street"' );
	ok( anObjectWithaSchemaApplied.address.postcode === 4000, 'address.postcode equals 4000' );
	ok( anObjectWithaSchemaApplied.address.work.constructor === Object, 'address.work constructor equals an Object' );
	ok( anObjectWithaSchemaApplied.address.work.hasOwnProperty('badKey') === false, 'address.work does not contain a key "badKey"' );
	ok( JSON.stringify(anObjectWithaSchemaApplied.address) === '{"street":"1 smith street","postcode":4000,"work":{"country":""}}', 'address stringified' );
	ok( anObjectWithaSchemaApplied.favouriteColor1 === 'red', 'bad value so use the first value' );
	ok( anObjectWithaSchemaApplied.favouriteColor2 === 'red', 'bad value but use the values instead of the default' );
	ok( anObjectWithaSchemaApplied.favouriteColor3 === 'orange', 'bad value and no values so use the default' );

	ok( anObjectWithaSchemaApplied.favouriteNumber1 === 3, 'more default value tests');
	ok( anObjectWithaSchemaApplied.favouriteNumber2 === 1, 'more default value tests');
	ok( anObjectWithaSchemaApplied.favouriteNumber3 === 3, 'more default value tests');

	ok( anObjectWithaSchemaApplied.likesPorkBelly1 === true, 'more default value tests');
	ok( anObjectWithaSchemaApplied.likesPorkBelly2 === true, 'more default value tests');
	ok( anObjectWithaSchemaApplied.likesPorkBelly3 === true, 'more default value tests');

});


test('schema test 2', function(){

	var aSchema = {

		name : String,
		ismale : { _type : Boolean, _default : true, _optional : true },
		ispolitical : { _type : Boolean, _default : true, _optional : true },
		age : { _type : Number },
		height : Number,

		address : {

			street : { _type : String, _default : '1 smith st' },
			postcode : { _type : Number, _default : 4000, _optional : true },

			work : {

				suburb : String,
				somearray : { _type : Array, _values : [[1],[2],[3]] },
				emptyobject : { _type : Object, _values : [{a:'a'}, {b:'b'}] }

			}

		}

	}

	var anObject = {

		name : 'Max',
		ismale : true,

	}

	var anObjectWithaSchemaApplied = sg.schema.apply(aSchema, anObject);

	ok( JSON.stringify(anObjectWithaSchemaApplied) == '{"name":"Max","ismale":true,"age":0,"height":0,"address":{"street":"1 smith st","work":{"suburb":"","somearray":[1],"emptyobject":{"a":"a"}}}}' )

});


test('schema test with auto defaults off', function() {

	var aSchema = {

		name : String,
		ismale : { _type : Boolean, _default : true, _optional : true },
		ispolitical : { _type : Boolean, _default : true, _optional : true },
		age : { _type : Number },
		height : Number,

		address : {

			street : { _type : String, _default : '1 smith st' },
			postcode : { _type : Number, _default : 4000, _optional : true },

			work : {

				suburb : String,
				somearray : { _type : Array, _values : [[1],[2],[3]] },
				emptyobject : { _type : Object, _values : [{a:'a'}, {b:'b'}] }

			}

		}

	}

	var anObject = {

		name : 'Max',
		ismaleBadKey : true,

	}

	var anObjectWithaSchemaApplied = sg.schema.apply(aSchema, anObject, true);

	ok( JSON.stringify(anObjectWithaSchemaApplied) == '{"name":"Max","address":{"street":"1 smith st","work":{"somearray":[1],"emptyobject":{"a":"a"}}}}' );

});

test('an empty schema returns the data', function() {

	ok( JSON.stringify(sg.schema.apply({}, { a: 'a', b: { c: 'c' } })) == '{"a":"a","b":{"c":"c"}}' );

});


