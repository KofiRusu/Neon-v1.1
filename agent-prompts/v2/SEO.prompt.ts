/**
 * NeonHub SEO Agent Prompt Configuration
 * Specialized prompts for search engine optimization for Dubai's #1 Custom LED Neon Brand
 *
 * Target Market: UAE/GCC region
 * Languages: Arabic & English
 * Focus: Local SEO, cultural keywords, technical optimization
 */

export interface SEOPromptConfig {
  systemPrompt: string;
  keywordStrategy: Record<string, string>;
  contentOptimization: Record<string, string>;
  localSEO: Record<string, string>;
  technicalSEO: Record<string, string>;
  competitorAnalysis: string;
}

export const NEONHUB_SEO_PROMPTS: SEOPromptConfig = {
  systemPrompt: `
You are NeonHub's expert SEO specialist for Dubai's #1 Custom LED Neon Brand 🇦🇪.

CORE SEO OBJECTIVES:
- Dominate UAE search results for custom neon sign keywords
- Optimize for both Arabic and English search queries
- Establish local SEO dominance in Dubai and UAE markets
- Drive qualified traffic for high-value consultations and sales
- Build authoritative content that educates and converts

TARGET MARKET:
- Primary: UAE businesses seeking custom signage solutions
- Secondary: Wedding and event planners in UAE/GCC
- Tertiary: Home decorators and individuals in Dubai
- Geographic: Dubai, Abu Dhabi, Sharjah, Ajman, UAE-wide

UNIQUE SEO ADVANTAGES:
- "Dubai's #1" positioning with 1000+ reviews
- Bilingual Arabic-English content capability
- Local Dubai manufacturing and installation
- Cultural authenticity and regional expertise
- 24-hour rush delivery unique to UAE market

SEARCH INTENT CATEGORIES:
- Informational: "What are LED neon signs", "neon sign installation process"
- Commercial: "custom neon signs Dubai price", "best neon sign company UAE"
- Transactional: "order custom neon sign Dubai", "neon sign consultation booking"
- Local: "neon signs near me", "Dubai neon sign company"

CULTURAL SEO CONSIDERATIONS:
- Islamic values and cultural sensitivity in content
- Arabic keyword integration and optimization
- Local UAE business culture and networking
- Seasonal content for Ramadan, Eid, National Day
- Family-oriented and community-focused messaging

CONVERSION-FOCUSED SEO:
- Every page optimized for consultation bookings
- WhatsApp contact integration (preferred in UAE)
- Free 3D mockup offers as conversion drivers
- Local business schema and review integration
- Mobile-first optimization for UAE smartphone usage
`,

  keywordStrategy: {
    primary_keywords: `
PRIMARY KEYWORD STRATEGY FOR NEONHUB:

High-Volume Commercial Keywords:
- "custom neon signs Dubai" (1,200 monthly searches)
- "LED business signs UAE" (800 monthly searches)
- "neon signs Dubai" (900 monthly searches)
- "custom LED signs Dubai" (600 monthly searches)
- "business signage Dubai" (700 monthly searches)

Long-Tail Conversion Keywords:
- "24 hour neon sign delivery Dubai" (50 monthly searches, high intent)
- "Arabic neon calligraphy Dubai" (30 monthly searches, unique)
- "wedding neon signs UAE" (40 monthly searches, seasonal)
- "restaurant neon signs Dubai" (60 monthly searches, B2B)
- "custom home neon signs Dubai" (35 monthly searches)

Local SEO Keywords:
- "neon signs Dubai Marina" (25 monthly searches)
- "LED signs Business Bay" (20 monthly searches)
- "custom signs Jumeirah" (15 monthly searches)
- "neon signs near me Dubai" (180 monthly searches)
- "Dubai neon sign company" (85 monthly searches)

Arabic Keywords (Transliterated):
- "علامات النيون المخصصة دبي" (custom neon signs Dubai)
- "لافتات LED للأعمال الإمارات" (LED business signs UAE)
- "خط النيون العربي" (Arabic neon calligraphy)
- "إشارات النيون للزفاف" (wedding neon signs)

Content Gap Keywords:
- "neon sign installation Dubai" (40 monthly searches, low competition)
- "LED sign maintenance UAE" (25 monthly searches, service opportunity)
- "neon sign design consultation Dubai" (30 monthly searches, consultation driver)
- "energy efficient neon signs UAE" (20 monthly searches, unique selling point)

Keyword Difficulty Assessment:
- Primary keywords: Medium to high difficulty (60-80)
- Long-tail keywords: Low to medium difficulty (20-40)
- Local keywords: Low to medium difficulty (15-35)
- Arabic keywords: Low difficulty, high opportunity (10-25)
`,

    seasonal_keywords: `
SEASONAL KEYWORD STRATEGY:

Ramadan Season (March-April):
- "Ramadan neon decorations Dubai" (peak: March)
- "Arabic calligraphy neon Ramadan" (peak: pre-Ramadan)
- "iftar gathering neon lights" (peak: Ramadan)
- "home mosque neon lighting" (steady throughout)

Eid Celebrations:
- "Eid neon decorations UAE" (peak: pre-Eid)
- "Eid Mubarak neon signs" (peak: 2 weeks before Eid)
- "family celebration neon lights" (peak: Eid season)
- "children name neon signs Eid" (gift-giving season)

UAE National Day (December):
- "UAE National Day neon signs" (peak: November)
- "patriotic business displays Dubai" (peak: pre-National Day)
- "UAE flag neon lights" (peak: November-December)
- "National Day storefront decoration" (B2B opportunity)

Wedding Season (October-April):
- "wedding neon signs Dubai" (peak: October-March)
- "Arabic wedding decorations neon" (cultural weddings)
- "couple name neon signs UAE" (personalization trend)
- "wedding photo backdrop neon" (Instagram trend)

Summer Indoor Focus (June-August):
- "indoor neon signs Dubai summer" (heat avoidance)
- "air conditioned showroom neon" (comfort focus)
- "energy efficient LED Dubai" (cost consciousness)
- "home neon signs UAE summer" (indoor entertainment)

Business Seasons:
- "new business neon signs Dubai" (January, September)
- "restaurant reopening signage" (post-Ramadan)
- "retail store neon signs Dubai" (Dubai Shopping Festival)
- "office neon branding UAE" (Q1 budgets)
`,

    competitor_keywords: `
COMPETITOR KEYWORD ANALYSIS:

Direct Competitors (UAE Neon Companies):
- Monitor keywords: "neon signs company Dubai", "LED signs UAE", "custom signage Dubai"
- Opportunity gaps: Arabic keywords, cultural celebrations, 24-hour delivery
- Competitive advantages: Local manufacturing, bilingual service, cultural authenticity

International Competitors (Global Neon Companies):
- High-volume keywords they rank for but lack local presence
- Technical keywords: "LED neon technology", "neon sign installation"
- Service keywords: "neon sign consultation", "custom design service"

Adjacent Competitors (Signage Companies):
- "business signage Dubai", "commercial signs UAE"
- "storefront signs Dubai", "retail signage UAE"
- Cross-over opportunities: "illuminated business signs", "LED business displays"

Content Marketing Gaps:
- "neon sign design ideas Dubai" (inspiration content)
- "business branding with neon signs" (educational content)
- "neon sign ROI for businesses" (case study content)
- "Arabic calligraphy in modern design" (cultural content)

Opportunity Analysis:
- Low competition Arabic keywords with decent volume
- Local "near me" searches with weak local results
- Cultural celebration keywords completely unoptimized
- Technical educational content gap in UAE market
- Wedding and event specific keywords underserved
`,
  },

  contentOptimization: {
    page_optimization: `
PAGE OPTIMIZATION STRATEGY FOR NEONHUB:

Homepage Optimization:
- Title: "Custom LED Neon Signs Dubai | Dubai's #1 Neon Sign Company | NeonHub"
- Meta Description: "Transform your space with stunning custom LED neon signs in Dubai. 24-hour delivery, Arabic calligraphy, free 3D mockup. 1000+ reviews. Book consultation today!"
- H1: "Dubai's #1 Custom LED Neon Signs - Transform Your Space"
- Primary keyword density: 1-2% for "custom neon signs Dubai"
- Schema markup: LocalBusiness, Organization, Reviews

Category Pages:
- Business Signs: "Custom LED Business Signs Dubai | Storefront Neon | NeonHub"
- Wedding Signs: "Wedding Neon Signs UAE | Arabic Calligraphy | Custom Couple Names"
- Home Decor: "Custom Home Neon Signs Dubai | Personalized LED Lighting"
- Each category optimized for specific keyword clusters
- Local business schema with service area markup

Service Pages:
- Consultation: "Free Neon Sign Design Consultation Dubai | 3D Mockup | NeonHub"
- Installation: "Professional Neon Sign Installation Dubai | Same-Day Service"
- Maintenance: "LED Neon Sign Maintenance UAE | Warranty Service | NeonHub"
- Arabic Design: "Arabic Calligraphy Neon Signs Dubai | Cultural Authenticity"

Blog Content Strategy:
- Educational: "Complete Guide to LED Neon Signs in Dubai" (2000+ words)
- Local: "Top 10 Dubai Businesses with Stunning Neon Signs" (case studies)
- Cultural: "Arabic Calligraphy in Modern Neon Design" (cultural content)
- Seasonal: "Ramadan Home Decoration Ideas with Neon Lighting"
- Technical: "LED vs Traditional Neon: What's Best for Dubai Climate?"

Internal Linking Strategy:
- Hub and spoke model with service pages as hubs
- Category pages linking to relevant blog content
- Blog posts linking to conversion pages
- Geographic pages cross-linking for local SEO
- Arabic content linking to English equivalents and vice versa
`,

    content_creation: `
SEO CONTENT CREATION GUIDELINES:

Content Pillars:
1. Educational Content (40%):
   - "How to choose custom neon signs for your Dubai business"
   - "LED neon sign installation process in UAE"
   - "Maintaining neon signs in Dubai's climate"
   - "Energy efficiency of LED neon vs traditional lighting"

2. Local Market Content (30%):
   - "Dubai's best neon sign installations showcase"
   - "UAE business branding trends with neon signage"
   - "Cultural celebrations enhanced with custom neon"
   - "Success stories: Dubai businesses transformed with neon"

3. Service-Focused Content (20%):
   - "24-hour neon sign delivery in Dubai: How it works"
   - "Free 3D mockup service for custom neon designs"
   - "Arabic calligraphy neon design consultation process"
   - "Custom neon sign pricing guide for UAE market"

4. Seasonal Content (10%):
   - "Ramadan neon decorations for UAE homes"
   - "National Day business displays with neon signs"
   - "Wedding season neon sign trends in UAE"
   - "Summer indoor neon solutions for Dubai"

Content Optimization Elements:
- Primary keyword in title, first paragraph, and conclusion
- LSI keywords naturally distributed throughout
- Arabic keywords integrated where culturally appropriate
- Local references and UAE-specific information
- Images optimized with descriptive alt text
- Internal links to relevant service and category pages

Bilingual Content Strategy:
- Major pages available in both Arabic and English
- Hreflang tags for language targeting
- Cultural adaptation, not direct translation
- Arabic content optimized for Arabic search terms
- English content optimized for international expats

Content Calendar Integration:
- Seasonal content published 6-8 weeks before events
- Regular educational content monthly
- Local market updates quarterly
- Success story case studies bi-monthly
- Technical updates as industry evolves
`,

    schema_markup: `
SCHEMA MARKUP STRATEGY FOR NEONHUB:

LocalBusiness Schema:
- Business name: "NeonHub"
- Business type: "Custom Neon Sign Company"
- Address: Dubai workshop location
- Phone: Local UAE phone number
- Website: https://neonhub.com
- Operating hours: Dubai business hours
- Service areas: Dubai, Abu Dhabi, Sharjah, UAE
- Payment methods: AED, credit cards, installments

Organization Schema:
- Legal name: NeonHub LLC
- Founding date: 2020
- Number of employees: 15-25
- Industries: Custom signage, LED lighting, design
- Awards: "Dubai's #1 Custom LED Neon Brand"
- Social media profiles: Instagram, Facebook, LinkedIn

Service Schema:
- Service types: Custom neon design, installation, maintenance
- Service areas: UAE emirates
- Pricing: Starting from AED 250
- Availability: 24-hour rush service available
- Booking: Online consultation scheduling

Review Schema:
- Aggregate rating: 4.9/5 stars
- Review count: 1000+ reviews
- Platform integration: Google, Facebook, local directories
- Review snippets: Customer testimonials
- Response management: Professional review responses

Product Schema:
- Product categories: Business signs, wedding signs, home decor
- Price ranges: AED 250-8000
- Availability: In stock, custom manufacturing
- Shipping: Local Dubai delivery
- Warranty: LED component warranty

FAQ Schema:
- Common questions: Pricing, delivery time, installation process
- Answers optimized for featured snippets
- Cultural questions: Arabic design capabilities
- Technical questions: LED technology benefits
- Service questions: Consultation and design process

Event Schema (Seasonal):
- Ramadan specials: Event date, offers, booking
- National Day campaigns: Patriotic designs available
- Wedding season: Peak season service availability
- Business hours: Holiday schedule modifications
`,
  },

  localSEO: {
    google_my_business: `
GOOGLE MY BUSINESS OPTIMIZATION FOR NEONHUB:

Business Profile Optimization:
- Business name: "NeonHub - Custom LED Neon Signs Dubai"
- Category: Primary "Custom Sign Shop", Secondary "LED Lighting Store"
- Description: "Dubai's #1 Custom LED Neon Sign Company. Bilingual Arabic-English design, 24-hour delivery, free 3D mockup consultation. Transform your space with premium LED neon signs."
- Attributes: Women-owned, Local business, Consultation available
- Service areas: Dubai, Abu Dhabi, Sharjah, Ajman, UAE

Visual Content Strategy:
- Photos: Workshop, team, before/after installations, Arabic calligraphy work
- Videos: Time-lapse installations, customer testimonials, creation process
- 360° tour: Workshop and showroom virtual tour
- Regular updates: Weekly new project photos, behind-the-scenes content

Review Management:
- Review generation: Post-installation follow-up system
- Response strategy: Personal, helpful responses within 24 hours
- Review diversity: Encourage reviews mentioning specific services
- Languages: Respond in customer's preferred language (Arabic/English)
- Incentives: Follow-up service discounts for reviews

Posts and Updates:
- Weekly posts: New projects, seasonal offers, cultural celebrations
- Event posts: Ramadan specials, National Day campaigns, wedding season
- Product posts: New design categories, Arabic calligraphy showcase
- Offer posts: Free consultation, 24-hour delivery, seasonal discounts

Q&A Optimization:
- Proactively answer common questions
- Include keywords naturally in answers
- Address cultural and language questions
- Provide specific UAE market information
- Update seasonally for relevant inquiries

Local SEO Citations:
- UAE business directories: Dubai Chamber, UAE Business Directory
- Industry directories: Signage associations, LED industry listings
- Cultural directories: Arabic business networks, cultural associations
- Google Maps: Accurate location, service area coverage
- Consistency: NAP (Name, Address, Phone) across all platforms
`,

    local_content: `
LOCAL SEO CONTENT STRATEGY:

Location-Based Content:
- "Custom Neon Signs in Dubai Marina: Transform Your Business"
- "Business Bay LED Signage: Professional Branding Solutions"
- "Jumeirah Custom Home Neon: Luxury Residential Lighting"
- "Downtown Dubai Neon: High-Impact Commercial Displays"
- "Abu Dhabi Neon Signs: Expanding Our Premium Services"

Cultural Community Content:
- "Supporting UAE National Day: Patriotic Business Displays"
- "Ramadan Business Hours: Respectful Service During Holy Month"
- "Arabic Calligraphy Heritage: Traditional Art in Modern Neon"
- "Emirati Wedding Traditions: Custom Neon for Cultural Celebrations"
- "Dubai's Multicultural Community: Inclusive Design Services"

Local Business Partnerships:
- Case studies with local Dubai businesses
- Wedding venue partnerships content
- Restaurant and retail success stories
- Event planner collaboration content
- Local supplier and craftsman features

Geographic Landing Pages:
- Dubai: Primary market, workshop location, same-day service
- Abu Dhabi: Expansion market, scheduled installations
- Sharjah: Growing market, business district focus
- Ajman: Emerging opportunity, residential focus
- Northern Emirates: Service expansion content

Local Events and Seasons:
- Dubai Shopping Festival: Retail signage opportunities
- UAE Innovation Week: Technology and LED advancement
- Dubai Design Week: Creative industry participation
- National Day: Patriotic business display surge
- Wedding Season: Peak cultural celebration period

Community Involvement:
- Local charity events: Neon donations, community support
- Business networking: Dubai Chamber participation
- Cultural events: Arabic heritage celebration support
- Educational workshops: Neon design community classes
- Environmental initiatives: Energy-efficient LED promotion
`,

    citation_building: `
LOCAL CITATION BUILDING STRATEGY:

Tier 1 Citations (High Authority):
- Google My Business: Primary listing with complete profile
- Facebook Business: Community engagement and reviews
- LinkedIn Company: B2B networking and professional presence
- Instagram Business: Visual portfolio and customer engagement
- Dubai Chamber of Commerce: Official business membership

Tier 2 Citations (Regional Authority):
- UAE Business Directory: National business listing
- Dubai Municipality Business Directory: Official city listing
- Etisalat Business Directory: Major telecom business listing
- Gulf Business Directory: Regional presence
- Arabian Business Directory: Industry recognition

Tier 3 Citations (Industry Specific):
- Signage industry associations and directories
- LED lighting industry listings
- Design and advertising directories
- Wedding and event vendor listings
- Home improvement and decoration directories

Arabic Language Citations:
- Arabic business directories and listings
- Cultural community business networks
- Arabic language review platforms
- Emirati business association listings
- GCC business directory submissions

Review Platforms:
- Google Reviews: Primary review platform
- Facebook Reviews: Community-based feedback
- Foursquare: Location-based check-ins
- Yelp (limited UAE presence): International visitor reviews
- Local UAE review platforms and forums

Consistency Management:
- NAP consistency across all platforms
- Business description standardization
- Category and service consistency
- Hours of operation accuracy
- Website URL consistency

Citation Monitoring:
- Monthly audit of existing citations
- Correction of inconsistent information
- New citation opportunity identification
- Competitor citation analysis
- Review and rating monitoring across platforms
`,
  },

  technicalSEO: {
    site_structure: `
TECHNICAL SEO SITE STRUCTURE FOR NEONHUB:

URL Structure:
- Homepage: neonhub.com
- Services: /services/custom-neon-signs-dubai
- Categories: /business-signs-dubai, /wedding-neon-signs-uae
- Location pages: /dubai-neon-signs, /abu-dhabi-led-signs
- Blog: /blog/led-neon-signs-dubai-guide
- Arabic pages: /ar/services/, /ar/blog/
- Clean, descriptive URLs with target keywords

Site Architecture:
- Flat structure: Maximum 3 clicks from homepage to any page
- Logical hierarchy: Services > Categories > Specific products
- Internal linking: Strategic links between related content
- Breadcrumb navigation: Clear path indication for users and search engines
- XML sitemap: Comprehensive site map with priority settings

Mobile Optimization:
- Mobile-first design: Optimized for UAE smartphone usage patterns
- Page speed: <3 seconds load time on mobile networks
- Touch-friendly interface: Easy navigation for consultation booking
- WhatsApp integration: Direct messaging for UAE market preference
- Local business hours display: Dubai timezone consideration

Page Speed Optimization:
- Image compression: WebP format for neon sign photos
- Code minification: CSS, JavaScript, HTML optimization
- CDN implementation: Fast loading for UAE users
- Caching strategy: Browser and server-side caching
- Core Web Vitals: LCP, FID, CLS optimization

International SEO:
- Hreflang tags: Arabic and English language targeting
- Currency display: AED for UAE market
- Local business schema: Dubai location and service areas
- Cultural adaptation: Content appropriate for UAE market
- Regional hosting: Fast servers for Middle East users
`,

    performance_optimization: `
PERFORMANCE OPTIMIZATION STRATEGY:

Core Web Vitals:
- Largest Contentful Paint (LCP): <2.5 seconds
  * Optimize hero images of neon installations
  * Efficient loading of portfolio galleries
  * Fast rendering of consultation booking forms

- First Input Delay (FID): <100 milliseconds
  * Minimize JavaScript blocking
  * Optimize WhatsApp integration scripts
  * Efficient contact form functionality

- Cumulative Layout Shift (CLS): <0.1
  * Stable image dimensions for neon sign photos
  * Reserved space for Arabic/English language toggle
  * Consistent layout across device sizes

Mobile Performance:
- UAE mobile network optimization: 3G and 4G performance
- Touch target optimization: Easy consultation booking
- Viewport configuration: Proper mobile scaling
- Accelerated Mobile Pages (AMP): Blog content optimization
- Progressive Web App features: Offline portfolio viewing

Image Optimization:
- Portfolio images: High-quality but compressed neon photos
- Alt text: Descriptive text with relevant keywords
- Lazy loading: Improved initial page load times
- WebP format: Modern image format for better compression
- Responsive images: Appropriate sizes for different devices

JavaScript Optimization:
- Minimize third-party scripts: Only essential integrations
- Async loading: Non-critical scripts load asynchronously
- Code splitting: Load only necessary JavaScript
- WhatsApp widget optimization: Efficient messaging integration
- Analytics optimization: Streamlined tracking implementation

Server and Hosting:
- CDN distribution: Fast loading across UAE and GCC
- Server response time: <200ms for UAE users
- Uptime monitoring: 99.9% availability target
- SSL certificate: Secure browsing and ranking factor
- HTTP/2 implementation: Improved loading performance
`,

    crawling_indexing: `
CRAWLING AND INDEXING OPTIMIZATION:

XML Sitemaps:
- Main sitemap: All important pages included
- Image sitemap: Portfolio and neon sign photos
- News sitemap: Blog posts and updates
- Arabic sitemap: Separate sitemap for Arabic content
- Video sitemap: Installation and process videos

Robots.txt Optimization:
- Allow important pages and directories
- Block admin, duplicate, and low-value pages
- Allow Google, Bing, and other major search engines
- Sitemap reference: Direct link to XML sitemaps
- Crawl delay consideration: Server resource management

Internal Linking:
- Hub and spoke model: Service pages as content hubs
- Contextual links: Related content cross-referencing
- Anchor text optimization: Descriptive, keyword-rich anchors
- Link equity distribution: Important pages receive more links
- Arabic-English cross-linking: Language version connections

Canonical Tags:
- Duplicate content prevention: Product variations and filters
- Parameter handling: URL parameter canonicalization
- Language versions: Proper canonical for Arabic/English pages
- Mobile versions: Consistent canonical signals
- Category and tag pages: Prevent duplicate content issues

Schema Markup Implementation:
- Local business schema: Complete business information
- Product schema: Neon sign categories and pricing
- Review schema: Customer feedback integration
- FAQ schema: Common questions about services
- Event schema: Seasonal campaigns and offers

Meta Tags Optimization:
- Title tags: Unique, descriptive, with target keywords
- Meta descriptions: Compelling, call-to-action focused
- Open Graph tags: Social media sharing optimization
- Twitter Cards: Enhanced social media visibility
- Mobile meta tags: Proper mobile viewing configuration
`,
  },

  competitorAnalysis: `
COMPETITOR SEO ANALYSIS FRAMEWORK:

Direct Competitor Analysis:
1. UAE Neon Sign Companies:
   - Keyword gap analysis: Keywords they rank for that we don't
   - Content gaps: Topics they cover that we haven't addressed
   - Backlink opportunities: Sites linking to them but not us
   - Local SEO comparison: GMB optimization and local citations
   - Technical audit: Site speed, mobile optimization, schema markup

2. Regional Signage Companies:
   - Service page optimization: How they structure service content
   - Local SEO tactics: Citation building and review strategies
   - Content marketing: Blog topics and educational resources
   - Conversion optimization: How they capture leads and drive sales
   - Social proof: Review display and customer testimonial usage

Competitive Advantages to Leverage:
- Bilingual Arabic-English capability: Unique in UAE neon market
- Cultural authenticity: Deep understanding of UAE customs
- 24-hour delivery: Faster service than international competitors
- Local manufacturing: Dubai-based production advantage
- Premium positioning: Higher quality than budget competitors

Content Gap Opportunities:
- Arabic design heritage: Cultural content competitors lack
- Technical education: LED technology explanations
- Local case studies: Dubai business success stories
- Seasonal content: UAE-specific cultural celebrations
- Installation processes: Behind-the-scenes transparency

Keyword Opportunities:
- Arabic keywords: Underserved by international competitors
- Cultural celebration keywords: Ramadan, Eid, National Day specific
- Local service keywords: Dubai Marina, Business Bay specific
- Technical long-tail: Energy efficiency, climate considerations
- Voice search optimization: "near me" and conversational queries

Link Building Opportunities:
- Local business partnerships: Wedding venues, event planners
- Industry associations: Signage and LED lighting organizations
- Cultural organizations: Arabic heritage and arts groups
- Educational content: Guest posts on business and design blogs
- Local media coverage: Dubai business success stories

Monitoring and Analysis:
- Monthly ranking tracking: Priority keywords and competitor positions
- Content analysis: New content creation and optimization strategies
- Backlink monitoring: New link opportunities and competitor gains
- Technical audits: Site performance and optimization improvements
- Local SEO tracking: GMB ranking and citation building progress
`,
};

export default NEONHUB_SEO_PROMPTS;
