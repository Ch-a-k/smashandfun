/**
 * Google Ads OAuth2 — получение refresh_token
 *
 * Не храни client id/secret в репозитории — только в .env (см. .env.example).
 *
 * Запуск (Node 20.6+), те же имена что в API (GOOGLE_ADS_CLIENT_ID / SECRET):
 *   node --env-file=.env.local scripts/google-ads-auth.js
 *
 * 1. Откроется ссылка — перейди по ней в браузере
 * 2. Разреши доступ к Google Ads
 * 3. Callback на localhost — код обменивается автоматически
 * 4. Получишь refresh_token — добавь в .env как GOOGLE_ADS_REFRESH_TOKEN
 */

const http = require('http');
const url = require('url');

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3456/callback';
const SCOPES = 'https://www.googleapis.com/auth/adwords';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\nЗадай переменные окружения:');
  console.error('  GOOGLE_ADS_CLIENT_ID');
  console.error('  GOOGLE_ADS_CLIENT_SECRET');
  console.error('\nПример: node --env-file=.env.local scripts/google-ads-auth.js\n');
  process.exit(1);
}

// Step 1: Generate auth URL
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&access_type=offline` +
  `&prompt=consent`;

console.log('\n====================================');
console.log('Google Ads OAuth2 Authorization');
console.log('====================================\n');
console.log('Открой эту ссылку в браузере:\n');
console.log(authUrl);
console.log('\nЖду callback на http://localhost:3456 ...\n');

// Step 2: Start local server to catch the callback
const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);

  if (parsed.pathname === '/callback') {
    const code = parsed.query.code;

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>Ошибка: нет кода авторизации</h1>');
      return;
    }

    console.log('Получен код авторизации! Обмениваю на refresh_token...\n');

    // Step 3: Exchange code for tokens
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenRes.json();

      if (tokenData.refresh_token) {
        console.log('====================================');
        console.log('REFRESH TOKEN ПОЛУЧЕН!');
        console.log('====================================\n');
        console.log('Refresh Token:');
        console.log(tokenData.refresh_token);
        console.log('\nДобавь в .env файл:');
        console.log(`GOOGLE_ADS_REFRESH_TOKEN=${tokenData.refresh_token}`);
        console.log('');

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <html><body style="background:#1a1a2e;color:#fff;font-family:monospace;padding:40px;text-align:center">
            <h1 style="color:#4caf50">✓ Авторизация успешна!</h1>
            <p>Refresh token получен. Проверь терминал.</p>
            <p style="color:#888">Можешь закрыть эту вкладку.</p>
          </body></html>
        `);
      } else {
        console.log('Ошибка получения refresh token:');
        console.log(JSON.stringify(tokenData, null, 2));

        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h1>Ошибка</h1><pre>${JSON.stringify(tokenData, null, 2)}</pre>`);
      }
    } catch (err) {
      console.log('Ошибка:', err);
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>Ошибка</h1><pre>${err}</pre>`);
    }

    // Close server after getting token
    setTimeout(() => {
      server.close();
      process.exit(0);
    }, 1000);
  }
});

server.listen(3456, () => {
  // Try to open browser automatically
  const { exec } = require('child_process');
  const platform = process.platform;
  const openCmd = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${openCmd} "${authUrl}"`);
});
