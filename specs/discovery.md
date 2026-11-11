# Discovery — Aplicação de Previsão do Tempo

## 1. Contexto e objetivo do negócio

### 1.1. Contexto

A empresa solicitou o desenvolvimento de uma aplicação de previsão do tempo que permita aos usuários consultar informações meteorológicas de cidades de seu interesse.

A aplicação deverá apresentar as condições climáticas atuais e a previsão para os próximos cinco dias, oferecendo opções de personalização da unidade de temperatura e suporte à utilização em dispositivos móveis.

### 1.2. Problema identificado

Os usuários precisam de uma maneira simples e acessível de consultar as condições meteorológicas atuais e futuras de diferentes cidades.

### 1.3. Objetivo principal

Desenvolver uma aplicação que permita pesquisar cidades e visualizar informações meteorológicas atualizadas, incluindo condições atuais e previsão para os próximos cinco dias.

### 1.4. Benefícios esperados

- Facilitar o acesso às informações meteorológicas.
- Permitir o planejamento de atividades com base na previsão do tempo.
- Oferecer uma experiência de utilização simples e intuitiva.
- Garantir acesso à aplicação por dispositivos móveis.
- Permitir que usuários escolham sua unidade de temperatura preferida.

### 1.5. Stakeholders identificados

| Stakeholder | Responsabilidade |
|---|---|
| Usuários finais | Consultar informações meteorológicas. |
| Empresa solicitante | Definir objetivos e validar a solução. |
| Equipe de desenvolvimento | Projetar, desenvolver e manter a aplicação. |
| Provedor de dados meteorológicos | Disponibilizar informações sobre o clima. |

Os stakeholders e suas responsabilidades deverão ser confirmados durante o discovery.

---

## 2. Requisitos funcionais (FR)

### FR-001 — Busca de cidades

- **Descrição:** O sistema deverá permitir que os usuários pesquisem cidades para consultar informações meteorológicas.
- **Ator:** Usuário.
- **Regra de negócio:** A pesquisa deverá permitir identificar a cidade desejada.
- **Critérios de aceite:**
  - O usuário consegue informar o nome de uma cidade.
  - O sistema apresenta resultados correspondentes à pesquisa.
  - O usuário consegue selecionar uma cidade para visualizar suas informações meteorológicas.
  - O sistema informa quando nenhuma cidade correspondente for encontrada.
- **Origem:** Briefing de negócio.
- **Prioridade:** Must Have.
- **Status:** Confirmado quanto à funcionalidade; critérios de pesquisa precisam de validação.

### FR-002 — Visualização do clima atual

- **Descrição:** O sistema deverá apresentar as condições meteorológicas atuais da cidade selecionada.
- **Ator:** Usuário.
- **Regra de negócio:** As informações deverão corresponder à cidade selecionada e aos dados mais recentes disponibilizados pelo provedor meteorológico.
- **Critérios de aceite:**
  - O usuário consegue visualizar o clima atual da cidade selecionada.
  - As informações apresentadas correspondem à cidade consultada.
  - O sistema apresenta uma indicação quando os dados não estiverem disponíveis.
- **Origem:** Briefing de negócio.
- **Prioridade:** Must Have.
- **Status:** Confirmado quanto à funcionalidade; informações meteorológicas que serão exibidas precisam de validação.

### FR-003 — Visualização da previsão de cinco dias

- **Descrição:** O sistema deverá apresentar a previsão meteorológica para os próximos cinco dias da cidade selecionada.
- **Ator:** Usuário.
- **Regra de negócio:** A previsão deverá considerar os cinco dias subsequentes à data da consulta, conforme a disponibilidade dos dados do provedor.
- **Critérios de aceite:**
  - O usuário consegue visualizar a previsão para cinco dias.
  - Cada dia apresenta suas respectivas informações meteorológicas.
  - A previsão está associada à cidade selecionada.
  - O sistema informa quando não houver dados suficientes para apresentar a previsão.
- **Origem:** Briefing de negócio.
- **Prioridade:** Must Have.
- **Status:** Confirmado quanto ao período; granularidade e informações apresentadas precisam de validação.

### FR-004 — Alternância entre Celsius e Fahrenheit

- **Descrição:** O sistema deverá permitir que o usuário alterne a unidade de temperatura entre Celsius (°C) e Fahrenheit (°F).
- **Ator:** Usuário.
- **Regra de negócio:** Todas as temperaturas exibidas deverão respeitar a unidade selecionada.
- **Critérios de aceite:**
  - O usuário consegue selecionar Celsius.
  - O usuário consegue selecionar Fahrenheit.
  - As temperaturas do clima atual e da previsão são atualizadas conforme a unidade selecionada.
  - A alternância não altera os dados meteorológicos originais.
- **Origem:** Briefing de negócio.
- **Prioridade:** Must Have.
- **Status:** Confirmado; persistência da preferência precisa de validação.

### FR-005 — Utilização em dispositivos móveis

- **Descrição:** A aplicação deverá permitir que os usuários acessem suas funcionalidades em dispositivos móveis.
- **Ator:** Usuário.
- **Regra de negócio:** As funcionalidades de busca e consulta meteorológica deverão estar disponíveis em dispositivos móveis.
- **Critérios de aceite:**
  - O usuário consegue pesquisar cidades em dispositivos móveis.
  - O usuário consegue consultar o clima atual.
  - O usuário consegue visualizar a previsão de cinco dias.
  - O usuário consegue alternar entre Celsius e Fahrenheit.
  - A interface adapta sua apresentação às dimensões da tela.
- **Origem:** Briefing de negócio.
- **Prioridade:** Must Have.
- **Status:** Confirmado; dispositivos e navegadores suportados precisam de validação.

---

## 3. Requisitos não-funcionais (NFR)

### NFR-001 — Responsividade

- **Categoria:** Usabilidade / Compatibilidade.
- **Descrição:** A aplicação deverá adaptar sua interface para diferentes tamanhos de tela, especialmente dispositivos móveis.
- **Critério de validação:** Verificar a utilização das funcionalidades em diferentes resoluções de tela.
- **Origem:** Necessidade explícita de utilização em dispositivos móveis.
- **Prioridade:** Must Have.
- **Status:** Confirmado; resoluções e dispositivos suportados precisam de validação.

### NFR-002 — Desempenho

- **Categoria:** Desempenho.
- **Descrição:** A aplicação deverá responder às solicitações dos usuários em tempo adequado, especialmente nas operações de busca de cidades e consulta meteorológica.
- **Critério de validação:** Medir o tempo de resposta das operações em condições normais e de pico.
- **Origem:** Necessidade operacional identificada.
- **Prioridade:** Must Have.
- **Status:** Hipótese; tempos máximos de resposta precisam de definição.

### NFR-003 — Disponibilidade

- **Categoria:** Disponibilidade.
- **Descrição:** A aplicação deverá estar disponível para consulta pelos usuários, considerando também a disponibilidade do provedor externo de informações meteorológicas.
- **Critério de validação:** Monitorar disponibilidade da aplicação e identificar indisponibilidades do serviço externo.
- **Origem:** Necessidade operacional identificada.
- **Prioridade:** Should Have.
- **Status:** Hipótese; nível de disponibilidade esperado precisa de definição.

### NFR-004 — Confiabilidade das informações

- **Categoria:** Confiabilidade.
- **Descrição:** As informações meteorológicas apresentadas deverão corresponder aos dados fornecidos pelo serviço meteorológico contratado ou selecionado.
- **Critério de validação:** Comparar os dados apresentados com os dados retornados pelo provedor.
- **Origem:** Necessidade implícita nas funcionalidades de consulta.
- **Prioridade:** Must Have.
- **Status:** Confirmado quanto à necessidade; critérios de atualização e confiabilidade precisam de validação.

### NFR-005 — Segurança

- **Categoria:** Segurança.
- **Descrição:** A aplicação deverá proteger as informações e os recursos utilizados para comunicação com serviços externos.
- **Critério de validação:** Verificar a proteção das comunicações, credenciais e eventuais dados armazenados.
- **Origem:** Boa prática de desenvolvimento de aplicações.
- **Prioridade:** Must Have.
- **Status:** Necessidade identificada; requisitos específicos precisam de validação.

### NFR-006 — Compatibilidade

- **Categoria:** Compatibilidade.
- **Descrição:** A aplicação deverá funcionar nos principais navegadores e sistemas operacionais utilizados pelos usuários, conforme escopo a ser definido.
- **Critério de validação:** Executar testes funcionais nos navegadores e sistemas operacionais homologados.
- **Origem:** Necessidade de acesso em dispositivos móveis.
- **Prioridade:** Should Have.
- **Status:** Hipótese; ambientes suportados precisam de definição.

### NFR-007 — Escalabilidade

- **Categoria:** Escalabilidade.
- **Descrição:** A solução deverá permitir atender ao crescimento da quantidade de usuários e consultas meteorológicas.
- **Critério de validação:** Realizar testes de carga e avaliar o comportamento da aplicação com diferentes volumes de acesso.
- **Origem:** Necessidade potencial de crescimento do negócio.
- **Prioridade:** Should Have.
- **Status:** Hipótese; volumetria esperada precisa de definição.

### NFR-008 — Usabilidade

- **Categoria:** Usabilidade.
- **Descrição:** A interface deverá permitir que os usuários realizem buscas e consultas meteorológicas de maneira simples e intuitiva.
- **Critério de validação:** Realizar testes de usabilidade com usuários representativos.
- **Origem:** Objetivo de oferecer uma experiência simples.
- **Prioridade:** Must Have.
- **Status:** Necessidade identificada; critérios de avaliação precisam de definição.

---

## 4. Riscos (RISK)

### RISK-001 — Dependência de provedor externo de dados meteorológicos

- **Descrição:** A aplicação depende de um serviço externo para obter informações meteorológicas.
- **Causa:** Ausência de fonte própria de dados meteorológicos.
- **Impacto:** Indisponibilidade ou falha na apresentação das informações climáticas.
- **Probabilidade:** Média.
- **Severidade:** Alta.
- **Mitigação sugerida:** Avaliar provedores alternativos, implementar tratamento de falhas e definir estratégias de cache.
- **Status:** Identificado.

### RISK-002 — Limitações do serviço meteorológico contratado

- **Descrição:** O provedor escolhido pode possuir limitações de quantidade de consultas, cobertura geográfica ou funcionalidades.
- **Causa:** Restrições comerciais e técnicas da API meteorológica.
- **Impacto:** Limitação da utilização da aplicação ou aumento dos custos operacionais.
- **Probabilidade:** Média.
- **Severidade:** Alta.
- **Mitigação sugerida:** Avaliar previamente limites de requisições, cobertura geográfica, disponibilidade e custos dos provedores.
- **Status:** Identificado.

### RISK-003 — Informações meteorológicas desatualizadas

- **Descrição:** Os usuários podem visualizar informações que não representam as condições meteorológicas mais recentes.
- **Causa:** Atrasos na atualização dos dados ou utilização de informações armazenadas em cache por períodos inadequados.
- **Impacto:** Decisões dos usuários baseadas em informações desatualizadas.
- **Probabilidade:** Média.
- **Severidade:** Alta.
- **Mitigação sugerida:** Definir política de atualização, apresentar horário da última atualização e identificar dados desatualizados.
- **Status:** Identificado.

### RISK-004 — Ambiguidade na identificação de cidades

- **Descrição:** Cidades com nomes iguais ou semelhantes podem provocar consultas meteorológicas para localidades incorretas.
- **Causa:** Pesquisa baseada exclusivamente no nome da cidade.
- **Impacto:** Apresentação de informações meteorológicas de uma localização diferente da desejada.
- **Probabilidade:** Média.
- **Severidade:** Média.
- **Mitigação sugerida:** Apresentar informações complementares, como estado e país, durante a seleção da cidade.
- **Status:** Identificado.

### RISK-005 — Experiência inadequada em dispositivos móveis

- **Descrição:** A aplicação pode apresentar dificuldades de navegação ou visualização em determinadas telas.
- **Causa:** Diferenças de resolução, navegadores e sistemas operacionais.
- **Impacto:** Redução da satisfação e da utilização da aplicação.
- **Probabilidade:** Média.
- **Severidade:** Média.
- **Mitigação sugerida:** Implementar testes responsivos em diferentes dispositivos e navegadores.
- **Status:** Identificado.

### RISK-006 — Custos operacionais não previstos

- **Descrição:** O volume de consultas meteorológicas pode ultrapassar os limites gratuitos ou contratados do provedor.
- **Causa:** Crescimento da utilização ou modelo comercial baseado em quantidade de requisições.
- **Impacto:** Aumento dos custos ou interrupção do serviço.
- **Probabilidade:** Média.
- **Severidade:** Média.
- **Mitigação sugerida:** Estimar volumetria, monitorar consumo e avaliar estratégias de cache.
- **Status:** Identificado.

---

## 5. Perguntas em aberto (Open Questions)

As perguntas abaixo deverão ser respondidas pelos stakeholders antes da definição completa do escopo e da arquitetura da solução.

### OQ-001 — Público-alvo

- **Pergunta:** A aplicação será disponibilizada para o público em geral ou será destinada a um grupo específico de usuários?
- **Motivação:** Identificar o perfil dos usuários e suas necessidades.
- **Impacto:** Pode influenciar requisitos de acesso, usabilidade e escalabilidade.
- **Responsável pela resposta:** Área de negócio.
- **Prioridade:** Alta.
- **Status:** Aberta.

### OQ-002 — Identificação das cidades

- **Pergunta:** A busca deverá permitir pesquisar cidades de qualquer país ou somente cidades brasileiras?
- **Motivação:** Definir a abrangência geográfica da aplicação.
- **Impacto:** Influencia a escolha do provedor meteorológico e o mecanismo de pesquisa.
- **Responsável pela resposta:** Área de negócio.
- **Prioridade:** Alta.
- **Status:** Aberta.

### OQ-003 — Informações meteorológicas

- **Pergunta:** Quais informações deverão ser apresentadas no clima atual e na previsão de cinco dias? Temperatura, sensação térmica, umidade, velocidade do vento, precipitação, condição climática ou outras?
- **Motivação:** Definir o conteúdo das consultas meteorológicas.
- **Impacto:** Influencia a seleção do provedor e a apresentação dos dados.
- **Responsável pela resposta:** Área de negócio.
- **Prioridade:** Alta.
- **Status:** Aberta.

### OQ-004 — Granularidade da previsão

- **Pergunta:** A previsão dos cinco dias deverá apresentar somente um resumo diário ou informações por hora?
- **Motivação:** Esclarecer o nível de detalhamento esperado.
- **Impacto:** Pode afetar a disponibilidade dos dados, a interface e o consumo da API.
- **Responsável pela resposta:** Área de negócio.
- **Prioridade:** Alta.
- **Status:** Aberta.

### OQ-005 — Preferência de temperatura

- **Pergunta:** A unidade de temperatura escolhida pelo usuário deverá ser mantida entre acessos ou deverá voltar ao padrão quando a aplicação for reiniciada?
- **Motivação:** Definir o comportamento da preferência do usuário.
- **Impacto:** Pode exigir armazenamento local ou persistência em servidor.
- **Responsável pela resposta:** Área de negócio.
- **Prioridade:** Média.
- **Status:** Aberta.

### OQ-006 — Localização automática

- **Pergunta:** A aplicação deverá identificar automaticamente a localização do usuário por GPS ou deverá utilizar exclusivamente a busca manual de cidades?
- **Motivação:** Avaliar a necessidade de funcionalidades adicionais de localização.
- **Impacto:** Pode introduzir requisitos de privacidade e permissões de localização.
- **Responsável pela resposta:** Área de negócio.
- **Prioridade:** Média.
- **Status:** Aberta.

### OQ-007 — Autenticação

- **Pergunta:** Os usuários precisarão realizar cadastro e login ou a aplicação deverá permitir acesso sem autenticação?
- **Motivação:** Definir o modelo de acesso.
- **Impacto:** Influencia a arquitetura, a segurança e a persistência de preferências.
- **Responsável pela resposta:** Área de negócio.
- **Prioridade:** Média.
- **Status:** Aberta.

### OQ-008 — Cidades favoritas

- **Pergunta:** Os usuários poderão salvar uma lista de cidades favoritas para facilitar consultas futuras?
- **Motivação:** Avaliar a necessidade de personalização.
- **Impacto:** Pode exigir armazenamento de preferências e identificação dos usuários.
- **Responsável pela resposta:** Área de negócio.
- **Prioridade:** Média.
- **Status:** Aberta.

### OQ-009 — Atualização das informações

- **Pergunta:** Qual deverá ser a frequência de atualização das informações meteorológicas e qual será o tempo máximo aceitável de defasagem dos dados?
- **Motivação:** Definir a política de atualização.
- **Impacto:** Influencia desempenho, custos e confiabilidade.
- **Responsável pela resposta:** Área de negócio e equipe técnica.
- **Prioridade:** Alta.
- **Status:** Aberta.

### OQ-010 — Disponibilidade e desempenho

- **Pergunta:** Qual é a quantidade estimada de usuários simultâneos e qual o tempo máximo aceitável para apresentar os resultados de uma consulta?
- **Motivação:** Definir parâmetros de desempenho e escalabilidade.
- **Impacto:** Influencia dimensionamento e arquitetura da solução.
- **Responsável pela resposta:** Área de negócio e equipe técnica.
- **Prioridade:** Média.
- **Status:** Aberta.

### OQ-011 — Provedor meteorológico

- **Pergunta:** A empresa já possui um provedor de dados meteorológicos contratado ou a equipe deverá avaliar e selecionar uma API externa?
- **Motivação:** Identificar dependências e restrições de integração.
- **Impacto:** Influencia custos, cobertura geográfica e disponibilidade.
- **Responsável pela resposta:** Empresa solicitante.
- **Prioridade:** Alta.
- **Status:** Aberta.

### OQ-012 — Plataforma de disponibilização

- **Pergunta:** A aplicação deverá ser exclusivamente web responsiva ou também deverá existir como aplicativo nativo para Android e iOS?
- **Motivação:** Esclarecer o significado de utilização em dispositivos móveis.
- **Impacto:** Influencia escopo, tecnologias e esforço de desenvolvimento.
- **Responsável pela resposta:** Área de negócio.
- **Prioridade:** Alta.
- **Status:** Aberta.

### OQ-013 — Tratamento de indisponibilidade

- **Pergunta:** Quando o provedor meteorológico estiver indisponível, a aplicação deverá apresentar dados armazenados em cache, informar a indisponibilidade ou adotar outra estratégia?
- **Motivação:** Definir o comportamento em cenários de falha.
- **Impacto:** Influencia confiabilidade e experiência do usuário.
- **Responsável pela resposta:** Área de negócio e equipe técnica.
- **Prioridade:** Média.
- **Status:** Aberta.

---

## 6. Matriz de rastreabilidade

| Requisito | Riscos relacionados | Perguntas relacionadas |
|---|---|---|
| FR-001 | RISK-004 | OQ-002 |
| FR-002 | RISK-001, RISK-002, RISK-003 | OQ-003, OQ-009, OQ-011, OQ-013 |
| FR-003 | RISK-001, RISK-002, RISK-003 | OQ-003, OQ-004, OQ-009, OQ-011 |
| FR-004 | — | OQ-005 |
| FR-005 | RISK-005 | OQ-012 |

Os requisitos não-funcionais NFR-002, NFR-003 e NFR-007 também possuem relação com OQ-009 e OQ-010.

---

## 7. Resumo executivo

### 7.1. Consolidado da análise

| Categoria | Quantidade |
|---|---:|
| Requisitos funcionais | 5 |
| Requisitos não-funcionais | 8 |
| Riscos identificados | 6 |
| Perguntas em aberto | 13 |

### 7.2. Principais pontos de atenção

1. **Dependência externa:** A solução depende de um provedor de informações meteorológicas, cuja escolha ainda não foi definida.
2. **Abrangência geográfica:** É necessário determinar se a consulta será restrita ao Brasil ou mundial.
3. **Detalhamento da previsão:** A granularidade da previsão de cinco dias ainda precisa ser esclarecida.
4. **Experiência móvel:** É necessário definir se uma aplicação web responsiva atende à necessidade ou se aplicativos nativos serão exigidos.
5. **Desempenho e atualização:** A frequência de atualização e os tempos de resposta ainda não possuem parâmetros definidos.

### 7.3. Nível de maturidade do briefing

**Classificação: Média.**

O briefing apresenta claramente as funcionalidades principais e o objetivo geral da solução. Entretanto, existem lacunas relacionadas à abrangência geográfica, ao conteúdo das informações meteorológicas, à integração externa, à persistência de preferências e aos requisitos operacionais.

### 7.4. Próximos passos recomendados

1. Validar as perguntas em aberto prioritárias com a área de negócio.
2. Definir o provedor de informações meteorológicas.
3. Estabelecer os requisitos mensuráveis de desempenho e disponibilidade.
4. Consolidar o escopo funcional e os critérios de aceite.
5. Elaborar a especificação detalhada dos requisitos.
6. Desenvolver a arquitetura e o protótipo da aplicação.

**Resultado esperado:** uma aplicação de previsão do tempo que permita pesquisar cidades, consultar condições meteorológicas atuais e previsões para cinco dias, alternar unidades de temperatura e funcionar adequadamente em dispositivos móveis.