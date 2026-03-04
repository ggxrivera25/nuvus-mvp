# Nuvus 

Special project
## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Deploy to GitHub Pages

Deployment happens automatically when you push to `main`. The GitHub Action will build and deploy for you.

### First-time setup:

1. Push this repo to GitHub
2. Go to your repo → **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Push any commit to `main` — the action will run and deploy

Your site will be live at: `https://YOUR_USERNAME.github.io/nuvus-mvp/`

### Important:

If your repo name is different from `nuvus-mvp`, update the `base` value in `vite.config.js`:

```js
base: '/your-repo-name/',
```
