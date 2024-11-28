import { Trend, Rate } from 'k6/metrics';
import http from 'k6/http';
import { check } from 'k6';

export const getCrocodilesDuration = new Trend('get_crocodiles_duration', true);

export const successRate = new Rate('success_rate');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.12'],
    http_req_duration: ['p(95)<5700'],
    success_rate: ['rate>0.88'],
    get_contacts_duration: ['avg<5700']
  },
  stages: [
    { duration: '10s', target: 10 },
    { duration: '40s', target: 37 },
    { duration: '40s', target: 37 },
    { duration: '40s', target: 75 },
    { duration: '40s', target: 75 },
    { duration: '40s', target: 150 },
    { duration: '40s', target: 150 },
    { duration: '50s', target: 300 }
  ]
};

export default function () {
  const baseUrl = 'https://test-api.k6.io/public/crocodiles/';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const res = http.get(`${baseUrl}`, params);

  getCrocodilesDuration.add(res.timings.duration);

  successRate.add(res.status === 200);

  check(res, {
    'GET Crocodile - Status 200': r => r.status === 200,
    'Payload não está vazio': r => JSON.parse(r.body).length > 0
  });

  const invalidRes = http.get(`${baseUrl}/invalid`);
  check(invalidRes, {
    'Erro esperado - Status 404': () => invalidRes.status === 404
  });
}
