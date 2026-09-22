import test from 'node:test';
import assert from 'node:assert/strict';

const { connectDb, getDb, closeDb } = await import('../src/db/connection.js');
const { nextDocNumber } = await import('../src/domain/docNumber.js');

test('nextDocNumber: ยิง 20 คำขอพร้อมกัน ต้องได้เลข 0001-0020 ไม่ซ้ำไม่ข้าม', async () => {
  await connectDb();

  // เคลียร์ตัวนับทดสอบทิ้งก่อน เผื่อรันเทสนี้ซ้ำหลายรอบ
  await getDb().collection('counters').deleteOne({ _id: 'TEST-2569' });

  const now = new Date('2026-01-15'); // ปีนี้ + 543 = 2569 ตรงกับ _id ด้านบน

  // Promise.all ยิงคำขอทั้ง 20 อันออกไป "พร้อมกัน" จริงๆ (ไม่ใช่ทีละอัน)
  // ถ้า nextDocNumber มีช่องโหว่แบบ race condition จะเห็นผลตรงนี้แหละ
  const promises = [];
  for (let i = 0; i < 20; i++) {
    promises.push(nextDocNumber('TEST', { now }));
  }
  const results = await Promise.all(promises);

  const numbers = results
    .map((docNumber) => Number(docNumber.split('-')[2]))
    .sort((a, b) => a - b);

  const expected = Array.from({ length: 20 }, (_, i) => i + 1);
  assert.deepEqual(numbers, expected, 'ต้องได้เลข 1 ถึง 20 ครบ ไม่ซ้ำ ไม่ขาด');

  // เก็บกวาดหลังเทส ไม่ทิ้งขยะไว้ใน collection จริง
  await getDb().collection('counters').deleteOne({ _id: 'TEST-2569' });
  await closeDb();
});
