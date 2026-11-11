import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/services/weatherService')>()),
  getWeather: vi.fn(),
  searchCities: vi.fn(),
}));

const city: City = { id: 1, name: 'Lisboa', country: 'Portugal', latitude: 38.7, longitude: -9.1 };
const weather: WeatherData = {
  city,
  current: { time: '2026-11-11T12:00', temperature: 18, weatherCode: 0, humidity: 50, windSpeed: 10, pressure: 1015, precipitation: 0 },
  forecast: [],
};

describe('useWeather', () => {
  beforeEach(() => vi.resetAllMocks());

  it('aguarda a seleção antes de consultar o clima', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather).mockResolvedValue(weather);
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search('Lisboa'));
    expect(result.current.status).toBe('selecting');
    expect(result.current.cities).toEqual([city]);
    expect(getWeather).not.toHaveBeenCalled();

    await act(() => result.current.selectCity(city));
    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(weather);
  });

  it('repete a nova busca quando ela falha após uma consulta anterior', async () => {
    vi.mocked(searchCities).mockResolvedValueOnce([city]).mockRejectedValueOnce(new Error()).mockResolvedValueOnce([]);
    vi.mocked(getWeather).mockResolvedValue(weather);
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search('Lisboa'));
    await act(() => result.current.selectCity(city));
    await act(() => result.current.search('Porto'));
    expect(result.current.status).toBe('error');
    await act(() => result.current.retry());
    expect(searchCities).toHaveBeenLastCalledWith('Porto');
    expect(result.current.status).toBe('empty');
    expect(getWeather).toHaveBeenCalledTimes(1);
  });

  it('exibe carregamento e permite repetir uma previsão que falhou', async () => {
    let rejectForecast!: (reason: Error) => void;
    vi.mocked(getWeather)
      .mockImplementationOnce(() => new Promise((_resolve, reject) => { rejectForecast = reject; }))
      .mockResolvedValueOnce(weather);
    const { result } = renderHook(() => useWeather());

    let pending!: Promise<void>;
    act(() => { pending = result.current.selectCity(city); });
    expect(result.current.status).toBe('loading');
    expect(result.current.data).toBeNull();
    await act(async () => { rejectForecast(new Error('rede')); await pending; });
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Algo deu errado. Tente novamente.');

    await act(() => result.current.retry());
    expect(getWeather).toHaveBeenLastCalledWith(city);
    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(weather);
  });

  it('ignora respostas de uma busca anterior que chega depois da mais recente', async () => {
    let resolveOldSearch!: (cities: City[]) => void;
    vi.mocked(searchCities)
      .mockImplementationOnce(() => new Promise((resolve) => { resolveOldSearch = resolve; }))
      .mockResolvedValueOnce([]);
    const { result } = renderHook(() => useWeather());

    let oldSearch!: Promise<void>;
    act(() => { oldSearch = result.current.search('Lisboa'); });
    await act(() => result.current.search('Porto'));
    await act(async () => { resolveOldSearch([city]); await oldSearch; });

    expect(result.current.status).toBe('empty');
    expect(result.current.query).toBe('Porto');
    expect(result.current.cities).toEqual([]);
  });
});