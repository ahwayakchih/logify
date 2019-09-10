logify
======

Yet another implementation of turning objects and/or values into a JSON string.

This one strives to be safe (`JSON.stringify` will throw on `bigint` and circular references) and result in JSON that's easy on the eyes while keeping enough information:

- circular references are exported as a string, e.g., `"[circular: @one.two]"`,
- object references that were already "seen" earlier are exported as a string, e.g., `["reference: @one.two"]`,
- `undefined` values are exported as a string, e.g., `"[undefined]"`,
- `bigint` values are exported as a string, e.g., `"5n"`,
- `Buffer` values are exported as a string with it's data shown as hexadecimal, e.g., `"[Buffer: 42]"`.

It's meant to be used for `console.log` output: for a quick check what's going on.

Do not use it to store data! While it's output can be parsed back to objects, result will differ from the original data.


## Installation

```sh
npm install logify
```

or:

```sh
npm install https://github.com/ahwayakchih/logify
```


## Usage

Some example uses:

```js
const logify = require('logify');

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

console.log(logify(o));
/*
{
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
}
*/
```


## Compatibility

Logify uses features from ES2015, so it should be compatible with most of the up-to-date browsers and Node.js.
To make InternetExplorer use logify, you'll probably need some pollyfies and/or additional compile stage, e.g., using Babel.
