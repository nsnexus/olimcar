# Deploy

O site é servido estático (pasta `public/`). O host não manda header de cache
curto nos `.js`, então quem já visitou fica preso numa versão antiga (vê
"página não encontrada" quando uma rota nova entra).

## Antes de CADA deploy

```bash
node scripts/bump-version.js
```

Isso carimba um `?v=<timestamp>` novo em:

- `<script src="/js/app.js">` e `/js/tv.js` (em `index.html` / `tv.html`)
- todos os `import` relativos dentro de `public/js`

Com URL nova, o navegador de todo mundo baixa os arquivos atualizados.

Commite os arquivos alterados junto com a sua mudança, depois publique a
pasta `public/`.

## Regras do Firestore / Storage

Mudou `firestore.rules` ou `storage.rules`? Rode também:

```bash
npx firebase deploy --only firestore:rules
npx firebase deploy --only storage
```
