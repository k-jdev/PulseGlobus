export const createPopupContent = (properties: Record<string, any>): string => {
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
