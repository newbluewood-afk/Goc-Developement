'use strict';

/**
 * Contract checks for `planStayChat` JSON responses (booking assistant).
 * `planStayChat` delegates to `chatStayService.planStay` — no Anthropic in controller.
 */

const PLAN_STAY_STATUSES = ['needs_input', 'suggestions_ready', 'alternatives_only'];

/**
 * @param {unknown} body
 * @param {string} [path]
 * @throws {Error}
 */
function assertValidPlanStayPayload(body, path = 'response') {
  if (!body || typeof body !== 'object') {
    throw new Error(`${path}: expected object`);
  }
  if (!PLAN_STAY_STATUSES.includes(body.status)) {
    throw new Error(
      `${path}.status: expected one of ${PLAN_STAY_STATUSES.join(', ')}, got ${JSON.stringify(body.status)}`
    );
  }
  if (!body.criteria || typeof body.criteria !== 'object') {
    throw new Error(`${path}: missing criteria object`);
  }
  if (body.status === 'needs_input') {
    if (typeof body.follow_up_question !== 'string' || !body.follow_up_question.trim()) {
      throw new Error(`${path}: needs_input requires follow_up_question`);
    }
    if (!body.missing || typeof body.missing !== 'object') {
      throw new Error(`${path}: needs_input requires missing`);
    }
  }
  if (body.status === 'suggestions_ready' || body.status === 'alternatives_only') {
    if (!Array.isArray(body.suggestions)) {
      throw new Error(`${path}: requires suggestions array`);
    }
  }
}

module.exports = {
  assertValidPlanStayPayload,
  PLAN_STAY_STATUSES,
};
