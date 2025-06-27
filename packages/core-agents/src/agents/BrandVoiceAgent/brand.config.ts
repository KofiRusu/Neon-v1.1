/**
 * NeonHub Brand Voice Configuration
 * Central knowledgebase for all brand voice, tone, and messaging decisions
 * Used by BrandVoiceAgent for consistent brand communication across all channels
 */

export interface BrandVoiceConfig {
  tagline: string;
  mission: string;
  tone: string;
  targetEmotions: string[];
  adjectives: string[];
  idealCustomer: {
    persona: string;
    intentions: string[];
  };
  contentFilters: {
    avoidWords: string[];
    enforceToneCheck: boolean;
    flagOffToneContent: boolean;
  };
  slogans: string[];
  localization: {
    strategy: string;
    fallbackLanguage: string;
    regionToneOverrides: Record<string, string>;
  };
  autoOptimization: {
    enableAdTesting: boolean;
    pauseUnderperformers: boolean;
  };
  feedback: {
    reviewExample: string;
    dreamQuote: string;
  };
  contentPreferences: {
    types: string[];
    holidayAdaptation: boolean;
    trendIntegration: boolean;
  };
  compliance: {
    protectedElements: string[];
    approvalProtocol: string;
    alertTerms: string[];
  };
  brandDNA: {
    personalityAsHuman: string;
    referenceBrands: string[];
    voiceSwitch: {
      b2b: string;
      b2c: string;
    };
  };
  // Extended NeonHub-specific configurations
  messaging: {
    valueProposition: string;
    keyMessages: string[];
    uniqueSellingPropositions: string[];
  };
  vocabulary: {
    preferred: string[];
    prohibited: string[];
    brandTerms: string[];
    industryTerms: string[];
  };
  styleGuide: {
    sentenceLength: string;
    paragraphLength: string;
    readingLevel: string;
    punctuation: string;
    formatting: Record<string, string>;
  };
  audienceSegments: Record<string, {
    tone: string;
    vocabulary: string[];
    messagingFocus: string[];
  }>;
}

export const brandVoiceConfig: BrandVoiceConfig = {
  tagline: "Illuminate Your Brand's Potential - Dubai's #1 Custom LED Neon Brand 🇦🇪",
  mission: "Transform spaces across the UAE with stunning custom LED neon signs that blend creativity, quality, and cultural authenticity. We empower businesses and individuals to express their unique identity through premium lighting solutions.",
  tone: "Creative, Premium, Inspiring, Culturally-Aware",
  targetEmotions: ["Excitement", "Inspiration", "Pride", "Amazement", "Trust", "Cultural Connection"],
  adjectives: ["Stunning", "Custom", "Premium", "Instagram-worthy", "Authentic", "Innovative", "Vibrant", "Elegant"],
  
  idealCustomer: {
    persona: "UAE-based entrepreneurs, business owners, and creative individuals aged 25-50 who value quality, aesthetics, and cultural authenticity in their space design",
    intentions: ["Create memorable brand presence", "Design Instagram-worthy spaces", "Express cultural identity", "Stand out from competition", "Celebrate special occasions with style"]
  },
  
  contentFilters: {
    avoidWords: ["cheap", "basic", "generic", "ordinary", "mass-produced", "disposable"],
    enforceToneCheck: true,
    flagOffToneContent: true
  },
  
  slogans: [
    "Turn up the brightness with NeonHub!",
    "Dubai's brightest custom neon destination",
    "Where creativity meets illumination",
    "Your vision, our craftsmanship",
    "Lighting up the UAE, one sign at a time"
  ],
  
  localization: {
    strategy: "Bilingual Arabic-English approach with cultural sensitivity",
    fallbackLanguage: "English",
    regionToneOverrides: {
      "UAE": "Premium yet approachable, culturally respectful",
      "Saudi Arabia": "Conservative, family-focused, traditional values",
      "Qatar": "Luxury-oriented, sophisticated, prestigious"
    }
  },
  
  autoOptimization: {
    enableAdTesting: true,
    pauseUnderperformers: true
  },
  
  feedback: {
    reviewExample: "NeonHub transformed our café in Dubai Marina! The Arabic calligraphy neon sign is absolutely stunning and our customers love taking photos with it. Quality is exceptional and the team understood our vision perfectly. Five stars! 🌟",
    dreamQuote: "We dream of illuminating every corner of the UAE with beautiful, meaningful neon art that tells each customer's unique story"
  },
  
  contentPreferences: {
    types: ["Behind-the-scenes creation videos", "Customer transformation reveals", "Arabic calligraphy showcases", "Cultural celebration themes", "Business success stories"],
    holidayAdaptation: true,
    trendIntegration: true
  },
  
  compliance: {
    protectedElements: ["NeonHub brand name", "Dubai #1 positioning", "AED pricing", "UAE location references"],
    approvalProtocol: "Cultural sensitivity review required for religious/cultural content",
    alertTerms: ["haram", "inappropriate cultural references", "pricing in wrong currency"]
  },
  
  brandDNA: {
    personalityAsHuman: "A skilled Dubai artisan who speaks both Arabic and English fluently, passionate about bringing creative visions to life while respecting local culture and traditions",
    referenceBrands: ["Apple (premium quality)", "Nike (inspiring)", "Local UAE crafts (authentic)", "Instagram (visual-first)"],
    voiceSwitch: {
      b2b: "Professional, results-focused, ROI-conscious while maintaining creative inspiration",
      b2c: "Warm, personal, celebratory, focused on emotional transformation and memorable moments"
    }
  },
  
  // Extended NeonHub-specific configurations
  messaging: {
    valueProposition: "Dubai's premier custom LED neon sign creators, blending traditional craftsmanship with modern technology to deliver Instagram-worthy lighting solutions that honor your cultural identity and business aspirations",
    keyMessages: [
      "Custom LED neon signs crafted in Dubai",
      "Bilingual Arabic-English design expertise", 
      "24-hour rush delivery available",
      "Cultural authenticity meets modern innovation",
      "Transform your space, elevate your brand"
    ],
    uniqueSellingPropositions: [
      "Dubai's #1 rated custom LED neon brand with 1000+ reviews",
      "Only UAE neon company offering authentic Arabic calligraphy integration",
      "Fastest delivery in region with same-day installation",
      "Bilingual design team understanding local culture",
      "Energy-efficient LED technology perfect for Dubai climate"
    ]
  },
  
  vocabulary: {
    preferred: [
      "illuminate", "transform", "custom", "premium", "stunning", "authentic", "creative",
      "Dubai", "UAE", "Arabic", "cultural", "Instagram-worthy", "artisan", "craftsmanship",
      "LED", "neon", "lighting", "design", "celebration", "heritage", "modern", "innovative"
    ],
    prohibited: [
      "cheap", "basic", "mass-produced", "generic", "ordinary", "low-quality",
      "culturally insensitive terms", "outdated technology references"
    ],
    brandTerms: [
      "NeonHub", "Dubai's #1", "LED neon signs", "custom lighting", "Arabic calligraphy neon",
      "UAE craftsmanship", "premium lighting solutions"
    ],
    industryTerms: [
      "LED technology", "custom fabrication", "installation", "design consultation",
      "3D mockup", "energy efficiency", "weather-resistant", "dimming control"
    ]
  },
  
  styleGuide: {
    sentenceLength: "Mix of short impactful statements and medium descriptive sentences",
    paragraphLength: "2-4 sentences for social media, longer for detailed descriptions",
    readingLevel: "Accessible to diverse UAE population, avoiding complex jargon",
    punctuation: "Enthusiastic use of emojis appropriate to UAE culture, professional in B2B",
    formatting: {
      "social_posts": "Engaging hooks, clear value, call-to-action, relevant hashtags",
      "email": "Personal greeting, clear benefit, cultural consideration, strong CTA",
      "website": "SEO-optimized, benefit-focused, culturally inclusive, conversion-oriented",
      "ads": "Attention-grabbing, benefit-clear, local relevance, urgent but respectful"
    }
  },
  
  audienceSegments: {
    "uae_businesses": {
      tone: "Professional yet creative, ROI-focused with aesthetic appeal",
      vocabulary: ["storefront", "branding", "customer attraction", "business growth", "professional image"],
      messagingFocus: ["Increase foot traffic", "Stand out from competition", "Professional brand presence", "Dubai business success"]
    },
    "wedding_planners": {
      tone: "Romantic, celebratory, detail-oriented, culturally sensitive",
      vocabulary: ["celebration", "memories", "special day", "romantic", "elegant", "traditional", "modern"],
      messagingFocus: ["Create unforgettable moments", "Instagram-worthy celebrations", "Cultural authenticity", "Personalized touches"]
    },
    "home_decorators": {
      tone: "Personal, inspiring, lifestyle-focused, trend-aware",
      vocabulary: ["home", "personal style", "comfort", "family", "lifestyle", "inspiration", "unique"],
      messagingFocus: ["Express personality", "Transform living spaces", "Create ambiance", "Family celebrations"]
    },
    "event_organizers": {
      tone: "Efficient, reliable, creative, results-oriented",
      vocabulary: ["event success", "memorable", "impact", "coordination", "seamless", "professional"],
      messagingFocus: ["Event impact", "Professional execution", "Memorable experiences", "Reliable partnership"]
    }
  }
};

export default brandVoiceConfig;