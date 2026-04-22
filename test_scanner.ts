import fetch from "node-fetch";

async function test() {
  const response = await fetch('https://scanner.tradingview.com/egypt/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symbols: { tickers: ['EGX:COMI', 'EGX:EAST', 'EGX:FWRY', 'EGX:HRHO', 'EGX:TMGH', 'EGX:EKHO'] },
      columns: ['close', 'name', 'change', 'volume']
    })
  });
  console.log(JSON.stringify(await response.json(), null, 2));
}
test();
