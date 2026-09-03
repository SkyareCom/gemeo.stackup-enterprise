# MOVIMENTAÇÕES E GESTÃO — UI CONGELADA

Status: APROVADA / CONGELADA

Baseline aprovado: commit `41c505a300f01627bb0bd4c0fb493a672d48fcb8`
Arquivo protegido por decisão de produto: `players.html`

## REGRA

A tela MOVIMENTAÇÕES E GESTÃO não deve sofrer alterações visuais, estruturais, tipográficas ou de espaçamento sem solicitação explícita do proprietário do produto.

## PADRÃO APROVADO

- Referência visual: STAFF/JOGADORES.
- Fundo direto, sem card estrutural externo.
- Fonte: Cantarell.
- Pesos: 400 e 600.
- Título principal: 20px / 600.
- Títulos de seção: 14px / 600, verde #8DFC3B, letter-spacing .14em.
- Textos, campos, labels e botões: 12px.
- Campos: 44px mínimos, padding 10px, radius 9px, borda #27342D.
- Espaçamento-base: 8px.
- Sem traços ou placeholders visuais em campos informativos vazios; mostrar apenas o título do campo.
- Mobile: conteúdo em uma coluna conforme breakpoint aprovado.

## PROIBIDO SEM PEDIDO EXPLÍCITO

- Redesenhar a tela.
- Reintroduzir app-theme.css ou overrides antigos nesta página.
- Alterar tipografia, tamanhos, pesos, cores, bordas, raios ou espaçamentos.
- Reintroduzir cards estruturais externos.
- Reintroduzir traços em campos vazios.
- Fazer refatoração visual incidental ao alterar lógica.

Alterações funcionais futuras devem preservar integralmente esta apresentação, salvo pedido explícito em contrário.