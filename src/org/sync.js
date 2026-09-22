import { allEmployees } from './client.js';
import { upsertUserFromOrg } from '../models/users.js';

export async function syncUsers() {
  const employees = await allEmployees();
  let count = 0;
  for (const emp of employees) {
    if (!emp.emp_id) continue;
    await upsertUserFromOrg(emp);
    count++;
  }
  return count;
}
