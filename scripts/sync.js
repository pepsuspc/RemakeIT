const { connectDb, closeDb } = await import('../src/db/connection.js');
const { syncUsers } = await import('../src/org/sync.js');

await connectDb();
const count = await syncUsers();
console.log(`sync เสร็จแล้ว: ${count} คน`);
await closeDb();
