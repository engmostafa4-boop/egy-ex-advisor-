import React from 'react';

export default function TradingViewChart({ symbol }: { symbol: string }) {
  // Mapping the symbol directly to Egyptian Exchange (EGX) in the iframe
  const iframeSrc = `https://www.tradingview.com/widgetembed/?symbol=EGX:${symbol}&interval=D&theme=dark`;

  return (
    <div className='tradingview-widget-container' style={{ height: "100%", width: "100%" }}>
      <iframe 
        src={iframeSrc}
        width="100%" 
        height="100%"
        style={{ border: "none", borderRadius: "1.4rem" }}
        title={`${symbol} TradingView Chart`}
      ></iframe>
    </div>
  );
}
