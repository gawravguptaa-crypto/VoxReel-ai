import test from 'node:test';
import assert from 'node:assert/strict';
import { routeCommand, detectLanguage } from './commandRouter.js';

test('detects language accurately for English, Hindi, and Hinglish', () => {
  assert.equal(detectLanguage('Explain polymorphism in C++'), 'en');
  assert.equal(detectLanguage('Instagram kholo'), 'hinglish');
  assert.equal(detectLanguage('व्हाट्सएप खोलो'), 'hi');
});

test('routes application launch commands correctly', () => {
  const r1 = routeCommand('Open Instagram');
  assert.equal(r1.intent, 'open_app');
  assert.equal(r1.target, 'instagram');

  const r1b = routeCommand('Open instragram');
  assert.equal(r1b.intent, 'open_app');
  assert.equal(r1b.target, 'instagram');

  const r2 = routeCommand('WhatsApp kholo');
  assert.equal(r2.intent, 'open_app');
  assert.equal(r2.target, 'whatsapp');

  const r2b = routeCommand('Open WhatsApp');
  assert.equal(r2b.intent, 'open_app');
  assert.equal(r2b.target, 'whatsapp');

  const r2c = routeCommand('open whats app');
  assert.equal(r2c.intent, 'open_app');
  assert.equal(r2c.target, 'whatsapp');

  const r3 = routeCommand('Open YouTube');
  assert.equal(r3.intent, 'open_app');
  assert.equal(r3.target, 'youtube');

  const r4 = routeCommand('Google Maps open karo');
  assert.equal(r4.intent, 'open_app');
  assert.equal(r4.target, 'maps');
});

test('routes greeting commands and preserves greeting intent', () => {
  const g1 = routeCommand('Hi');
  assert.equal(g1.intent, 'greeting');

  const g2 = routeCommand('Hello');
  assert.equal(g2.intent, 'greeting');

  const g3 = routeCommand('Namaste');
  assert.equal(g3.intent, 'greeting');
});

test('routes stop speaking and cancel commands', () => {
  const s1 = routeCommand('Stop speaking');
  assert.equal(s1.intent, 'stop_speaking');

  const s2 = routeCommand('Chup raho');
  assert.equal(s2.intent, 'stop_speaking');

  const s3 = routeCommand('Cancel');
  assert.equal(s3.intent, 'cancel');
});

test('routes study mode and educational queries', () => {
  const st1 = routeCommand('Help me with my assignment');
  assert.equal(st1.intent, 'study_mode');

  const st2 = routeCommand('Explain recursion in C++');
  assert.equal(st2.intent, 'study_query');

  const st3 = routeCommand('Binary search samjhao');
  assert.equal(st3.intent, 'study_query');
});

test('routes in-app media controls', () => {
  const m1 = routeCommand('Next video');
  assert.equal(m1.intent, 'media_control');
  assert.equal(m1.target, 'next');

  const m2 = routeCommand('Pause video');
  assert.equal(m2.intent, 'media_control');
  assert.equal(m2.target, 'pause');
});
