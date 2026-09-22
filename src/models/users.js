import { getDb } from '../db/connection.js';

function collection() {
  return getDb().collection('users');
}

export async function upsertUserFromOrg(emp) {
  await collection().updateOne(
    { emp_id: emp.emp_id },
    {
      $set: {
        emp_id: emp.emp_id,
        name: emp.name,
        department: emp.department ?? null,
        is_active: emp.is_active,
      },
      $setOnInsert: {
        roles: [],
      },
    },
    { upsert: true },
  );
}

export function findUserByEmpId(empId) {
  return collection().findOne({ emp_id: empId });
}
