import { getDb } from '../db/connection.js';

function collection() {
  return getDb().collection('submissions');
}

export async function createDraft(submitter) {
  const now = new Date();
  const doc = {
    status: 'draft',
    docNumber: null,
    submitter: { emp_id: submitter.emp_id, name: submitter.name },
    values: {},
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection().insertOne(doc);
  return result.insertedId;
}

export function findDraftById(id, empId) {
  return collection().findOne({ _id: id, status: 'draft', 'submitter.emp_id': empId });
}

export async function saveDraftValues(id, empId, values) {
  const result = await collection().updateOne(
    { _id: id, status: 'draft', 'submitter.emp_id': empId },
    { $set: { values, updatedAt: new Date() } },
  );
  return result.matchedCount > 0;
}

export function listMyDrafts(empId) {
  return collection()
    .find({ status: 'draft', 'submitter.emp_id': empId })
    .sort({ updatedAt: -1 })
    .toArray();
}