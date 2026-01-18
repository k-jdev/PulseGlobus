const formatCents = (price: number): string => {
  return (price * 100).toFixed(1) + "¢";
};

const formatCurrency = (num: number): string => {
  if (num >= 1000000) return "$" + (num / 1000000).toFixed(1) + "m";
  if (num >= 1000) return "$" + Math.round(num / 1000) + "k";
  return "$" + Math.round(num);
};

const formatNewsDate = (dateStr?: string): string => {
  if (!dateStr) return "";

  // GDELT format: 20260116T013000Z
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  const hour = dateStr.substring(9, 11);
  const minute = dateStr.substring(11, 13);

  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00Z`);

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const createNewsPopupContent = (
  properties: Record<string, any>
): string => {
  const title = properties.title || "Untitled News";
  const image = properties.image;
  const domain = properties.domain || "";
  const sourcecountry = properties.sourcecountry || "";
  const seendate = properties.seendate;
  const url = properties.url || properties.slug || "#";

  return `
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #ffffff;
      border: 1px solid #e9edf8;
      border-radius: 14px;
      padding: 20px 24px;
      min-width: 360px;
      max-width: 420px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      animation: popupFadeIn 0.2s ease-out;
    ">
      <style>
        @keyframes popupFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      </style>
      <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px;">
        ${
          image
            ? `
          <div style="
            width: 54px;
            height: 54px;
            border-radius: 7px;
            overflow: hidden;
            flex-shrink: 0;
          ">
            <img src="${image}" alt="" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'"/>
          </div>
        `
            : ""
        }
        <h3 style="
          font-size: 19px;
          font-weight: 600;
          color: #1b2430;
          line-height: 26px;
          letter-spacing: -0.4px;
          margin: 0;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        ">${title}</h3>
      </div>
      
      <div style="height: 1px; background: #e4e4e4; width: 100%; margin-bottom: 12px;"></div>
      
      <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
        ${
          domain
            ? `
          <div style="padding: 4px 12px; background: #f5f5f5; border-radius: 999px;">
            <span style="color: #808080; font-size: 14px; font-weight: 500;">${domain}</span>
          </div>
        `
            : ""
        }
        ${
          sourcecountry
            ? `
          <div style="padding: 4px 12px; background: #f5f5f5; border-radius: 999px;">
            <span style="color: #808080; font-size: 14px; font-weight: 500;">${sourcecountry}</span>
          </div>
        `
            : ""
        }
        ${
          seendate
            ? `
          <div style="display: flex; align-items: center; gap: 4px; padding: 4px 12px; background: #f1f7ff; border-radius: 999px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1452f0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style="color: #1452f0; font-size: 14px; font-weight: 500;">${formatNewsDate(
              seendate
            )}</span>
          </div>
        `
            : ""
        }
      </div>
      
      <a href="${url}" target="_blank" rel="noopener noreferrer" style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 16px 24px;
        background: #1452f0;
        border-radius: 999px;
        color: white;
        text-decoration: none;
        font-size: 16px;
        font-weight: 600;
        letter-spacing: -0.32px;
        box-sizing: border-box;
      ">
        <span>Read article</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>
    </div>
  `;
};

export const createMarketPopupContent = (
  properties: Record<string, any>
): string => {
  const isMultiMarket =
    properties.isMultiMarket === true || properties.isMultiMarket === "true";
  const eventOutcomes = properties.eventOutcomes
    ? typeof properties.eventOutcomes === "string"
      ? JSON.parse(properties.eventOutcomes)
      : properties.eventOutcomes
    : null;

  const volume = parseFloat(properties.volume) || 0;
  const volume24hr = parseFloat(properties.volume24hr) || 0;
  const displayVolume = volume && volume > 0 ? volume : volume24hr;

  let outcomesData;

  if (isMultiMarket && eventOutcomes && eventOutcomes.length > 0) {
    outcomesData = eventOutcomes.map((outcome: any) => {
      const price = outcome.price || 0;
      return {
        name: outcome.name,
        percentage: outcome.percentage || Math.round(price * 100),
        buyPrice: formatCents(price),
        sellPrice: formatCents(1 - price),
        volume: outcome.volume,
        marketSlug: outcome.marketSlug,
      };
    });
  } else {
    const outcomes = JSON.parse(properties.outcomes || "[]");
    const prices = JSON.parse(properties.outcomePrices || "[]");

    outcomesData = outcomes.map((outcome: string, idx: number) => {
      const price = prices[idx] || 0;
      const percentage = (price * 100).toFixed(0);
      const buyPrice = formatCents(price);
      const sellPrice = formatCents(1 - price);

      return {
        name: outcome,
        percentage: parseInt(percentage),
        buyPrice,
        sellPrice,
      };
    });
  }

  const title = properties.title || "Untitled Market";
  const image = properties.image;
  const slug = properties.slug;
  const eventSlug = properties.eventSlug;

  // Check if it's a binary Yes/No market
  const isBinaryMarket =
    outcomesData.length === 2 &&
    outcomesData.some((o: any) => o.name.toLowerCase() === "yes") &&
    outcomesData.some((o: any) => o.name.toLowerCase() === "no");

  const yesOutcome = outcomesData.find(
    (o: any) => o.name.toLowerCase() === "yes"
  );
  const noOutcome = outcomesData.find(
    (o: any) => o.name.toLowerCase() === "no"
  );

  const marketUrl =
    eventSlug && eventSlug !== slug
      ? `https://polymarket.com/event/${eventSlug}/${slug}`
      : `https://polymarket.com/event/${slug}`;

  // Build outcomes HTML
  let outcomesHtml = "";

  if (isBinaryMarket && yesOutcome && noOutcome) {
    outcomesHtml = `
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="flex: 1; display: flex; align-items: center;">
            <span style="font-size: 16px; font-weight: 500; letter-spacing: -0.32px;">
              <span style="color: #1b2430;">Chance </span>
              <span style="color: #bbbdc1;">%</span>
            </span>
          </div>
          <div style="flex: 1; display: flex; align-items: center; gap: 12px;">
            <span style="color: #1b2430; font-size: 20px; font-weight: 600; letter-spacing: -0.4px;">
              ${yesOutcome.percentage}%
            </span>
            <div style="flex: 1; height: 6px; background: #ececec; border-radius: 41px; overflow: hidden;">
              <div style="height: 100%; background: #1452f0; width: ${yesOutcome.percentage}%;"></div>
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <div style="flex: 1; height: 46px; background: #f1f7ff; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
            <span style="color: #1452f0; font-size: 16px; font-weight: 600; letter-spacing: -0.32px;">
              ${yesOutcome.buyPrice}
            </span>
          </div>
          <div style="flex: 1; height: 46px; background: #ffebeb; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
            <span style="color: #ee1616; font-size: 16px; font-weight: 600; letter-spacing: -0.32px;">
              ${noOutcome.buyPrice}
            </span>
          </div>
        </div>
      </div>
    `;
  } else {
    const outcomesListStyle =
      outcomesData.length > 2 ? "max-height: 100px; overflow-y: auto;" : "";

    outcomesHtml = `
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; ${outcomesListStyle}">
        ${outcomesData
          .map(
            (outcome: any) => `
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="color: #1b2430; font-size: 16px; font-weight: 500; letter-spacing: -0.32px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;" title="${outcome.name}">
              ${outcome.name}
            </span>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #1b2430; font-size: 20px; font-weight: 600; letter-spacing: -0.4px;">
                ${outcome.percentage}%
              </span>
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 54px; background: #f1f7ff; border-radius: 4px; padding: 10px 12px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: #1452f0; font-size: 14px; font-weight: 600; letter-spacing: -0.28px;">
                    ${outcome.buyPrice}
                  </span>
                </div>
                <div style="width: 54px; background: #ffebeb; border-radius: 4px; padding: 10px 12px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: #ee1616; font-size: 14px; font-weight: 600; letter-spacing: -0.28px;">
                    ${outcome.sellPrice}
                  </span>
                </div>
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  return `
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #ffffff;
      border: 1px solid #e9edf8;
      border-radius: 14px;
      padding: 20px 24px;
      min-width: 360px;
      max-width: 420px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      animation: popupFadeIn 0.2s ease-out;
    ">
      <style>
        @keyframes popupFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      </style>
      
      <!-- Header with image and title -->
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
        ${
          image
            ? `
          <div style="width: 54px; height: 54px; border-radius: 7px; overflow: hidden; flex-shrink: 0;">
            <img src="${image}" alt="" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'"/>
          </div>
        `
            : ""
        }
        <h3 style="font-size: 19px; font-weight: 600; color: #1b2430; line-height: 30px; letter-spacing: -0.4px; margin: 0; flex: 1;">
          ${title}
        </h3>
      </div>

      ${outcomesHtml}

      <!-- Volume and metadata -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="height: 1px; background: #e4e4e4; width: 100%;"></div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="padding: 4px 12px; background: #f5f5f5; border-radius: 999px;">
              <span style="color: #808080; font-size: 14px; font-weight: 500; line-height: 21px; letter-spacing: -0.28px;">
                ${formatCurrency(displayVolume)} Vol.
              </span>
            </div>
            <div style="padding: 4px 12px; background: #f5f5f5; border-radius: 999px;">
              <span style="color: #808080; font-size: 14px; font-weight: 500; line-height: 21px; letter-spacing: -0.28px;">
                Weekly
              </span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14.6649 4.66626L8.99884 10.3323L5.66587 6.99934L1.33301 11.3322" stroke="#53BB33" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10.6655 4.66626H14.6655V8.66626" stroke="#53BB33" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" style="cursor: pointer;">
            <path d="M15 4.5L11 8.5L7 10L5.5 11.5L12.5 18.5L14 17L15.5 13L19.5 9M9 15L4.5 19.5M14.5 4L20 9.5" stroke="#BBBDC1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <!-- CTA Button -->
      <a href="${marketUrl}" target="_blank" rel="noopener noreferrer" style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        margin-top: 12px;
        padding: 16px 24px;
        background: #1452f0;
        border-radius: 999px;
        color: white;
        text-decoration: none;
        font-size: 16px;
        font-weight: 600;
        letter-spacing: -0.32px;
        box-sizing: border-box;
        transition: background 0.2s;
      " onmouseover="this.style.background='#1240c0'" onmouseout="this.style.background='#1452f0'">
        <span>View market</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>
    </div>
  `;
};

export const createPopupContent = (properties: Record<string, any>): string => {
  // Check if it's a news item
  if (properties.type === "news") {
    return createNewsPopupContent(properties);
  }

  // Check if it's a market
  if (
    properties.outcomes ||
    properties.outcomePrices ||
    (properties.slug && properties.type === "market")
  ) {
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
