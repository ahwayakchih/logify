const test = require('tape-catch');
const logify = require('../index.js');

test('logify', t => {
	t.strictEqual(typeof logify, 'function', 'Should export function');

	t.strictEqual(logify(1), 1, 'Should handle basic number');
	t.strictEqual(logify(1n), 1n, 'Should handle basic bigint');
	t.strictEqual(logify(true), true, 'Should handle basic boolean');
	t.strictEqual(logify(null), null, 'Should handle null');
	t.strictEqual(logify(undefined), undefined, 'Should handle undefined');
	t.strictEqual(logify("one"), "one", 'Should handle basic string');

	const a = {
		text: 'test'
	};
	a.circular = a;

	const o = {};
	o.one = 1;
	o.two = "two";
	o.three = undefined;
	o.four = null;
	o.five = 5n;
	o.six = {
		oo: o,
		a: a
	};
	o.seven = o;
	o.eight = a;
	o.nine = function nine () { return 'Hello'; };
	o.ten = () => 'World!';
	o.eleven = {
		f1: function () {},
		f2: () => {}
	};
	o.twelve = Buffer.from('\x42');

	var expected = `{
	"one": 1,
	"two": "two",
	"three": "[undefined]",
	"four": null,
	"five": "5n",
	"six": {
		"oo": "[circular: @]",
		"a": {
			"text": "test",
			"circular": "[circular: @six.a]"
		}
	},
	"seven": "[circular: @]",
	"eight": "[reference: @six.a]",
	"eleven": {},
	"twelve": "[Buffer: 42]"
}`;

	t.strictEqual(logify(o), expected, 'Should convert to JSON');
	t.ok(JSON.parse(logify(o)), 'Should result in parsable JSON string');

	// Default JSON.stringify outputs no spacing, so compare to that.
	expected = JSON.stringify(JSON.parse(expected));
	t.strictEqual(logify(o, ''), expected, 'Should convert to JSON without spacing');
	t.ok(JSON.parse(logify(o), ''), 'Should result in parsable JSON string without spacing');

	t.end();
});