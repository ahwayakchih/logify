logify
======

Yet another implementation of turning objects and/or values into a JSON string.

This one strives to be safe (`JSON.stringify` will throw on `bigint` and circular references) and result in a JSON that's easy on the eyes while keeping enough information:

- references to objects are reported as a string with path to the first "encounter", e.g., `"@one.two"`,
- so are circular references too, but "@" character is doubled, e.g., `"@@one.two"`,
- `undefined` values are exported as an empty string, e.g., `""`,
- `bigint` values are exported as a string, e.g., `"5n"`,
- `Buffer` values are exported as a string with it's data shown as hexadecimal, e.g., `"[42]"`,
- `Infinity` values are exported as a string, i.e., `"Infinity"`,
- `NaN` values are exported as a string, i.e., `"NaN"`,
- regular strings are prefixed with a less-than, i.e., `"<text"`.

It's meant to be used for `console.log`-like output: for a quick check what's going on while debugging, and for testers to be able to quickly copy&paste information to developers.

Do not use it to store data! While it's output can be parsed back to objects, result will differ from the original data.


## Installation

```sh
npm install @ahwayakchih/logify
```

or:

```sh
npm install https://github.com/ahwayakchih/logify
```


## Usage

Example code:

```js
const logify = require('logify');

const circular = {
  text: 'test'
};
circular.circular = circular;

const o = {};
o.one = 1;
o.two = "two";
o.three = undefined;
o.four = null;
o.five = 5n;
o.six = {
  oo: o,
  a: circular
};
o.seven = o;
o.eight = circular;
o.nine = function nine () { return 'Hello'; };
o.ten = () => 'World!';
o.eleven = {
  f1: function () {},
  f2: () => {}
};
o.twelve = Buffer.from('\x42');
o.thirteen = Infinity;
o.fourteen = NaN;
o.fifteen = [1,'2',circular,null,Infinity,NaN,15n,undefined];
o.sixteen = '<hack';

console.log(logify(o));
```

It should output something like this:

```json
{
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
}
```

By enforcing empty spacer:

```js
console.log(logify(o, ''));
```

You can get output similar to default `JSON.stringify`:

```json
{"one":1,"two":"<two","three":"","four":null,"five":"5n","six":{"oo":"@@","a":{"text":"<test","circular":"@@six.a"}},"seven":"@@","eight":"@six.a","eleven":{},"twelve":"[42]","thirteen":"Infinity","fourteen":"NaN","fifteen":[1,"<2","@six.a",null,"Infinity","NaN","15n",""],"sixteen":"<<hack"}
```

## Compatibility

Logify uses features from ES2015, so it should be compatible with most of the up-to-date browsers and Node.js.
To make InternetExplorer use logify, you'll probably need some pollyfills and/or additional compile stage, e.g., using Babel.

Tests use features from ES2020, e.g., bigints (`1n`), so Node.js v12+ is required.

## API Documentation

To generate documentation for this module, clone it from repository (package does not include required files) and use:

```sh
npm run doc
```

It will create HTML files inside `logify/reports/jsdoc` directory.

## Testing

To run tests, clone module from repository and use:

```sh
npm test
```

To check coverage, use:

```sh
npm run checkCoverage
```

To check for any linting issues use:

```sh
npm run checkStyle
```
