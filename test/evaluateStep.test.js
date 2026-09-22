import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateStep } from '../src/domain/evaluateStep.js';

function approvers(n) {
  return Array.from({ length: n }, (_, i) => ({ emp_id: `E${i + 1}` }));
}
function decision(empId, action, extra = {}) {
  return { emp_id: empId, action, ...extra };
}

// แถวที่ 1: 1 จาก 1
test('1 จาก 1: คนเดียวอนุมัติ -> passed', () => {
  const step = { quorum: 1, approvers: approvers(1) };
  assert.equal(evaluateStep(step, [decision('E1', 'approve')]), 'passed');
});
test('1 จาก 1: คนเดียวไม่อนุมัติ -> failed', () => {
  const step = { quorum: 1, approvers: approvers(1) };
  assert.equal(evaluateStep(step, [decision('E1', 'reject')]), 'failed');
});
test('1 จาก 1: ยังไม่มีใครกด -> waiting', () => {
  const step = { quorum: 1, approvers: approvers(1) };
  assert.equal(evaluateStep(step, []), 'waiting');
});

// แถวที่ 2: 1 จาก 3
test('1 จาก 3: ใครก็ได้ 1 คนอนุมัติ -> passed', () => {
  const step = { quorum: 1, approvers: approvers(3) };
  assert.equal(evaluateStep(step, [decision('E2', 'approve')]), 'passed');
});
test('1 จาก 3: ไม่อนุมัติแค่ 2 คน -> waiting (ยังไม่ตก)', () => {
  const step = { quorum: 1, approvers: approvers(3) };
  const result = evaluateStep(step, [decision('E1', 'reject'), decision('E2', 'reject')]);
  assert.equal(result, 'waiting');
});
test('1 จาก 3: ทั้ง 3 คนไม่อนุมัติ -> failed', () => {
  const step = { quorum: 1, approvers: approvers(3) };
  const result = evaluateStep(step, [decision('E1', 'reject'), decision('E2', 'reject'), decision('E3', 'reject')]);
  assert.equal(result, 'failed');
});

// แถวที่ 3: 2 จาก 3
test('2 จาก 3: 2 คนอนุมัติ -> passed', () => {
  const step = { quorum: 2, approvers: approvers(3) };
  const result = evaluateStep(step, [decision('E1', 'approve'), decision('E2', 'approve')]);
  assert.equal(result, 'passed');
});
test('2 จาก 3: อนุมัติแค่ 1 คน -> waiting', () => {
  const step = { quorum: 2, approvers: approvers(3) };
  assert.equal(evaluateStep(step, [decision('E1', 'approve')]), 'waiting');
});
test('2 จาก 3: 2 คนไม่อนุมัติ -> failed', () => {
  const step = { quorum: 2, approvers: approvers(3) };
  const result = evaluateStep(step, [decision('E1', 'reject'), decision('E2', 'reject')]);
  assert.equal(result, 'failed');
});

// แถวที่ 4: 3 จาก 3
test('3 จาก 3: ครบ 3 คนอนุมัติ -> passed', () => {
  const step = { quorum: 3, approvers: approvers(3) };
  const result = evaluateStep(step, [decision('E1', 'approve'), decision('E2', 'approve'), decision('E3', 'approve')]);
  assert.equal(result, 'passed');
});
test('3 จาก 3: คนแรกไม่อนุมัติ -> failed ทันที', () => {
  const step = { quorum: 3, approvers: approvers(3) };
  assert.equal(evaluateStep(step, [decision('E1', 'reject')]), 'failed');
});

// กรณีดึงกลับ (recalledAt)
test('recalledAt: การอนุมัติที่ถูกดึงกลับ ไม่นับ', () => {
  const step = { quorum: 1, approvers: approvers(1) };
  const result = evaluateStep(step, [decision('E1', 'approve', { recalledAt: new Date() })]);
  assert.equal(result, 'waiting');
});
test('recalledAt: ดึงกลับแล้วกดใหม่ นับแค่ครั้งล่าสุดที่ยังไม่ถูกดึง', () => {
  const step = { quorum: 1, approvers: approvers(1) };
  const result = evaluateStep(step, [
    decision('E1', 'reject', { recalledAt: new Date() }),
    decision('E1', 'approve'),
  ]);
  assert.equal(result, 'passed');
});