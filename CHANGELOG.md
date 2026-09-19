# 📋 Changelog

Todas as mudanças notáveis deste projeto estão documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)  
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [1.0.0] - 2026-09-15

Primeira versão estável do Calendário de Escalas.

### ✨ Adicionado

- **Feriados móveis** calculados por ano (Páscoa, Carnaval, Corpus Christi, Sexta-feira Santa)
  - Algoritmo de Meeus/Jones/Butcher para Páscoa
  - Cache por ano para performance
- **Alerta de saída antecipada** com chip colorido
  - Marcador `'T'` na string da escala
  - Chip compacto no número do dia
  - Popup mostra "Antecipar saída em 1 hora"
- **Destaque do dia atual** com borda azul + aura
- **Créditos do desenvolvedor** com animações
  - Coração pulsante
  - Gradiente animado no nome
  - Cursor piscando
  - Link para o GitHub
- **GoatCounter** para analytics sem cookies (LGPD/GDPR compliant)
- **PWA completo** com Service Worker v4
  - Cache First para assets
  - Network First para HTML
  - Stale-while-revalidate
- **Menu lateral** com:
  - Guia rápido
  - Cadastro de funcionário
  - Configuração de período
  - Alternância de tema
  - Exportar/Importar dados
  - Limpar dados / Resetar
  - Sugerir melhoria / Reportar bug
- **Sistema de horas extras** por dia, filtradas pelo período atual
- **Estatísticas detalhadas** com relatório por escala, turno e período
- **Contadores** de funcionários por turno (Total, Manhã, Tarde, Noite)
- **Modais e popups** para:
  - Detalhes do dia
  - Cadastro/edição de funcionário
  - Adição/remoção de hora extra
  - Lista de funcionários por turno
  - Estatísticas
- **Tema claro/escuro** com persistência em `localStorage`
- **Acessibilidade** com:
  - ARIA labels em todos os elementos interativos
  - `focus-visible` padronizado
  - `prefers-reduced-motion` respeitado
  - Navegação por teclado no calendário

### 🔧 Corrigido

- Feriados móveis agora são **calculados dinamicamente** por ano (antes eram fixos)
  - Carnaval 2027 e 2028 agora aparecem nas datas corretas
- Horas extras são **filtradas pelo período atual** (não vazam para outros meses)
- Erro `getFeriados is not defined` em `estatisticas.js` e `app.js`
- **Chip de alerta** uniforme com o badge `T`/`F` (mesmo tamanho, alinhamento)
- **Comentários aninhados** no CSS que quebravam o bloco `.dia-alerta-saida`
- `box-shadow: #0D0D0D` inválido no `.dia-sup-dir`
- Contraste do **feriado trabalhado** no tema escuro
- Ordem das checagens no Service Worker (HTTP antes de GoatCounter)
- `transition: all` trocado por transições específicas (performance)

### 🎨 Melhorado

- **Configuração centralizada** no `:root` do `style.css`
  - Mudar cor do chip = 1 variável
  - Mudar tamanho da célula = 1 variável
  - Mudar cor do dia atual = 1 variável
- **Layout do calendário** unificado (grid 2x2 com `gap`)
- **Tema escuro** sobrescreve apenas variáveis (DRY)
- **Responsividade** com 5 breakpoints (768px, 480px, 380px, 360px)
- **README.md** completo com:
  - Estrutura do projeto
  - Como usar
  - Feriados móveis documentados
  - Acessibilidade
  - Compatibilidade
- **manifest.json** com:
  - `id`, `lang`, `dir`, `categories`
  - Ícones maskable separados
  - `shortcuts` para ação rápida
  - Screenshots para preview

### 🗑️ Removido

- CSS morto (`.dia-btn.folga`, variáveis não usadas)
- Comentários redundantes
- Registro duplicado do Service Worker no `index.html`
- Favicons redundantes (o `.ico` cobre 16/32)

---

## Tipos de mudança

- `✨ Adicionado` — novas funcionalidades
- `🔧 Corrigido` — correção de bugs
- `🎨 Melhorado` — mudanças em funcionalidades existentes
- `🗑️ Removido` — funcionalidades removidas
- `⚠️ Depreciado` — funcionalidades que serão removidas
- `🔒 Segurança` — correções de vulnerabilidade

---

## Links

- **Repositório:** https://github.com/abl0n/calendario-escalas
- **Demo:** https://abl0n.github.io/calendario-escalas/
- **Estatísticas:** https://abl0n.goatcounter.com
- **Issues:** https://github.com/abl0n/calendario-escalas/issues

---

**Desenvolvido por [Adriano Monteiro](https://github.com/abl0n)** 💙