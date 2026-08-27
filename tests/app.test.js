import request from 'supertest';
import app from '../src/app.js';

describe('Acquisitions API', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api', () => {
    it('should return API status', async () => {
      const response = await request(app).get('/api').expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Acquisitions API is running'
      );
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for non-existent route', async () => {
      const response = await request(app).get('/nonexistent').expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body).toHaveProperty(
        'message',
        'The requested resource was not found on this server.'
      );
    });
  });
});
