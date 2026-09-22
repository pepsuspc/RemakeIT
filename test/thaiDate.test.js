import test from 'node:test';
import assert from 'node:assert/strict';
import { formatThaiDate } from '../src/domain/thaiDate.js';

test('formatThaiDate: แปลงเป็น "วัน เดือน พ.ศ."', () => {
  assert.equal(formatThaiDate('2026-09-22T12:00:00'), '22 กันยายน 2569');
});

test('formatThaiDate: เดือนแรกของปี', () => {
  assert.equal(formatThaiDate('2026-01-01T12:00:00'), '1 มกราคม 2569');
});