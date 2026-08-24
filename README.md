# Gerador de Orçamentos MasterServ

Aplicação web simples para gerar **ordens de serviço**, **orçamentos** e **laudos técnicos** da MasterServ Limeira, com prévia em formato A4, impressão direta pelo navegador e download em PDF.

Feita em **HTML, CSS e JavaScript puro** — sem etapa de build, sem dependências de instalação. Basta abrir o `index.html` ou publicar no GitHub Pages.

## ✨ Funcionalidades

- 3 modelos de documento: **Serviço Executado**, **Orçamento** e **Laudo Técnico**
- Edição em tempo real com prévia fiel ao papel (A4)
- Suporte a múltiplos equipamentos no laudo técnico
- Cálculo automático dos totais
- **Imprimir** (abre a janela de impressão do navegador, já formatada para A4)
- **Baixar PDF**: tenta encaixar o documento inteiro em 1 folha A4; se o conteúdo for mais longo, divide em várias páginas **sem cortar texto ao meio** — cada bloco (cabeçalho, seção, item) pula inteiro para a página seguinte quando necessário
- Campo de assinatura **opcional**: um checkbox no editor permite incluir ou remover a área de assinatura do documento
- Botão para restaurar o exemplo padrão

## 🚀 Como usar localmente

Não é necessário instalar nada. Duas opções:

1. **Abrir direto**: dê duplo clique no arquivo `index.html`.
2. **Servidor local** (recomendado, evita bloqueios de navegador com alguns recursos):
   ```bash
   npx serve .
   # ou
   python3 -m http.server 8080
   ```
   Depois acesse `http://localhost:8080`.

## 🌐 Como publicar no GitHub Pages

1. Crie um repositório no GitHub e envie estes arquivos (`index.html`, `style.css`, `app.js`, `README.md`) para a branch `main`.
2. No repositório, vá em **Settings → Pages**.
3. Em **Source**, selecione a branch `main` e a pasta `/ (root)`.
4. Salve. Em alguns minutos o site estará disponível em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

## 🗂️ Estrutura do projeto

```
.
├── index.html   # estrutura da página
├── style.css    # todo o visual (papel A4, editor, cores da marca)
├── app.js       # lógica: estado, edição, prévia, impressão e PDF
└── README.md
```

## 🛠️ Personalizar

- **Dados da empresa** (nome, telefone, e-mail, CNPJ): edite o bloco `.paper-header` dentro de `renderPreview()` em `app.js`, e o cabeçalho `.brand-lockup` em `index.html`.
- **Cores**: variáveis CSS no topo de `style.css` (`--navy`, `--ink`, `--muted` etc.).
- **Exemplo padrão** (serviços/equipamentos pré-preenchidos ao carregar): funções `seedServices()` e `seedEquipment()` em `app.js`.

## 📄 Sobre o PDF

O botão **Baixar PDF** usa as bibliotecas [html2canvas](https://github.com/niklasvh/html2canvas) e [jsPDF](https://github.com/parallax/jsPDF), carregadas via CDN — por isso é necessária conexão com a internet para essa função. O botão **Imprimir** funciona mesmo offline, usando o recurso nativo de impressão do navegador (que também permite "Salvar como PDF").

## Licença

MIT — veja o arquivo [LICENSE](./LICENSE).
