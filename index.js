'use strict';

// Symbols //
const TEST_NAME = Symbol('TEST_NAME');

// Error class //
class WantError extends Error {
  constructor(name, value, testFunction) {
    super(`Input variable "${name}" fails type check: ${testFunction[TEST_NAME]}`);
    this.name = 'WantError';
    this.data = { name, value, testFunction };
  }
}

// Entry point //
function want(name, value, testFunction) {
  if (!testFunction[TEST_NAME]) {
    throw new Error('want() test functions need to have a [TEST_NAME] symbol property');
  }
  if (!testFunction(value)) {
    throw new WantError(name, value, testFunction);
  }
}
want.TEST_NAME = TEST_NAME;
want.WantError = WantError;

// Test function decorator //
// NOTE: "name" is a verb, as in "give a name".
function name(testName, testFunction) {
  // This mutates the input like there's no tomorrow
  testFunction[TEST_NAME] = testName;
  return testFunction;
}

// Test functions //
// NOTE: The functions' goal is to be simple, readable and concise, not smart and cool.

// 1. Simple tests //
want.String = function(minLength = 0, maxLength = Infinity) {
  return name('String', (input) => (typeof input === 'string' && input.length >= minLength && input.length <= maxLength));
};
want.Number = function(min = 0, max = Infinity) {
  return name('Number', (input) => (typeof input === 'number' && !isNaN(input) && input >= min && input <= max));
};
want.Date = function(min = 0, max = Infinity) {
  min = Number(min);
  max = Number(max);
  return name('Date', (input) => (typeof input === 'object' && input.getTime && !isNaN(input.getTime()) && input.getTime() >= min && input.getTime() <= max));
};
want.Boolean = function() {
  return name('Boolean', (input) => (typeof input === 'boolean'));
};
// 2. Composite tests //
want.Object = function(fieldTests = null, extraFields = true) {
  const nameFromFieldTests = fieldTests ? ':' : '';
  const nameFromExtraFields = extraFields ? '+' : '';
  const compositeName = `Object(${nameFromFieldTests}${nameFromExtraFields})`;
  return name(compositeName, function(input) {
    if (!input || typeof input !== 'object') {
      return false;
    }
    const uncheckedFields = new Set(Object.keys(input));
    const valid = Object.keys(fieldTests || {}).every(function _runTestFunctionForKey(key) {
      uncheckedFields.delete(key);
      return fieldTests[key](input[key]);
    });
    if (!valid) {
      return false;
    }
    if (!extraFields && uncheckedFields.size > 0) {
      return false;
    }
    return true;
  });
};
want.Array = function(elementTest, minLength = 0, maxLength = Infinity) {
  return name(`Array(${elementTest[TEST_NAME]})`, function(input) {
    return (
      Array.isArray(input) &&
      input.every(elementTest) &&
      input.length >= minLength &&
      input.length <= maxLength
    );
  });
};
want.Nullable = function(test) {
  const compositeName = 'Nullable(' + test[TEST_NAME] + ')';
  return name(compositeName, (input) => (input === null || test(input)));
};
want.Optional = function(test) {
  const compositeName = 'Optional(' + test[TEST_NAME] + ')';
  return name(compositeName, (input) => (typeof input === 'undefined' || test(input)));
};

module.exports = want;
