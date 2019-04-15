var md5Hash = require('../utils').md5Hash;
jest.mock('crypto');
var crypto = require('crypto');

describe('md5Hash', () => {
  it('creates a hash from a string', () => {
    const updateMock = jest.fn();
    const digestMock = jest.fn().mockReturnValue('do doo do do do');
    crypto.createHash = jest.fn().mockReturnValue({
      update: updateMock,
      digest: digestMock
    });
    var hashed = md5Hash('mahna mahna');
    expect(crypto.createHash).toHaveBeenCalledWith('md5');
    expect(updateMock).toHaveBeenCalledWith('mahna mahna');
    expect(digestMock).toHaveBeenCalledWith('hex');
    expect(hashed).toBe('do doo do do do');
  });
});
