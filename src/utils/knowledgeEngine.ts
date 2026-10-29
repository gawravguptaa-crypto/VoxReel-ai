/**
 * Comprehensive Knowledge & Conversational Engine for VoxReel AI
 * Provides intelligent, multi-lingual answers (Hindi, Hinglish, English)
 * for General Knowledge, Academics, Coding (DSA, C++, Python, Web), Daily Chit-Chat,
 * Math, and natural open-ended queries when Gemini API is offline or quota-limited.
 */

export interface KnowledgeResult {
  reply: string;
  source: 'knowledge_engine' | 'math' | 'chat';
}

export function getIntelligentReply(
  rawMessage: string,
  languageHint: 'en' | 'hi' | 'hinglish' = 'en'
): string {
  const message = rawMessage.trim();
  const lower = message.toLowerCase().replace(/[?.,!]/g, '').trim();
  const isHi = languageHint === 'hi';
  const isHinglish = languageHint === 'hinglish';

  // 1. Math & Calculation Parser
  const mathResult = solveMathQuery(lower, isHi, isHinglish);
  if (mathResult) return mathResult;

  // 2. Real-time Clock & Date
  const isClockQuery =
    !lower.includes('complexity') &&
    (
      lower === 'time' ||
      lower === 'what is the time' ||
      lower.includes('current time') ||
      lower.includes('time kya') ||
      lower.includes('kya time') ||
      lower.includes('time batao') ||
      lower.includes('samay kya') ||
      lower.includes('waqt kya') ||
      lower.includes('baj rahe') ||
      lower.includes('kitne baje') ||
      lower.includes('ghadi me')
    );

  if (isClockQuery) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isHi) return `अभी समय ${timeStr} हुआ है।`;
    if (isHinglish) return `Abhi time ${timeStr} ho raha hai.`;
    return `The current time is ${timeStr}.`;
  }

  if (
    lower.includes('date') ||
    lower.includes('tarikh') ||
    lower.includes('aaj ka din') ||
    lower.includes('din konsa') ||
    lower.includes('what day')
  ) {
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (isHi) return `आज की तारीख और दिन है: ${dateStr}।`;
    if (isHinglish) return `Aaj ki date aur din hai: ${dateStr}.`;
    return `Today is ${dateStr}.`;
  }

  // 3. Identity, Creator & Capabilities
  if (
    lower.includes('who are you') ||
    lower.includes('tum kaun ho') ||
    lower.includes('aap kaun ho') ||
    lower.includes('tera naam') ||
    lower.includes('naam kya hai') ||
    lower.includes('what is your name') ||
    lower.includes('about yourself')
  ) {
    if (isHi) {
      return 'मैं VoxReel AI हूँ — आपका स्मार्ट वॉइस बॉट और स्टडी असिस्टेंट। मैं ऐप्स खोल सकता हूँ, कोडिंग व असाइनमेंट समझा सकता हूँ, और रील्स में मदद कर सकता हूँ।';
    }
    if (isHinglish) {
      return 'Main VoxReel AI hoon — aapka smart hands-free voice assistant aur study buddy. Main apps open kar sakta hoon, coding samjha sakta hoon aur aapke har sawaal ka answer de sakta hoon!';
    }
    return 'I am VoxReel AI — your intelligent voice-controlled multimodal assistant and study companion. I can launch apps, explain code, solve assignments, and answer any questions.';
  }

  if (
    lower.includes('who made you') ||
    lower.includes('kisine banaya') ||
    lower.includes('kisne banaya') ||
    lower.includes('who created you') ||
    lower.includes('tumhara creator')
  ) {
    if (isHi) return 'मुझे VoxReel AI टीम ने भारत के छात्रों और क्रिएटर्स के लिए एक एडवांस्ड AI असिस्टेंट के रूप में विकसित किया है।';
    if (isHinglish) return 'Mujhe VoxReel AI team ne design kiya hai, students aur creators ke liye ek super-smart voice assistant ke roop mein.';
    return 'I was developed by the VoxReel AI team as an intelligent multimodal voice assistant and educational companion for students and creators.';
  }

  if (
    lower.includes('what can you do') ||
    lower.includes('kya kar sakte ho') ||
    lower.includes('features') ||
    lower.includes('tum kya karte ho')
  ) {
    if (isHi) {
      return 'मैं आपकी आवाज़ से ऐप्स (जैसे WhatsApp, Instagram, YouTube) खोल सकता हूँ, C++, Python, DSA के कॉन्सेप्ट्स समझा सकता हूँ, गणित के सवाल हल कर सकता हूँ, और सामान्य ज्ञान के उत्तर दे सकता हूँ।';
    }
    if (isHinglish) {
      return 'Main voice commands se apps launch kar sakta hoon (WhatsApp, Instagram, etc.), DSA aur C++ programming samjha sakta hoon, math solve kar sakta hoon, aur reels control kar sakta hoon!';
    }
    return 'I can launch installed apps hands-free (like WhatsApp, Instagram, YouTube), explain coding & DSA assignments step-by-step, calculate math, and answer questions across any topic.';
  }

  // 4. Greetings, Chit-Chat & Status
  if (
    lower === 'hi' ||
    lower === 'hello' ||
    lower === 'hey' ||
    lower === 'namaste' ||
    lower === 'pranam' ||
    lower === 'salaam'
  ) {
    if (isHi) return 'नमस्ते! मैं आपकी सहायता के लिए तैयार हूँ। कोई भी सवाल पूछिए या कोई ऐप खोलने को कहिए।';
    if (isHinglish) return 'Hello! Kaise hain aap? Mujhse koi bhi question poochiye ya koi app kholne ko boliye!';
    return 'Hello! How can I help you today? Ask me any question, ask for code help, or tell me to open an app.';
  }

  if (
    lower.includes('how are you') ||
    lower.includes('kaise ho') ||
    lower.includes('kya haal hai') ||
    lower.includes('sab theek') ||
    lower.includes('kaisa hai')
  ) {
    if (isHi) return 'मैं बिल्कुल ठीक हूँ, पूछने के लिए धन्यवाद! आप कैसे हैं और आज क्या नया सीखना या जानना चाहते हैं?';
    if (isHinglish) return 'Main ekdum badiya hoon, thank you! Aap bataiye, aaj kya naya seekhna ya explore karna chahte hain?';
    return "I'm doing fantastic, thank you! How are you doing, and what would you like to explore or learn today?";
  }

  if (
    lower.includes('bore ho raha') ||
    lower.includes('boring') ||
    lower.includes('kuch maza nahi')
  ) {
    if (isHi) return 'बोर मत होइए! आप VoxReel के वीडियो रील्स देख सकते हैं, मुझसे कोई मजेदार पहेली या जोक सुन सकते हैं, या कोई नया कोडिंग कॉन्सेप्ट सीख सकते हैं।';
    if (isHinglish) return 'Bore hone ki zaroorat nahi hai! VoxReel par short reels dekhiye, mujhse koi funny joke ya puzzle suniye, ya koi cool coding trick seekhiye!';
    return "Don't be bored! You can watch short video reels on VoxReel, ask me for a fun programming joke or puzzle, or explore a new tech topic!";
  }

  if (
    lower.includes('joke') ||
    lower.includes('chutkula') ||
    lower.includes('hasao') ||
    lower.includes('funny')
  ) {
    const jokesHi = [
      'टीचर: होमवर्क क्यों नहीं किया? छात्र: सर, लाइट चली गई थी। टीचर: तो मोमबत्ती जला लेते! छात्र: माचिस अंधेरे में नहीं मिल रही थी सर!',
      'प्रोग्रामर की पत्नी: बाज़ार जाओ और एक पैकेट ब्रेड लाओ, अगर अंडे मिले तो 10 ले आना। प्रोग्रामर 10 पैकेट ब्रेड ले आया, क्योंकि अंडे मिल गए थे!',
    ];
    const jokesEn = [
      'Why do programmers prefer dark mode? Because light attracts bugs!',
      'There are only 10 types of people in the world: those who understand binary, and those who don’t.',
      'A SQL query walks into a bar, walks up to two tables and asks: "Can I join you?"',
    ];
    const chosen = isHi ? jokesHi[Math.floor(Math.random() * jokesHi.length)] : jokesEn[Math.floor(Math.random() * jokesEn.length)];
    return chosen;
  }

  if (
    lower.includes('motivat') ||
    lower.includes('quote') ||
    lower.includes('inspire') ||
    lower.includes('hausla') ||
    lower.includes('मोटिवेशन') ||
    lower.includes('प्रेरणा') ||
    lower.includes('सुविचार')
  ) {
    if (isHi) return '“मंजिल उन्हीं को मिलती है जिनके सपनों में जान होती है, पंखों से कुछ नहीं होता हौसलों से उड़ान होती है।” मेहनत करते रहिए, सफलता ज़रूर मिलेगी!';
    if (isHinglish) return '"Consistency is the key to mastery." Chahe coding ho ya padhai, roz thoda thoda aage badhte rahiye, aap zaroor kamiyab honge!';
    return '"The only way to do great work is to love what you do. Keep pushing forward and never stop learning."';
  }

  if (
    lower.includes('good morning') ||
    lower.includes('suprabhat') ||
    lower.includes('shubh prabhat')
  ) {
    if (isHi) return 'सुप्रभात! आपका आज का दिन मंगलमय और ऊर्जावान रहे। आज क्या नया सीखना चाहेंगे?';
    if (isHinglish) return 'Good Morning! Aaj ka din productive aur inspiring rahe. Batayein aaj kis cheez par kaam karna hai!';
    return 'Good morning! Wishing you a productive and successful day ahead. What are we working on today?';
  }

  if (
    lower.includes('good night') ||
    lower.includes('shubh ratri') ||
    lower.includes('sweet dreams')
  ) {
    if (isHi) return 'शुभ रात्रि! अच्छी नींद लीजिए और कल नई ऊर्जा के साथ शुरुआत कीजिए।';
    if (isHinglish) return 'Good Night! Sweet dreams aur acchi neend lijiye. Kal milte hain nayi energy ke saath!';
    return 'Good night! Have a restful sleep and recharge for a great day tomorrow.';
  }

  if (
    lower.includes('thank') ||
    lower.includes('dhanyawad') ||
    lower.includes('shukriya')
  ) {
    if (isHi) return 'आपका बहुत-बहुत स्वागत है! कोई और भी प्रश्न या सहायता हो तो बेझिझक पूछिए।';
    if (isHinglish) return 'You are always welcome! Koi aur sawaal ya help chahiye ho to batayein!';
    return "You're very welcome! I'm always here to help whenever you need anything.";
  }

  // 5. Indian Geography & Capitals
  if (lower.includes('patna') || lower.includes('पटना')) {
    if (isHi) return 'पटना भारत के बिहार राज्य की राजधानी और सबसे बड़ा शहर है। यह पवित्र गंगा नदी के दक्षिणी तट पर स्थित है, जिसे प्राचीन काल में पाटलिपुत्र के नाम से जाना जाता था।';
    if (isHinglish) return 'Patna Bihar ki capital aur sabse bada shahar hai, jo Ganga nadi ke tat par sthit hai. Ise prachin kal mein Pataliputra kaha jata tha.';
    return 'Patna is the capital and largest city of the state of Bihar in India. Situated along the southern bank of the river Ganges, it was historically known as Pataliputra.';
  }

  if (lower.includes('bihar') || lower.includes('बिहार')) {
    if (isHi) return 'बिहार पूर्वी भारत का एक ऐतिहासिक राज्य है जिसकी राजधानी पटना है। यह भगवान बुद्ध और भगवान महावीर की पावन तपोभूमि तथा प्राचीन नालंदा विश्वविद्यालय की भूमि है।';
    if (isHinglish) return 'Bihar eastern India ka ek aitihasik rajya hai jiski capital Patna hai. Nalanda University aur Bodh Gaya Bihar mein hi sthit hain.';
    return 'Bihar is a historic state in eastern India with Patna as its capital. It is world-renowned as the land of Buddha, Mahavira, and the ancient Nalanda University.';
  }

  if (
    lower.includes('capital of india') ||
    lower.includes('bharat ki rajdhani') ||
    lower.includes('india ki capital') ||
    lower.includes('भारत की राजधानी') ||
    (lower.includes('delhi') && (lower.includes('capital') || lower.includes('rajdhani'))) ||
    (lower.includes('दिल्ली') && lower.includes('राजधानी'))
  ) {
    if (isHi) return 'भारत की राजधानी नई दिल्ली (New Delhi) है। यह देश का राजनीतिक और प्रशासनिक केंद्र है।';
    if (isHinglish) return 'Bharat ki capital New Delhi hai, jo desh ka administrative aur political center hai.';
    return 'The capital of India is New Delhi, which serves as the seat of all three branches of the Government of India.';
  }

  if (lower.includes('mumbai') || lower.includes('maharashtra')) {
    if (isHinglish) return 'Maharashtra ki capital Mumbai hai, jise Bharat ki financial aur commercial capital kaha jata hai.';
    return 'Mumbai is the capital of Maharashtra and the financial, commercial, and entertainment capital of India.';
  }

  if (lower.includes('lucknow') || lower.includes('uttar pradesh') || lower.includes('up ki capital')) {
    if (isHinglish) return 'Uttar Pradesh ki capital Lucknow hai, jise Nawabo ka Shahar bhi kaha jata hai.';
    return 'Lucknow is the capital of Uttar Pradesh, historically celebrated as the city of Nawabs and Awadhi culture.';
  }

  if (lower.includes('bengaluru') || lower.includes('bangalore') || lower.includes('karnataka')) {
    if (isHinglish) return 'Karnataka ki capital Bengaluru hai, jise Bharat ka Silicon Valley aur IT capital kaha jata hai.';
    return 'Bengaluru is the capital of Karnataka and widely regarded as the Silicon Valley and IT capital of India.';
  }

  if (lower.includes('kolkata') || lower.includes('calcutta') || lower.includes('west bengal')) {
    if (isHinglish) return 'West Bengal ki capital Kolkata hai, jo Hooghly river ke kinare sthit hai aur City of Joy kahlata hai.';
    return 'Kolkata is the capital of West Bengal, situated along the Hooghly River, known as the City of Joy and cultural capital of India.';
  }

  if (lower.includes('jaipur') || lower.includes('rajasthan')) {
    if (isHinglish) return 'Rajasthan ki capital Jaipur hai, jise pure vishwa mein Pink City ke naam se jana jata hai.';
    return 'Jaipur is the capital of Rajasthan, world-famous as the Pink City for its distinctive terracotta architecture.';
  }

  // 6. Indian Politics & Leaders
  if (
    lower.includes('prime minister') ||
    lower.includes('bharat ke pradhan mantri') ||
    lower.includes('pm of india') ||
    lower.includes('pradhanmantri') ||
    lower.includes('प्रधानमंत्री') ||
    lower.includes('नरेंद्र मोदी')
  ) {
    if (isHi) return 'वर्तमान में भारत के प्रधानमंत्री श्री नरेंद्र मोदी हैं।';
    if (isHinglish) return 'Bharat ke vartaman Prime Minister Shri Narendra Modi hain.';
    return 'The current Prime Minister of India is Narendra Modi.';
  }

  if (
    lower.includes('president of india') ||
    lower.includes('bharat ke rashtrapati') ||
    lower.includes('rashtrapati kaun') ||
    lower.includes('राष्ट्रपति') ||
    lower.includes('द्रौपदी मुर्मू')
  ) {
    if (isHi) return 'वर्तमान में भारत की राष्ट्रपति श्रीमती द्रौपदी मुर्मू हैं।';
    if (isHinglish) return 'Bharat ki vartaman President Smt. Droupadi Murmu hain.';
    return 'The President of India is Smt. Droupadi Murmu.';
  }

  if (
    lower.includes('chief minister of bihar') ||
    lower.includes('bihar ke mukhyamantri') ||
    lower.includes('cm of bihar') ||
    lower.includes('बिहार के मुख्यमंत्री') ||
    lower.includes('नीतीश कुमार')
  ) {
    if (isHi) return 'बिहार के वर्तमान मुख्यमंत्री श्री नीतीश कुमार हैं।';
    if (isHinglish) return 'Bihar ke vartaman Chief Minister Shri Nitish Kumar hain.';
    return 'The current Chief Minister of Bihar is Shri Nitish Kumar.';
  }

  // 7. World & India Monuments / Wonders
  if (
    lower.includes('taj mahal') ||
    lower.includes('tajmahal') ||
    lower.includes('ताजमहल') ||
    lower.includes('ताज महल')
  ) {
    if (isHi) return 'ताजमहल भारत के उत्तर प्रदेश राज्य के आगरा शहर में यमुना नदी के तट पर स्थित है। इसे मुगल सम्राट शाहजहाँ ने अपनी बेगम मुमताज़ महल की याद में बनवाया था, और यह विश्व के सात अजूबों में शामिल है।';
    if (isHinglish) return 'Taj Mahal Agra (Uttar Pradesh) mein Yamuna nadi ke kinare sthit hai. Ise Shah Jahan ne Mumtaz Mahal ki yaad mein banwaya tha, aur yeh duniya ke 7 wonders mein se ek hai.';
    return 'The Taj Mahal is an ivory-white marble mausoleum on the south bank of the river Yamuna in Agra, India, commissioned by Mughal emperor Shah Jahan in memory of Mumtaz Mahal.';
  }

  if (lower.includes('independence day') || lower.includes('azadi') || lower.includes('bharat kab azad')) {
    if (isHi) return 'भारत 15 अगस्त 1947 को ब्रिटिश शासन से आज़ाद हुआ था। हर साल 15 अगस्त को स्वतंत्रता दिवस के रूप में मनाया जाता है।';
    if (isHinglish) return 'Bharat 15 August 1947 ko azaad hua tha. Is din ko poore desh mein Independence Day ke roop mein celebrate kiya jata hai.';
    return 'India gained its independence from British rule on August 15, 1947, which is celebrated nationwide as Independence Day.';
  }

  if (lower.includes('republic day') || lower.includes('gantantra diwas')) {
    if (isHi) return 'भारत में गणतंत्र दिवस 26 जनवरी को मनाया जाता है। इसी दिन 26 जनवरी 1950 को भारत का संविधान लागू हुआ था।';
    if (isHinglish) return 'Republic Day 26 January ko manaya jata hai, kyunki 26 January 1950 ko Bharat ka Samvidhan (Constitution) lagu hua tha.';
    return 'Republic Day is celebrated on January 26 each year, commemorating the date on which the Constitution of India came into effect in 1950.';
  }

  if (
    lower.includes('mount everest') ||
    lower.includes('everest') ||
    lower.includes('highest mountain') ||
    lower.includes('highest peak') ||
    lower.includes('sabse uncha pahaad') ||
    lower.includes('sabse uncha pahad') ||
    lower.includes('sabse unchi choti')
  ) {
    if (isHi) return 'माउंट एवरेस्ट पृथ्वी की सबसे ऊंची पर्वत चोटी है, जिसकी ऊंचाई समुद्र तल से 8,848.86 मीटर है। यह हिमालय पर्वत श्रृंखला में नेपाल और तिब्बत की सीमा पर स्थित है।';
    if (isHinglish) return 'Mount Everest duniya ki sabse unchi mountain peak hai jiski height 8,848.86 meters hai. Yeh Nepal aur Tibet ke border par Himalayas mein sthit hai.';
    return 'Mount Everest is Earth’s highest mountain above sea level, located in the Himalayas along the border between Nepal and Tibet, with an elevation of 8,848.86 meters.';
  }

  if (lower.includes('ganga') || lower.includes('ganges')) {
    if (isHi) return 'गंगा भारत की सबसे लंबी और पवित्र नदी है, जिसकी कुल लंबाई लगभग 2,525 किलोमीटर है। यह गंगोत्री हिमनद (उत्तराखंड) से निकलकर बंगाल की खाड़ी में गिरती है।';
    if (isHinglish) return 'Ganga Bharat ki sabse lambi aur pavitra nadi hai (length: 2,525 km). Yeh Gangotri se nikal kar Bay of Bengal mein milti hai.';
    return 'The Ganges (Ganga) is the sacred and longest river of India, flowing 2,525 km from the Himalayas through the Gangetic Plain into the Bay of Bengal.';
  }

  // 8. Science & Nature
  if (lower.includes('photosynthesis') || lower.includes('prakash sanshleshan')) {
    if (isHi) return 'प्रकाश संश्लेषण (Photosynthesis) वह प्रक्रिया है जिसके द्वारा हरे पौधे सूर्य के प्रकाश, पानी और कार्बन डाइऑक्साइड की सहायता से अपने भोजन (ग्लूकोज) का निर्माण करते हैं और ऑक्सीजन छोड़ते हैं।';
    if (isHinglish) return 'Photosynthesis wo natural process hai jisme green plants sunlight, water aur CO2 ka use karke glucose aur oxygen banate hain.';
    return 'Photosynthesis is the biological process used by plants and other organisms to convert light energy, carbon dioxide, and water into chemical energy (glucose) and release oxygen.';
  }

  if (lower.includes('speed of light') || lower.includes('roshni ki speed')) {
    if (isHi) return 'प्रकाश की गति निर्वात (Vacuum) में लगभग 3,00,000 किलोमीटर प्रति सेकंड (3 × 10⁸ m/s) होती है।';
    if (isHinglish) return 'Light ki speed vacuum mein lagbhag 3,00,000 km per second (3 x 10^8 m/s) hoti hai.';
    return 'The speed of light in vacuum is approximately 299,792 kilometers per second (about 3 × 10^8 meters per second).';
  }

  if (lower.includes('gravity') || lower.includes('gurutwakarshan') || lower.includes('newton')) {
    if (isHi) return 'गुरुत्वाकर्षण वह अदृश्य आकर्षण बल है जो द्रव्यमान वाली वस्तुओं को एक-दूसरे की ओर खींचता है। पृथ्वी पर इसका त्वरण मान g ≈ 9.8 m/s² होता है। आइजैक न्यूटन ने गुरुत्वाकर्षण का सार्वभौमिक नियम प्रतिपादित किया था।';
    if (isHinglish) return 'Gravity wo natural force hai jo har mass wali object ko dusri object ki taraf kheechti hai. Earth par iska acceleration g = 9.8 m/s² hota hai, jise Sir Isaac Newton ne discover kiya tha.';
    return 'Gravity is a fundamental physical force by which all things with mass are brought toward one another. On Earth, gravitational acceleration is approximately 9.8 m/s², formulated by Sir Isaac Newton.';
  }

  if (lower.includes('solar system') || lower.includes('saur mandal') || lower.includes('planets')) {
    if (isHi) return 'हमारे सौर मंडल में सूर्य के चारों ओर 8 ग्रह चक्कर लगाते हैं: बुध, शुक्र, पृथ्वी, मंगल, बृहस्पति, शनि, यूरेनस और नेपच्यून। सबसे बड़ा ग्रह बृहस्पति (Jupiter) है।';
    if (isHinglish) return 'Hamaare solar system mein Sun aur 8 planets hain: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, aur Neptune. Jupiter sabse bada planet hai.';
    return 'Our solar system consists of the Sun and eight planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune, with Jupiter being the largest.';
  }

  // 9. Computer Science & Programming Languages
  if (lower.includes('c++') || lower.includes('cpp')) {
    if (isHinglish) return 'C++ ek powerful, high-performance object-oriented programming language hai jise Bjarne Stroustrup ne develop kiya tha. Yeh fast execution speed aur memory control ke liye DSA, competitive programming aur game engines mein use hoti hai.';
    return 'C++ is a powerful, high-performance object-oriented programming language developed by Bjarne Stroustrup, widely used in game engines, operating systems, and competitive programming.';
  }

  if (lower.includes('python')) {
    if (isHinglish) return 'Python ek high-level, easy-to-read programming language hai jo dynamic typing aur huge library ecosystem provide karti hai. Yeh AI, Machine Learning, Data Science aur Web Backend development mein sabse zyada popular hai.';
    return 'Python is a high-level, dynamically typed programming language known for its clean syntax and readability, dominating fields like Artificial Intelligence, Machine Learning, and Data Science.';
  }

  if (lower.includes('java ') || lower === 'java') {
    if (isHinglish) return 'Java ek robust, class-based object-oriented programming language hai jo "Write Once, Run Anywhere" (WORA) philosophy par kaam karti hai via JVM (Java Virtual Machine). Enterprise backends aur Android apps mein widely used hai.';
    return 'Java is a robust, class-based object-oriented language renowned for its "Write Once, Run Anywhere" principle powered by the Java Virtual Machine (JVM).';
  }

  if (lower.includes('javascript') || lower.includes(' js')) {
    if (isHinglish) return 'JavaScript web ki lingua franca hai jo web browsers mein interactive user interfaces banane aur Node.js ke zariye scalable backend server applications run karne ke liye use hoti hai.';
    return 'JavaScript is the fundamental scripting language of the web, enabling dynamic interactive user interfaces on the frontend and scalable servers on the backend with Node.js.';
  }

  if (lower.includes('html') || lower.includes('css')) {
    if (isHinglish) return 'HTML (HyperText Markup Language) web pages ka basic structure aur content banata hai, jabki CSS (Cascading Style Sheets) layout, colors, responsive design aur styling handle karta hai.';
    return 'HTML provides the structural skeleton and content of web pages, while CSS styles and creates responsive, beautiful layouts.';
  }

  if (lower.includes('react')) {
    if (isHinglish) return 'React.js Meta dwara banayi gayi popular JavaScript library hai jo reusable components aur Virtual DOM ke through lightning-fast, reactive web user interfaces build karne ke liye use hoti hai.';
    return 'React is an open-source front-end JavaScript library developed by Meta for building component-based, high-performance user interfaces via a Virtual DOM.';
  }

  // 10. Data Structures & Algorithms (DSA)
  if (lower.includes('binary search')) {
    if (isHi) return 'बाइनरी सर्च एक कुशल खोज एल्गोरिथ्म है जो सॉर्टेड एरे में किसी एलिमेंट को O(log N) समय में खोजता है। यह मध्य एलिमेंट (mid) से तुलना करके सर्च स्पेस को हर बार आधा करता जाता है।';
    if (isHinglish) return 'Binary Search ek sorted array mein O(log N) time complexity mein target element dhoondhne ka algorithm hai. Yeh search space ko har step par aadha (divide & conquer) karta hai.';
    return 'Binary Search is an efficient algorithm with O(log n) time complexity that locates an element in a sorted array by repeatedly dividing the search space in half.';
  }

  if (lower.includes('polymorphism')) {
    if (isHinglish) return 'Polymorphism OOP ka core pillar hai jiska arth hai "many forms". Iske do mukhya types hote hain: Compile-time polymorphism (Function Overloading & Operator Overloading) aur Run-time polymorphism (Virtual Functions & Method Overriding).';
    return 'Polymorphism is an object-oriented programming concept where a single entity can take many forms, broadly divided into Compile-time (Function Overloading) and Run-time polymorphism (Method Overriding via virtual functions).';
  }

  if (lower.includes('recursion')) {
    if (isHinglish) return 'Recursion ek aisi programming technique hai jisme function khud ko solve karne ke liye call karta hai. Har recursive function mein ek Base Case (rukne ke liye) aur ek Recursive Case hona anivarya hota hai.';
    return 'Recursion is a programming technique where a function calls itself to solve smaller sub-problems of the same type, requiring a base case to terminate and a recursive step.';
  }

  if (lower.includes('array vs linked list') || (lower.includes('array') && lower.includes('linked list'))) {
    if (isHinglish) return 'Array contiguous memory blocks mein data store karta hai jisme O(1) random access milta hai par size fixed hoti hai. Linked List dynamic nodes se banti hai jisme pointers hote hain, insertion O(1) hota hai par access O(N) leta hai.';
    return 'Arrays store elements in contiguous memory with O(1) random access but fixed capacity. Linked Lists store nodes connected by pointers, providing dynamic sizing and O(1) insertions, but requiring O(n) sequential access.';
  }

  if (lower.includes('stack') || lower.includes('queue')) {
    if (isHinglish) return 'Stack LIFO (Last In First Out) principle follow karta hai (jaise push & pop). Queue FIFO (First In First Out) principle follow karta hai (jaise enqueue & dequeue).';
    return 'A Stack operates on a LIFO (Last In, First Out) principle, while a Queue operates on a FIFO (First In, First Out) principle.';
  }

  if (lower.includes('database') || lower.includes('sql') || lower.includes('nosql')) {
    if (isHinglish) return 'SQL databases (jaise PostgreSQL, MySQL) structured relational tables aur strict schema use karte hain. NoSQL databases (jaise MongoDB) flexible document, key-value ya graph format use karte hain high-scale unstructured data ke liye.';
    return 'SQL databases are relational and structured with strict schemas and ACID compliance, while NoSQL databases provide flexible schema designs (document, key-value) optimized for horizontal scalability.';
  }

  if (lower.includes('api') || lower.includes('what is api')) {
    if (isHinglish) return 'API (Application Programming Interface) ek software intermediary hai jo do alag alag applications ko aapas mein baat aur data exchange karne ki suvidha deta hai (jaise REST APIs JSON data ke sath).';
    return 'An API (Application Programming Interface) is a computing interface that enables different software systems and applications to communicate and exchange data seamlessly.';
  }

  if (lower.includes('machine learning') || lower.includes('ai') || lower.includes('artificial intelligence')) {
    if (isHinglish) return 'AI (Artificial Intelligence) machines ko human jaise sochne aur decide karne ki shamta deta hai. Machine Learning AI ka subfield hai jisme models data se pattern seekh kar predictions karte hain.';
    return 'Artificial Intelligence (AI) encompasses machines capable of performing tasks that typically require human cognition. Machine Learning is a subset where algorithms learn patterns directly from data.';
  }

  // 11. Conversational Open-Ended Fallback with Contextual Analysis
  return generateContextualFallback(message, lower, languageHint);
}

/**
 * Solves standard math expressions
 */
function solveMathQuery(
  lower: string,
  isHi: boolean,
  isHinglish: boolean
): string | null {
  // Percentage query: "what is 15% of 200", "20 percent of 500"
  const percentMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)\s*(?:of|ka)?\s*(\d+(?:\.\d+)?)/);
  if (percentMatch) {
    const rate = parseFloat(percentMatch[1]);
    const total = parseFloat(percentMatch[2]);
    const ans = (rate * total) / 100;
    if (isHi) return `${total} का ${rate}% बराबर ${ans} होता है।`;
    if (isHinglish) return `${total} ka ${rate}% answer ${ans} hota hai.`;
    return `${rate}% of ${total} is ${ans}.`;
  }

  // Square root: "square root of 144", "sqrt 64"
  const sqrtMatch = lower.match(/(?:square root of|sqrt|root of)\s*(\d+(?:\.\d+)?)/);
  if (sqrtMatch) {
    const num = parseFloat(sqrtMatch[1]);
    const ans = Math.sqrt(num);
    if (isHi) return `${num} का वर्गमूल (Square Root) ${ans} है।`;
    if (isHinglish) return `${num} ka square root ${ans} hota hai.`;
    return `The square root of ${num} is ${ans}.`;
  }

  // Basic arithmetic: "15 + 25", "100 / 4", "25 * 5", "50 - 12"
  const mathMatch = lower.match(/(?:what is|calculate|solve|kitna hota hai)?\s*(\d+(?:\.\d+)?)\s*([\+\-\*\/xX])\s*(\d+(?:\.\d+)?)/);
  if (mathMatch) {
    const a = parseFloat(mathMatch[1]);
    const op = mathMatch[2].toLowerCase();
    const b = parseFloat(mathMatch[3]);
    let result = 0;
    if (op === '+') result = a + b;
    else if (op === '-') result = a - b;
    else if (op === '*' || op === 'x') result = a * b;
    else if (op === '/' && b !== 0) result = a / b;
    else if (op === '/' && b === 0) {
      return isHinglish ? 'Zero se divide nahi kiya ja sakta (Undefined).' : 'Division by zero is undefined.';
    }

    if (isHi) return `${a} ${op} ${b} का उत्तर ${result} है।`;
    if (isHinglish) return `${a} ${op} ${b} ka answer ${result} hota hai.`;
    return `${a} ${op} ${b} is equal to ${result}.`;
  }

  return null;
}

/**
 * Intelligent Contextual responder for queries not matched in exact dictionary
 */
function generateContextualFallback(
  rawQuery: string,
  lower: string,
  languageHint: 'en' | 'hi' | 'hinglish'
): string {
  const isHi = languageHint === 'hi';
  const isHinglish = languageHint === 'hinglish';

  // If question starts with "kahan / where"
  if (lower.startsWith('where') || lower.includes('kahan hai') || lower.includes('kidhar')) {
    if (isHi) {
      return `आपने "${rawQuery}" के स्थान के बारे में पूछा। यदि यह किसी प्रसिद्ध शहर या संस्थान का नाम है, तो आप मुझे उसका राज्य या देश बता सकते हैं, मैं विस्तार से जानकारी दूंगा!`;
    }
    if (isHinglish) {
      return `Aapne "${rawQuery}" ke baare mein poocha. Agar yeh kisi city, state ya tourist place ka question hai to mujhe specific naam batayein, main pura detail bataunga!`;
    }
    return `Regarding "${rawQuery}": If you are inquiring about a specific city, landmark, or territory, please specify the region or country for detailed geographic guidance!`;
  }

  // If question starts with "kaise / how"
  if (lower.startsWith('how') || lower.includes('kaise') || lower.includes('kare')) {
    if (isHi) {
      return `आपने प्रक्रिया पूछी: "${rawQuery}"। किसी भी तकनीक, कोडिंग समस्या या विषय को चरणबद्ध तरीके से हल करने में मैं आपकी पूरी मदद कर सकता हूँ। क्या आप इसका कोडिंग उदाहरण या सिद्धांत समझना चाहते हैं?`;
    }
    if (isHinglish) {
      return `Aapne poochha "${rawQuery}". Isko step-by-step implement ya solve karne ke liye aap mujhe exact language (jaise C++, Python) ya context bata sakte hain, main turant help karunga!`;
    }
    return `Regarding your question on "${rawQuery}": I can guide you through the step-by-step process, logic, or code implementation. Let me know which language or framework you are using!`;
  }

  // If question starts with "kya / what"
  if (lower.startsWith('what') || lower.includes('kya hai') || lower.includes('kya hota')) {
    if (isHi) {
      return `"${rawQuery}" एक महत्वपूर्ण विषय है। आप मुझे इसके बारे में कोई विशेष प्रश्न या अवधारणा पूछ सकते हैं, मैं आपको सरल शब्दों और उदाहरणों के साथ समझाऊंगा!`;
    }
    if (isHinglish) {
      return `"${rawQuery}" ek rochak topic hai! Iske fundamentals, code syntax, ya real-world use case ke baare mein jo bhi jaanna chahein, freely poochiye!`;
    }
    return `Regarding "${rawQuery}": That is a great topic. Let me know whether you'd like a concise summary, academic breakdown, or real-world example to explore it further!`;
  }

  // Default pleasant conversation response
  if (isHi) {
    return `मैंने आपकी बात सुनी: "${rawQuery}"। मैं कोडिंग (C++, DSA, Python), सामान्य ज्ञान, गणित के समाधान और ऐप्स ओपन करने के लिए तैयार हूँ। आप कोई भी विशिष्ट सवाल पूछ सकते हैं!`;
  }
  if (isHinglish) {
    return `Maine aapka message samjha: "${rawQuery}". Main programming concepts, GK, calculations aur app controls mein expert hoon. Batayein isme aapko kya jaankari chahiye?`;
  }
  return `I received your query: "${rawQuery}". I'm equipped to assist with coding concepts (C++, DSA, Python), general knowledge, mathematics, and app commands. Feel free to ask more details!`;
}
