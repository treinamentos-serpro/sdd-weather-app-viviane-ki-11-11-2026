import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import App from '../../src/App';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/services/weatherService')>()),
  getWeather: vi.fn(),
  searchCities: vi.fn(),
}));

const city: City = { id: 1, name: 'Lisboa', admin1: 'Lisboa', country: 'Portugal', latitude: 38.7, longitude: -9.1 };
const weather: WeatherData = {
  city,
  current: { time: '2026-11-11T12:00', temperature: 0, weatherCode: 0, humidity: 50, windSpeed: 10, pressure: 1015, precipitation: 0 },
  forecast: Array.from({ length: 5 }, (_, index) => ({
    date: `2026-11-${11 + index}`,
    weatherCode: 0,
    max: 20,
    min: 10,
    precipitationProbability: 20,
  })),
};

describe('App', () => {
  beforeEach(() => vi.resetAllMocks());

  it('renderiza a marca e o estado inicial vazio', () => {
    render(<App />);
    expect(screen.getByText('WeatherView')).toBeInTheDocument();
    expect(screen.getByText(/busque uma cidade para começar/i)).toBeInTheDocument();
  });

  it('mostra a barra de busca e o alternador de unidade', () => {
    render(<App />);
    expect(screen.getByLabelText(/buscar cidade/i)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /unidade de temperatura/i })).toBeInTheDocument();
  });

  it('busca por teclado, seleciona cidade e converte clima e previsão sem nova consulta', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather).mockResolvedValue(weather);
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/buscar cidade/i), 'Lisboa{Enter}');
    const cityButton = await screen.findByRole('button', { name: 'Lisboa, Lisboa, Portugal' });
    expect(screen.getByLabelText(/buscar cidade/i)).toHaveFocus();
    await user.click(cityButton);
    expect(await screen.findByRole('heading', { name: 'Lisboa' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveFocus();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    for (const day of screen.getAllByRole('listitem')) {
      expect(within(day).getByText('Céu limpo')).toHaveClass('sr-only');
    }
    expect(screen.getByText('0°')).toBeInTheDocument();
    expect(screen.getAllByText('20°')).toHaveLength(5);
    expect(screen.getAllByText('10°')).toHaveLength(5);

    await user.click(screen.getByRole('button', { name: '°F' }));
    expect(screen.getByText('32°')).toBeInTheDocument();
    expect(screen.getAllByText('68°')).toHaveLength(5);
    expect(screen.getAllByText('50°')).toHaveLength(5);
    expect(getWeather).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledWith(city);
  });

  it('mostra erro amigável e recupera a previsão ao tentar novamente', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather).mockRejectedValueOnce(new Error('rede')).mockResolvedValueOnce(weather);
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/buscar cidade/i), 'Lisboa{Enter}');
    await user.click(await screen.findByRole('button', { name: 'Lisboa, Lisboa, Portugal' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Algo deu errado. Tente novamente.');
    await user.click(screen.getByRole('button', { name: /tentar novamente/i }));
    expect(await screen.findByRole('heading', { name: 'Lisboa' })).toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledTimes(2);
  });

  it('informa que não há resultados e não consulta previsão', async () => {
    vi.mocked(searchCities).mockResolvedValue([]);
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/buscar cidade/i), 'cidade inexistente{Enter}');
    expect(await screen.findByText(/nenhuma cidade encontrada para "cidade inexistente"/i)).toBeInTheDocument();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('sinaliza dados indisponíveis e previsão parcial', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather).mockResolvedValue({
      ...weather,
      current: { ...weather.current, temperature: null, humidity: null },
      forecast: [{ ...weather.forecast[0], min: null, precipitationProbability: null }],
    });
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/buscar cidade/i), 'Lisboa{Enter}');
    await user.click(await screen.findByRole('button', { name: 'Lisboa, Lisboa, Portugal' }));
    expect(await screen.findByText(/previsão parcial/i)).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Atualizado em 2026-11-11 12:00')).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveTextContent('—');
  });

  it('não retira o foco da busca quando o usuário digita durante o carregamento', async () => {
    let resolveSearch!: (cities: City[]) => void;
    vi.mocked(searchCities).mockImplementation(() => new Promise((resolve) => { resolveSearch = resolve; }));
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/buscar cidade/i);
    await user.type(input, 'Lisboa{Enter}');
    await user.type(input, ' Portugal');
    await act(async () => { resolveSearch([city]); });

    expect(input).toHaveFocus();
    expect(input).toHaveValue('Lisboa Portugal');
    expect(screen.getByRole('button', { name: 'Lisboa, Lisboa, Portugal' })).toBeInTheDocument();
  });
});
