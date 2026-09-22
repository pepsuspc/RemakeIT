export function validateMemoValues(values) {
  const errors = {};
  if (!values.subject || !values.subject.trim()) {
    errors.subject = 'กรุณากรอกเรื่อง';
  }
  if (!values.to || !values.to.trim()) {
    errors.to = 'กรุณากรอกเรียน';
  }
  if (!values.details || !values.details.trim()) {
    errors.details = 'กรุณากรอกรายละเอียด';
  }
  return errors;
}