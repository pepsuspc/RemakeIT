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

export function listMySubmissions(empId) {
  return collection()
    .find({ 'submitter.emp_id' : empId })
    .sort({ updatedAt: -1 })
    .toArray();
}

export async function submitDraft(id, empId, { values, docNumber, submittedAt }) {
  const result = await collection().updateOne(
    { _id: id, status: 'draft', 'submitter.emp_id': empId },
    {
      $set: {
        status: 'pending',
        docNumber,
        values,
        submittedAt,
        autoValues: { submittedAt: submittedAt.toISOString() },
        rounds: [],
        updatedAt: submittedAt,
      },
    },
  );
  return result.matchedCount > 0;
}

export function findSubmissionById(id, empId) {
  return collection().findOne({ _id: id, 'submitter.emp_id': empId });
}