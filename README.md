# Escola de Administradores — Website v2

Segunda versão do site institucional da **Escola de Administradores**, redesenhada com base na linguagem visual do projeto MEI Financeiro: fundo claro, navegação simples, cards limpos, azul institucional e foco comercial.

## Destaques desta versão

- Identidade visual simplificada com o símbolo **EA**;
- Curso **Reforma Tributária do Consumo: IBS, CBS e os Impactos nas Empresas** em destaque no hero e em uma seção própria;
- Catálogo inicial com **3 e-books**;
- Grade de e-books preparada para crescer com novos cards;
- Links comerciais centralizados em um único arquivo para integração com checkout da **Kirvano**;
- Layout responsivo para desktop, tablet e celular;
- SEO básico, sitemap, robots.txt, 404 e headers para Cloudflare Pages;
- Animações leves com suporte a `prefers-reduced-motion`.

## Configurar os links da Kirvano

Abra:

```txt
assets/js/store.js
```

E substitua as strings vazias pelos links reais de checkout:

```js
window.EA_STORE = {
  "curso-reforma": "https://pay.kirvano.com/SEU-CODIGO",
  "ebook-reforma": "https://pay.kirvano.com/SEU-CODIGO",
  "ebook-dre": "https://pay.kirvano.com/SEU-CODIGO",
  "ebook-fluxo-caixa": "https://pay.kirvano.com/SEU-CODIGO"
};
```

Enquanto o link estiver vazio, o botão correspondente permanece desativado e exibe **Em breve**.

## Adicionar novos e-books

1. Duplique um bloco `<article class="ebook-card">` dentro da seção `#ebooks` do `index.html`.
2. Altere capa, coleção, título e descrição.
3. Crie uma nova chave em `assets/js/store.js`.
4. Use essa chave no atributo `data-checkout` do novo card.

O grid se reorganiza automaticamente em desktop, tablet e celular.

## Estrutura

```txt
.
├── index.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── _headers
├── README.md
└── assets/
    ├── css/
    │   └── styles.css
    ├── img/
    │   └── logo-ea.png
    └── js/
        ├── store.js
        └── main.js
```

## Visualização local

```bash
python -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Cloudflare Pages

O site é totalmente estático.

- Framework preset: `None`
- Build command: vazio
- Build output directory: `/`

