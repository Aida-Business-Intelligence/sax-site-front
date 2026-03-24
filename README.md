# sax-site-front

Site público da plataforma SAX. Exibe imóveis, lojas e informações institucionais.

- **Stack:** Next.js 16, React 19, TypeScript, Yarn
- **Backend:** [sax-backend](../sax-backend) (Express + Prisma + PostgreSQL)
- **Imagem Docker:** `aidabusiness/sax-site` (:latest | :dev)

## Setup local

```bash
cp .env.example .env.local
# editar .env.local com suas URLs
yarn install
yarn dev  # http://localhost:3000
```

### Variáveis de ambiente (`.env.example`)

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SAX_API_URL` | URL da API (`http://localhost:4000` em dev) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Token público do Mapbox (mapas de imóveis) |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site (SEO, sitemap, Open Graph) |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager (opcional) |

## Docker

```bash
docker build -t sax-site .
docker run -p 3000:3000 sax-site
```

O Dockerfile usa multi-stage com output standalone do Next.js. A variável `STANDALONE_BUILD=true` é setada automaticamente no build Docker — não afeta builds na Vercel.

## CI/CD

Push para `main` → CI builda `aidabusiness/sax-site:latest` e publica no DockerHub.
Push para `develop` → CI builda `aidabusiness/sax-site:dev`.

Deploy em produção via **Vercel** (automático ao push) ou via **Docker + Watchtower** no VPS.
