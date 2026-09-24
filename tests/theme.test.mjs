import test from 'node:test';
import assert from 'node:assert/strict';
import {readTheme, applyTheme} from '../dist/theme.mjs';

test('theme toggle exposes its state and restores a saved preference', () => {
  const saved = new Map();
  const storage = {getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value)};
  const root = {dataset: {}};
  const attributes = {};
  const button = {setAttribute: (name, value) => {attributes[name] = value}, textContent: ''};
  assert.equal(readTheme(storage), 'light');
  applyTheme(root, 'dark', button, storage);
  assert.equal(readTheme(storage), 'dark');
  assert.equal(root.dataset.theme, 'dark');
  assert.equal(attributes['aria-pressed'], 'true');
  assert.match(button.textContent, /Light mode/);
  applyTheme(root, 'light', button, storage);
  assert.equal(readTheme(storage), 'light');
  assert.equal(attributes['aria-pressed'], 'false');
});

test('a blocked preference store does not stop switching themes', () => {
  const blocked = {getItem() {throw Error('blocked')}, setItem() {throw Error('blocked')}};
  const root = {dataset: {}};
  assert.equal(readTheme(blocked), 'light');
  assert.doesNotThrow(() => applyTheme(root, 'dark', null, blocked));
  assert.equal(root.dataset.theme, 'dark');
});
