import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseHtml } from '../src/services/parser/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadFixture(name) {
  return readFileSync(join(__dirname, 'fixtures', name), 'utf-8');
}

test('parseHtml — happy path: extracts all fields from a well-formed page', () => {
  const html = loadFixture('valid-page.html');

  const result = parseHtml(html);

  assert.equal(result.page_title, 'Acme Widgets — Home');
  assert.equal(result.meta_description, 'Acme Widgets builds reliable, affordable widgets for everyone.');
  assert.equal(result.h1_count, 1);
  assert.equal(result.images_missing_alt, 2);
  assert.ok(
    result.approximate_word_count >= 20 && result.approximate_word_count <= 40,
    `expected word count within [20, 40], got ${result.approximate_word_count}`,
  );
});

test('parseHtml — failure case: missing <title> is handled gracefully', () => {
  const html = loadFixture('missing-title.html');

  const result = parseHtml(html);

  assert.equal(result.page_title, null);
  assert.equal(result.meta_description, 'A page that forgot to set a title.');
  assert.equal(result.h1_count, 2);
  assert.equal(result.images_missing_alt, 0);
  assert.ok(result.approximate_word_count > 0);
});

test('parseHtml — failure case: malformed/unclosed HTML does not throw and still extracts what it can', () => {
  const html = loadFixture('malformed.html');

  assert.doesNotThrow(() => parseHtml(html));

  const result = parseHtml(html);

  assert.equal(result.page_title, 'Broken Page');
  assert.equal(result.meta_description, 'Missing closing tags all over the place.');
  assert.equal(result.h1_count, 1);
  assert.equal(result.images_missing_alt, 2);
  assert.ok(result.approximate_word_count > 0);
});

test('parseHtml — edge case: empty HTML string never throws', () => {
  assert.doesNotThrow(() => parseHtml(''));

  const result = parseHtml('');

  assert.equal(result.page_title, null);
  assert.equal(result.meta_description, null);
  assert.equal(result.h1_count, 0);
  assert.equal(result.images_missing_alt, 0);
  assert.equal(result.approximate_word_count, 0);
});
