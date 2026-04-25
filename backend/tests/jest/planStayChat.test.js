'use strict';

/**
 * planStayChat — delegates to chatStayService.planStay (no Anthropic in controller).
 */

jest.mock('../../services/chatStayService', () => ({
  planStay: jest.fn(),
}));

const { planStay } = require('../../services/chatStayService');
const { planStayChat } = require('../../controllers/chatController');
const { assertValidPlanStayPayload } = require('../../services/planStayAiResponseSpec');

function mockRes() {
  return {
    _status: 200,
    _jsonBody: null,
    status(code) {
      this._status = code;
      return this;
    },
    json(obj) {
      this._jsonBody = obj;
      return this;
    },
  };
}

function mockReq(overrides = {}) {
  return {
    body: { message: '2 osobe', ...overrides.body },
    user: overrides.user,
    app: { locals: { db: overrides.db || {} } },
    ...overrides,
  };
}

describe('planStayChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns needs_input from planStay and passes contract', async () => {
    planStay.mockResolvedValue({
      status: 'needs_input',
      criteria: { adults: null, check_in: null, stay_length_days: null },
      missing: { guest_breakdown: true, check_in: true, stay_length_days: true },
      follow_up_question: 'Molimo broj osoba, datum dolaska i dužinu boravka.'
    });

    const req = mockReq();
    const res = mockRes();
    await planStayChat(req, res);

    expect(planStay).toHaveBeenCalledWith(req.app.locals.db, req.body);
    expect(res._status).toBe(200);
    assertValidPlanStayPayload(res._jsonBody);
    expect(res._jsonBody.follow_up_question).toContain('Molimo');
  });

  it('returns suggestions_ready from planStay', async () => {
    planStay.mockResolvedValue({
      status: 'suggestions_ready',
      criteria: { adults: 2, check_in: '2026-06-01', stay_length_days: 2, check_out: '2026-06-03' },
      suggestions: [],
      alternatives: [],
      next_actions: []
    });

    const req = mockReq({ body: { message: 'x', context: {} } });
    const res = mockRes();
    await planStayChat(req, res);

    expect(res._status).toBe(200);
    assertValidPlanStayPayload(res._jsonBody);
    expect(res._jsonBody.status).toBe('suggestions_ready');
  });
});
