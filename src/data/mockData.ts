export interface Stock {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: string;
  chartData: { time: string; price: number }[];
  riskLevel: 'منخفضة' | 'متوسطة' | 'عالية';
  sentiment: 'إيجابي' | 'محايد' | 'سلبي';
}

function generateChartData(startPrice: number, volatility: number) {
  let currentPrice = startPrice;
  const data = [];
  for (let i = 0; i < 20; i++) {
    const change = (Math.random() - 0.5) * volatility;
    currentPrice = currentPrice + change;
    data.push({ time: `Day ${i + 1}`, price: Number(currentPrice.toFixed(2)) });
  }
  return data;
}

export const egxStocks: Stock[] = [
  {
    symbol: 'COMI',
    name: 'البنك التجاري الدولي (CIB)',
    price: 85.20,
    changePercent: 1.5,
    volume: '3.5M',
    chartData: generateChartData(80, 2),
    riskLevel: 'متوسطة',
    sentiment: 'إيجابي',
  },
  {
    symbol: 'EAST',
    name: 'الشرقية للدخان (ايسترن كومباني)',
    price: 36.80,
    changePercent: -0.8,
    volume: '1.2M',
    chartData: generateChartData(36, 1),
    riskLevel: 'متوسطة',
    sentiment: 'محايد',
  },
  {
    symbol: 'FWRY',
    name: 'فوري لتكنولوجيا البنوك',
    price: 7.15,
    changePercent: 3.2,
    volume: '8.4M',
    chartData: generateChartData(6, 0.5),
    riskLevel: 'عالية',
    sentiment: 'إيجابي',
  },
  {
    symbol: 'HRHO',
    name: 'المجموعة المالية هيرميس',
    price: 19.50,
    changePercent: 0.5,
    volume: '1.1M',
    chartData: generateChartData(18, 1),
    riskLevel: 'متوسطة',
    sentiment: 'محايد',
  },
  {
    symbol: 'TMGH',
    name: 'مجموعة طلعت مصطفى القابضة',
    price: 28.40,
    changePercent: 4.1,
    volume: '5.6M',
    chartData: generateChartData(22, 1.5),
    riskLevel: 'عالية',
    sentiment: 'إيجابي',
  },
  {
    symbol: 'EKHO',
    name: 'القابضة المصرية الكويتية',
    price: 42.10,
    changePercent: -1.2,
    volume: '800K',
    chartData: generateChartData(45, 1.2),
    riskLevel: 'متوسطة',
    sentiment: 'سلبي',
  },
  {
    symbol: 'SWDY',
    name: 'السويدي اليكتريك',
    price: 31.20,
    changePercent: 2.3,
    volume: '2.1M',
    chartData: generateChartData(28, 1.2),
    riskLevel: 'متوسطة',
    sentiment: 'إيجابي',
  },
  {
    symbol: 'ESRS',
    name: 'عز للصلب (حديد عز)',
    price: 72.50,
    changePercent: 1.8,
    volume: '1.8M',
    chartData: generateChartData(70, 2),
    riskLevel: 'عالية',
    sentiment: 'إيجابي',
  },
  {
    symbol: 'ABUK',
    name: 'أبو قير للأسمدة',
    price: 88.90,
    changePercent: -2.1,
    volume: '1.5M',
    chartData: generateChartData(90, 1.8),
    riskLevel: 'متوسطة',
    sentiment: 'سلبي',
  },
  {
    symbol: 'MFPC',
    name: 'موبكو للأسمدة',
    price: 58.30,
    changePercent: 5.4,
    volume: '2.3M',
    chartData: generateChartData(50, 2.5),
    riskLevel: 'عالية',
    sentiment: 'إيجابي',
  },
  {
    symbol: 'ETEL',
    name: 'المصرية للاتصالات',
    price: 35.10,
    changePercent: 0.2,
    volume: '1.4M',
    chartData: generateChartData(34, 0.5),
    riskLevel: 'منخفضة',
    sentiment: 'محايد',
  },
  {
    symbol: 'ORAS',
    name: 'أوراسكوم كونستراكشون',
    price: 210.50,
    changePercent: -0.5,
    volume: '300K',
    chartData: generateChartData(215, 3),
    riskLevel: 'متوسطة',
    sentiment: 'محايد',
  },
  {
    symbol: 'SKPC',
    name: 'سيدي كرير للبتروكيماويات',
    price: 32.40,
    changePercent: 1.1,
    volume: '1.6M',
    chartData: generateChartData(30, 0.8),
    riskLevel: 'متوسطة',
    sentiment: 'إيجابي',
  },
  {
    symbol: 'ISPH',
    name: 'ابن سينا فارما',
    price: 2.85,
    changePercent: -1.7,
    volume: '4.5M',
    chartData: generateChartData(3.1, 0.2),
    riskLevel: 'عالية',
    sentiment: 'سلبي',
  },
  {
    symbol: 'JUFO',
    name: 'جهينة للصناعات الغذائية',
    price: 18.20,
    changePercent: 0.9,
    volume: '900K',
    chartData: generateChartData(17, 0.4),
    riskLevel: 'منخفضة',
    sentiment: 'إيجابي',
  }
];

export const newsArticles = [
  {
    id: 1,
    title: 'تدفقات أجنبية قوية تنعش مؤشر EGX30',
    summary: 'شهد المؤشر الرئيسي للبورصة اختراقاً لمستويات مقاومة هامة مدفوعاً بعمليات شراء مكثفة من المؤسسات الأجنبية على الأسهم القيادية مثل CIB وطلعت مصطفى.',
    date: 'منذ 30 دقيقة',
    category: 'أخبار السوق'
  },
  {
    id: 2,
    title: 'المركزي المصري يعلن عن إحصاءات التضخم الجديدة',
    summary: 'أظهرت البيانات تراجعاً ملحوظاً في معدلات التضخم الأساسية، مما يفتح الباب لاحتمالية خفض أسعار الفائدة في الاجتماعات القادمة للجنة السياسة النقدية.',
    date: 'منذ ساعتين',
    category: 'اقتصاد'
  },
  {
    id: 3,
    title: 'أرباح تاريخية لقطاع البتروكيماويات والأسمدة',
    summary: 'أعلنت شركات مثل "موبكو" و"أبو قير للأسمدة" عن قفزة في صافي الأرباح تتجاوز 40% على أساس سنوي مستفيدة من تسعير المنتجات وحركة التصدير.',
    date: 'منذ 4 ساعات',
    category: 'شركات'
  },
  {
    id: 4,
    title: 'تحليل فني: أي الأسهم مرشحة للصعود هذا الأسبوع؟',
    summary: 'تكوين نماذج فنية إيجابية (مثل الرأس والكتفين المقلوب) على بعض أسهم القطاع العقاري يشير لاستكمال الموجة الصاعدة خلال الجلسات القادمة.',
    date: 'منذ 6 ساعات',
    category: 'تحليلات'
  }
];

export const lessons = [
  {
    id: 1,
    title: 'ما هي البورصة؟',
    content: 'البورصة هي سوق منظم لبيع وشراء الأوراق المالية، مثل الأسهم والسندات. عندما تشتري سهماً، فأنت تشتري جزءاً من ملكية الشركة وتصبح شريكاً في أرباحها (أو خسائرها).'
  },
  {
    id: 2,
    title: 'ما هو مؤشر EGX30؟',
    content: 'هو المؤشر الرئيسي للبورصة المصرية ويضم أنشط 30 شركة مقيدة من حيث السيولة والنشاط. يُعتبر مقياساً عاماً يعكس حالة السوق المصري ككل.'
  },
  {
    id: 3,
    title: 'الاستثمار مقابل المضاربة',
    content: 'الاستثمار هو شراء الأسهم للاحتفاظ بها لفترة طويلة بهدف نمو رأس المال والحصول على أرباح موزعة، بينما المضاربة تعتمد على التغيرات السريعة في الأسعار لتحقيق أرباح سريعة مع تحمل مخاطر أعلى.'
  },
  {
    id: 4,
    title: 'أساسيات التحليل الفني (Technical Analysis)',
    content: 'التحليل الفني هو دراسة حركة السعر التاريخية لتوقع الحركة المستقبلية.\n\nتعتمد فلسفته على أن "كل العوامل تنعكس في السعر المحتمل".\nأهم المفاهيم:\n1- مستويات الدعم (Support): مناطق سعرية يكثر عندها المشترون ويرتد منها السعر لأعلى.\n2- مستويات المقاومة (Resistance): مناطق سعرية يكثر عندها البائعون ويرتد منها السعر لأسفل.\n3- خط الاتجاه (Trendline): خط يُرسم لربط القيعان (في التريند الصاعد) أو القمم (في التريند الهابط).'
  },
  {
    id: 5,
    title: 'الشموع اليابانية (Japanese Candlesticks)',
    content: 'هي أشهر طريقة لتمثيل حركة السعر بدقة فائقة. تتكون كل شمعة من:\n- "جسم الشمعة": يمثل المسافة بين سعر الافتتاح وسعر الإغلاق.\n- "ظلال الشمعة" (الذيول): تمثل أعلى وأقل سعر وصل له السهم خلال الجلسة.\n- الشمعة الخضراء: إغلاق أعلى من الافتتاح (تشير لسيطرة المشتري).\n- الشمعة الحمراء: إغلاق أقل من الافتتاح (تشير لسيطرة البائع).'
  },
  {
    id: 6,
    title: 'أهم نماذج الشموع اليابانية',
    content: 'إليك بعض النماذج الفردية والمركبة التي تعطي إشارات قوية لتغيير اتجاه السهم:\n\n1- المطرقة (Hammer): شمعة بظل سفلي طويل وجسم صغير بالأعلى. تحدث في نهاية اتجاه هابط، وتدل على رفض قاطع للهبوط، مما يمثل احتمال ارتداد وصعود قوي للسهم.\n2- الدوجي (Doji): شمعة سعر افتتاحها هو نفس إغلاقها (كعلامة +). تدل على حيرة وتوازن شديد بين قوة المشتري والبائع وتوقف المؤشر مؤقتاً.\n3- الابتلاع الشرائي (Bullish Engulfing): نموذج يتكون من شمعة خضراء كبيرة تغطي (تبتلع) الشمعة الحمراء التي قبلها بالكامل. وهو أقوى النماذج لتأكيد بداية موجة صعود شرسة.'
  },
  {
    id: 7,
    title: 'مؤشرات التحليل الفني (Technical Indicators)',
    content: 'تُستخدَم المؤشرات الفنية لفلترة وتأكيد حركة الأسعار بعمق:\n\n1- المتوسطات المتحركة (Moving Averages): تقوم بدمج أسعار الإغلاق لفترة محددة (مثل متوسط 50 يوماً) لتحديد الاتجاه العام (تريند صاعد أم هابط). تقاطع السعر فوق هذا الخط إشارة إيجابية.\n2- مؤشر القوة النسبية (RSI): يتأرجح بين 0 و 100 لتحديد سرعة تغير السعر. عندما يتجاوز 70 يُعتبر السهم في منطقة "تشبع شرائي" (يحتمل أن يهبط للتصحيح)، وعندما ينخفض تحت 30 يُعتبر في منطقة "تشبع بيعي" (يحتمل أن يرتد صعوداً بقوة).\n3- مؤشر الماكد (MACD): يحدد زخم وقوة التريند عبر تقاطع خطين للرصد المبكر لتحول مسار السهم.'
  },
  {
    id: 8,
    title: 'فهم النسب المالية (Financial Ratios)',
    content: 'بعكس التحليل الفني الذي يهتم بحركة السعر، فإن أداة التحليل الأساسي لتقييم قوة أداء الشركة هي النسب المالية:\n\n1- نسبة السعر إلى الربحية (P/E Ratio): تقيس كم يدفع المستثمرون حالياً مقابل كل جنيه من أرباح الشركة. كلما كانت أقل من متوسط القطاع، كان السهم مقيماً بشكل مغري، ولكنها قد تعني أيضاً توقعات نمو ضعيفة.\n2- ربحية السهم (EPS): يوضح مقدار العائد الصافي المخصص لكل سهم يتم تداوله. وهو أهم مؤشر للوقوف على كفاءة الشركة المالية للنمو المستقبلي.'
  }
];
