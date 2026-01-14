const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toFixed(0);
};

export const createMarketPopupContent = (
  properties: Record<string, any>
): string => {
  const outcomes = JSON.parse(properties.outcomes || "[]");
  const prices = JSON.parse(properties.outcomePrices || "[]");
  const volume = parseFloat(properties.volume) || 0;
  const liquidity = parseFloat(properties.liquidity) || 0;

  const outcomesHtml = outcomes
    .map((outcome: string, idx: number) => {
      const price = prices[idx] || 0;
      const percentage = (price * 100).toFixed(0);
      const isYes = outcome.toLowerCase() === "yes";
      const isNo = outcome.toLowerCase() === "no";
      const color = isYes ? "#22c55e" : isNo ? "#ef4444" : "#3b82f6";

      return `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        margin-bottom: 6px;
      ">
        <span style="color: #e2e8f0; font-size: 13px;">${outcome}</span>
        <span style="
          color: ${color};
          font-weight: 700;
          font-size: 14px;
        ">${percentage}%</span>
      </div>
    `;
    })
    .join("");

  return `
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      background: linear-gradient(135deg, #1a2332 0%, #0f1720 100%);
      color: #ffffff;
      padding: 20px;
      border-radius: 16px;
      min-width: 300px;
      max-width: 380px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    ">
      ${
        properties.image
          ? `
        <div style="
          width: 100%;
          height: 120px;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 16px;
        ">
          <img src="${properties.image}" alt="" style="
            width: 100%;
            height: 100%;
            object-fit: cover;
          " />
        </div>
      `
          : ""
      }
      
      ${
        properties.eventTitle
          ? `
        <div style="
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #64748b;
          margin-bottom: 8px;
        ">${properties.eventTitle}</div>
      `
          : ""
      }
      
      <div style="
        font-size: 16px; 
        font-weight: 600; 
        margin-bottom: 16px;
        line-height: 1.4;
        color: #f1f5f9;
      ">${properties.title || "Untitled Market"}</div>
      
      ${
        properties.category
          ? `
        <div style="
          display: inline-block;
          padding: 4px 10px;
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          border-radius: 12px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        ">${properties.category}</div>
      `
          : ""
      }
      
      ${
        outcomesHtml
          ? `
        <div style="margin-bottom: 16px;">
          ${outcomesHtml}
        </div>
      `
          : ""
      }
      
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      ">
        <div style="
          text-align: center;
          padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        ">
          <div style="color: #64748b; font-size: 10px; text-transform: uppercase; margin-bottom: 4px;">Volume</div>
          <div style="color: #22c55e; font-weight: 700; font-size: 14px;">$${formatNumber(
            volume
          )}</div>
        </div>
        <div style="
          text-align: center;
          padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        ">
          <div style="color: #64748b; font-size: 10px; text-transform: uppercase; margin-bottom: 4px;">Liquidity</div>
          <div style="color: #3b82f6; font-weight: 700; font-size: 14px;">$${formatNumber(
            liquidity
          )}</div>
        </div>
      </div>
      
      <a href="https://polymarket.com/event/${
        properties.slug
      }" target="_blank" style="
        display: block;
        text-align: center;
        padding: 12px;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 13px;
        margin-top: 12px;
        transition: opacity 0.2s;
      ">View on Polymarket →</a>
    </div>
  `;
};

export const createPopupContent = (properties: Record<string, any>): string => {
  if (properties.outcomes || properties.outcomePrices || properties.slug) {
    return createMarketPopupContent(properties);
  }

  return `
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      background: linear-gradient(135deg, #1a2332 0%, #0f1720 100%);
      color: #ffffff;
      padding: 20px;
      border-radius: 16px;
      min-width: 280px;
      max-width: 320px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    ">
      <div style="
        font-size: 18px; 
        font-weight: 600; 
        margin-bottom: 16px;
        line-height: 1.4;
      ">${String(properties.name || "N/A")}</div>
      
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 8px;
      ">
        <span style="color: #a0aec0; font-size: 13px;">Code</span>
        <span style="font-size: 15px; font-weight: 600;">${String(
          properties.abbrev || properties.iata_code || "N/A"
        )}</span>
      </div>

      ${Object.entries(properties)
        .filter(
          ([key]) => key !== "name" && key !== "abbrev" && key !== "iata_code"
        )
        .slice(0, 5)
        .map(
          ([key, value]) => `
          <div style="
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 13px;
          ">
            <span style="color: #a0aec0;">${key}</span>
            <span style="color: #ffffff; font-weight: 500;">${String(
              value
            )}</span>
          </div>
        `
        )
        .join("")}
    </div>
  `;
};
