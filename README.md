# Need type checking! Quick!

Do the below if you:
* need simple, one-liner type checking
* want an error thrown if the types are wrong
* only have 2 minutes to learn the library

## Install!

```sh
npm install want-type
```

## Use!
Let's add type checking to a function that accepts user comments on a website.

```js
const want = require('want-type');

function handleUserComment(nickname, email, message, subscribeToNewsletter) {
  // Nicknames can be null for anonymous commenters, otherwise 1-100 chars:
  want('nickname', nickname, want.Nullable(want.String(1, 100)));
  // Need the e-mail for user verification, should be 3 to 200 characters:
  want('email', email, want.String(3, 200));
  // Allow any message length, including empty string:
  want('message', message, want.String());
  // Need a boolean flag:
  want('subscribeToNewsletter', subscribeToNewsletter, want.Boolean());
  // ... now you can code with peace of mind.
}
```

If any of the predicates are not met in the above example (e.g. `nickname` is an empty string, or `subscribeToNewsletter` is not a boolean), an error is thrown. Simple enough!

Many more types can be checked for - see the API section below.

## Error handling
There are 2 options what to do in case validation fails:
1. Let the calling function (or the framework) handle it
2. Catch the validation error and apply custom logic in this case

In case 1, you don't have to do anything special - just let the thrown error (exception) bubble up the stack.

In case you need to recognize validation errors, do this (using our example function defined above):
```js
try {
  handleUserComment(req.body.nickname, req.body.email, req.body.message, req.body.subscribeToNewsletter);
} catch (error) {
  if (error && error.name === 'WantError') {
    return res.status(400).send('Invalid user input');
  }
}
```

Alternatively, if you want to be specific, you could `.send(error.message)` - the message will be something useful, such as:
```
Input variable "nickname" fails type check: Nullable(String)
```

To facilitate automatic error handling, the errors also have a `data` property, which is an object that explains which check failed, and includes both the test function and the input value:
```js
{
  // Whatever we passed as the first argument to want(...):
  name: 'nickname',
  // The value that was passed as the second argument:
  value: '',
  // The test function used (the third argument):
  testFunction: function(){/*...*/}
}
```

## API

### Running a type check for a value

#### `want(name, value, testFunction)`
Executes a type check ("test") on the `value` using the passed function `testFunction`. If it fails (returns false), an `WantError` is thrown. The `name` string is used for annotating the error object with the name of argument/parameter that was considered invalid.

The test function needs to have a symbol-keyed property that gives it a test name - this is the string that ends up in the error message if validation fails. All test functions created by this library have the symbol. See the source for hints on how to implement your own test functions.

Constructors for included functions are listed below:

### Simple types ###

#### `want.String(minLength, maxLength)`
Generates a test function that returns true iff the input is a string of the given length. Checking is done by `typeof input === 'string'` and by inspecting `input.length`.

#### `want.Number(min = 0, max = Infinity)`
Generates a test function for checking if the input is a valid number (not NaN), and is within range (inclusive).

#### `want.Date(min = 0, max = Infinity)`
Generates a function that checks whether the input is a date between the given timestamps,
as represented by milliseconds since the Unix epoch (`1970-01-01T00:00:00Z`). Also supports
passing `Date` objects, but not date strings, as `min` and `max`.

#### `want.Boolean()`
Generates a function that checks if the input is a boolean. Numbers like 0 and 1 fail the test, too (`typeof` needs to be `boolean`).

### Composite types

#### `want.Nullable(testFunction)`
Generates a test function that checks whether:
* the input is `null`, or
* the input passes the test function

#### `want.Optional(testFunction)`
Generates a test function that checks whether:
* the input is `undefined`, or
* the input passes the test function

If you need to allow both `null` and `undefined`, compose the two - use `want(..., ..., want.Optional(want.Nullable(...)))`.

#### `want.Array(elementTest, minLength = 0, maxLength = Infinity)`
Generates a test function that returns true iff the input is an Array where each element passes test `elementTest`. For example, to make sure you got an array of at least 2 non-negative numbers, do:
```js
want('myNumbers', myNumbers, want.Array(want.Number(), 2, Infinity));
```

Obviously, in production code it probably makes sense to also put an upper limit on array length when reading untrusted user input.

#### `want.Object(keyTestFunctions, extraFields = true)`
Generates a test function that checks whether the input is a non-null `object`. If you need to allow null too, use `want.Nullable(want.Object(...))`.

It is possible to validate the keys/values of the input by passing a key/value map as `keyTestFunctions`. For example:

```js
const product = { name: 'Broccoli, 250g', quantity: 4 };
want('product', product, want.Object({
  name: want.String(1, 100),
  quantity: want.Number(0, 1000)
}));
```

The second argument, `extraFields` (true by default), controls whether other fields are allowed than those in the specification. If `false`, objects with superfluous fields are disallowed.

## License

This library is licensed under the terms of the MIT license - see file [LICENSE](LICENSE).

## Contributing

This is an open project. Feel free to submit issues with bug reports, feature requests/suggestions, and to send Pull Requests for merging. Before sending patches, make sure your changes don't mangle all whitespaces/newlines in the file or do other chaotic stuff. Follow git best practices -  only change what is necessary. Pull requests should have unit tests - what good is a type-checking library if you can't quite trust it?

This library is designed to be simple, lightweight and easy to understand. It favors clarity over sophistication. When adding features, use your best judgement.
