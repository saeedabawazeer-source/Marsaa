/**
 * Data layer — every function here returns mock data today so the site is fully
 * navigable without a backend. Swap the body of each function for a real fetch()
 * call to your CMS/API and the rest of the app (pages, components) does not need
 * to change, since they only ever import from this file.
 *
 * TODO(api): point these at the real backend before launch. Suggested shape:
 *   const res = await fetch(`${process.env.MARSA_API_URL}/articles`, { next: { revalidate: 300 } });
 *   return res.json();
 */

import type { Article, MarketTick } from "./types";

const MOCK_ARTICLES: Article[] = [
  {
    slug: "tadawul-opens-to-all-foreign-investors",
    title: "Tadawul fully opens to foreign investors as TASI jumps 2.5%",
    dek: "Saudi Arabia scrapped its Qualified Foreign Investor regime on February 1, letting all categories of foreign investors trade directly on the exchange.",
    body: [
      "Saudi Arabia fully opened the Tadawul stock exchange to all categories of foreign investors on February 1, eliminating the Qualified Foreign Investor (QFI) regime that had gated direct access for over a decade.",
      "The Tadawul All Share Index rose as much as 2.5% in early trading on the news, as investors read the move as a signal of continued capital-market liberalization tied to the kingdom's broader diversification push.",
      "The change removes a layer of registration and eligibility requirements that previously stood between international investors and direct ownership of Saudi-listed shares, bringing the exchange closer in line with how global peers handle foreign access.",
    ],
    category: "markets",
    readMins: 3,
    publishedAt: "2026-02-01",
    desk: "Markets Desk",
    titleAr: "تداول تفتح أبوابها بالكامل أمام المستثمرين الأجانب مع قفزة مؤشر تاسي 2.5%",
    dekAr: "ألغت السعودية نظام المستثمر الأجنبي المؤهل في فبراير، لتسمح لجميع فئات المستثمرين الأجانب بالتداول المباشر في السوق.",
    bodyAr: [
      "فتحت المملكة العربية السعودية سوق تداول بالكامل أمام جميع فئات المستثمرين الأجانب في الأول من فبراير، بإلغاء نظام المستثمر الأجنبي المؤهل (QFI) الذي كان يقيّد الوصول المباشر لأكثر من عقد من الزمن.",
      "ارتفع مؤشر تاسي بنسبة تصل إلى 2.5% في تعاملات مبكرة عقب الإعلان، حيث قرأ المستثمرون الخطوة كإشارة على استمرار تحرير سوق رأس المال في إطار دفعة التنويع الاقتصادي الأوسع للمملكة.",
      "يزيل هذا التغيير طبقة من متطلبات التسجيل والأهلية التي كانت تفصل سابقاً بين المستثمرين الدوليين والملكية المباشرة للأسهم السعودية المدرجة، مقرّباً السوق من الطريقة التي تتعامل بها الأسواق العالمية النظيرة مع الوصول الأجنبي.",
    ],
  },
  {
    slug: "aramco-dividend-buyback-2026",
    title: "Aramco lifts dividend 3.5% as buyback program continues",
    dek: "The kingdom's oil giant raised its base dividend and pressed on with a multi-billion-dollar share repurchase plan through 2026.",
    body: [
      "Saudi Aramco increased its base dividend 3.5% year-over-year in its first-quarter 2026 results, continuing a pattern of steady payout growth even as global oil prices stayed range-bound.",
      "The increase comes alongside a $2-3 billion share buyback program the company kicked off in March 2026, running over an 18-month window — part of a broader capital-return push as Aramco balances dividend commitments with reinvestment in gas and downstream projects.",
      "Aramco's next earnings report is due August 4, 2026, and investors will be watching for updated guidance on the pace of the buyback alongside any shift in dividend policy.",
    ],
    category: "energy",
    readMins: 3,
    publishedAt: "2026-07-31",
    desk: "Energy Desk",
    titleAr: "أرامكو ترفع أرباحها الموزعة 3.5% مع استمرار برنامج إعادة الشراء",
    dekAr: "رفعت عملاقة النفط السعودية أرباحها الأساسية الموزعة واستمرت في برنامج إعادة شراء أسهم متعدد المليارات.",
    bodyAr: [
      "رفعت أرامكو السعودية أرباحها الأساسية الموزعة بنسبة 3.5% على أساس سنوي في نتائج الربع الأول من عام 2026، مواصلة نمطاً من النمو المستقر للتوزيعات حتى مع بقاء أسعار النفط العالمية ضمن نطاق محدود.",
      "تأتي الزيادة إلى جانب برنامج إعادة شراء أسهم بقيمة 2 إلى 3 مليارات دولار بدأته الشركة في مارس 2026، يمتد على مدى 18 شهراً — جزء من دفعة أوسع لإعادة رأس المال بينما توازن أرامكو بين التزامات الأرباح وإعادة الاستثمار في مشاريع الغاز والتصنيع اللاحق.",
      "من المقرر أن تصدر أرامكو تقريرها المالي التالي في 4 أغسطس 2026، وسيترقب المستثمرون توجيهات محدّثة حول وتيرة إعادة الشراء إلى جانب أي تغيير في سياسة توزيع الأرباح.",
    ],
  },
  {
    slug: "mawani-jeddah-port-expansion",
    title: "Mawani pours $170m into Jeddah Islamic Port expansion",
    dek: "The Saudi Ports Authority is adding cranes, terminal trucks, and cold storage capacity in partnership with DP World and Red Sea Gateway Terminal.",
    body: [
      "The Saudi Ports Authority (Mawani) is investing SAR 641 million ($170 million) to expand cargo-handling capacity at Jeddah Islamic Port, working alongside DP World and Red Sea Gateway Terminal.",
      "The build-out includes three new container cranes, 27 rubber-tyred gantry cranes, 91 terminal trucks, and seven ground-handling units. Container terminal space grows by 200,000 square metres, and cold storage rooms increase from eight to 75.",
      "The investment follows a sharp rebound in traffic: the terminal handled more than 1.3 million TEUs in 2025, more than double the year before, as Red Sea shipping lines increasingly route through Jeddah.",
    ],
    category: "trade",
    readMins: 3,
    publishedAt: "2026-07-13",
    desk: "Trade Desk",
    titleAr: "موانئ تضخ 170 مليون دولار في توسعة ميناء جدة الإسلامي",
    dekAr: "تضيف الهيئة العامة للموانئ رافعات وشاحنات نقل وسعة تخزين مبرّد بالشراكة مع موانئ دبي العالمية ومحطة بوابة البحر الأحمر.",
    bodyAr: [
      "تستثمر الهيئة العامة للموانئ السعودية (موانئ) 641 مليون ريال سعودي (170 مليون دولار) لتوسعة قدرة مناولة البضائع في ميناء جدة الإسلامي، بالتعاون مع موانئ دبي العالمية ومحطة بوابة البحر الأحمر.",
      "تشمل خطة التوسعة ثلاث رافعات حاويات جديدة، و27 رافعة بوابية مطاطية الإطارات، و91 شاحنة نقل داخل المحطة، وسبع وحدات مناولة أرضية. تزداد مساحة محطة الحاويات بمقدار 200 ألف متر مربع، وترتفع غرف التخزين المبرّد من ثماني غرف إلى 75 غرفة.",
      "يأتي هذا الاستثمار في أعقاب انتعاش حاد في حركة الشحن: تعاملت المحطة مع أكثر من 1.3 مليون حاوية نمطية (TEU) في عام 2025، أي أكثر من ضعف العام السابق، مع تزايد توجّه خطوط الشحن عبر البحر الأحمر إلى جدة.",
    ],
  },
  {
    slug: "apm-terminals-jeddah-stake",
    title: "Maersk's APM Terminals takes 37.5% stake in Jeddah's South Container Terminal",
    dek: "The acquisition deepens the Danish shipping giant's footprint in Saudi Arabia as Red Sea trade volumes climb.",
    body: [
      "APM Terminals, the terminal-operating arm of A.P. Moller-Maersk, acquired a 37.5% stake in the South Container Terminal at Jeddah Islamic Port.",
      "The deal reinforces Maersk's commitment to Saudi Arabia's logistics sector at a moment when Red Sea trade has taken on added strategic weight, with shipping lines and terminal operators racing to secure capacity along the corridor.",
      "It follows a string of related moves at the port this year, including new shipping services linking Jeddah to India and Djibouti, and the launch of the Red Sea Express container line connecting Yanbu, Jeddah, Egypt, and Jordan.",
    ],
    category: "trade",
    readMins: 2,
    publishedAt: "2026-06-18",
    desk: "Trade Desk",
    titleAr: "إيه بي إم تيرمينالز التابعة لميرسك تستحوذ على حصة 37.5% في المحطة الجنوبية بميناء جدة",
    dekAr: "تعمّق الشركة الدنماركية للشحن حضورها في السعودية مع تصاعد حركة التجارة في البحر الأحمر.",
    bodyAr: [
      "استحوذت إيه بي إم تيرمينالز، الذراع المشغّلة للمحطات التابعة لشركة إيه.بي. مولر-ميرسك، على حصة 37.5% في المحطة الجنوبية للحاويات بميناء جدة الإسلامي.",
      "تعزز الصفقة التزام ميرسك بقطاع الخدمات اللوجستية في السعودية في وقت اكتسبت فيه تجارة البحر الأحمر وزناً استراتيجياً إضافياً، مع تسابق خطوط الشحن ومشغّلي المحطات لتأمين الطاقة الاستيعابية على طول الممر.",
      "تأتي الصفقة عقب سلسلة من التحركات ذات الصلة في الميناء هذا العام، من بينها خدمات شحن جديدة تربط جدة بالهند وجيبوتي، وإطلاق خط الحاويات إكسبريس البحر الأحمر الذي يربط بين ينبع وجدة ومصر والأردن.",
    ],
  },
  {
    slug: "tamara-24bn-financing",
    title: "Tamara secures up to $2.4bn in financing from Goldman Sachs, Citi, and Apollo",
    dek: "The Riyadh-based buy-now-pay-later fintech landed one of the largest financing facilities ever raised by a Saudi startup.",
    body: [
      "Tamara, the Riyadh-headquartered buy-now-pay-later platform, secured an asset-backed financing facility of up to $2.4 billion, one of the largest such deals raised by a company in the region.",
      "The structure includes an immediate initial commitment of $1.4 billion, with an additional $1 billion available over a three-year period subject to approvals. Backers include Goldman Sachs, Citi, and Apollo-managed funds.",
      "The deal underscores how far Saudi Arabia's BNPL sector has matured: Tamara and rival Tabby, also based in the Gulf, have both moved from early-stage startups to companies raising billion-dollar facilities from global institutional lenders.",
    ],
    category: "startups",
    readMins: 3,
    publishedAt: "2026-07-22",
    desk: "Startups Desk",
    titleAr: "تمارا تؤمّن تمويلاً يصل إلى 2.4 مليار دولار من جولدمان ساكس وسيتي وأبولو",
    dekAr: "حصلت شركة الدفع الآجل الرياضية على واحدة من أكبر صفقات التمويل التي حققتها شركة ناشئة سعودية.",
    bodyAr: [
      "أمّنت تمارا، منصة الشراء الآن والدفع لاحقاً ومقرها الرياض، تسهيلاً تمويلياً مضموناً بالأصول يصل إلى 2.4 مليار دولار، ما يجعله واحداً من أكبر الصفقات من نوعها التي تحصل عليها شركة في المنطقة.",
      "يتضمن الهيكل التزاماً أولياً فورياً بقيمة 1.4 مليار دولار، مع إتاحة مليار دولار إضافي على مدى ثلاث سنوات رهناً بالموافقات. ومن بين الجهات الداعمة جولدمان ساكس وسيتي وصناديق تديرها أبولو.",
      "تؤكد الصفقة مدى النضج الذي بلغه قطاع الشراء الآن والدفع لاحقاً في السعودية: انتقلت تمارا ومنافستها تابي، ومقرها الخليج أيضاً، من شركتين ناشئتين في مرحلة مبكرة إلى شركتين تحصلان على تسهيلات تمويلية بمليارات الدولارات من مؤسسات إقراض عالمية.",
    ],
  },
  {
    slug: "tabby-45bn-valuation",
    title: "Tabby reaches $4.5bn valuation, the highest ever for an Arab-world consumer fintech",
    dek: "The Gulf buy-now-pay-later provider's valuation climbed from $3.3 billion in February 2025, extending a run of billion-dollar outcomes in Saudi and UAE fintech.",
    body: [
      "Tabby, the buy-now-pay-later provider operating across Saudi Arabia and the wider Gulf, reached a $4.5 billion valuation in its latest funding round — up from $3.3 billion in February 2025.",
      "The valuation makes Tabby the most highly valued consumer fintech startup to emerge from the Arab world, and places it alongside Tamara as one of two Gulf-born BNPL companies now operating at billion-dollar scale.",
      "Investors point to Saudi Arabia's rapid e-commerce growth and young, digitally-native population as the underlying driver, with both companies expanding beyond BNPL into broader consumer financial products.",
    ],
    category: "startups",
    readMins: 2,
    publishedAt: "2026-05-30",
    desk: "Startups Desk",
    titleAr: "تابي تصل إلى تقييم 4.5 مليار دولار، الأعلى على الإطلاق لشركة تقنية مالية استهلاكية عربية",
    dekAr: "ارتفع تقييم الشركة من 3.3 مليار دولار في فبراير 2025.",
    bodyAr: [
      "بلغت تابي، مزوّدة خدمات الشراء الآن والدفع لاحقاً العاملة في السعودية ومنطقة الخليج الأوسع، تقييماً بلغ 4.5 مليار دولار في جولة تمويلها الأخيرة — ارتفاعاً من 3.3 مليار دولار في فبراير 2025.",
      "يجعل هذا التقييم من تابي أعلى شركة ناشئة في مجال التقنية المالية الاستهلاكية تقييماً في العالم العربي، ويضعها إلى جانب تمارا كواحدة من شركتين خليجيتين للشراء الآن والدفع لاحقاً تعملان الآن بحجم يتجاوز المليار دولار.",
      "يشير المستثمرون إلى نمو التجارة الإلكترونية السريع في السعودية والسكان الشباب المعتادين على التقنية الرقمية كمحرك أساسي، مع توسع الشركتين خارج نطاق الشراء الآن والدفع لاحقاً نحو منتجات مالية استهلاكية أوسع.",
    ],
  },
  {
    slug: "proptech-funding-giga-projects",
    title: "Proptech and construction-tech funding climbs as NEOM and Red Sea projects scale up",
    dek: "Construction and real-estate technology startups pulled in a combined $87 million in H1 2025, as giga-projects create demand for smart-building and construction software.",
    body: [
      "Construction technology and real-estate technology startups serving Saudi Arabia's giga-projects — NEOM, Qiddiya, and the Red Sea Project among them — attracted a combined $87 million in funding in the first half of 2025, split roughly $48 million to construction tech and $39 million to real estate tech.",
      "NEOM alone is planned as a $500 billion smart-city development powered by artificial intelligence and renewable energy, and its scale has pulled in a wave of proptech and construction-software vendors building tools for smart buildings, project management, and materials logistics.",
      "Investors say the giga-projects function as a captive early customer base for these startups, giving Saudi proptech a distinct advantage over comparable markets where construction-tech adoption depends on winning over fragmented private developers.",
    ],
    category: "real-estate",
    readMins: 3,
    publishedAt: "2026-04-11",
    desk: "Real Estate Desk",
    titleAr: "تمويل التقنيات العقارية والإنشائية يرتفع مع توسع مشاريع نيوم والبحر الأحمر",
    dekAr: "جمعت الشركات الناشئة في هذا القطاع 87 مليون دولار في النصف الأول من 2025.",
    bodyAr: [
      "جمعت الشركات الناشئة في مجالي التقنية الإنشائية والتقنية العقارية العاملة على خدمة المشاريع العملاقة في السعودية — ومن بينها نيوم وقدية ومشروع البحر الأحمر — تمويلاً مجمّعاً بلغ 87 مليون دولار في النصف الأول من عام 2025، موزّعة تقريباً بين 48 مليون دولار للتقنية الإنشائية و39 مليون دولار للتقنية العقارية.",
      "تُخطَّط نيوم وحدها كمدينة ذكية بقيمة 500 مليار دولار مدعومة بالذكاء الاصطناعي والطاقة المتجددة، وقد جذب حجمها موجة من موردي التقنية العقارية وبرمجيات البناء الذين يطوّرون أدوات للمباني الذكية وإدارة المشاريع ولوجستيات المواد.",
      "يقول المستثمرون إن المشاريع العملاقة تعمل كقاعدة عملاء أولية أسيرة لهذه الشركات الناشئة، ما يمنح قطاع التقنية العقارية السعودي ميزة واضحة مقارنة بأسواق مشابهة يعتمد فيها تبنّي التقنية الإنشائية على إقناع مطورين خاصين متفرقين.",
    ],
  },
];

const MOCK_MARKET_TICKS: MarketTick[] = [
  { label: "TASI", value: "11,842.3", direction: "up" },
  { label: "Brent", value: "$81.4", direction: "down" },
  { label: "USD/SAR", value: "3.750", direction: "flat" },
  { label: "Tadawul vol.", value: "SAR 4.2B", direction: "flat" },
  { label: "ARAMCO", value: "27.85", direction: "up" },
  { label: "NEOM bonds", value: "steady", direction: "flat" },
];

export async function getLatestArticles(): Promise<Article[]> {
  // TODO(api): replace with real fetch to the CMS/API
  return MOCK_ARTICLES;
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  // TODO(api): replace with real fetch to the CMS/API
  return MOCK_ARTICLES.find((a) => a.slug === slug);
}

export async function getArticlesByCategory(category: string): Promise<Article[]> {
  // TODO(api): replace with real fetch to the CMS/API
  return MOCK_ARTICLES.filter((a) => a.category === category);
}

export async function getMarketTicks(): Promise<MarketTick[]> {
  // TODO(api): replace with a real market-data feed (e.g. Tadawul, a data vendor)
  return MOCK_MARKET_TICKS;
}
