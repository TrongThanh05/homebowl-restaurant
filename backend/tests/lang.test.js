// tests/lang.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveLang, SUPPORTED_LANGS, DEFAULT_LANG } from '../src/utils/lang.js';

function mockReq(url, headers = {}) {
  return { url, headers };
}

describe('resolveLang', () => {
  it('returns vi when no hints given', () => {
    assert.equal(resolveLang(mockReq('/api/menu-items')), 'vi');
  });

  it('returns en from ?lang=en', () => {
    assert.equal(resolveLang(mockReq('/api/menu-items?lang=en')), 'en');
  });

  it('returns vi from ?lang=vi', () => {
    assert.equal(resolveLang(mockReq('/api/menu-items?lang=vi')), 'vi');
  });

  it('ignores unsupported ?lang=fr and falls to Accept-Language', () => {
    const req = mockReq('/api/menu-items?lang=fr', { 'accept-language': 'en-US,en;q=0.9' });
    assert.equal(resolveLang(req), 'en');
  });

  it('ignores unsupported ?lang=fr and unsupported Accept-Language, returns vi', () => {
    const req = mockReq('/api/menu-items?lang=fr', { 'accept-language': 'ja-JP,ja;q=0.9' });
    assert.equal(resolveLang(req), 'vi');
  });

  it('uses Accept-Language when no ?lang=', () => {
    const req = mockReq('/api/menu-items', { 'accept-language': 'en-US,en;q=0.9' });
    assert.equal(resolveLang(req), 'en');
  });

  it('defaults to vi when Accept-Language is empty', () => {
    const req = mockReq('/api/menu-items', { 'accept-language': '' });
    assert.equal(resolveLang(req), 'vi');
  });

  it('?lang= takes priority over Accept-Language', () => {
    const req = mockReq('/api/menu-items?lang=vi', { 'accept-language': 'en-US' });
    assert.equal(resolveLang(req), 'vi');
  });
});

describe('constants', () => {
  it('SUPPORTED_LANGS includes vi and en', () => {
    assert.ok(SUPPORTED_LANGS.includes('vi'));
    assert.ok(SUPPORTED_LANGS.includes('en'));
  });

  it('DEFAULT_LANG is vi', () => {
    assert.equal(DEFAULT_LANG, 'vi');
  });
});
