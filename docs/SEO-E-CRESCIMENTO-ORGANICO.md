# SEO e crescimento orgânico – SAX Site

Este documento resume o que foi implementado para **ranqueamento no Google** e **performance para anúncios**, e como aproveitar a **hierarquia cidade → construtora/empreendimento**.

---

## O que foi implementado

### 1. Sitemap e robots
- **`/sitemap.xml`** – gerado automaticamente com:
  - Páginas estáticas (home, imóveis, blog, sobre, contato, etc.)
  - **Cada imóvel** → `/imovel/[slug]`
  - **Cidades** → `/cidade/[slug]` (hierarquia local)
  - **Bairros** → `/bairro/[slug]`
  - **Posts do blog** → `/blog/[slug]`
- **`/robots.txt`** – permite todo o site e aponta para o sitemap. Áreas de edição (`/blog/*/edit/`) são bloqueadas.

### 2. Dados estruturados (JSON-LD)
- **RealEstateAgent** no layout: identifica a imobiliária para o Google (Knowledge Panel, E-E-A-T).
- **Product + Offer + Place** em cada página de imóvel: preço, endereço (cidade, bairro), imagem e URL. Ajuda em buscas por “imóvel cidade X” e rich results.

### 3. Meta tags e SEO por página
- **Layout global**: título, descrição, Open Graph, Twitter Card, `metadataBase`, canonical.
- **Páginas dinâmicas**:
  - **Imóvel** – título, descrição, imagem de capa, **keywords** (cidade, bairro, tipo).
  - **Cidade** – título “Imóveis em [Cidade]”, descrição e keywords focados na cidade.
  - **Blog (post)** – título, descrição, canonical e imagem da capa quando existir.
- **Campo `keywords`** em `buildMetadata`: usado em listagem de imóveis, página de cidade e página do imóvel.

### 4. Hierarquia cidade → construtora → empreendimento

A estrutura de URLs já segue uma ordem que favorece SEO local e por empreendimento:

| Nível        | URL              | Uso sugerido |
|-------------|------------------|--------------|
| **Cidade**  | `/cidade/[slug]` | “Imóveis em Florianópolis”, “apartamento São Paulo” |
| **Bairro**  | `/bairro/[slug]` | “Imóveis no bairro X”, refinamento por região |
| **Imóvel**  | `/imovel/[slug]` | Cada imóvel/empreendimento com título, cidade, bairro, construtora (se houver) |

No **imóvel** já existem:
- `address.city`, `address.neighborhood` → usados em meta e JSON-LD (Place).
- `builder` (construtora) no tipo – pode ser exibido na página e incluído em keywords/metadata se quiser reforçar “construtora X” ou “empreendimento Y”.

Recomendações para o cliente:
1. **Cidades e bairros**: manter listas de cidades/bairros com slug estável; as páginas `/cidade/...` e `/bairro/...` já estão no sitemap.
2. **Construtora/empreendimento**: usar o campo **construtora** no imóvel e, na descrição/título do imóvel, incluir nome do empreendimento e da construtora quando fizer sentido.
3. **Conteúdo nas páginas de cidade**: a página `/cidade/[slug]` pode ganhar texto único (qualidade de vida, regiões, destaques) para melhorar relevância e E-E-A-T.

---

## Performance para anúncios (Google Ads / Meta)

- **GTM e GA**: o layout já carrega Google Tag Manager e Google Analytics quando `NEXT_PUBLIC_GTM_ID` e `NEXT_PUBLIC_GA_ID` estão definidos.
- **Meta Pixel**: carregado quando `NEXT_PUBLIC_META_PIXEL_ID` está definido.
- **Conversões**: configurar eventos (lead, clique em WhatsApp, etc.) no GTM ou no gtag e enviar para o Google Ads e para o Pixel conforme a estratégia de anúncios.

---

## Checklist rápido para o cliente

- [ ] Definir **NEXT_PUBLIC_SITE_URL** em produção (URL final do site).
- [ ] Revisar **config/site.ts**: nome, descrição e redes sociais.
- [ ] Ter **imagem padrão** para redes sociais (ex.: `/og.jpg` no root público).
- [ ] Preencher **cidades e bairros** no backend para que apareçam no sitemap.
- [ ] Usar **títulos e descrições únicos** por imóvel e por cidade.
- [ ] No PDV, preencher **construtora** e **nome do empreendimento** nos imóveis quando aplicável.
- [ ] Enviar **sitemap** no Google Search Console: `https://seusite.com/sitemap.xml`.

### 5. Blog: Article + Breadcrumbs + keywords
- **JSON-LD Article** em cada post: headline, author, datePublished, dateModified, image, publisher. Ajuda em rich results do Google.
- **Breadcrumbs** em todas as páginas relevantes, com **BreadcrumbList** em JSON-LD:
  - **Imóveis**: Início > Imóveis
  - **Imóvel**: Imóveis > [título do imóvel]
  - **Cidade**: Imóveis > Cidade: [nome]
  - **Bairro**: Imóveis > Bairro: [nome]
  - **Blog**: Início > Blog
  - **Post**: Blog > [título do post]
- **Keywords por post**: as tags do post são enviadas como meta keywords na página do post.
