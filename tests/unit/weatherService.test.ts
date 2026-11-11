import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchCities, getWeather, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const CITY: City = {
  id: 1,
  name: 'Seattle',
  country: 'Estados Unidos',
  admin1: 'Washington',
  latitude: 47.6,
  longitude: -122.33,
};

function mockFetchOnce(body: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    json: async () => body,
  } as Response);
}

describe('weatherService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('searchCities', () => {
    it('retorna lista vazia para input vazio sem chamar a rede', async () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
      const result = await searchCities('   ');
      expect(result).toEqual([]);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('mapeia resultados de geocoding', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce({
          results: [
            {
              id: 1,
              name: 'Seattle',
              country: 'Estados Unidos',
              admin1: 'Washington',
              latitude: 47.6,
              longitude: -122.33,
            },
          ],
        }),
      );
      const result = await searchCities('Seattle');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Seattle');
      const url = new URL(vi.mocked(fetch).mock.calls[0][0] as string);
      expect(url.origin + url.pathname).toBe('https://geocoding-api.open-meteo.com/v1/search');
      expect(Object.fromEntries(url.searchParams)).toEqual({
        name: 'Seattle',
        count: '5',
        language: 'pt',
        format: 'json',
      });
    });

    it('retorna vazio quando não há results', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({}));
      expect(await searchCities('xyzxyz')).toEqual([]);
    });

    it('lança erro tipado em resposta não-ok', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({}, false));
      await expect(searchCities('Seattle')).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it('trata falhas de rede e timeout com mensagens apropriadas', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new TypeError('network'))
        .mockRejectedValueOnce(new DOMException('aborted', 'AbortError')));
      await expect(searchCities('Seattle')).rejects.toThrow('Falha de rede. Verifique sua conexão.');
      await expect(searchCities('Seattle')).rejects.toThrow('A requisição demorou demais. Tente novamente.');
    });

    it('interrompe a leitura do corpo quando o prazo expira', async () => {
      vi.useFakeTimers();
      try {
        vi.stubGlobal('fetch', vi.fn((_url: string, options: RequestInit) => Promise.resolve({
          ok: true,
          json: () => new Promise((_resolve, reject) => {
            options.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
          }),
        })));
        const assertion = expect(searchCities('Seattle')).rejects.toThrow('A requisição demorou demais. Tente novamente.');
        await vi.advanceTimersByTimeAsync(10_000);
        await assertion;
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('getWeather', () => {
    it('mapeia current e daily para WeatherData', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce({
          current: {
            time: '2026-06-16T12:00',
            temperature_2m: 18,
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
            precipitation_probability_max: [20, 90, 70, 10, null],
          },
        }),
      );

      const data = await getWeather(CITY);
      expect(data.current.temperature).toBe(18);
      expect(data.forecast).toHaveLength(5);
      const url = new URL(vi.mocked(fetch).mock.calls[0][0] as string);
      expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
      expect(Object.fromEntries(url.searchParams)).toEqual({
        latitude: '47.6',
        longitude: '-122.33',
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
        forecast_days: '5',
        timezone: 'auto',
      });
      expect(data.forecast[4].precipitationProbability).toBeNull();
    });

    it('lança erro quando a resposta está incompleta', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({ current: null, daily: null }));
      await expect(getWeather(CITY)).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it('preserva dias disponíveis e campos ausentes como indisponíveis', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({
        current: { temperature_2m: null },
        daily: { time: ['2026-06-16'], temperature_2m_max: [20] },
      }));
      const data = await getWeather(CITY);
      expect(data.current.temperature).toBeNull();
      expect(data.forecast).toEqual([{ date: '2026-06-16', max: 20, min: null, weatherCode: null, precipitationProbability: null }]);
    });

    it('lança erro tratável quando a previsão responde com falha HTTP', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({}, false));
      await expect(getWeather(CITY)).rejects.toThrow('Não foi possível carregar o clima. Tente novamente.');
    });
  });
});
