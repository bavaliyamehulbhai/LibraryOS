const checkPermission = require('../../src/middleware/permissionMiddleware');
const User = require('../../src/models/User');

jest.mock('../../src/models/User');
jest.mock('../../src/services/auditService', () => ({
  createSecurityLog: jest.fn()
}));

describe('RBAC Security Tests', () => {
  it('should allow access if user has required permission', async () => {
    const middleware = checkPermission('BOOK_CREATE');
    
    User.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: 'user123',
        roleId: {
          permissions: [{ name: 'BOOK_CREATE' }, { name: 'BOOK_READ' }]
        }
      })
    });

    const req = {
      user: { id: 'user123' },
      ip: '127.0.0.1',
      originalUrl: '/api/books'
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should block access if user lacks required permission', async () => {
    const middleware = checkPermission('SETTINGS_UPDATE');
    
    User.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: 'user123',
        roleId: {
          permissions: [{ name: 'BOOK_CREATE' }, { name: 'BOOK_READ' }]
        }
      })
    });

    const req = {
      user: { id: 'user123' },
      ip: '127.0.0.1',
      originalUrl: '/api/settings'
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Forbidden. You don't have the required permissions."
    });
    expect(next).not.toHaveBeenCalled();
  });
});
