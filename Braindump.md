# Listagem de Streamers

## 1. Visão geral

O projeto é uma interface web responsiva que apresenta streamers de xadrez associados ao Chess.com. O usuário poderá encontrar jogadores pelo nome e identificar quais deles estão ao vivo por meio de um indicador visual claro.

A aplicação deve utilizar o tema escuro como padrão e seguir uma linguagem visual moderna, minimalista e funcional, baseada nas referências de cores e componentes da Chess.com.

## 2. Objetivo do produto

Permitir que usuários:

- Visualizem os streamers disponíveis em uma grade organizada.
- Identifiquem rapidamente quem está ao vivo.
- Pesquisem um streamer pelo nome de usuário.
- Acessem o canal disponível no YouTube ou em outra plataforma, quando informado pela API.
- Consultem informações básicas, como avatar e país de origem.

## 3. Público-alvo

- Jogadores de xadrez que acompanham partidas e conteúdos ao vivo.
- Entusiastas que desejam descobrir novos streamers.
- Usuários que procuram um streamer específico pelo nome.

## 4. Escopo da primeira versão

### Funcionalidades obrigatórias

1. Consultar a lista de streamers no endpoint de streamers do Chess.com.
2. Exibir os streamers em cards com:
   - Nome de usuário;
   - Avatar;
   - Indicador de transmissão ao vivo ou offline.
   - Link para o canal ou transmissão no YouTube, quando disponível.
3. Pesquisar streamers pelo nome de usuário.
4. Executar a pesquisa ao:
   - Pressionar Enter no campo de pesquisa; ou
   - Clicar no botão **Pesquisar**.
5. Informar ao usuário quando o campo estiver vazio.
6. Exibir estados de carregamento, dados vazios e erros.
7. Adaptar o layout para desktop, tablets e dispositivos móveis.

### Funcionalidades opcionais para evolução

- Filtros por status: **Todos**, **Ao vivo** e **Offline**.
- Ordenação por nome ou popularidade.
- Exibição do horário de início da transmissão.
- Favoritar streamers.
- Atualização automática da lista.
- Paginação ou carregamento infinito.

O horário de início não será exibido na primeira versão, pois não consta como propriedade confirmada no endpoint principal.

## 5. Fluxo do usuário

1. O usuário acessa a página.
2. A aplicação solicita a lista de streamers ao Chess.com.
3. Enquanto aguarda a resposta, exibe um estado de carregamento.
4. A lista é apresentada em cards.
5. O usuário pesquisa um nome:
   - Se o campo estiver vazio, o campo recebe destaque de erro e a mensagem **Campo de pesquisa vazio**.
   - Se houver resultados, os cards correspondentes são exibidos.
   - Se não houver resultados, é exibida uma mensagem informando que nenhum streamer foi encontrado.
6. O usuário pode selecionar o link de YouTube ou de outra plataforma disponível no card.

## 6. Comportamento da pesquisa

- A pesquisa deve ignorar maiúsculas e minúsculas.
- Espaços antes e depois do texto devem ser removidos.
- A busca deve corresponder ao nome completo ou a parte do nome digitada.
- Os resultados devem ser atualizados somente após a confirmação da pesquisa, por Enter ou pelo botão.
- A mensagem de campo vazio não deve realizar uma nova consulta à API.

Exemplo:

```text
Busca: " hikaru "
Resultado: streamers cujo nome contenha "hikaru"
```

## 7. Requisitos da interface

### Layout

- Fundo principal em tema escuro.
- Cabeçalho ou área de pesquisa centralizada no topo.
- Grade responsiva com:
  - Até 3 cards por linha em telas grandes;
  - 2 cards por linha em tablets;
  - 1 card por linha em celulares.
- Cards com bordas arredondadas, espaçamento consistente e fundo em tom de cinza escuro.
- Informações organizadas de forma hierárquica e fácil de ler.

### Pesquisa

- Campo de texto com rótulo acessível.
- Botão **Pesquisar** destacado na cor verde principal.
- Estado vazio: borda vermelha e texto ou placeholder informativo.
- Estado de carregamento: botão desabilitado e indicador visual durante a busca.

### Indicador de transmissão

- Ao vivo: bolinha vermelha acompanhada do texto **Ao vivo**.
- Offline: bolinha cinza acompanhada do texto **Offline**.
- O indicador deve ser visível sem depender apenas da cor.

### Estados visuais

- **Carregando:** esqueleto ou mensagem de carregamento.
- **Sucesso:** lista de cards ou resultado da busca.
- **Sem resultados:** mensagem clara de ausência de registros.
- **Erro:** alerta legível com a causa e uma ação para tentar novamente.

## 8. Identidade visual

### Paleta de cores

| Elemento | Cor |
| --- | --- |
| Verde principal | `#81B64C` |
| Verde escuro | `#5D9948` |
| Verde claro / hover | `#B2E068` |
| Fundo principal | `#302E2B` |
| Fundo secundário | `#262421` |
| Superfície dos cards | `#484644` |
| Texto principal | `#FFFFFF` |
| Texto secundário | `#B0AEAC` |
| Estado de erro | `#D9534F` |

### Tipografia

- Fonte recomendada: Inter ou Arial, sem serifa.
- Títulos: Semibold ou Bold, peso 600–700.
- Corpo do texto: Regular, peso 400.
- Botões: Semibold, peso 600.

### Diretrizes

- Priorizar tema escuro.
- Usar verde apenas em ações principais e estados ativos.
- Garantir contraste suficiente para textos e estados.
- Evitar excesso de cores e elementos decorativos.
- Manter espaçamento, cantos arredondados e dimensões consistentes.
- Garantir navegação por teclado e suporte a leitores de tela.

## 9. Integração com a API

### Endpoint principal

```text
https://api.chess.com/pub/streamers
```

Responsável por retornar a lista de streamers e suas informações públicas.

### Endpoint de perfil

```text
https://api.chess.com/pub/player/{username}
```

Responsável por retornar dados complementares do jogador, incluindo o país de origem quando disponível.

Exemplo:

```text
https://api.chess.com/pub/player/hikaru
```

Não é necessário incluir parâmetros de rastreamento externos na URL da API.

### Campos esperados no frontend

Os dados podem ser normalizados em uma estrutura própria antes da renderização:

```ts
interface Streamer {
  username: string
  name?: string
  avatar?: string
  country?: string
  isLive: boolean
  youtubeUrl?: string
  platformUrl?: string
}
```

As propriedades reais do Chess.com devem ser verificadas na resposta da API. Valores opcionais não devem impedir que o card seja exibido.

### País de origem

Quando a resposta do endpoint principal não fornecer o país diretamente:

1. Consultar o endpoint de perfil usando o nome de usuário.
2. Extrair o código do país da propriedade `country`, se presente.
3. Exibir o nome ou código do país somente quando houver uma informação válida.
4. Exibir **País não informado** caso o dado não esteja disponível.

As consultas de país devem ser controladas para evitar chamadas excessivas à API.

## 10. Requisitos técnicos

- Utilizar React com TypeScript.
- Utilizar `useState` para controlar os dados e estados da interface, incluindo:
  - Lista de streamers recebida da API;
  - Texto digitado no campo de pesquisa;
  - Resultados apresentados após a confirmação da pesquisa;
  - Estado de carregamento;
  - Mensagens de erro e validação.
- Utilizar `useEffect` para carregar a lista inicial de streamers quando o componente da página for montado e atualizar o estado com os dados retornados pela API.
- Declarar corretamente as dependências de cada `useEffect` e evitar dependências que provoquem requisições repetidas ou ciclos de renderização.
- Manter a pesquisa vinculada ao estado do formulário: atualizar os resultados após Enter ou clique em **Pesquisar**, sem disparar uma requisição a cada tecla digitada.
- Atualizar os estados de carregamento, dados e erro de forma consistente para que a interface renderize as informações mais recentes recebidas da API.
- Cancelar a requisição iniciada pelo `useEffect` no processo de limpeza do efeito, ou ignorar sua resposta, caso o componente seja desmontado antes da conclusão. Isso evita atualizações de estado obsoletas.
- Utilizar `fetch` para realizar as requisições.
- Implementar operações assíncronas com `async/await`.
- Utilizar `try/catch/finally` para tratamento de erros e finalização dos estados.
- Validar o formato da resposta antes de utilizá-la.
- Não renderizar dados provenientes da API sem uma apresentação segura no HTML.
- Exibir fallback para avatar, país e links não informados.
- Cancelar ou impedir consultas duplicadas enquanto uma requisição estiver em andamento.

## 11. Tratamento de erros

### Erros HTTP

| Código | Mensagem para o usuário |
| --- | --- |
| 400 | Não foi possível processar sua solicitação. Confira os dados e tente novamente. |
| 403 | O acesso aos dados foi recusado. Tente novamente mais tarde. |
| 404 | Nenhum perfil ou streamer foi encontrado. |
| 429 | Muitas solicitações foram realizadas. Aguarde alguns instantes e tente novamente. |
| 500 | O serviço está temporariamente indisponível. Tente novamente em instantes. |

Para outros códigos de erro, exibir:

> Não foi possível concluir a solicitação. Verifique sua conexão e tente novamente.

Além dos erros HTTP, devem ser tratados:

- Falha de rede;
- Resposta inválida ou inesperada;
- Timeout ou resposta que não conclua em tempo hábil;
- Lista vazia;
- Perfil sem país informado.

### Validação da pesquisa

- Campo vazio ou composto apenas por espaços:
  - Alterar a borda do campo para vermelho;
  - Definir o atributo `aria-invalid="true"`;
  - Exibir a mensagem **Campo de pesquisa vazio**;
  - Não realizar requisição.
- Ao digitar novamente, remover o estado de erro.

## 12. Acessibilidade

- Utilizar HTML semântico.
- O campo de pesquisa deve possuir `label` acessível.
- Mensagens de erro devem ser associadas ao campo com `aria-describedby`.
- Alterações de estado podem ser anunciadas com `role="status"` ou `role="alert"`.
- Todos os elementos interativos devem ser operáveis por teclado.
- O contraste do indicador de status não deve depender exclusivamente da cor.
- Imagens devem possuir texto alternativo adequado.

## 13. Critérios de aceite

1. A página inicial apresenta a lista de streamers obtida pela API.
2. Os cards exibem nome, avatar e status ao vivo ou offline.
3. O país é exibido quando disponível no perfil do Chess.com.
4. A lista é exibida em até três colunas em telas grandes e se adapta a telas menores.
5. Pesquisar por parte do nome retorna os cards correspondentes.
6. Pressionar Enter ou clicar no botão executa a mesma pesquisa.
7. A busca vazia destaca o campo em vermelho e impede a requisição.
8. Nenhum resultado apresenta uma mensagem clara ao usuário.
9. Erros HTTP 400, 403, 404, 429 e 500 apresentam mensagens adequadas.
10. A interface continua utilizável em desktop e dispositivos móveis.
11. Não existem erros visuais ou de execução durante o carregamento e atualização da lista.
12. A lista e os estados da interface são controlados com `useState` e renderizados novamente quando os dados da API ou os resultados da pesquisa mudarem.
13. `useEffect` carrega a lista inicial sem gerar requisições repetidas e lida com a limpeza da requisição quando necessário.
