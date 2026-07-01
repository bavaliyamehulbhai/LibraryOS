const tenantMiddleware = require('../../src/middleware/tenantMiddleware');
const Organization = require('../../src/models/Organization');

jest.mock('../../src/models/Organization');

describe('Tenant Isolation Tests', () => {
  it('should ensure libraryId exists on request', async () => {
    Organization.findById.mockResolvedValue({ _id: 'lib123', status: 'ACTIVE' });

    const req = {
      user: { libraryId: 'lib123' },
      body: {},
      query: {}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await tenantMiddleware(req, res, next);

    expect(req.libraryId).toBe('lib123');
    expect(next).toHaveBeenCalled();
  });

  it('should throw error if no libraryId in user', async () => {
    const req = {
      user: {}, // No libraryId
      body: {},
      query: {}
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await tenantMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "No library assigned to this user"
    });
    expect(next).not.toHaveBeenCalled();
  });
});
