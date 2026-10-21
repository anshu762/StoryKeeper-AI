import { PrismaClient, StoryStatus, StoryPermission, DisplayPreference } from "@prisma/client";

const prisma = new PrismaClient();

const LANGUAGES = ["Hindi", "Tamil", "Bengali", "Marathi", "Gujarati", "Telugu", "Kannada", "Punjabi", "Malayalam", "Odia"];
const REGIONS = [
  "Varanasi, Uttar Pradesh",
  "Thanjavur, Tamil Nadu",
  "Kolkata, West Bengal",
  "Pune, Maharashtra",
  "Rajkot, Gujarat",
  "Hyderabad, Telangana",
  "Mysuru, Karnataka",
  "Amritsar, Punjab",
  "Kozhikode, Kerala",
  "Puri, Odisha",
  "Bhojpur, Bihar",
  "Bikaner, Rajasthan"
];
const TOPICS = [
  "Monsoon Harvest & Agricultural Songs",
  "Traditional Cooking & Heirloom Recipes",
  "Loom Weaving & Textile Heritage",
  "Folk Songs & Village Chants",
  "Community Fairs & Festivals",
  "River Crossings & Night Travels",
  "Handcrafted Earthenware & Clay Pottery",
  "Childhood Games & Star Lore",
  "Oral Herbal Remedies & Forest Medicine",
  "Vanishing Street Cry Melodies"
];

const DECADES = [
  { label: "1940s", start: 1945, end: 1949 },
  { label: "1950s", start: 1952, end: 1958 },
  { label: "1960s", start: 1963, end: 1968 },
  { label: "1970s", start: 1972, end: 1977 },
  { label: "1980s", start: 1981, end: 1986 },
  { label: "1990s", start: 1990, end: 1995 }
];

async function main() {
  const isCleanup = process.argv.includes("--cleanup");
  if (isCleanup) {
    console.log("Cleaning up stress test stories...");
    const deleted = await prisma.story.deleteMany({
      where: {
        slug: { startsWith: "stress-story-" },
      },
    });
    console.log(`✓ Deleted ${deleted.count} stress test stories.`);
    return;
  }

  console.log("Seeding 120 stress-test stories for search & archive scalability...");

  // Get or create a sample contributor
  const contributor = await prisma.user.upsert({
    where: { email: "stress.tester@storykeeper.archive" },
    update: {},
    create: {
      email: "stress.tester@storykeeper.archive",
      name: "Community Elder Archive",
      role: "CONTRIBUTOR",
      preferredLanguage: "Hindi",
      defaultPermission: "PUBLIC",
      defaultDisplay: "NAMED",
    },
  });

  const allThemes = await prisma.theme.findMany();
  const themeIds = allThemes.map((t) => t.id);

  const keywordsList = [
    "harvest", "paddy", "monsoon", "clay stove", "weaving", "cotton", "bazaar",
    "train journey", "folklore", "temple bell", "river", "ancestral", "spices",
    "lullaby", "pottery", "blacksmith", "heirloom", "radio", "banyan tree", "lantern"
  ];

  // Batch insert 120 stories
  for (let i = 1; i <= 120; i++) {
    const lang = LANGUAGES[i % LANGUAGES.length];
    const region = REGIONS[i % REGIONS.length];
    const topic = TOPICS[i % TOPICS.length];
    const decade = DECADES[i % DECADES.length];
    const slug = `stress-story-${i.toString().padStart(3, "0")}`;
    const title = `${topic.split("&")[0].trim()} Memories of ${region.split(",")[0]}: Chronicle ${i}`;
    const summary = `Oral chronicle #${i} capturing authentic recollections of ${topic.toLowerCase()} in ${region} during the ${decade.label}. Preserved directly from spoken accounts.`;

    const story = await prisma.story.upsert({
      where: { slug },
      update: {
        title,
        originalLanguage: lang,
        originalTranscript: `[Spoken oral record #${i} in ${lang}] ${summary}`,
        englishTranslation: `[Verified English translation #${i}] ${summary}`,
        summary,
        region,
        topic,
        timePeriodLabel: decade.label,
        timePeriodStart: decade.start,
        timePeriodEnd: decade.end,
        status: StoryStatus.PUBLISHED,
        permission: StoryPermission.PUBLIC,
        displayPreference: DisplayPreference.NAMED,
        audioKey: "samples/sample.mp3",
        audioMimeType: "audio/mpeg",
        audioDurationSec: 120 + ((i * 17) % 300),
        isSample: true,
        publishedAt: new Date(Date.now() - i * 86400000), // staggered past dates
      },
      create: {
        contributorId: contributor.id,
        slug,
        title,
        originalLanguage: lang,
        originalTranscript: `[Spoken oral record #${i} in ${lang}] ${summary}`,
        englishTranslation: `[Verified English translation #${i}] ${summary}`,
        summary,
        region,
        topic,
        timePeriodLabel: decade.label,
        timePeriodStart: decade.start,
        timePeriodEnd: decade.end,
        status: StoryStatus.PUBLISHED,
        permission: StoryPermission.PUBLIC,
        displayPreference: DisplayPreference.NAMED,
        audioKey: "samples/sample.mp3",
        audioMimeType: "audio/mpeg",
        audioDurationSec: 120 + ((i * 17) % 300),
        isSample: true,
        publishedAt: new Date(Date.now() - i * 86400000),
      },
    });

    // Attach 2 random themes if available
    if (themeIds.length > 0) {
      const t1 = themeIds[i % themeIds.length];
      const t2 = themeIds[(i + 3) % themeIds.length];
      await prisma.storyTheme.deleteMany({ where: { storyId: story.id } });
      await prisma.storyTheme.createMany({
        data: [
          { storyId: story.id, themeId: t1 },
          ...(t1 !== t2 ? [{ storyId: story.id, themeId: t2 }] : []),
        ],
        skipDuplicates: true,
      });
    }

    // Attach 3 keywords
    const kw1 = keywordsList[i % keywordsList.length];
    const kw2 = keywordsList[(i + 4) % keywordsList.length];
    const kw3 = "archive";

    for (const kwName of [kw1, kw2, kw3]) {
      const normalizedName = kwName.toLowerCase().trim();
      const kwRecord = await prisma.keyword.upsert({
        where: { normalizedName },
        update: {},
        create: { name: kwName, normalizedName },
      });
      await prisma.storyKeyword.upsert({
        where: {
          storyId_keywordId: {
            storyId: story.id,
            keywordId: kwRecord.id,
          },
        },
        update: {},
        create: {
          storyId: story.id,
          keywordId: kwRecord.id,
        },
      });
    }

    if (i % 30 === 0) {
      console.log(`  ..seeded ${i}/120 stress stories`);
    }
  }

  console.log("✓ Successfully seeded 120 stress stories for performance testing!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
