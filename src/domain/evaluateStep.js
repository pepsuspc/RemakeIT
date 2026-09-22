export function evaluateStep(step, decisions) {
  const active = decisions.filter((d) => !d.recalledAt);
  const approvals = active.filter((d) => d.action === 'approve').length;
  const rejections = active.filter((d) => d.action === 'reject').length;

  const N = step.quorum;
  const M = step.approvers.length;

  if (approvals >= N) return 'passed';
  if (rejections > M - N) return 'failed';
  return 'waiting';
}
