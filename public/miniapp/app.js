const API_URL = window.location.origin; // автоматически берёт адрес Render

let chartInstance = null;

async function scan() {
  const status = document.getElementById('status');
  const resultsDiv = document.getElementById('results');
  status.textContent = '🔄 Сканирую Binance...';

  try {
    const res = await fetch(`${API_URL}/api/scan`);
    const data = await res.json();

    resultsDiv.innerHTML = '';

    if (data.length === 0) {
      resultsDiv.innerHTML = '<p style="text-align:center; color:#aaa;">Пока ничего интересного не найдено</p>';
      status.textContent = 'Готово';
      return;
    }

    data.forEach(coin => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-info">
          <h3>${coin.symbol}</h3>
          <p>Цена: ${parseFloat(coin.currentPrice).toFixed(4)} USDT</p>
        </div>
        <div class="score">
          <span>${coin.score}</span><br>
          <span class="volume">vol ×${coin.volumeGrowth}</span>
        </div>
      `;
      card.onclick = () => showChart(coin.symbol);
      resultsDiv.appendChild(card);
    });

    status.textContent = `Найдено ${data.length} сигналов`;
  } catch (e) {
    status.textContent = 'Ошибка соединения';
    console.error(e);
  }
}

async function showChart(symbol) {
  document.getElementById('chartContainer').style.display = 'block';
  document.getElementById('chartSymbol').textContent = symbol + ' — график цены (1h)';

  // Здесь можно добавить реальный график позже. Пока заглушка
  const ctx = document.getElementById('priceChart');
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array(20).fill('').map((_, i) => i + 'h'),
      datasets: [{
        label: 'Цена',
        data: Array(20).fill(0).map(() => Math.random() * 10 + 0.1),
        borderColor: '#00ff9d',
        tension: 0.4
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}

document.getElementById('scanBtn').addEventListener('click', scan);
document.getElementById('closeChart').addEventListener('click', () => {
  document.getElementById('chartContainer').style.display = 'none';
});

// Первый скан при открытии
scan();
