import { PrismaClient, StoryStatus, StoryPermission, DisplayPreference, UserRole } from "@prisma/client";
import { auth } from "../src/lib/auth";
import { CLIENT_STORIES } from "./data/client-stories";

const prisma = new PrismaClient();

async function getOrCreateUser(
  email: string,
  name: string,
  password: string,
  role: UserRole
) {
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`Creating user: ${email} (${role})`);
    try {
      const res = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
      });
      if (res && res.user) {
        user = await prisma.user.update({
          where: { id: res.user.id },
          data: { role },
        });
      }
    } catch (err) {
      console.warn(`Fallback user creation for ${email}:`, err);
      user = await prisma.user.create({
        data: {
          email,
          name,
          role,
          emailVerified: true,
        },
      });
    }
  } else {
    user = await prisma.user.update({
      where: { email },
      data: { name, role },
    });
  }

  if (!user) {
    throw new Error(`Failed to create or retrieve user: ${email}`);
  }

  return user;
}

async function main() {
  console.log("🌱 Starting StoryKeeper AI Phase 1 seed...");

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@storykeeper.org";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "StoryKeeper2026!Admin";

  // 1. Users
  const adminUser = await getOrCreateUser(
    adminEmail,
    "Archive Director",
    adminPassword,
    "ADMIN"
  );

  const sunita = await getOrCreateUser(
    "sunita@storykeeper.org",
    "Sunita Sharma",
    "StoryKeeper2026!Sunita",
    "CONTRIBUTOR"
  );

  const rameshwar = await getOrCreateUser(
    "rameshwar@storykeeper.org",
    "Rameshwar Patel",
    "StoryKeeper2026!Patel",
    "CONTRIBUTOR"
  );

  const aruna = await getOrCreateUser(
    "aruna@storykeeper.org",
    "Aruna Sengupta",
    "StoryKeeper2026!Aruna",
    "CONTRIBUTOR"
  );

  const subhashini = await getOrCreateUser(
    "subhashini@storykeeper.org",
    "Subhashini Murthy",
    "StoryKeeper2026!Subha",
    "CONTRIBUTOR"
  );

  const harjinder = await getOrCreateUser(
    "harjinder@storykeeper.org",
    "Harjinder Gill",
    "StoryKeeper2026!Harjinder",
    "CONTRIBUTOR"
  );

  console.log("✓ Seeded admin & 5 regional contributor accounts");

  // 2. Themes (15 themes)
  const themeData = [
    { name: "Migration", slug: "migration", description: "Displacement, movement across borders, and settling in new lands." },
    { name: "Resilience", slug: "resilience", description: "Surviving hardships, historical upheavals, and economic challenges." },
    { name: "Community", slug: "community", description: "Village gatherings, shared wells, neighborhood solidarity, and collective living." },
    { name: "Festivals", slug: "festivals", description: "Sacred celebrations, folk holidays, music, and seasonal festivities." },
    { name: "Food", slug: "food", description: "Heirloom recipes, culinary rituals, traditional spices, and feast customs." },
    { name: "Craft", slug: "craft", description: "Weaving, pottery, metalwork, carpentry, and handmade folk arts." },
    { name: "Family", slug: "family", description: "Generational wisdom, parenting, sibling bonds, and ancestor memories." },
    { name: "Farming", slug: "farming", description: "Monsoon cycles, traditional seeds, cattle rearing, and harvest songs." },
    { name: "Education", slug: "education", description: "Village schools, first-generation learners, and the quest for literacy." },
    { name: "Faith & Ritual", slug: "faith-and-ritual", description: "Prayers, sacred groves, temple ceremonies, and community shrines." },
    { name: "Marriage & Weddings", slug: "marriage-and-weddings", description: "Matchmaking, ceremonial songs, trousseaus, and village nuptials." },
    { name: "Childhood", slug: "childhood", description: "Street games, river swims, folklore, and youthful innocence." },
    { name: "Women's Histories", slug: "womens-histories", description: "Untold sacrifices, courtyard leadership, and female solidarity." },
    { name: "Partition", slug: "partition", description: "Memories of the 1947 division, lost homes, and shared borders." },
    { name: "Work & Livelihood", slug: "work-and-livelihood", description: "Traditional trades, guild customs, and changing economic landscapes." },
  ];

  const themes: Record<string, string> = {};
  for (const t of themeData) {
    const created = await prisma.theme.upsert({
      where: { slug: t.slug },
      update: { name: t.name, description: t.description },
      create: t,
    });
    themes[t.slug] = created.id;
  }
  console.log(`✓ Seeded ${themeData.length} themes`);

  // 3. Collections (6 curated collections)
  const collectionData = [
    {
      name: "Grandmothers' Kitchen",
      slug: "grandmothers-kitchen",
      description: "Heirloom recipes, earthen stove memories, and food traditions passed down through spoken instruction.",
      coverGradient: "saffron-terracotta",
      motif: "wheat-spice",
      displayOrder: 1,
    },
    {
      name: "Vanishing Professions",
      slug: "vanishing-professions",
      description: "Blacksmiths, water carriers, handloom weavers, and folk singers whose work is disappearing into history.",
      coverGradient: "ink-moss",
      motif: "loom-tools",
      displayOrder: 2,
    },
    {
      name: "Partition Memories",
      slug: "partition-memories",
      description: "Personal recollections of displacement, shared neighborhoods, and cross-border nostalgia.",
      coverGradient: "plum-terracotta",
      motif: "railway-border",
      displayOrder: 3,
    },
    {
      name: "Festival Stories",
      slug: "festival-stories",
      description: "Oral accounts of village carnivals, monsoon fairs, and forgotten regional celebrations.",
      coverGradient: "saffron-plum",
      motif: "diya-flame",
      displayOrder: 4,
    },
    {
      name: "Childhood Then & Now",
      slug: "childhood-then-and-now",
      description: "Childhood memories spanning street games, tree climbs, and stories told beneath star-lit skies.",
      coverGradient: "moss-saffron",
      motif: "kite-river",
      displayOrder: 5,
    },
    {
      name: "Women's Untold Histories",
      slug: "womens-untold-histories",
      description: "Courtyard conversations, maternal wisdom, and the resilient women who anchored communities.",
      coverGradient: "plum-ink",
      motif: "weave-spiral",
      displayOrder: 6,
    },
  ];

  const collections: Record<string, string> = {};
  for (const c of collectionData) {
    const created = await prisma.collection.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        description: c.description,
        coverGradient: c.coverGradient,
        motif: c.motif,
        displayOrder: c.displayOrder,
      },
      create: {
        ...c,
        status: "ACTIVE",
      },
    });
    collections[c.slug] = created.id;
  }
  console.log(`✓ Seeded ${collectionData.length} collections`);

  // Helper for Keywords
  async function connectKeywords(storyId: string, kwList: string[]) {
    await prisma.storyKeyword.deleteMany({ where: { storyId } });
    for (const name of kwList) {
      const normalizedName = name.toLowerCase().trim();
      const kw = await prisma.keyword.upsert({
        where: { normalizedName },
        update: { name },
        create: { name, normalizedName },
      });
      await prisma.storyKeyword.create({
        data: { storyId, keywordId: kw.id },
      });
    }
  }

  // Helper for Themes
  async function connectThemes(storyId: string, themeSlugs: string[]) {
    await prisma.storyTheme.deleteMany({ where: { storyId } });
    for (const slug of themeSlugs) {
      const themeId = themes[slug];
      if (themeId) {
        await prisma.storyTheme.create({
          data: { storyId, themeId },
        });
      }
    }
  }

  // 4. 14 Sample Stories (isSample = true, PUBLISHED + PUBLIC)
  const sampleStories = [
    {
      slug: "mahua-clay-oven-recipe",
      title: "The Scent of Mahua and the Mud Chulha",
      contributorId: sunita.id,
      collectionId: collections["grandmothers-kitchen"],
      originalLanguage: "Bhojpuri",
      originalTranscript: "हमरे बचपन में जब दादी चूल्हे पर रोटी सेकती थीं, तब पूरे आँगन में महुए के फूल की खुशबू फैल जाती थी। जाड़े के दिनों में हम सब भाई-बहन मिट्टी के चूल्हे के चारों तरफ बैठ जाते थे। दादी अपने हाथ से गुड़ और सत्तू का पराठा बनाती थीं।",
      englishTranslation: "In our childhood, when my grandmother baked flatbreads on the clay stove, the fragrance of mahua flowers would spread across the courtyard. On winter mornings, all of us siblings gathered closely around the earthen hearth. Grandmother made parathas stuffed with roasted gram flour and fresh jaggery.",
      summary: "A warm reflection on winter mornings in rural Bhojpur during the late 1960s, describing the ritual of communal cooking on clay stoves and the heirloom recipe for mahua flower harvest flatbread.",
      region: "Bhojpur, Bihar",
      topic: "Traditional Cooking",
      timePeriodLabel: "1960s",
      timePeriodStart: 1965,
      timePeriodEnd: 1969,
      audioDurationSec: 245,
      displayPreference: "NAMED" as DisplayPreference,
      themeSlugs: ["food", "family", "childhood"],
      keywords: ["harvest", "chulha", "mahua", "bhojpur", "clay stove", "heirloom recipe"],
    },
    {
      slug: "crossing-sutlej-night-train-1947",
      title: "Crossing the Sutlej: The Final Night Train",
      contributorId: rameshwar.id,
      collectionId: collections["partition-memories"],
      originalLanguage: "Punjabi",
      originalTranscript: "اس رات ستلج دا پاݨی بڑا خاموش سی۔ ٹرین ہولی ہولی پل تے چڑھی، ہر مسافر نے اپݨا ساہ روکیا ہویا سی۔ ساڈے نال بیٹھے باباجی نے اپنی گٹھڑی چھاتی نال لائی رکھی سی، جس وچ صرف پورانے پنڈ دی مٹی سی۔",
      englishTranslation: "That night the waters of the Sutlej river were eerily silent. As our locomotive crept onto the iron bridge, every passenger held their breath. An elderly elder beside us clutched a cloth bundle to his chest—inside was nothing but soil gathered from his ancestral courtyard.",
      summary: "An eyewitness account of crossing the Punjab border in October 1947 aboard an unlit refugee train, carrying memories of an abandoned ancestral village.",
      region: "Amritsar, Punjab",
      topic: "Partition Migration",
      timePeriodLabel: "1940s",
      timePeriodStart: 1947,
      timePeriodEnd: 1947,
      audioDurationSec: 375,
      displayPreference: "ANONYMOUS" as DisplayPreference,
      themeSlugs: ["partition", "migration", "resilience"],
      keywords: ["partition", "sutlej", "refugee", "amritsar", "1947"],
    },
    {
      slug: "sound-of-handloom-in-shantipur",
      title: "Rhythm of the Loom: Silk and Shuttle in Shantipur",
      contributorId: aruna.id,
      collectionId: collections["vanishing-professions"],
      originalLanguage: "Bengali",
      originalTranscript: "আমাদের শান্তিপুরের প্রতিটা গলিতে সকাল হলেই খটখট আওয়াজ শোনা যেত। বাবা ভোর চারটেয় উঠে তাঁতের মাকু চালাতেন। ঢাকাই জামদানির নকশা তুলতে কখনো গোটা দিন লেগে যেত। এখন সেই সুর আর শোনা যায় না।",
      englishTranslation: "In every lane of Shantipur, the rhythmic click-clack of the looms signaled dawn. My father would wake at four in the morning to guide the wooden shuttle. Crafting an intricate motif on a Dhakai Jamdani sari often took an entire day. That music has now faded from our streets.",
      summary: "Memories from a master weaver's daughter tracing four generations of handloom craftsmanship in Nadia district, recounting how cotton warp was prepared and the loss of traditional jacquard work.",
      region: "Nadia, West Bengal",
      topic: "Handloom Craft",
      timePeriodLabel: "1970s",
      timePeriodStart: 1972,
      timePeriodEnd: 1979,
      audioDurationSec: 310,
      displayPreference: "NAMED" as DisplayPreference,
      themeSlugs: ["craft", "work-and-livelihood", "community"],
      keywords: ["handloom", "shantipur", "jamdani", "weaving", "bengal"],
    },
    {
      slug: "madhubani-kohbar-wedding-murals",
      title: "Painting Kohbar on the Nuptial Courtyard Wall",
      contributorId: sunita.id,
      collectionId: collections["womens-untold-histories"],
      originalLanguage: "Maithili",
      originalTranscript: "मिथिला मे वियाहक बेरा कोहबर लिखबाक परंपरा बहुत पुरान अछि। हमर दादी आ माए बांस के कुची आ पिठार सँ देवाल पर कमल, माछ आ बासक चित्र बनबैत छलीह। ई केवल चित्र नहि छल, बल्कि नव दांपत्य जीवन लेल आशीर्वाद छल।",
      englishTranslation: "In Mithila, the tradition of painting the Kohbar bridal chamber wall dates back centuries. My grandmother and mother used bamboo twigs and ground rice paste to draw lotuses, sacred fish, and bamboo groves on clay plaster. These weren't mere paintings; they were sacred invocations for the couple.",
      summary: "An oral preservation of Mithila folk art techniques, describing natural pigments made from soot, turmeric, and berries, and the wedding night songs sung by village matriarchs.",
      region: "Madhubani, Bihar",
      topic: "Folk Murals",
      timePeriodLabel: "1980s",
      timePeriodStart: 1982,
      timePeriodEnd: 1985,
      audioDurationSec: 290,
      displayPreference: "NAMED" as DisplayPreference,
      themeSlugs: ["womens-histories", "craft", "marriage-and-weddings"],
      keywords: ["madhubani", "kohbar", "mithila", "natural pigments", "wedding art"],
    },
    {
      slug: "charkha-songs-during-monsoon",
      title: "Charkha Melodies in the Rain-Drenched Verandah",
      contributorId: rameshwar.id,
      collectionId: collections["womens-untold-histories"],
      originalLanguage: "Gujarati",
      originalTranscript: "ચોમાસામાં જ્યારે ખેતરમાં કામ બંધ થતું, ત્યારે ફળીયાની તમામ બહેનો એકઠાં થઈને રેંટિયો કાંતતી. અમે વરસાદના ગીતો ગાતાં અને રેંટિયાનો અવાજ વરસાદની ઝડી સાથે ભળી જતો. એ સૂતરના તાંતણે અમારું જીવન ગૂંથાયેલું હતું.",
      englishTranslation: "During monsoon rains when field work paused, women from all neighborhood households gathered in the sheltered verandah to spin on the charkha. We sang rain songs, and the whir of spinning wheels blended seamlessly with the patter of rainfall on clay tiles.",
      summary: "Recollections of women spinning cotton thread during the monsoon season in rural Saurashtra, capturing community bonding and traditional seasonal songs.",
      region: "Rajkot, Gujarat",
      topic: "Spinning Traditions",
      timePeriodLabel: "1950s",
      timePeriodStart: 1954,
      timePeriodEnd: 1959,
      audioDurationSec: 220,
      displayPreference: "ANONYMOUS" as DisplayPreference,
      themeSlugs: ["womens-histories", "craft", "community"],
      keywords: ["charkha", "saurashtra", "spinning", "monsoon songs", "gujarat"],
    },
    {
      slug: "first-radio-in-the-village-square",
      title: "The Evening Crowds Around the Village Murphy Radio",
      contributorId: aruna.id,
      collectionId: collections["childhood-then-and-now"],
      originalLanguage: "Hindi",
      originalTranscript: "1962 में हमारे गांव के प्रधानजी के घर पहला मर्फी रेडियो आया था। शाम को छह बजते ही पूरा गांव चौपाल पर जमा हो जाता था। जब आकाशवाणी से समाचार की घंटी बजती, तो सन्नाटा छा जाता था। उस लकड़ी के डिब्बे ने हमारी दुनिया बदल दी थी।",
      englishTranslation: "In 1962, the first wooden Murphy radio arrived at the village headman's house. Every evening as six o'clock struck, the entire village congregated under the banyan tree. When All India Radio's news chimes rang, pin-drop silence swept through the crowd. That wooden box changed our worldview.",
      summary: "Memories of the collective thrill when the first transistor radio was introduced to a North Indian village, uniting farmers and children around daily evening broadcasts.",
      region: "Varanasi, Uttar Pradesh",
      topic: "Community History",
      timePeriodLabel: "1960s",
      timePeriodStart: 1962,
      timePeriodEnd: 1965,
      audioDurationSec: 260,
      displayPreference: "NAMED" as DisplayPreference,
      themeSlugs: ["community", "childhood", "education"],
      keywords: ["radio", "akashvani", "chaopal", "varanasi", "village life"],
    },
    {
      slug: "kaveri-delta-monsoon-harvest",
      title: "Harvest Songs of the Kaveri Delta: Sowing and Kuruvai Paddy",
      contributorId: sunita.id,
      collectionId: collections["vanishing-professions"],
      originalLanguage: "Tamil",
      originalTranscript: "காவிரி ஆற்றில் புது வெள்ளம் வரும் ஆடிப் பெருக்கு நாளில், நாங்கள் வயல்களில் இறங்குவோம். நாற்று நடும் பெண்கள் பாடும் நாற்றுப்பாட்டு ஊர் முழுக்க எதிரொலிக்கும். அந்தப் பாடல்கள் வெறும் இசை அல்ல, வயலின் களைப்பையும் வெயிலின் சூட்டையும் மறக்கச் செய்யும் மருந்து.",
      englishTranslation: "On the day of Aadi Perukku when the first fresh swells filled the Kaveri river, we stepped barefoot into the slushy fields. The transplantation songs sung by women echoed across green terraces. Those verses were not just music; they were medicine that washed away the scorching sun and aching backs.",
      summary: "An oral preservation of traditional Kuruvai paddy transplantation and monsoon harvest chants, seasonal river rituals from the fertile Thanjavur delta.",
      region: "Thanjavur, Tamil Nadu",
      topic: "Monsoon Harvest & Agricultural Songs",
      timePeriodLabel: "1970s",
      timePeriodStart: 1974,
      timePeriodEnd: 1978,
      audioDurationSec: 330,
      displayPreference: "NAMED" as DisplayPreference,
      themeSlugs: ["farming", "work-and-livelihood", "festivals"],
      keywords: ["harvest", "kaveri", "thanjavur", "paddy songs", "aadi perukku", "tamil nadu", "monsoon harvest"],
    },
    {
      slug: "brass-coppersmith-bazaar-pune",
      title: "Hammers on Red Copper: The Tambat Ali of Pune",
      contributorId: rameshwar.id,
      collectionId: collections["vanishing-professions"],
      originalLanguage: "Hindi",
      originalTranscript: "पुणे के तांबट आलि में सौ साल से तांबे के बर्तनों पर हथौड़े की खटखट गूंजती रही है। कारीगर आग की भट्टी से लाल तांबा निकालते और उसे हाथ से पीटकर सुंदर घड़े और परात बनाते। हाथ के बने उन बर्तनों में जो चमक और ताकत थी, वो मशीनों में कहां।",
      englishTranslation: "For over a century, the clatter of hammers against copper sheets echoed across Tambat Ali in Pune. Artisans pulled red-hot metal from coal forges, hand-beating water urns and ceremonial platters with microscopic indentations. The sheen and durability of those hand-forged vessels cannot be matched by any machine.",
      summary: "A retired coppersmith explains the intricate mathaari hammer-beating technique that prevents copper pots from oxidizing and laments the decline of handmade kitchenware.",
      region: "Pune, Maharashtra",
      topic: "Metal Craft",
      timePeriodLabel: "1980s",
      timePeriodStart: 1980,
      timePeriodEnd: 1988,
      audioDurationSec: 340,
      displayPreference: "NAMED" as DisplayPreference,
      themeSlugs: ["craft", "work-and-livelihood", "community"],
      keywords: ["coppersmith", "tambat ali", "pune", "hand hammer", "traditional craft"],
    },
    {
      slug: "night-of-the-paper-lanterns-kolkata",
      title: "Fanush in the Winter Sky: The Lantern Makers of North Kolkata",
      contributorId: aruna.id,
      collectionId: collections["festival-stories"],
      originalLanguage: "Bengali",
      originalTranscript: "কালীপূজার পরের রবিবার আমরা উত্তর কলকাতার ছাদে ছাদে ফানুস ওড়াতাম। পাতলা টিস্যু কাগজ আর বাঁশের কঞ্চি দিয়ে তৈরি হতো সেই বিশালাকার গরম বাতাসের বেলুন। কেরোসিনে ভেজানো কাপড়ে আগুন দিতেই সেটা সন্ধ্যার আকাশে লাল-নীল তারা হয়ে উড়ে যেত।",
      englishTranslation: "On the Sunday following Kali Puja, rooftops across North Kolkata came alive with flying Fanush. These massive hot-air lanterns were crafted from paper-thin tissue and pliable bamboo strips. Once the kerosene-soaked rag caught fire, the glowing lanterns rose gracefully into the winter dusk like ascending stars.",
      summary: "Memories of the century-old artisan art of launching giant sky lanterns from historic townhouse terraces in North Kolkata.",
      region: "Kolkata, West Bengal",
      topic: "Folk Festivals",
      timePeriodLabel: "1970s",
      timePeriodStart: 1975,
      timePeriodEnd: 1981,
      audioDurationSec: 280,
      displayPreference: "NAMED" as DisplayPreference,
      themeSlugs: ["festivals", "childhood", "community"],
      keywords: ["fanush", "kolkata", "sky lanterns", "kali puja", "craft"],
    },
    {
      slug: "grandfathers-wooden-box-partition-heirloom",
      title: "The Sheesham Box That Traveled from Sialkot",
      contributorId: sunita.id,
      collectionId: collections["partition-memories"],
      originalLanguage: "English",
      originalTranscript: "My grandfather never spoke much about Sialkot, except when he opened his brass-hinged Sheesham wooden box. Inside were his surveyor's brass compass, a bundle of yellowed Urdu land papers, and the brass key to a home he knew he would never unlock again.",
      englishTranslation: "My grandfather never spoke much about Sialkot, except when he opened his brass-hinged Sheesham wooden box. Inside were his surveyor's brass compass, a bundle of yellowed Urdu land papers, and the brass key to a home he knew he would never unlock again.",
      summary: "A granddaughter reflects on the tactile memory box her grandfather brought across the border during the 1947 Partition, exploring grief, silence, and heirloom objects.",
      region: "Delhi",
      topic: "Family Memory",
      timePeriodLabel: "1950s",
      timePeriodStart: 1950,
      timePeriodEnd: 1958,
      audioDurationSec: 320,
      displayPreference: "NAMED" as DisplayPreference,
      themeSlugs: ["partition", "family", "resilience"],
      keywords: ["sialkot", "sheesham box", "heirloom", "partition", "delhi"],
    },
    {
      slug: "fermented-rice-summer-mornings-odisha",
      title: "Pakhala and Roasted Mustard: The Cooling Summer Breakfast",
      contributorId: aruna.id,
      collectionId: collections["grandmothers-kitchen"],
      originalLanguage: "Hindi",
      originalTranscript: "ओडिशा के चिलचिलाती धूप वाले दिनों में सुबह-सुबह पखाल भात खाना एक सुकून भरा रिवाज था। मिट्टी की हांडी में रात भर पानी में भीगा हुआ चावल, जिसमें दही, भुना जीरा और करी पत्ता मिलाया जाता था। साथ में आलू का चोखा और हरी मिर्च।",
      englishTranslation: "During the blazing summer days of coastal Odisha, savoring fermented Pakhala rice at dawn was an indispensable comfort. Rice fermented overnight in earthen pots was tempered with homemade curd, roasted cumin, and crisp curry leaves, served alongside roasted mash and green chilies.",
      summary: "An exploration of ancestral gut health and cooling fermented foods in coastal Odisha, explaining the preparation of Basi Pakhala and community hospitality during heat waves.",
      region: "Cuttack, Odisha",
      topic: "Heritage Cuisine",
      timePeriodLabel: "1990s",
      timePeriodStart: 1991,
      timePeriodEnd: 1995,
      audioDurationSec: 215,
      displayPreference: "ANONYMOUS" as DisplayPreference,
      themeSlugs: ["food", "family", "community"],
      keywords: ["pakhala", "fermented rice", "odisha", "cuttack", "summer recipe"],
    },
    {
      slug: "kite-battles-over-ahmedabad-rooftops",
      title: "Kite Duels Above the Pols: Uttarayan 1978",
      contributorId: rameshwar.id,
      collectionId: collections["childhood-then-and-now"],
      originalLanguage: "Gujarati",
      originalTranscript: "ઉત્તરાયણના દિવસે આખું અમદાવાદ ધાબા પર હોતું. માંજો ઘસવા માટે કાચ અને ગુંદરનો ખાસ મસાલો અમે પોતે બનાવતા. 'કાપ્યો છે!' ની બૂમોથી આકાશ ગાજી ઉઠતું અને સાંજે તુક્કલના દીવાઓથી આકાશ તારાઓથી ભરાઈ જતું.",
      englishTranslation: "On Uttarayan day, the entirety of Ahmedabad migrated onto terrace rooftops. We brewed our own glass-coated cotton manja cord using crushed glass and tree resin. Shrieks of victory echoed across the pols, and by nightfall, hundreds of glowing paper candle balloons illuminated the heavens.",
      summary: "A thrilling memoir of Uttarayan kite fighting atop centuries-old wooden townhouses (Pols) in walled Ahmedabad during the late 1970s.",
      region: "Ahmedabad, Gujarat",
      topic: "Folk Festivals",
      timePeriodLabel: "1970s",
      timePeriodStart: 1978,
      timePeriodEnd: 1978,
      audioDurationSec: 360,
      displayPreference: "NAMED" as DisplayPreference,
      themeSlugs: ["festivals", "childhood", "community"],
      keywords: ["uttarayan", "kite flying", "ahmedabad", "pol", "gujarat"],
    },
    {
      slug: "the-water-carrier-of-chandni-chowk",
      title: "Bhishti of Chandni Chowk: Water in Goat-Skin Bags",
      contributorId: sunita.id,
      collectionId: collections["vanishing-professions"],
      originalLanguage: "Hindi",
      originalTranscript: "चांदनी चौक की तंग गलियों में भिश्ती भाई अपनी मशक से धूल भरे रास्तों पर पानी छिड़कते थे। चमड़े की उस मशक से ठंडे पानी की फुहार निकलती थी जो गर्मी के मौसम में राहगीरों की प्यास भी बुझाती थी। अब नल और बोतलबंद पानी के दौर में वो चमड़े की मशकें संग्रहालयों में भी नहीं दिखतीं।",
      englishTranslation: "Through the narrow bylanes of Old Delhi's Chandni Chowk, the Bhishti water carriers carried swollen goat-skin mashaks, sprinkling water to settle the swirling dust. The spray from that leather bag quenched the thirst of weary cart-pullers under the summer sun. With municipal pipelines, this ancient trade has quietly vanished.",
      summary: "Memories of the traditional Bhishti water carriers who served markets and travelers in Old Delhi before mechanized urban plumbing took over.",
      region: "Old Delhi",
      topic: "Vanishing Trades",
      timePeriodLabel: "1960s",
      timePeriodStart: 1963,
      timePeriodEnd: 1968,
      audioDurationSec: 275,
      displayPreference: "ANONYMOUS" as DisplayPreference,
      themeSlugs: ["vanishing-professions", "work-and-livelihood", "community"],
      keywords: ["bhishti", "water carrier", "mashak", "chandni chowk", "delhi"],
    },
    {
      slug: "village-well-assembly-bihar",
      title: "The Morning Gathering Around the Stone Well",
      contributorId: sunita.id,
      collectionId: collections["womens-untold-histories"],
      originalLanguage: "Bhojpuri",
      originalTranscript: "हमरे गांव के पुरनका कुआं सिर्फ पानी भरे के जगह ना रहे, उ हम औरत लोगन के चौपाल रहे। सुबह-सुबह जब सब कोई बाल्टी लेके आवत रहे, तब सुख-दुख के बात होत रहे। केकर बेटा परदेस गइल, केकर बेटी के बियाह तय भइल—सब खबर वहीं मिलत रहे।",
      englishTranslation: "Our village's stone well wasn't just a place to draw water; it was the open-air parliament for village women. Each morning as women hauled iron buckets on squeaking pulleys, personal joys and sorrows were unpacked. Who had migrated for work, whose wedding had been finalized—the life of the village unfolded there.",
      summary: "A touching oral narrative about village wells as sacred democratic spaces for female solidarity and mutual support before tap water isolated households.",
      region: "Gaya, Bihar",
      topic: "Community Solidarity",
      timePeriodLabel: "1980s",
      timePeriodStart: 1980,
      timePeriodEnd: 1986,
      audioDurationSec: 305,
      displayPreference: "NAMED" as DisplayPreference,
      themeSlugs: ["womens-histories", "community", "resilience"],
      keywords: ["village well", "female solidarity", "gaya", "water ritual", "bihar"],
    },
  ];

  for (const s of sampleStories) {
    const { themeSlugs, keywords, ...storyFields } = s;
    const story = await prisma.story.upsert({
      where: { slug: storyFields.slug },
      update: {
        ...storyFields,
        status: StoryStatus.PUBLISHED,
        permission: StoryPermission.PUBLIC,
        isSample: true,
        audioKey: "samples/sample.mp3",
        audioMimeType: "audio/mpeg",
        publishedAt: new Date(),
        deletedAt: null,
      },
      create: {
        ...storyFields,
        status: StoryStatus.PUBLISHED,
        permission: StoryPermission.PUBLIC,
        isSample: true,
        audioKey: "samples/sample.mp3",
        audioMimeType: "audio/mpeg",
        publishedAt: new Date(),
        deletedAt: null,
      },
    });

    await connectKeywords(story.id, keywords);
    await connectThemes(story.id, themeSlugs);
  }
  console.log(`✓ Seeded ${sampleStories.length} published sample stories`);

  // 5. 75 Client Oral History Archive Stories (Real Human Stories)
  const clientContributors = [sunita, rameshwar, aruna, subhashini, harjinder];
  console.log(`⏳ Seeding ${CLIENT_STORIES.length} authentic client oral history stories...`);

  // Pre-fetch all keywords to optimize insertion
  const allKeywordsSet = new Set<string>();
  CLIENT_STORIES.forEach((cs) => {
    cs.keywords.forEach((kw) => allKeywordsSet.add(kw.trim()));
  });

  // Bulk upsert keywords
  const keywordMap = new Map<string, string>();
  const existingKeywords = await prisma.keyword.findMany();
  existingKeywords.forEach((k) => keywordMap.set(k.normalizedName, k.id));

  for (const kwName of allKeywordsSet) {
    const normalizedName = kwName.toLowerCase().trim();
    if (!keywordMap.has(normalizedName)) {
      const created = await prisma.keyword.create({
        data: { name: kwName, normalizedName },
      });
      keywordMap.set(normalizedName, created.id);
    }
  }

  for (let i = 0; i < CLIENT_STORIES.length; i++) {
    const cs = CLIENT_STORIES[i];
    const contributor = clientContributors[i % clientContributors.length];
    const targetCollectionId = collections[cs.collection] || collections["vanishing-professions"];

    const story = await prisma.story.upsert({
      where: { slug: cs.slug },
      update: {
        title: cs.title,
        contributorId: contributor.id,
        collectionId: targetCollectionId,
        originalLanguage: cs.language,
        originalTranscript: cs.text,
        englishTranslation: cs.text,
        summary: cs.summary,
        region: cs.region,
        topic: cs.topic,
        timePeriodLabel: cs.decade,
        timePeriodStart: cs.start,
        timePeriodEnd: cs.end,
        audioDurationSec: cs.duration,
        displayPreference: (cs.displayPreference || "NAMED") as DisplayPreference,
        status: StoryStatus.PUBLISHED,
        permission: StoryPermission.PUBLIC,
        isSample: false,
        audioKey: "samples/sample.mp3",
        audioMimeType: "audio/mpeg",
        publishedAt: new Date(),
        deletedAt: null,
      },
      create: {
        title: cs.title,
        slug: cs.slug,
        contributorId: contributor.id,
        collectionId: targetCollectionId,
        originalLanguage: cs.language,
        originalTranscript: cs.text,
        englishTranslation: cs.text,
        summary: cs.summary,
        region: cs.region,
        topic: cs.topic,
        timePeriodLabel: cs.decade,
        timePeriodStart: cs.start,
        timePeriodEnd: cs.end,
        audioDurationSec: cs.duration,
        displayPreference: (cs.displayPreference || "NAMED") as DisplayPreference,
        status: StoryStatus.PUBLISHED,
        permission: StoryPermission.PUBLIC,
        isSample: false,
        audioKey: "samples/sample.mp3",
        audioMimeType: "audio/mpeg",
        publishedAt: new Date(),
        deletedAt: null,
      },
    });

    // Connect keywords
    await prisma.storyKeyword.deleteMany({ where: { storyId: story.id } });
    const kwToCreate = cs.keywords
      .map((k) => keywordMap.get(k.toLowerCase().trim()))
      .filter((id): id is string => Boolean(id))
      .map((keywordId) => ({ storyId: story.id, keywordId }));

    if (kwToCreate.length > 0) {
      await prisma.storyKeyword.createMany({
        data: kwToCreate,
        skipDuplicates: true,
      });
    }

    // Connect themes
    await prisma.storyTheme.deleteMany({ where: { storyId: story.id } });
    const themeToCreate = cs.themes
      .map((slug) => themes[slug])
      .filter((id): id is string => Boolean(id))
      .map((themeId) => ({ storyId: story.id, themeId }));

    if (themeToCreate.length > 0) {
      await prisma.storyTheme.createMany({
        data: themeToCreate,
        skipDuplicates: true,
      });
    }
  }

  console.log(`✓ Seeded ${CLIENT_STORIES.length} published client oral history stories`);

  // 6. Test Non-public Stories (for moderation & privacy verification)
  const testStories = [
    {
      slug: "test-draft-story",
      title: "Unfinished Draft: Songs of the Blacksmith",
      contributorId: rameshwar.id,
      originalLanguage: "Gujarati",
      originalTranscript: "કામ અધૂરું છે...",
      englishTranslation: "Draft notes waiting for full translation.",
      summary: "A contributor draft recording awaiting full transcript review.",
      status: StoryStatus.DRAFT,
      permission: StoryPermission.PUBLIC,
      isSample: false,
    },
    {
      slug: "test-needs-review-story",
      title: "Needs Review: Village Herb Doctor Memories",
      contributorId: sunita.id,
      originalLanguage: "Hindi",
      originalTranscript: "जड़ी-बूटी के नुस्खे...",
      englishTranslation: "Traditional herbal remedies passed down by village healers.",
      summary: "AI generated translation awaiting contributor accuracy confirmation.",
      status: StoryStatus.NEEDS_REVIEW,
      permission: StoryPermission.PUBLIC,
      isSample: false,
    },
    {
      slug: "test-submitted-story",
      title: "Submitted for Admin Moderation: Folk Tales of the Forest",
      contributorId: aruna.id,
      originalLanguage: "Bengali",
      originalTranscript: "বনের রূপকথা...",
      englishTranslation: "Folk legends from the Sundarbans forest.",
      summary: "Contributor has granted consent; waiting for admin moderation approval.",
      status: StoryStatus.SUBMITTED,
      permission: StoryPermission.PUBLIC,
      isSample: false,
    },
    {
      slug: "test-research-only-story",
      title: "Ethno-Musicology Archive (Research Only)",
      contributorId: rameshwar.id,
      originalLanguage: "Hindi",
      originalTranscript: "अकादमिक अध्ययन हेतु...",
      englishTranslation: "Field recordings permitted solely for academic research.",
      summary: "Explicitly restricted by contributor for educational & research access only.",
      status: StoryStatus.PUBLISHED,
      permission: StoryPermission.RESEARCH_ONLY,
      isSample: false,
    },
    {
      slug: "test-private-family-story",
      title: "Private Family Ledger and Courtyard Tree",
      contributorId: sunita.id,
      originalLanguage: "Hindi",
      originalTranscript: "निजी पारिवारिक स्मरण...",
      englishTranslation: "Private family oral chronicle.",
      summary: "Marked private by contributor; should never be visible to the public or other users.",
      status: StoryStatus.PUBLISHED,
      permission: StoryPermission.PRIVATE,
      isSample: false,
    },
    {
      slug: "test-archived-story",
      title: "Archived Story: Old Railway Colony Memory",
      contributorId: aruna.id,
      originalLanguage: "English",
      originalTranscript: "Archived oral history entry.",
      englishTranslation: "Archived oral history entry.",
      summary: "Archived by administrator; should be excluded by publicStoryWhere.",
      status: StoryStatus.ARCHIVED,
      permission: StoryPermission.PUBLIC,
      isSample: false,
    },
    {
      slug: "test-soft-deleted-story",
      title: "Soft Deleted Story: Retracted by Contributor",
      contributorId: sunita.id,
      originalLanguage: "Hindi",
      originalTranscript: "हटाया गया वृत्तांत...",
      englishTranslation: "Retracted narrative.",
      summary: "Marked deletedAt; should never appear in public views.",
      status: StoryStatus.PUBLISHED,
      permission: StoryPermission.PUBLIC,
      isSample: false,
      deletedAt: new Date("2026-01-15T00:00:00Z"),
    },
  ];

  for (const s of testStories) {
    await prisma.story.upsert({
      where: { slug: s.slug },
      update: {
        ...s,
        audioKey: "samples/sample.mp3",
        audioMimeType: "audio/mpeg",
        audioDurationSec: 180,
      },
      create: {
        ...s,
        audioKey: "samples/sample.mp3",
        audioMimeType: "audio/mpeg",
        audioDurationSec: 180,
      },
    });
  }
  console.log(`✓ Seeded ${testStories.length} non-public test stories`);

  console.log("✨ Seed completed successfully and idempotently!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
