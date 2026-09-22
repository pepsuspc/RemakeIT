import { getDb } from '../db/connection.js';

// แปลง ค.ศ. -> พ.ศ. (บวก 543) — ใช้ getFullYear() ของเครื่องเซิร์ฟเวอร์ไปก่อน
// (ยังไม่ล็อก timezone เป็น Asia/Bangkok) เดี๋ยวจะกลับมาทำให้แม่นยำขึ้นตอนที่
// สร้างฟังก์ชันจัดการวันที่แบบเต็มรูปแบบในงานถัดๆ ไป
export function buddhistYear(date = new Date()) {
  return date.getFullYear() + 543;
}

// ออกเลขที่เอกสารแบบ atomic เช่น "MEMO-2569-0001"
// ต้องใช้ findOneAndUpdate + $inc เท่านั้น ห้าม findOne() แล้วค่อย +1 เอง
// เพราะถ้ามีคนกดส่งพร้อมกันสองคน จะมีช่วงเวลาที่ทั้งคู่อ่านเจอเลขเดิม
// แล้วคำนวณเลขใหม่ซ้ำกัน — findOneAndUpdate เป็นคำสั่งเดียวที่ MongoDB
// รับประกันว่าจะไม่มีคำขออื่นมาแทรกกลางได้
export async function nextDocNumber(prefix, { now = new Date() } = {}) {
  const year = buddhistYear(now);
  const counterId = `${prefix}-${year}`;

  const result = await getDb().collection('counters').findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' },
  );

  const seq = String(result.seq).padStart(4, '0');
  return `${counterId}-${seq}`;
}
