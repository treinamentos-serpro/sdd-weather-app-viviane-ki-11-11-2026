# Plano Técnico — Weather App

## 1. Architecture (Overview)

A aplicação será uma SPA responsiva. A interface React coordena a busca e a
visualização; um hook mantém o estado da consulta; e o service concentra a
comunicação HTTP, a validação mínima das respostas e o mapeamento do formato da
Open-Meteo para os tipos internos. Os componentes de apresentação não acessam
a API diretamente.

```text
SearchBar ── busca/seleção ──> useWeather ──> weatherService
                                  │                 ├── Geocoding API
                                  │                 └── Forecast API
                                  └── estado ──> CurrentWeather / ForecastList
                                               └── LoadingState / ErrorState / EmptyState
UnitToggle ── preferência C/F ──> apresentação (sem nova consulta)
```

Essa separação atende à busca e consulta de clima (FR-001 a FR-003), à troca de
unidade sem nova pesquisa (FR-004) e ao tratamento previsível de estados e falhas
(AC-001 a AC-006).

## 2. Tech Stack

| Tecnologia | Uso e justificativa |
|---|---|
| TypeScript strict | Contratos explícitos para domínio e respostas externas. |
| React 19 | Componentes e composição da interface. |
| Vite | Servidor de desenvolvimento e build da SPA. |
| Tailwind CSS | Estilização responsiva conforme a stack definida pelo projeto. |
| Open-Meteo | Geocoding e previsão sem chave de API para a primeira versão. |
| Vitest + Testing Library | Testes unitários e de componentes em ambiente DOM. |
| Playwright | Testes E2E dos fluxos principais em navegador. |
| Biome | Lint e formatação consistentes. |
| pnpm | Gerenciamento de dependências definido pelo repositório. |

## 3. Project Structure

```text
src/
  App.tsx                    composição da tela e dos estados principais
  components/                busca, clima atual, previsão e unidade
    states/                  estados de carregamento, erro e vazio
  hooks/                     estado e orquestração do fluxo meteorológico
  lib/                       formatação, conversão e interpretação de códigos
  services/                  integração HTTP e mapeamento da Open-Meteo
  styles/                    estilos globais e configuração visual
  types/                     contratos compartilhados do domínio
tests/
  unit/                      testes de funções, services e componentes
  e2e/                       cenários completos no navegador
```

Responsabilidades seguem a regra de não acoplar componentes à API: `services/`
traduz dados externos; `hooks/` controla o fluxo e o estado de tela; `lib/`
mantém funções puras reutilizáveis; e `components/` apresenta dados e estados.

## 4. Data Model

As temperaturas serão mantidas em Celsius no domínio e convertidas apenas para
exibição. Isso mantém a unidade uniforme e permite alternar C/F sem novo request
(FR-004, AC-004).

```ts
type Unit = 'celsius' | 'fahrenheit';

interface City {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface CurrentWeather {
  temperature: number; // Celsius
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  precipitation: number;
  time: string;
}

interface ForecastDay {
  date: string; // data local da cidade, formato ISO
  min: number; // Celsius
  max: number; // Celsius
  weatherCode: number;
  precipitationProbability: number;
}

interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: ForecastDay[];
}
```

Os campos `admin1` e `country` ajudam a distinguir cidades homônimas. Campos
ausentes ou inválidos da resposta externa não devem ser apresentados como dados
confiáveis; informações opcionais devem ser omitidas ou sinalizadas como
indisponíveis (FR-001, FR-002, AC-002 e AC-003).

## 5. Data Flow

1. O usuário informa o nome da cidade em `SearchBar`; entradas vazias não geram
   consulta (AC-001, EC-001).
2. O hook solicita ao service a busca geográfica. O service normaliza o texto,
   codifica os parâmetros e converte os resultados para `City`.
3. A interface apresenta resultados com cidade, região e país quando fornecidos.
   A seleção de um resultado, e não apenas do texto digitado, define as
   coordenadas da consulta (FR-001, EC-003 e EC-004).
4. O hook solicita o clima para a cidade selecionada. O service consulta a API
   de previsão e mapeia resposta atual e dados diários para `WeatherData`.
5. Os componentes renderizam clima atual e dias disponíveis, formatando datas
   no fuso horário retornado para a localidade (FR-002 e FR-003).
6. A unidade escolhida é aplicada na camada de apresentação às temperaturas
   atuais e previstas. Alterá-la preserva a cidade e os dados carregados
   (FR-004, AC-004 e EC-010).

## 6. External APIs

As chamadas são feitas por HTTPS diretamente do cliente e sem credencial
privada, usando os endpoints públicos da Open-Meteo.

### Geocoding

- Endpoint: `https://geocoding-api.open-meteo.com/v1/search`
- Parâmetros: `name` (texto codificado), `count` (limite de resultados),
  `language=pt` e `format=json`.
- Campos consumidos: `id`, `name`, `country`, `admin1`, `latitude` e
  `longitude`.
- Resultado sem cidades é uma lista vazia; falha HTTP/rede é erro de consulta.

### Forecast

- Endpoint: `https://api.open-meteo.com/v1/forecast`
- Parâmetros: `latitude`, `longitude`, variáveis `current` e `daily`,
  `forecast_days=5` e `timezone=auto`.
- Campos atuais: horário, temperatura a 2 m, umidade relativa, velocidade do
  vento, pressão de superfície, precipitação e código meteorológico.
- Campos diários: data local, código meteorológico, temperaturas mínima/máxima
  e probabilidade máxima de precipitação.
- Temperaturas são solicitadas em Celsius. O fuso `auto` é necessário para
  associar cada previsão ao dia local correto (FR-002 e FR-003).

O service deve tratar respostas HTTP não bem-sucedidas, timeout, rede indisponível
e payload sem campos essenciais. A API pode mudar seus limites ou disponibilidade;
essa dependência é um risco operacional (EC-005 a EC-008 e EC-014 a EC-015).

## 7. State Management

O estado fica local à aplicação, sem biblioteca global: o hook de clima é a
fonte de verdade para consulta, cidade selecionada, dados meteorológicos e erro.
O estado de unidade é mantido na interface e compartilhado com os componentes
que exibem temperatura. O estado mínimo da consulta compreende:

- termo e resultados da busca;
- cidade selecionada;
- dados meteorológicos carregados;
- indicador de carregamento e erro da operação;
- unidade `celsius` ou `fahrenheit` (inicial `celsius`).

Uma nova cidade inicia uma nova consulta e substitui os dados associados à
seleção anterior. A troca de unidade não invalida nem busca novamente os dados.
Persistência da unidade entre sessões fica fora do escopo até decisão de produto
(FR-004; premissa 12 da spec).

## 8. Error Handling

Busca e consulta de previsão devem expor estados explícitos de carregamento,
sucesso, erro e vazio, sem deixar a tela em estado ambíguo (AC-001, AC-006).

| Situação | Comportamento |
|---|---|
| Busca vazia | Não chamar a API e solicitar um nome de cidade. |
| Nenhum resultado | Exibir estado vazio e permitir nova busca. |
| HTTP, conexão ou timeout | Exibir mensagem compreensível e ação para tentar novamente. |
| Resposta inválida/incompleta | Não apresentar o payload como completo; informar indisponibilidade dos dados essenciais. |
| Alguns dias sem dados | Exibir somente os dias válidos e sinalizar que a previsão é parcial. |
| Menos de cinco dias | Mostrar os dias disponíveis sem bloquear os demais dados (EC-008). |
| Dados desatualizados | Exibir horário de atualização quando disponível e sinalizar defasagem quando identificável (EC-009). |
| Limite de requisições | Informar indisponibilidade temporária e evitar repetição automática contínua (EC-014). |

O retry é iniciado pelo usuário; não haverá política automática de repetição na
primeira versão. O service deve limitar a duração de cada request e apresentar
mensagens apropriadas para timeout e falha de rede.

## 9. Testing Strategy

Os testes derivam dos critérios AC-001 a AC-006 e dos casos EC-001 a EC-016.

- **Unitários (Vitest):** conversões C/F, formatação, interpretação de códigos,
  mapeamento de respostas e comportamento do service para sucesso, resultados
  vazios, falhas HTTP, timeout e resposta incompleta.
- **Componentes (Vitest + Testing Library):** busca vazia e resultados,
  seleção de cidade, estados de loading/erro/vazio, atualização de temperaturas
  ao alternar unidade e renderização parcial da previsão.
- **E2E (Playwright):** busca e seleção de cidade, consulta do clima atual e dos
  cinco dias, troca de unidade, feedback de erro e uso em viewport móvel.
  Respostas externas devem ser interceptadas para cenários determinísticos;
  testes não devem depender da disponibilidade ao vivo da API.
- **Validação do projeto:** `pnpm lint`, `pnpm build` e `pnpm test`; executar
  também `pnpm test:e2e` para validar os fluxos no navegador.

## 10. Risks & Trade-offs

| Risco ou decisão | Impacto / trade-off | Tratamento |
|---|---|---|
| Dependência direta da Open-Meteo | Indisponibilidade, limite de consultas ou mudanças no serviço afetam a experiência. | Timeout, erros tratados, evitar repetição contínua e monitorar limites; avaliar cache ou provedor alternativo se o uso justificar (RISK-001 e RISK-002). |
| Chamadas do navegador ao provedor | Simplifica a arquitetura e não exige backend para API pública, mas oferece controle limitado sobre cache, cotas e disponibilidade. | Não incluir segredos no cliente; adotar proxy/backend somente se requisitos de segurança, cota ou escala exigirem. |
| Sem cache na primeira versão | Consultas repetidas podem aumentar latência e uso da API. Cache melhora eficiência, mas requer política de expiração e risco de dados desatualizados. | Manter simples inicialmente; reavaliar com métricas e limites do provedor. |
| Celsius como unidade canônica | Conversão de apresentação é simples e consistente; valores exibidos podem ser arredondados. | Preservar precisão internamente e arredondar apenas na formatação. |
| Dados parciais | Campos ausentes podem reduzir o detalhe exibido. | Validar campos essenciais e omitir/sinalizar apenas os dados indisponíveis, sem descartar dias válidos. |
| Persistência de preferência não definida | Unidade volta ao padrão em uma nova sessão. | Usar Celsius inicial; adicionar persistência apenas após decisão de produto. |
| Metas não quantificadas de desempenho, disponibilidade e escala | Não há limite objetivo de aceitação para essas qualidades. | Medir tempos e disponibilidade; definir metas com negócio antes de otimizações ou infraestrutura adicional (NFR-002, NFR-003 e NFR-007). |

As escolhas mantêm a primeira versão simples e alinhada ao escopo Must Have. Cache,
backend intermediário, autenticação e histórico permanecem fora do plano inicial,
mas podem ser incorporados se volume, segurança ou disponibilidade tornarem essa
evolução necessária.