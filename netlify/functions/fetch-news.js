exports.handler = async (event, context) => {
  try {
    const sampleData = {
      belgian: [
        {
          title: 'Belgian Retail Sees Growth in Soft Drinks Despite Health Trends',
          description: 'Soft drink sales in Belgium declined in volume but saw value growth in 2024 due to health-conscious consumers seeking diverse flavors.',
          priority: 'Medium',
          source: 'Euromonitor',
          topic: 'Retail',
          date: '2025-08-13',
          url: 'https://example.com/soft-drinks',
        },
        {
          title: 'Media Consolidation in Flanders and Wallonia',
          description: 'Mediahuis and DPG Media dominate Flemish news, while Rossel and IPM lead in Wallonia, with digital subscriptions up 4% in 2024.',
          priority: 'High',
          source: 'Reuters',
          topic: 'Media',
          date: '2025-06-17',
          url: 'https://example.com/media-consolidation',
        },
        {
          title: 'Knokke-Heist Store Pioneers New Retail Loyalty Model',
          description: 'A Belgian store introduces a loyalty model focused on community connection, challenging traditional price-based promotions.',
          priority: 'High',
          source: 'Other',
          topic: 'Retail',
          date: '2025-08-14',
          url: 'https://example.com/loyalty-model',
        },
        {
          title: 'Decline in Belgian Newspaper Readership',
          description: 'Combined print and digital readership dropped 2.7% in 2023, with quality newspapers like Le Soir seeing slight gains.',
          priority: 'Low',
          source: 'Reuters',
          topic: 'Media',
          date: '2023-06-14',
          url: 'https://example.com/newspaper-decline',
        },
        {
          title: 'Beer Consumption Falls in Belgium',
          description: 'Total beer consumption dropped by 2% in 2024, impacting local retailers and the Xtra App’s beverage category.',
          priority: 'Medium',
          source: 'Le Soir',
          topic: 'Consumer Behavior',
          date: '2025-02-06',
          url: 'https://example.com/beer-decline',
        },
      ],
      global: [
        {
          title: 'Global Retail Loyalty Trends Shift to Personalization',
          description: 'Retailers worldwide, including Colruyt, adopt personalized loyalty programs, influencing apps like Xtra.',
          priority: 'High',
          source: 'Forbes',
          topic: 'Retail',
          date: '2025-08-10',
          url: 'https://example.com/global-loyalty',
        },
        {
          title: 'European Media Giants Expand Digital Reach',
          description: 'Companies like Mediahuis expand digital subscriptions, competing with Colruyt’s Xtra app ecosystem.',
          priority: 'Medium',
          source: 'BBC',
          topic: 'Media',
          date: '2025-07-15',
          url: 'https://example.com/media-expansion',
        },
      ],
    };

    return {
      statusCode: 200,
      body: JSON.stringify(sampleData),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch news' }),
    };
  }
};
