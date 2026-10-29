import test from 'node:test';
import assert from 'node:assert/strict';
import { getIntelligentReply } from './knowledgeEngine.js';

test('answers math calculations accurately', () => {
  const r1 = getIntelligentReply('what is 25 * 4');
  assert.ok(r1.includes('100'), `Expected 100 in "${r1}"`);

  const r2 = getIntelligentReply('15 + 35 kitna hota hai', 'hinglish');
  assert.ok(r2.includes('50'), `Expected 50 in "${r2}"`);

  const r3 = getIntelligentReply('what is 20% of 500');
  assert.ok(r3.includes('100'), `Expected 100 in "${r3}"`);

  const r4 = getIntelligentReply('square root of 144');
  assert.ok(r4.includes('12'), `Expected 12 in "${r4}"`);
});

test('answers geography & capitals in Hindi and Hinglish', () => {
  const patna = getIntelligentReply('Patna kahan hai', 'hinglish');
  assert.ok(patna.toLowerCase().includes('bihar'), `Expected Bihar in "${patna}"`);
  assert.ok(patna.toLowerCase().includes('ganga'), `Expected Ganga in "${patna}"`);

  const delhi = getIntelligentReply('Bharat ki rajdhani kya hai', 'hi');
  assert.ok(delhi.includes('नई दिल्ली'), `Expected New Delhi in "${delhi}"`);

  const everest = getIntelligentReply('duniya ka sabse uncha pahaad', 'hinglish');
  assert.ok(everest.toLowerCase().includes('everest'), `Expected Everest in "${everest}"`);
});

test('answers programming, DSA and tech questions properly', () => {
  const bs = getIntelligentReply('explain binary search with time complexity', 'en');
  assert.ok(bs.toLowerCase().includes('binary search'), `Expected binary search in "${bs}"`);
  assert.ok(bs.includes('O(log n)'), `Expected O(log n) in "${bs}"`);

  const poly = getIntelligentReply('polymorphism samjhao', 'hinglish');
  assert.ok(poly.toLowerCase().includes('polymorphism'), `Expected polymorphism in "${poly}"`);

  const py = getIntelligentReply('python kya hai', 'hinglish');
  assert.ok(py.toLowerCase().includes('python'), `Expected python in "${py}"`);
});

test('answers general conversation, jokes and time/date', () => {
  const who = getIntelligentReply('who are you');
  assert.ok(who.includes('VoxReel AI'), `Expected VoxReel AI in "${who}"`);

  const time = getIntelligentReply('time kya hai', 'hinglish');
  assert.ok(time.toLowerCase().includes('time'), `Expected time in "${time}"`);

  const joke = getIntelligentReply('joke sunao', 'hi');
  assert.ok(joke.length > 10, `Expected non-empty joke: "${joke}"`);
});

