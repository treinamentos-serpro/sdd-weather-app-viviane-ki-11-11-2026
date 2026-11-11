import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

/** Erro tipado da camada de dados, com mensagem amigável ao usuário. */
export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

/** Faz um fetch com timeout via AbortController. */
async function fetchWithTimeout<T>(url: string, failureMessage: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new WeatherServiceError(failureMessage);
    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof WeatherServiceError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new WeatherServiceError('A requisição demorou demais. Tente novamente.');
    }
    if (err instanceof SyntaxError) throw new WeatherServiceError(failureMessage);
    throw new WeatherServiceError('Falha de rede. Verifique sua conexão.');
  } finally {
    clearTimeout(timeout);
  }
}

interface GeocodingResult {
  id: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

/**
 * Busca cidades por nome (geocoding). Retorna lista vazia quando não há
 * resultados — o estado "vazio" é tratado pela camada de UI.
 */
export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();
  if (!query) return [];

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`;
  const data = await fetchWithTimeout<{ results?: GeocodingResult[] }>(
    url,
    'Não foi possível buscar a cidade. Tente novamente.',
  );
  if (!data.results) return [];

  return data.results.map((r) => ({
    id: r.id,
    name: r.name,
    country: r.country ?? '',
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

interface ForecastResponse {
  current?: {
    time?: string | null;
    temperature_2m?: number | null;
    relative_humidity_2m?: number | null;
    wind_speed_10m?: number | null;
    surface_pressure?: number | null;
    precipitation?: number | null;
    weather_code?: number | null;
  };
  daily?: {
    time?: string[];
    weather_code?: (number | null)[];
    temperature_2m_max?: (number | null)[];
    temperature_2m_min?: (number | null)[];
    precipitation_probability_max?: (number | null)[];
  };
}

function availableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function mapCurrent(c: NonNullable<ForecastResponse['current']>): CurrentWeather {
  return {
    time: typeof c.time === 'string' ? c.time : null,
    temperature: availableNumber(c.temperature_2m),
    humidity: availableNumber(c.relative_humidity_2m),
    windSpeed: availableNumber(c.wind_speed_10m),
    pressure: availableNumber(c.surface_pressure),
    precipitation: availableNumber(c.precipitation),
    weatherCode: availableNumber(c.weather_code),
  };
}

function mapForecast(d: NonNullable<ForecastResponse['daily']>): ForecastDay[] {
  return (d.time ?? []).map((date, i) => ({
    date,
    weatherCode: availableNumber(d.weather_code?.[i]),
    max: availableNumber(d.temperature_2m_max?.[i]),
    min: availableNumber(d.temperature_2m_min?.[i]),
    precipitationProbability: availableNumber(d.precipitation_probability_max?.[i]),
  }));
}

/**
 * Busca o clima atual e a previsão de 5 dias para uma cidade.
 * Temperaturas retornam em Celsius (conversão fica na UI).
 */
export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: '5',
    timezone: 'auto',
  });

  const data = await fetchWithTimeout<ForecastResponse>(
    `${FORECAST_URL}?${params.toString()}`,
    'Não foi possível carregar o clima. Tente novamente.',
  );
  if (!data?.current || !data.daily) {
    throw new WeatherServiceError('Resposta de clima incompleta. Tente novamente.');
  }

  const current = mapCurrent(data.current);
  const forecast = mapForecast(data.daily);
  const hasCurrent = Object.values(current).some((value) => typeof value === 'number');
  const hasForecast = forecast.some((day) =>
    [day.weatherCode, day.max, day.min, day.precipitationProbability].some((value) => value !== null),
  );
  if (!hasCurrent && !hasForecast) {
    throw new WeatherServiceError('Resposta de clima incompleta. Tente novamente.');
  }

  return {
    city,
    current,
    forecast,
  };
}
