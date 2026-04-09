const express = require('express');
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");
const path = require('path');

const TOKEN = "ВСТАВЬ_СВОЙ_ТОКЕН";
const CHAT_ID = "ВСТАВЬ_СВОЙ_CHAT_ID";

const bot = new TelegramBot(TOKEN);
const app = express();

const BASE_URL = "https://api.binance.com";
const PORT = process.env.PORT || 3000;

// ✅ Отдаём статические файлы Mini App
app.use(express.static(path.join(__dirname, 'public')));

// Health-check
app.get('/', (req, res) => res.send('✅ Crypto Mini App is running!'));
app.get('/health', (req, res) => res.status(200).send('OK'));

// ✅ API для Mini App
app.get('/api/scan', async (req, res) => {
  try {
    const pairs = await getPairs();
    const results = [];

    for (let i = 0; i < Math.min(150, pairs.length); i++) {
      const symbol = pairs[i];
      try {
        await new Promise(r => setTimeout(r, 100));
        const candles = await getCandles(symbol);
        const analysis = analyze(candles);

        if (analysis.distance < 0.25 && analysis.volumeGrowth > 1.8 && analysis.avgVolume > 50000) {
          const score = (1 - analysis.distance) * 0.55 + analysis.volumeGrowth * 0.45;
          results.push({
            symbol,
            currentPrice: analysis.currentPrice,
            score: score.toFixed(2),
            volumeGrowth: analysis.volumeGrowth.toFixed(1)
          });
        }
      } catch (e) {}
    }

    results.sort((a, b) => b.score - a.score);
    res.json(results.slice(0, 7));
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сканирования' });
  }
});

function getPairs() { /* тот же код, что был раньше */ }
function getCandles(symbol) { /* тот же код */ }
function analyze(candles) { /* тот же код */ }

// Запуск бота и сервера
bot.onText(/\/start/, () => bot.sendMessage(CHAT_ID, 'Открывай Mini App 👉'));
app.listen(PORT, () => console.log(`🚀 Mini App запущен на порту ${PORT}`));
setInterval(() => scanAndNotify(), 5 * 60 * 1000); // старые уведомления в Telegram
console.log('🤖 Crypto Mini App готов!');
