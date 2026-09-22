import cookieSession from 'cookie-session';
import { env } from '../config/env.js';

const SESSION_MAX_AGE_MS = 9 * 60 * 60 * 1000; // 9 ชั่วโมง

export function sessionMiddleware() {
  return cookieSession({
    name: 'its_forms_session',
    keys: [env.sessionSecret],
    maxAge: SESSION_MAX_AGE_MS,
    httpOnly: true,
  });
}

export function startSession(req, empId) {
  req.session.emp_id = empId;
}

export function requireAuth(req, res, next) {
  if (!req.session?.emp_id) {
    return res.redirect('/auth/login');
  }
  next();
}
