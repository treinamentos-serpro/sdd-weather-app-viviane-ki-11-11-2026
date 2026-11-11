# Backlog de Tarefas — Weather App

As tarefas abaixo derivam de [weather-app-spec.md](../specs/weather-app-spec.md)
e do [plano técnico](../plans/weather-app-plan.md). A ordem respeita as
dependências; tarefas sem dependência podem ser executadas em paralelo.

## Fundação e dados

### T-01 — Definir os tipos do domínio meteorológico

- **Descrição:** Criar contratos TypeScript para cidade, clima atual, dia de previsão, unidade e dados agregados.
- **Critérios de aceite:**
	- Existem tipos `City`, `CurrentWeather`, `ForecastDay`, `WeatherData` e `Unit`.
	- As temperaturas internas são documentadas e tratadas como Celsius.
	- A sensação térmica é representada como campo opcional do clima atual.
	- Região administrativa pode faltar sem invalidar uma cidade.
	- Os campos cobrem cidade, coordenadas, horário, condição atual e dados diários definidos no plano.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`
- **Tipo:** Data
- **Rastreabilidade:** FR-001 a FR-004, AC-001 a AC-004.

### T-02 — Implementar busca geográfica de cidades

- **Descrição:** Consultar o endpoint de geocoding da Open-Meteo e mapear resultados para o domínio.
- **Critérios de aceite:**
	- A busca envia o nome codificado, idioma português e limite de resultados.
	- Texto vazio ou composto apenas por espaços não gera request e retorna lista vazia.
	- Resultados incluem identificador, nome, país, região quando disponível e coordenadas.
	- Nenhum resultado retorna lista vazia; falhas HTTP e de rede geram erro tratável.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Tipo:** Data
- **Rastreabilidade:** FR-001, AC-001, EC-001 a EC-005.

### T-03 — Implementar consulta de clima atual e previsão

- **Descrição:** Consultar a API de previsão para as coordenadas selecionadas e converter a resposta para os tipos internos.
- **Critérios de aceite:**
	- A consulta solicita clima atual e previsão diária de cinco dias com `timezone=auto`.
	- O resultado inclui temperatura atual, condição e horário retornado; solicita e mapeia sensação térmica quando fornecida pela API.
	- Cada dia válido inclui data local, mínima, máxima, condição e probabilidade de precipitação quando disponível.
	- Temperaturas recebidas são mantidas em Celsius.
	- Resposta sem campos essenciais, falha HTTP, rede ou timeout resulta em erro tratável.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Tipo:** Data
- **Rastreabilidade:** FR-002, FR-003, AC-002, AC-003, EC-005 a EC-009.

### T-04 — Implementar conversão e formatação de temperaturas

- **Descrição:** Fornecer funções puras para converter e apresentar temperaturas em Celsius ou Fahrenheit.
- **Critérios de aceite:**
	- Conversões seguem as fórmulas definidas na spec e funcionam para valores negativos e extremos.
	- O arredondamento ocorre somente na apresentação, sem alterar os valores internos.
	- O formato apresenta o símbolo correspondente à unidade selecionada.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`, `src/lib/format.ts`
- **Tipo:** Data
- **Rastreabilidade:** FR-004, AC-004, EC-011 e EC-012.

## Testes dos dados

### T-05 — Testar busca geográfica e consulta meteorológica

- **Descrição:** Cobrir o mapeamento e os erros do service com respostas HTTP simuladas.
- **Critérios de aceite:**
	- Testes verificam busca válida, busca vazia, resultado vazio e distinção de cidades homônimas.
	- Testes verificam o mapeamento de clima atual e previsão para cinco dias.
	- Testes cobrem falha HTTP, rede, timeout e payload essencial incompleto.
	- Nenhum teste depende de chamadas ao vivo à Open-Meteo.
- **Dependências:** T-02, T-03.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** AC-001 a AC-003, AC-006, EC-002 a EC-009, EC-014 e EC-015.

### T-06 — Testar conversão de unidades e funções de apresentação

- **Descrição:** Validar os cálculos de temperatura e funções de formatação.
- **Critérios de aceite:**
	- Testes verificam conversão Celsius/Fahrenheit nas duas direções, incluindo zero e temperaturas negativas.
	- Testes verificam símbolo e precisão apresentados para cada unidade.
	- Testes confirmam que a conversão não modifica os valores de entrada.
- **Dependências:** T-04.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`, `tests/unit/format.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** FR-004, AC-004, EC-011 e EC-012.

## Fluxo e interface

### T-07 — Orquestrar busca e consulta no hook meteorológico

- **Descrição:** Centralizar estado de busca, seleção de cidade, carregamento, dados e erros.
- **Critérios de aceite:**
	- O hook permite buscar cidades e carregar clima para a cidade selecionada.
	- O estado diferencia carregamento, sucesso, erro e ausência de resultados.
	- Uma nova seleção substitui dados da cidade anterior.
	- A consulta expõe uma ação de retry e impede que erros causem falha inesperada da interface.
- **Dependências:** T-02, T-03.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`
- **Tipo:** Data
- **Rastreabilidade:** FR-001 a FR-003, AC-001 a AC-003, AC-006.

### T-08 — Criar busca e seleção de cidades

- **Descrição:** Permitir entrada do nome, visualização dos resultados e seleção inequívoca de uma localidade.
- **Critérios de aceite:**
	- Campo e ação de busca têm rótulos acessíveis e suportam teclado.
	- Pesquisa vazia não é enviada.
	- Resultados exibem país e região quando disponíveis para diferenciar homônimos.
	- Selecionar um resultado fornece a cidade e as coordenadas ao fluxo meteorológico.
	- Busca sem resultados apresenta estado vazio.
- **Dependências:** T-07.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`, `src/App.tsx`
- **Tipo:** UI
- **Rastreabilidade:** FR-001, AC-001, EC-001 a EC-004.

### T-09 — Apresentar clima atual e estados da consulta

- **Descrição:** Exibir informações atuais da cidade e feedback de carregamento, erro ou ausência de dados.
- **Critérios de aceite:**
	- Clima atual identifica a cidade e apresenta temperatura, condição e informações disponíveis.
	- Sensação térmica é apresentada quando fornecida pelo provedor.
	- Horário de atualização é exibido quando fornecido.
	- Loading, erro e ausência de dados têm apresentação distinta e não mostram dados incompletos como completos.
	- A ação de retry permite repetir a consulta após erro.
- **Dependências:** T-07.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`, `src/components/states/LoadingState.tsx`, `src/components/states/ErrorState.tsx`, `src/components/states/EmptyState.tsx`
- **Tipo:** UI
- **Rastreabilidade:** FR-002, AC-002, AC-006, EC-005 a EC-007 e EC-009.

### T-10 — Apresentar previsão diária de cinco dias

- **Descrição:** Renderizar os dias disponíveis com temperaturas e condição meteorológica.
- **Critérios de aceite:**
	- Os dias são apresentados separadamente e usam as datas locais retornadas para a cidade.
	- Cada dia válido exibe mínima, máxima e condição; probabilidade de precipitação é exibida quando disponível.
	- A ausência de dados em um dia não oculta os demais.
	- Uma previsão com menos de cinco dias é identificada como parcial.
- **Dependências:** T-03, T-07.
- **Arquivos prováveis:** `src/components/ForecastCard.tsx`, `src/components/ForecastList.tsx`
- **Tipo:** UI
- **Rastreabilidade:** FR-003, AC-003, EC-007, EC-008 e EC-013.

### T-11 — Adicionar alternância entre Celsius e Fahrenheit

- **Descrição:** Permitir mudar a unidade apresentada sem perder a cidade ou consultar novamente a API.
- **Critérios de aceite:**
	- A unidade inicial é Celsius e Celsius/Fahrenheit podem ser selecionados.
	- Clima atual e todas as temperaturas da previsão refletem a unidade escolhida.
	- Alternar a unidade não dispara uma nova consulta meteorológica.
	- O controle é acessível por teclado e comunica a seleção atual.
- **Dependências:** T-04, T-09, T-10.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`, `src/App.tsx`
- **Tipo:** UI
- **Rastreabilidade:** FR-004, AC-004, EC-010.

### T-12 — Compor a tela e adaptar o layout a diferentes dispositivos

- **Descrição:** Integrar busca, estados, clima atual, previsão e unidade em uma interface responsiva.
- **Critérios de aceite:**
	- A tela permite percorrer o fluxo de busca até a previsão sem navegação adicional.
	- Busca e controles permanecem utilizáveis por toque em viewport móvel.
	- Conteúdo permanece legível em celular, tablet e desktop, sem rolagem horizontal indevida.
	- Nenhuma funcionalidade essencial fica oculta em telas menores.
- **Dependências:** T-08, T-09, T-10, T-11.
- **Arquivos prováveis:** `src/App.tsx`, `src/styles/index.css`, `src/components/`
- **Tipo:** UI
- **Rastreabilidade:** FR-005, AC-005, NFR-001 e NFR-008.

## Testes de interface e fluxo

### T-13 — Testar estados e interações dos componentes

- **Descrição:** Verificar comportamento acessível da busca, unidade e visualizações meteorológicas.
- **Critérios de aceite:**
	- Testes cobrem pesquisa vazia, resultados, seleção e estado sem resultados.
	- Testes cobrem estados de loading, erro, retry e conteúdo parcial.
	- Testes confirmam que alternar unidade atualiza clima atual e previsão sem nova consulta.
	- Interações principais funcionam por teclado.
- **Dependências:** T-08, T-09, T-10, T-11.
- **Arquivos prováveis:** `tests/unit/SearchBar.test.tsx`, `tests/unit/UnitToggle.test.tsx`, `tests/unit/App.test.tsx`
- **Tipo:** Test
- **Rastreabilidade:** AC-001 a AC-004, AC-006, EC-001 e EC-008.

### T-14 — Validar fluxos principais e responsividade em navegador

- **Descrição:** Exercitar a aplicação integrada em navegador com respostas externas controladas.
- **Critérios de aceite:**
	- Cenário E2E busca e seleciona uma cidade, apresentando clima atual e previsão diária.
	- Cenário E2E alterna C/F e confirma atualização de todas as temperaturas.
	- Cenário E2E apresenta feedback e permite retry em falha simulada.
	- Cenários em viewport móvel permitem concluir a busca e consultar a previsão sem rolagem horizontal indevida.
	- Requests da Open-Meteo são interceptados para que o teste não dependa de serviço externo.
- **Dependências:** T-12, T-13.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`, `playwright.config.ts`
- **Tipo:** Test
- **Rastreabilidade:** AC-001 a AC-006, NFR-001, EC-005, EC-006, EC-010 e EC-016.

### T-15 — Executar verificações de qualidade do projeto

- **Descrição:** Validar lint, build e testes antes de concluir a implementação.
- **Critérios de aceite:**
	- `pnpm lint` conclui sem erros.
	- `pnpm build` conclui sem erros de TypeScript ou build.
	- `pnpm test` conclui com os testes unitários aprovados.
	- `pnpm test:e2e` conclui com os cenários E2E aprovados.
- **Dependências:** T-05, T-06, T-13, T-14.
- **Arquivos prováveis:** `package.json`, arquivos de `src/` e `tests/`
- **Tipo:** Infra
- **Rastreabilidade:** NFR-001, NFR-004, NFR-006 e critérios AC-001 a AC-006.
