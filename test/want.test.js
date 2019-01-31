'use strict';

const assert = require('assert');
const want = require('../');
const E = want.WantError;

describe('want', function() {
  it('should validate strings', function() {
    assert.doesNotThrow(function() { want('username', 'user1', want.String()); });
    assert.doesNotThrow(function() { want('username', '', want.String()); });
    assert.doesNotThrow(function() { want('password', 'swordfish', want.String(8, 16)); });
    assert.doesNotThrow(function() { want('password', 'swordfish', want.String(1)); });
    assert.throws(function() { want('password', 'swordfish', want.String(20, 70)); }, E);
    assert.throws(function() { want('password', null, want.String()); }, E);
    assert.throws(function() { want('password', undefined, want.String()); }, E);
    assert.throws(function() { want('password', 1, want.String()); }, E);
    assert.throws(function() { want('password', '', want.String(1)); }, E);
  });
  it('should validate numbers', function() {
    assert.doesNotThrow(function() { want('temperature', 0, want.Number()); });
    assert.doesNotThrow(function() { want('temperature', 10, want.Number()); });
    assert.doesNotThrow(function() { want('temperature', 10.5, want.Number()); });
    assert.doesNotThrow(function() { want('temperature', -16.5, want.Number(-273.5, Infinity)); }, E);
    assert.doesNotThrow(function() { want('money', Infinity, want.Number()); }, E);
    assert.throws(function() { want('temperature', -1, want.Number()); }, E);
    assert.throws(function() { want('temperature', -100, want.Number(-99.5)); }, E);
    assert.throws(function() { want('temperature', true, want.Number()); }, E);
    assert.throws(function() { want('temperature', false, want.Number()); }, E);
    assert.throws(function() { want('temperature', null, want.Number()); }, E);
    assert.throws(function() { want('temperature', '100', want.Number()); }, E);
    assert.throws(function() { want('temperature', 'not a number', want.Number()); }, E);
    assert.throws(function() { want('temperature', NaN, want.Number()); }, E);
  });
  it('should validate boolean', function() {
    assert.doesNotThrow(function() { want('flag', true, want.Boolean()); });
    assert.doesNotThrow(function() { want('flag', false, want.Boolean()); });
    assert.throws(function() { want('flag', 0, want.Boolean()); }, E);
    assert.throws(function() { want('flag', 1, want.Boolean()); }, E);
    assert.throws(function() { want('flag', 'true', want.Boolean()); }, E);
    assert.throws(function() { want('flag', 'false', want.Boolean()); }, E);
    assert.throws(function() { want('flag', null, want.Boolean()); }, E);
    assert.throws(function() { want('flag', undefined, want.Boolean()); }, E);
  });
  it('should validate nullable values', function() {
    assert.doesNotThrow(function() { want('realName', null, want.Nullable(want.String())); });
    assert.doesNotThrow(function() { want('realName', '', want.Nullable(want.String())); });
    assert.doesNotThrow(function() { want('ready', null, want.Nullable(want.Boolean())); });
    assert.doesNotThrow(function() { want('ready', true, want.Nullable(want.Boolean())); });
    assert.doesNotThrow(function() { want('ready', false, want.Nullable(want.Boolean())); });
    assert.doesNotThrow(function() { want('statusCode', 0, want.Nullable(want.Number())); });
    // Check that it doesn't disable checking completely:
    assert.throws(function() { want('realName', 1, want.Nullable(want.String())); }, E);
    assert.throws(function() { want('realName', true, want.Nullable(want.String())); }, E);
    assert.throws(function() { want('statusCode', NaN, want.Nullable(want.Number())); }, E);
    // Should not allow undefined - there's Optional for that:
    assert.throws(function() { want('realName', undefined, want.Nullable(want.String())); }, E);
  });
  it('should validate optional values', function() {
    assert.doesNotThrow(function() { want('realName', undefined, want.Optional(want.String())); });
    assert.doesNotThrow(function() { want('realName', '', want.Optional(want.String())); });
    assert.doesNotThrow(function() { want('ready', undefined, want.Optional(want.Boolean())); });
    assert.doesNotThrow(function() { want('ready', true, want.Optional(want.Boolean())); });
    assert.doesNotThrow(function() { want('ready', false, want.Optional(want.Boolean())); });
    assert.doesNotThrow(function() { want('statusCode', 0, want.Optional(want.Number())); });
    // Invalid values should still be detected:
    assert.throws(function() { want('realName', 1, want.Optional(want.String())); }, E);
    assert.throws(function() { want('realName', true, want.Optional(want.String())); }, E);
    assert.throws(function() { want('statusCode', NaN, want.Optional(want.Number())); }, E);
  });
  it('should validate inputs that are both optional and nullable', function() {
    assert.doesNotThrow(function() { want('realName', undefined, want.Optional(want.Nullable(want.String()))); });
    assert.doesNotThrow(function() { want('realName', null, want.Optional(want.Nullable(want.String()))); });
    assert.doesNotThrow(function() { want('realName', '', want.Optional(want.Nullable(want.String()))); });
    assert.throws(function() { want('realName', 1, want.Optional(want.Nullable(want.String()))); }, E);
    assert.throws(function() { want('realName', NaN, want.Optional(want.Nullable(want.String()))); }, E);
    assert.throws(function() { want('realName', true, want.Optional(want.Nullable(want.String()))); }, E);
  });
  it('should validate arrays', function() {
    assert.doesNotThrow(function() { want('emails', [], want.Array(want.String())); });
    assert.doesNotThrow(function() { want('emails', [ 'amy@example.org' ], want.Array(want.String())); });
    assert.doesNotThrow(function() { want('emails', [ '' ], want.Array(want.String())); });
    assert.doesNotThrow(function() { want('emails', [ '' ], want.Array(want.String(), 0, 1)); });
    assert.doesNotThrow(function() { want('emails', [ '' ], want.Array(want.String(), 0)); });
    assert.doesNotThrow(function() { want('emails', [ 'amy@example.org' ], want.Array(want.String(), 1)); });
    assert.doesNotThrow(function() { want('emails', [ 'amy@example.org' ], want.Array(want.String(), 1, 1)); });
    assert.doesNotThrow(function() {
      want('emails', [ null, null ], want.Array(
        want.Nullable(
          want.String()
        )
      ));
    });
    assert.throws(function() { want('emails', [ 1 ], want.Array(want.String())); }, E);
    assert.throws(function() { want('emails', [ null ], want.Array(want.String())); }, E);
    assert.throws(function() { want('emails', [ '' ], want.Array(want.String(1, 100))); }, E);
    assert.throws(function() { want('emails', [], want.Array(want.String(), 1, 50)); }, E);
  });
  it('should validate objects', function() {
    assert.doesNotThrow(function() { want('obj', {}, want.Object()); });
    assert.doesNotThrow(function() { want('obj', { someKey: 'someValue' }, want.Object()); });
    assert.doesNotThrow(function() { want('obj', {}, want.Object(null, false)); });
    assert.doesNotThrow(function() {
      want('obj', { someKey: 'someValue' }, want.Object({
        someKey: want.String()
      }, false));
    });
    assert.doesNotThrow(function() {
      want('address', {
        streetAddress: 'Main Street 1',
        city: 'Validipolis',
        country: 'VL'
      }, want.Object({
        streetAddress: want.String(5, 100),
        city: want.String(1, 100),
        country: want.String(2, 2)
      }));
    });
    assert.throws(function() { want('obj', { someKey: 'someValue' }, want.Object(null, false)); }, E);
    assert.throws(function() {
      want('obj', { someKey: 'someValue' }, want.Object({
        someKey: want.Number()
      }));
    }, E);
    assert.throws(function() {
      want('obj', {}, want.Object({
        someKey: want.String()
      }));
    }, E);
    assert.throws(function() {
      want('address', {
        streetAddress: 'Main Street 1',
        city: 'Validipolis',
        country: 'VALIDLAND'
      }, want.Object({
        streetAddress: want.String(5, 100),
        city: want.String(1, 100),
        // Want a 2-character country code (in reality, this is better served by RegExp)
        country: want.String(2, 2)
      }));
    }, E);
    assert.throws(function() {
      want('address', {
        apartment: null,
        streetAddress: 'Main Street 1',
        city: 'Validipolis',
        country: 'VALIDLAND'
      }, want.Object({
        // Notice how Optional does not cover Nullable:
        apartment: want.Optional(want.String(1, 50)),
        streetAddress: want.String(5, 100),
        city: want.String(1, 100),
        country: want.String(2, 2)
      }));
    }, E);
  });
});
