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

	t.strictEqual(logify(o), `{
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
	"eight": "[reference: @six.a]"
}`, 'Should convert to JSON');
	t.ok(JSON.parse(logify(o)), 'Should result in parsable JSON string');

	t.end();
});