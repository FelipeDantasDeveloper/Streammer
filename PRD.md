# PRD — Listagem de Streamers de Xadrez

## Visão geral

Criar uma aplicação web responsiva para listar streamers de xadrez do Chess.com. A pessoa usuária poderá visualizar os dados disponíveis de cada streamer, identificar quem está ao vivo e pesquisar pelo nome.

Este documento organiza o escopo em cinco etapas de implementação. Os detalhes funcionais e visuais completos estão em [Braindump.md](./Braindump.md), que deve ser consultado como referência durante todas as etapas.

## Regra para dúvidas e requisitos não especificados

Se, durante qualquer etapa, surgir uma dúvida ou uma decisão necessária que não esteja especificada neste PRD ou no Braindump, **pergunte à pessoa usuária antes de executar qualquer ação que dependa dessa decisão**. Não invente requisitos nem escolha silenciosamente entre alternativas que alterem o comportamento, o escopo ou a experiência do produto. Continue apenas após receber esclarecimento; se a decisão não bloquear o trabalho, prossiga somente com as partes que não dependem dela.

## Etapa 1 — Preparar a estrutura e a identidade visual

**Objetivo:** preparar a aplicação React com TypeScript para receber a experiência do produto.

**Tarefas:**

- Revisar a estrutura existente e preservar a configuração atual do projeto.
- Remover a tela de demonstração inicial do template, substituindo-a pela estrutura semântica da página.
- Definir estilos globais e tokens visuais com base na paleta, tipografia e diretrizes do Braindump.
- Criar a estrutura responsiva da página: cabeçalho, área de pesquisa e região da listagem.
- Garantir que o tema escuro, o contraste e a navegação por teclado sejam considerados desde o início.

**Conclusão da etapa:** a página possui a estrutura base e a identidade visual definidas, sem conteúdo de demonstração do template.

## Etapa 2 — Integrar a API e normalizar os dados

**Objetivo:** obter dados válidos do Chess.com e prepará-los para a interface.

**Tarefas:**

- Consultar `https://api.chess.com/pub/streamers` usando `fetch`, `async/await` e tratamento explícito de erros.
- Verificar o formato real da resposta e mapear seus campos para um tipo `Streamer` próprio da aplicação.
- Usar o endpoint `https://api.chess.com/pub/player/{username}` somente quando necessário para obter o país, controlando chamadas para evitar solicitações excessivas.
- Tratar campos opcionais, como avatar, país e link de plataforma, com fallbacks apropriados.
- Distinguir erros HTTP, falhas de rede e respostas inválidas, conforme as mensagens definidas no Braindump.

**Conclusão da etapa:** os dados da API podem ser convertidos para o modelo da aplicação e as falhas são representadas explicitamente, sem dados inventados.

## Etapa 3 — Exibir a listagem de streamers

**Objetivo:** apresentar os dados carregados de maneira clara e responsiva.

**Tarefas:**

- Criar cards com nome de usuário, avatar, país quando disponível e link de canal quando fornecido.
- Apresentar o estado de transmissão como **Ao vivo** ou **Offline**, usando texto e indicador visual, não apenas cor.
- Implementar a grade responsiva: até três colunas em telas grandes, duas em tablets e uma em celulares.
- Usar `useState` para controlar dados, carregamento e erro; usar `useEffect` para carregar a lista inicial.
- Limpar ou invalidar requisições pendentes quando necessário, evitando atualizações obsoletas após desmontagem do componente.
- Apresentar estados de carregamento, lista vazia e erro com opção para tentar novamente.

**Conclusão da etapa:** a lista exibe os dados disponíveis e os estados de carregamento, vazio e erro de forma adequada em diferentes tamanhos de tela.

## Etapa 4 — Implementar pesquisa e validação

**Objetivo:** permitir encontrar streamers por nome de forma previsível e acessível.

**Tarefas:**

- Controlar o texto do campo com `useState`.
- Executar a pesquisa ao pressionar Enter ou clicar em **Pesquisar**.
- Ignorar diferenças entre maiúsculas e minúsculas, remover espaços nas extremidades e permitir correspondência parcial pelo nome de usuário.
- Atualizar os resultados somente após a confirmação da pesquisa; não disparar uma requisição a cada tecla.
- Para campo vazio ou composto apenas por espaços, destacar o campo em vermelho, definir `aria-invalid="true"`, exibir **Campo de pesquisa vazio** e não consultar a API.
- Remover o erro de validação quando a pessoa usuária voltar a digitar.
- Apresentar uma mensagem clara quando não houver correspondências.

**Conclusão da etapa:** a pesquisa funciona igualmente pelo botão e pelo teclado, valida entradas vazias e atualiza os resultados sem requisições por tecla.

## Etapa 5 — Validar, refinar e concluir

**Objetivo:** confirmar que a experiência implementada atende aos critérios de aceite.

**Tarefas:**

- Conferir os cenários de sucesso, carregamento, lista vazia, pesquisa sem resultados e falhas HTTP 400, 403, 404, 429 e 500.
- Verificar layout em desktop, tablet e celular, além de teclado, rótulos acessíveis, mensagens associadas aos campos e anúncios de estado.
- Verificar links externos, fallbacks de imagem e tratamento de dados opcionais.
- Executar os comandos de lint e build existentes no projeto e corrigir problemas introduzidos pela implementação.
- Conferir os critérios de aceite do Braindump e resolver qualquer requisito pendente antes de considerar o trabalho concluído.

**Conclusão da etapa:** os critérios de aceite estão verificados, a aplicação compila e não há regressões conhecidas nas funcionalidades entregues.

## Critérios de aceite do produto

- A aplicação carrega e apresenta os streamers retornados pela API do Chess.com.
- Os cards exibem nome, avatar e status ao vivo ou offline; o país e os links são apresentados quando disponíveis.
- A pesquisa parcial por nome funciona por Enter e pelo botão, sem consultar a API a cada tecla.
- Uma pesquisa vazia informa o erro e não inicia uma consulta.
- Erros, carregamento e ausência de resultados têm feedback claro para a pessoa usuária.
- A interface segue as diretrizes visuais e de acessibilidade do Braindump e funciona em telas pequenas e grandes.
