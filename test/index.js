const test = require('tape-catch');
const logify = require('../index.js');

/**
 * Test object
 *
 * @private
 * @external test
 * @see {@link https://github.com/substack/tape#testname-opts-cb}
 */

test('logify', t => {
	t.strictEqual(typeof logify, 'function', 'Should be a function');

	t.strictEqual(logify(1), 1, 'Should return input when it is a basic number');
	t.strictEqual(logify(1n), 1n, 'Should return input when it is a basic bigint');
	t.strictEqual(logify(true), true, 'Should return input when it is a basic boolean');
	t.strictEqual(logify(null), null, 'Should return input when it is a null');
	t.strictEqual(logify(undefined), undefined, 'Should return input when it is an undefined'); // eslint-disable-line no-undefined
	t.strictEqual(logify('one'), 'one', 'Should return input when it is a basic string');
	t.strictEqual(logify(Infinity), Infinity, 'Should return input when it is an Infinity');
	t.ok(typeof logify(NaN) === 'number' && isNaN(logify(NaN)), 'Should return input when it is a NaN');
	t.strictEqual(logify({}), '{}', 'Should work on empty objects');
	t.strictEqual(logify([]), '[]', 'Should work on empty arrays');

	t.test('... object', testObject);
	t.test('... array', testArray);

	t.end();
});

const circular = {text: 'test'};
circular.circular = circular;

const o = {};
o.one = 1;
o.two = 'two';
o.three = undefined; // eslint-disable-line no-undefined
o.four = null;
o.five = 5n;
o.six = {
	oo: o,
	a : circular
};
o.seven = o;
o.eight = circular;
o.nine = function nine () {
	return 'Hello';
};
o.ten = () => 'World!';
o.eleven = {
	f1 () {}, // eslint-disable-line no-empty-function
	f2: () => {} // eslint-disable-line no-empty-function
};
o.twelve = Buffer.from('\x42');
o.thirteen = Infinity;
o.fourteen = NaN;
o.fifteen = [
	1,
	'2',
	circular,
	null,
	Infinity,
	NaN,
	15n,
	undefined // eslint-disable-line no-undefined
];
o.sixteen = '<hack';

/**
 * Test passing an object through logify.
 *
 * @private
 * @param {test} t
 */
function testObject (t) {
	var expected = `{
	"one": 1,
	"two": "<two",
	"three": "",
	"four": null,
	"five": "5n",
	"six": {
		"oo": "@@",
		"a": {
			"text": "<test",
			"circular": "@@six.a"
		}
	},
	"seven": "@@",
	"eight": "@six.a",
	"eleven": {},
	"twelve": "[42]",
	"thirteen": "Infinity",
	"fourteen": "NaN",
	"fifteen": [
		1,
		"<2",
		"@six.a",
		null,
		"Infinity",
		"NaN",
		"15n",
		""
	],
	"sixteen": "<<hack"
}`;

	t.strictEqual(logify(o), expected, 'Should convert object to JSON');
	t.ok(JSON.parse(logify(o)), 'Should result in parsable JSON string');

	// Default JSON.stringify outputs no spacing, so compare to that.
	expected = JSON.stringify(JSON.parse(expected));
	t.strictEqual(logify(o, ''), expected, 'Should convert object to JSON without spacing');
	t.ok(JSON.parse(logify(o), ''), 'Should result in parsable JSON string without spacing');
	t.end();
}

/**
 * Test passing an array through logify.
 *
 * @private
 * @param {test} t
 */
function testArray (t) {
	var a = [o];
	var expected = `[
	{
		"one": 1,
		"two": "<two",
		"three": "",
		"four": null,
		"five": "5n",
		"six": {
			"oo": "@@0",
			"a": {
				"text": "<test",
				"circular": "@@0.six.a"
			}
		},
		"seven": "@@0",
		"eight": "@0.six.a",
		"eleven": {},
		"twelve": "[42]",
		"thirteen": "Infinity",
		"fourteen": "NaN",
		"fifteen": [
			1,
			"<2",
			"@0.six.a",
			null,
			"Infinity",
			"NaN",
			"15n",
			""
		],
		"sixteen": "<<hack"
	}
]`;
	t.strictEqual(logify(a), expected, 'Should convert array to JSON');
	t.ok(JSON.parse(logify(o)), 'Should result in parsable JSON string');

	// Default JSON.stringify outputs no spacing, so compare to that.
	expected = JSON.stringify(JSON.parse(expected));
	t.strictEqual(logify(a, ''), expected, 'Should convert array to JSON without spacing');
	t.ok(JSON.parse(logify(a), ''), 'Should result in parsable JSON string without spacing');
	t.end();
}
