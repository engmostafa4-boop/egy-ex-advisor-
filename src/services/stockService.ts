import { Stock, egxStocks } from '../data/mockData';

// Function to fetch from TradingView / Mubasher or fallback to simulation
export async function getRealTimeStocks(): Promise<Stock[]> {
  const mubasherKey = import.meta.env.VITE_MUBASHER_API_KEY;
  const tradingViewKey = import.meta.env.VITE_TRADINGVIEW_API_KEY;
  const genericKey = import.meta.env.VITE_MARKET_DATA_API_KEY;

  try {
    // 1. Try Mubasher API if provided
    if (mubasherKey && mubasherKey !== 'YOUR_MUBASHER_KEY' && mubasherKey !== 'dummy') {
      try {
        const endpoint = import.meta.env.VITE_MUBASHER_ENDPOINT || 'https://api.mubasher.info/v1';
        return await fetchFromMubasher(endpoint, mubasherKey);
      } catch (e) {
        console.warn("Mubasher API failed, falling back to TradingView...", e);
      }
    }

    // 2. Try TradingView Free Scanner API (No key required for basic data)
    try {
      const tvData = await fetchFreeTradingViewScanner();
      if (tvData && tvData.length > 0) {
        return tvData;
      }
    } catch (e) {
      console.warn("TradingView free scanner failed, falling back...", e);
    }

    // 3. Optional Generic Fallback (from standard financial aggregators FMP/TwelveData)
    if (genericKey && genericKey !== 'YOUR_API_KEY_HERE') {
      return await fetchFromGenericProvider(genericKey);
    }

    // Fallback: Gracefully simulate data if no APIs are provided.
    return simulateLiveMarketData();

  } catch (error) {
    console.error("Live Market Error: Falling back to simulation", error);
    return simulateLiveMarketData();
  }
}

async function fetchFreeTradingViewScanner(): Promise<Stock[]> {
  const tickers = egxStocks.map(s => `EGX:${s.symbol}`);
  
  // Hit our local Express server endpoint to bypass CORS
  const response = await fetch('/api/market-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      symbols: {
        tickers: tickers
      },
      columns: ["close", "change", "volume", "Recommend.All"]
    })
  });

  if (!response.ok) throw new Error("Free TradingView Proxy Error");
  
  const data = await response.json();
  
  if (!data || !data.data || !Array.isArray(data.data)) {
    throw new Error("Invalid format from TradingView");
  }

  // Map TradingView data back to our Mock format
  return egxStocks.map(stock => {
    const tvStock = data.data.find((d: any) => d.s === `EGX:${stock.symbol}`);
    if (tvStock && tvStock.d) {
      const price = parseFloat(tvStock.d[0]);
      const changePercent = parseFloat(tvStock.d[1]);
      let volumeStr = stock.volume; // default
      // volume is now correctly at d[2] based on columns array requested above
      if (tvStock.d[2] !== null && tvStock.d[2] !== undefined) {
        const vol = parseFloat(tvStock.d[2]);
        if (!isNaN(vol)) {
           if (vol >= 1000000) volumeStr = (vol / 1000000).toFixed(1) + 'M';
           else if (vol >= 1000) volumeStr = (vol / 1000).toFixed(1) + 'K';
           else volumeStr = String(vol);
        }
      }

      return {
        ...stock,
        price: isNaN(price) ? stock.price : Number(price.toFixed(2)),
        changePercent: isNaN(changePercent) ? stock.changePercent : Number(changePercent.toFixed(2)),
        volume: volumeStr
      };
    }
    return stock;
  });
}

async function fetchFromMubasher(endpoint: string, apiKey: string): Promise<Stock[]> {
    const response = await fetch(`${endpoint}/market/prices/EGX`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!response.ok) throw new Error("Mubasher API Limit / Auth Error");
    const data = await response.json();
    return mergeData(data);
}

async function fetchFromGenericProvider(apiKey: string): Promise<Stock[]> {
    const symbols = egxStocks.map(s => s.symbol).join(',');
    const response = await fetch(`https://api.twelvedata.com/quote?symbol=${symbols}&apikey=${apiKey}`);
    if (!response.ok) throw new Error("Generic API Limit Reached or Error");
    const data = await response.json();
    return mergeData(data);
}

function mergeData(apiData: any): Stock[] {
    return egxStocks.map(stock => {
         const stockData = apiData[stock.symbol] || (apiData.data && apiData.data.find((d: any) => d.symbol === stock.symbol));
         if (stockData && (stockData.close || stockData.price)) {
             const price = parseFloat(stockData.close || stockData.price);
             const previousPrice = parseFloat(stockData.previous_close || stockData.prevPrice);
             const changePercent = ((price - previousPrice) / previousPrice) * 100;
             return {
                 ...stock,
                 price: isNaN(price) ? stock.price : price,
                 changePercent: isNaN(changePercent) ? stock.changePercent : Number(changePercent.toFixed(2))
             };
         }
         return stock;
    });
}

function simulateLiveMarketData(): Stock[] {
  return [...egxStocks].map(stock => {
    const randomChange = (Math.random() - 0.5) * 1; 
    const newPrice = stock.price + (stock.price * (randomChange / 100));
    return {
      ...stock,
      price: Number(newPrice.toFixed(2)),
      changePercent: Number((stock.changePercent + randomChange).toFixed(2))
    };
  });
}
