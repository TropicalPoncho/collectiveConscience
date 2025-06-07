const request = require('supertest');
const express = require('express');

const mockGetByOrder = jest.fn();

jest.mock('../services/neuronsService', () => {
  return jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    getAll: jest.fn(),
    getByOrder: mockGetByOrder
  }));
});

const NeuronsService = require('../services/neuronsService');
const neuronsRouter = require('../routes/neurons');

describe('GET /neurons/:order', () => {
  beforeEach(() => {
    mockGetByOrder.mockReset();
  });

  it('calls getByOrder and returns ordered results', async () => {
    const mockResult = [{ order: 1, comentario: 'A' }, { order: 1, comentario: 'B' }];
    mockGetByOrder.mockResolvedValue(mockResult);

    const app = express();
    app.use(express.json());
    app.use('/neurons', neuronsRouter);

    const res = await request(app).get('/neurons/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResult);
    expect(mockGetByOrder).toHaveBeenCalledWith('1', undefined);
  });
});
