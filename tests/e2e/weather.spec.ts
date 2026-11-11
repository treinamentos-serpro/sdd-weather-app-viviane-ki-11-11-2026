import { test, expect, type Page } from '@playwright/test';

const geocoding = {
  results: [
    {
      id: 1,
      name: 'Seattle',
      country: 'Estados Unidos',
      admin1: 'Washington',
      latitude: 47.6,
      longitude: -122.33,
    },
    {
      id: 2,
      name: 'Seattle',
      country: 'Canadá',
      admin1: 'Ontário',
      latitude: 46,
      longitude: -80,
    },
  ],
};

const forecast = {
  current: {
    time: '2026-06-16T12:00',
    temperature_2m: 0,
    relative_humidity_2m: 80,
    wind_speed_10m: 10,
    surface_pressure: 1015,
    precipitation: 0,
    weather_code: 3,
  },
  daily: {
    time: ['2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19', '2026-06-20'],
    weather_code: [3, 61, 80, 1, 0],
    temperature_2m_max: [20, 19, 22, 24, 25],
    temperature_2m_min: [12, 11, 13, 14, 15],
    precipitation_probability_max: [20, 90, 70, 10, 0],
  },
};

async function mockApis(page: Page) {
  await page.route('**/geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: geocoding }),
  );
  await page.route('**/api.open-meteo.com/**', (route) => route.fulfill({ json: forecast }));
}

test('fluxo completo: buscar → clima atual → previsão → trocar unidade', async ({ page }) => {
  await mockApis(page);
  const forecastRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().startsWith('https://api.open-meteo.com/')) forecastRequests.push(request.url());
  });
  await page.goto('/');

  await page.getByLabel(/buscar cidade/i).fill('Seattle');
  await page.getByRole('button', { name: /buscar/i }).click();
  await expect(page.getByRole('button', { name: 'Seattle, Washington, Estados Unidos' })).toBeVisible();
  await page.getByRole('button', { name: 'Seattle, Ontário, Canadá' }).click();

  await expect(page.getByRole('heading', { name: 'Seattle' })).toBeVisible();
  await expect(page.getByText('Ontário, Canadá')).toBeVisible();
  const days = page.getByRole('region', { name: /previsão de 5 dias/i }).getByRole('listitem');
  await expect(days).toHaveCount(5);
  for (const [index, temperatures] of ['20° 12°', '19° 11°', '22° 13°', '24° 14°', '25° 15°'].entries()) {
    await expect(days.nth(index)).toContainText(temperatures);
  }
  expect(new URL(forecastRequests[0]).searchParams.get('latitude')).toBe('46');
  expect(new URL(forecastRequests[0]).searchParams.get('longitude')).toBe('-80');

  // 0°C exibido; após trocar para °F deve virar 32°.
  await expect(page.getByText('0°').first()).toBeVisible();
  await page.getByRole('button', { name: '°F' }).click();
  await expect(page.getByText('32°').first()).toBeVisible();
  for (const [index, temperatures] of ['68° 54°', '66° 52°', '72° 55°', '75° 57°', '77° 59°'].entries()) {
    await expect(days.nth(index)).toContainText(temperatures);
  }
  expect(forecastRequests).toHaveLength(1);
});

test('estado vazio quando a cidade não existe', async ({ page }) => {
  await page.route('**/geocoding-api.open-meteo.com/**', (route) => route.fulfill({ json: {} }));
  await page.goto('/');

  await page.getByLabel(/buscar cidade/i).fill('xyzxyz');
  await page.getByRole('button', { name: /buscar/i }).click();

  await expect(page.getByText(/nenhuma cidade encontrada/i)).toBeVisible();
});

test('erro na previsão oferece retry e recupera a consulta', async ({ page }) => {
  let requests = 0;
  await page.route('**/geocoding-api.open-meteo.com/**', (route) => route.fulfill({ json: geocoding }));
  await page.route('**/api.open-meteo.com/**', (route) => {
    requests += 1;
    return requests === 1 ? route.fulfill({ status: 503 }) : route.fulfill({ json: forecast });
  });
  await page.goto('/');

  await page.getByLabel(/buscar cidade/i).fill('Seattle');
  await page.getByRole('button', { name: /buscar/i }).click();
  await page.getByRole('button', { name: 'Seattle, Washington, Estados Unidos' }).click();
  await expect(page.getByRole('alert')).toContainText(/não foi possível carregar o clima/i);
  await page.getByRole('button', { name: /tentar novamente/i }).click();
  await expect(page.getByRole('heading', { name: 'Seattle' })).toBeVisible();
  expect(requests).toBe(2);
});

for (const viewport of [
  { name: 'celular', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]) {
  test(`fluxo utilizável sem rolagem horizontal: ${viewport.name}`, async ({ page }) => {
    await mockApis(page);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');

    await page.getByLabel(/buscar cidade/i).fill('Seattle');
    await page.getByRole('button', { name: /buscar/i }).click();
    await page.getByRole('button', { name: 'Seattle, Washington, Estados Unidos' }).click();
    await expect(page.getByRole('heading', { name: 'Seattle' })).toBeVisible();
    await expect(page.getByRole('region', { name: /previsão de 5 dias/i }).getByRole('listitem')).toHaveCount(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
