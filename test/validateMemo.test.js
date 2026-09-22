import test from 'node:test';
import assert from 'node:assert/strict';
import { validateMemoValues } from '../src/domain/validateMemo.js';

test('validateMemoValues: ฟิลด์ว่างทั้งหมด -> error ครบ 3 ช่อง', () => {
  const errors = validateMemoValues({});
  assert.deepEqual(Object.keys(errors).sort(), ['details', 'subject', 'to']);
});

test('validateMemoValues: เว้นวรรคล้วนถือว่าว่าง', () => {
  const errors = validateMemoValues({ subject: 'เรื่อง', to: '   ', details: 'รายละเอียด' });
  assert.deepEqual(Object.keys(errors), ['to']);
});

test('validateMemoValues: กรอกครบทุกช่อง -> ไม่มี error', () => {
  const errors = validateMemoValues({ subject: 'a', to: 'b', details: 'c' });
  assert.deepEqual(errors, {});
});