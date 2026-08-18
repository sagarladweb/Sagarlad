import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

function parsePgUrl(url: string) {
  const at = url.lastIndexOf("@");
  const creds = url.slice("postgresql://".length, at);
  const colon = creds.lastIndexOf(":");
  const user = decodeURIComponent(creds.slice(0, colon));
  const password = decodeURIComponent(creds.slice(colon + 1));
  const rest = url.slice(at + 1);
  const slash = rest.indexOf("/");
  const hostPort = rest.slice(0, slash);
  const database = rest.slice(slash + 1).split("?")[0];
  const colonIdx = hostPort.lastIndexOf(":");
  const host = hostPort.slice(0, colonIdx);
  const port = Number(hostPort.slice(colonIdx + 1)) || 5432;
  return { user, password, host, port, database };
}

const url = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
const { user, password, host, port, database } = parsePgUrl(url);
const adapter = new PrismaPg({
  connectionString: `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(
    password
  )}@${host}:${port}/${database}`,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

const TIP_CONTENT = `
<h2>Start with awareness</h2>
<p>Every big change in my life started with a simple realisation — that I was not paying attention to what mattered most. Awareness is the first step towards everything.</p>
<blockquote><p>“Awareness is everything.”</p></blockquote>
<h3>Money is a tool, not a goal</h3>
<p>When I stopped chasing money and started chasing <strong>time and energy</strong>, everything changed. The goal was never to be rich — it was to be <em>free</em>.</p>
<ul><li><p>Build assets that buy back your time.</p></li><li><p>Invest early, invest often, keep it boring.</p></li><li><p>Never let a fancy car define your worth.</p></li></ul>
<h3>The 3-step process that works</h3>
<ol><li><p>Write down what you want.</p></li><li><p>Figure out the cost.</p></li><li><p>Pay it in advance.</p></li></ol>
<p>That's it. That's the whole secret. Everything else is noise.</p>
`;

const POSTS = [
  {
    title: "I quit my job to become a creator — here is what I learned",
    slug: "i-quit-my-job-to-become-a-creator",
    excerpt:
      "5 years ago I walked away from a comfortable corporate life. This is the honest, unglamorous truth about what followed.",
    featured: true,
    category: "Life Lessons",
  },
  {
    title: "The 50-30-20 rule is broken. Use this instead",
    slug: "the-50-30-20-rule-is-broken",
    excerpt:
      "Budgeting rules were made for a different era. Here is a money framework that actually fits how you live today.",
    featured: true,
    category: "Money",
  },
  {
    title: "How to handle failure without losing your mind",
    slug: "how-to-handle-failure",
    excerpt:
      "Failure is not a lesson, it's just feedback. But that's easier to say than to believe. Here is what actually helped me.",
    featured: false,
    category: "Life Lessons",
  },
  {
    title: "Why I stopped counting my net worth",
    slug: "why-i-stopped-counting-my-net-worth",
    excerpt:
      "Your net worth is a number. Your self worth is everything else. The day I separated the two, my life changed.",
    featured: false,
    category: "Money",
  },
  {
    title: "Books that changed how I think about time",
    slug: "books-that-changed-how-i-think-about-time",
    excerpt:
      "A short reading list for anyone who feels like there is never enough time in the day.",
    featured: false,
    category: "Books",
  },
  {
    title: "The 15-minute rule for getting things done",
    slug: "the-15-minute-rule",
    excerpt:
      "When a task feels enormous, don't schedule an hour. Schedule 15 minutes and see what happens.",
    featured: false,
    category: "Productivity",
  },
  {
    title: "An open letter to my younger self",
    slug: "an-open-letter-to-my-younger-self",
    excerpt:
      "Dear 25-year-old me, you are going to make some expensive mistakes. Here is what I wish you knew.",
    featured: false,
    category: "Life Lessons",
  },
  {
    title: "What I tell students who want to become entrepreneurs",
    slug: "what-i-tell-students-entrepreneurs",
    excerpt:
      "You don't need a startup to start. You need a problem, a customer, and the nerve to charge for a solution.",
    featured: false,
    category: "Startups",
  },
  {
    title: "My morning routine (the honest version)",
    slug: "my-morning-routine-honest-version",
    excerpt:
      "No 5 AM club. No ice baths. Here is what my mornings actually look like and why they work for me.",
    featured: false,
    category: "Productivity",
  },
];

const BOOKS = [
  {
    title: "The MIND UP Theory: Simple Shift That Will Make You Unshakable",
    tagline: "Mindset",
    description:
      "A powerful yet simple shift that transforms how you handle stress, relationships, work and self-doubt — reset, refocus, and rise.",
    imageUrl: "https://m.media-amazon.com/images/P/B0GYQ7HBBB.jpg",
    buyUrl: "https://www.amazon.com/dp/B0GYQ7HBBB",
    featured: true,
    sortOrder: 0,
  },
  {
    title: "Level Up with Azure AI Foundry",
    tagline: "Data & AI",
    description:
      "This book is a practical introduction to Azure AI Foundry and generative AI. It explains how to use tools like Prompt Flow and multimodal AI to build intelligent applications, integrate AI into existing systems, and manage security, responsible AI, and governance. It teaches you how to use Microsoft Azure's AI tools to build, manage, and deploy useful AI solutions in the real world.",
    imageUrl: "https://m.media-amazon.com/images/P/B0FHP511FM.jpg",
    buyUrl: "https://www.amazon.com/dp/B0FHP511FM",
    featured: true,
    sortOrder: 1,
  },
  {
    title: "Mastering Databricks Lakehouse Platform",
    tagline: "Data Engineering",
    description:
      "Master the Databricks Lakehouse platform — real-world patterns for modern data engineering.",
    imageUrl: "https://m.media-amazon.com/images/P/9355511396.jpg",
    buyUrl: "https://www.amazon.com/dp/9355511396",
    featured: false,
    sortOrder: 2,
  },
  {
    title: "Hands-On Azure Data Platform",
    tagline: "Data Platform",
    description:
      "End-to-end Azure data engineering — ingestion, storage, transformation and analytics.",
    imageUrl: "https://m.media-amazon.com/images/P/9355510306.jpg",
    buyUrl: "https://www.amazon.com/dp/9355510306",
    featured: false,
    sortOrder: 3,
  },
  {
    title: "Modern Data Architecture on Azure",
    tagline: "Architecture",
    description:
      "Design scalable, cost-effective and future-proof data architectures on the Azure cloud.",
    imageUrl: "https://m.media-amazon.com/images/P/1484297598.jpg",
    buyUrl: "https://www.amazon.com/dp/1484297598",
    featured: false,
    sortOrder: 4,
  },
  {
    title: "Azure Security for Critical Workloads",
    tagline: "Security",
    description:
      "Secure your most critical workloads — from zero-trust to threat protection.",
    imageUrl: "https://m.media-amazon.com/images/P/1484289358.jpg",
    buyUrl: "https://www.amazon.com/dp/1484289358",
    featured: false,
    sortOrder: 5,
  },
];

const COVER = (id: string) =>
  `https://vvawladyffozwclpqdhu.supabase.co/storage/v1/object/public/sagarlad-assets/books/${id}`;

// Cover images recovered from Supabase Storage (matched to each title by OCR).
const READ_COVERS: Record<string, string> = {
  "Attitude is Everything": COVER("cc80207a-329b-43b9-974e-3964118c6efa"),
  "Think Straight": COVER("ef5aee88-60fa-4808-bd1d-5a36174f6e84"),
  "The Mountain Is You": COVER("abd984cd-0790-43ac-b059-40df4477aa84"),
  "Read People Like a Book": COVER("d0097ba6-f813-420a-a800-298414674804"),
  "Life's Amazing Secrets": COVER("df43840b-99d6-4403-bea7-7b20cbcb7f6a"),
  "The Secret": COVER("088225a6-bd06-4831-acb0-cacf0777eb9a"),
  "The Law of Attraction": COVER("a9edf9b2-41dc-4dd2-9b34-7fb96311ee06"),
  "Who Will Cry When You Die?": COVER("f6aa4614-abc9-4588-848a-2d91782b02dd"),
  "How to Win Friends and Influence People": COVER("bcaa291c-4ecd-4901-b73d-574437661f94"),
  "How to Stop Worrying and Start Living": COVER("be799e1d-99dc-48e6-b08a-cbeb62ae3e89"),
  "Think & Grow Rich": COVER("25a2f909-3d98-49b2-9449-342fb37b8fc9"),
  "5 Types of Wealth": COVER("e675cfbe-6b6e-4e1d-bab5-c5df4ea62436"),
  Ikigai: COVER("e306103b-b03f-4697-af51-112df73973ac"),
  "Atomic Habits": COVER("3aa3e2ca-006d-4353-9308-86bd588786f3"),
  "The Odyssey": COVER("f0c36076-052e-4cd4-b944-4e3b7a130e15"),
};

const READ_BOOKS = [
  {
    type: "READ",
    title: "Attitude is Everything",
    author: "Jeff Keller",
    learning: "Small daily attitude choices shape your results more than talent or luck.",
    buyUrl: "https://www.amazon.com/s?k=Attitude+is+Everything+Jeff+Keller",
    sortOrder: 0,
  },
  {
    type: "READ",
    title: "Think Straight",
    author: "Darius Foroux",
    learning: "Clarity comes from simple frameworks and ruthless prioritisation, not complexity.",
    buyUrl: "https://www.amazon.com/s?k=Think+Straight+Darius+Foroux",
    sortOrder: 1,
  },
  {
    type: "READ",
    title: "The Mountain Is You",
    author: "Brianna Wiest",
    learning: "What feels like a wall is usually your own self-sabotage — self-awareness is how you climb it.",
    buyUrl: "https://www.amazon.com/s?k=The+Mountain+Is+You+Brianna+Wiest",
    sortOrder: 2,
  },
  {
    type: "READ",
    title: "Read People Like a Book",
    author: "Patrick King",
    learning: "Reading people is about observing behaviour and context, not guessing minds.",
    buyUrl: "https://www.amazon.com/s?k=Read+People+Like+a+Book+Patrick+King",
    sortOrder: 3,
  },
  {
    type: "READ",
    title: "Life's Amazing Secrets",
    author: "Gaur Gopal Das",
    learning: "Success feels empty without anchors for the heart — balance all four wheels of life.",
    buyUrl: "https://www.amazon.com/s?k=Life%27s+Amazing+Secrets+Gaur+Gopal+Das",
    sortOrder: 4,
  },
  {
    type: "READ",
    title: "The Secret",
    author: "Rhonda Byrne",
    learning: "What you focus on expands — attention shapes your experience of reality.",
    buyUrl: "https://www.amazon.com/s?k=The+Secret+Rhonda+Byrne",
    sortOrder: 5,
  },
  {
    type: "READ",
    title: "The Law of Attraction",
    author: "Esther & Jerry Hicks",
    learning: "Your dominant thoughts and feelings attract your reality — feeling good is a compass.",
    buyUrl: "https://www.amazon.com/s?k=The+Law+of+Attraction+Esther+Hicks",
    sortOrder: 6,
  },
  {
    type: "READ",
    title: "Who Will Cry When You Die?",
    author: "Robin Sharma",
    learning: "Live with intention — service, gratitude and small daily heroics are the point.",
    buyUrl: "https://www.amazon.com/s?k=Who+Will+Cry+When+You+Die+Robin+Sharma",
    sortOrder: 7,
  },
  {
    type: "READ",
    title: "How to Win Friends and Influence People",
    author: "Dale Carnegie",
    learning: "People respond to genuine interest and appreciation, never criticism.",
    buyUrl: "https://www.amazon.com/s?k=How+to+Win+Friends+and+Influence+People+Dale+Carnegie",
    sortOrder: 8,
  },
  {
    type: "READ",
    title: "How to Stop Worrying and Start Living",
    author: "Dale Carnegie",
    learning: "Worry shrinks when you break problems into actions and live one day at a time.",
    buyUrl: "https://www.amazon.com/s?k=How+to+Stop+Worrying+and+Start+Living+Dale+Carnegie",
    sortOrder: 9,
  },
  {
    type: "READ",
    title: "Think & Grow Rich",
    author: "Napoleon Hill",
    learning: "Burning desire, a definite plan and persistence compound into lasting wealth.",
    buyUrl: "https://www.amazon.com/s?k=Think+and+Grow+Rich+Napoleon+Hill",
    sortOrder: 10,
  },
  {
    type: "READ",
    title: "5 Types of Wealth",
    author: "Sahil Bloom",
    learning: "True wealth is time, social, mental, physical and financial — optimise all five.",
    buyUrl: "https://www.amazon.com/s?k=5+Types+of+Wealth+Sahil+Bloom",
    sortOrder: 11,
  },
  {
    type: "READ",
    title: "Ikigai",
    author: "Héctor García & Francesc Miralles",
    learning: "Purpose lives where what you love, what you're good at and what the world needs overlap.",
    buyUrl: "https://www.amazon.com/s?k=Ikigai+Hector+Garcia",
    sortOrder: 12,
  },
  {
    type: "READ",
    title: "Atomic Habits",
    author: "James Clear",
    learning: "Tiny daily changes compound into remarkable results — systems beat goals.",
    buyUrl: "https://www.amazon.com/s?k=Atomic+Habits+James+Clear",
    sortOrder: 13,
  },
  {
    type: "READ",
    title: "The Odyssey",
    author: "Homer",
    learning: "Resilience and cunning carry you home — the journey shapes who you become.",
    buyUrl: "https://www.amazon.com/s?k=The+Odyssey+Homer",
    sortOrder: 14,
  },
];

const VIDEOS: {
  title: string;
  embedUrl: string;
  sortOrder: number;
}[] = [
  {
    title: "Episode 1 - The Evolution of Product Owner with Michael Hoogkamer",
    embedUrl: "https://www.youtube.com/watch?v=28RJp5i1lb4",
    sortOrder: 1,
  },
  {
    title: "Episode 2 - Mastering Data Modeling: Role, Skills, and Future of Data Modelers with Gerrit De Rooij",
    embedUrl: "https://www.youtube.com/watch?v=rjwBf52IRHw",
    sortOrder: 2,
  },
  {
    title: "Future of Data Governance - Leveraging Azure Purview & Databricks | Azure Spring Clean 2025",
    embedUrl: "https://www.youtube.com/watch?v=N36upTd1Dc4",
    sortOrder: 3,
  },
  {
    title: "ચીખલીના પ્રજાપતિ સમાજના યુવકની TEDx સફર 🎤",
    embedUrl: "https://www.youtube.com/watch?v=G5F3kJ-lsYk",
    sortOrder: 4,
  },
];

const SOCIAL_LINKS: {
  key: string;
  label: string;
  handle: string;
  href: string;
  icon: string;
  color: string;
  sortOrder: number;
}[] = [
  {
    key: "youtube",
    label: "YouTube",
    handle: "@Sagarlad692",
    href: "https://www.youtube.com/@Sagarlad692",
    icon: "youtube",
    color: "#FF0000",
    sortOrder: 1,
  },
  {
    key: "instagram",
    label: "Instagram",
    handle: "@grow_with__sagar",
    href: "https://www.instagram.com/grow_with__sagar/",
    icon: "instagram",
    color: "#E4405F",
    sortOrder: 2,
  },
  {
    key: "twitter",
    label: "X / Twitter",
    handle: "@azuresagar",
    href: "https://x.com/azuresagar",
    icon: "twitter",
    color: "#000000",
    sortOrder: 3,
  },
  {
    key: "facebook",
    label: "Facebook",
    handle: "sagar.lad.96",
    href: "https://www.facebook.com/sagar.lad.96/",
    icon: "facebook",
    color: "#1877F2",
    sortOrder: 4,
  },
  {
    key: "reddit",
    label: "Reddit",
    handle: "u/sagar_lad",
    href: "https://www.reddit.com/user/sagar_lad/",
    icon: "reddit",
    color: "#FF4500",
    sortOrder: 5,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    handle: "ladsagar",
    href: "https://www.linkedin.com/in/ladsagar",
    icon: "linkedin",
    color: "#0A66C2",
    sortOrder: 6,
  },
  {
    key: "telegram",
    label: "Telegram",
    handle: "@sagarladclub",
    href: "https://t.me/sagarladclub",
    icon: "telegram",
    color: "#229ED9",
    sortOrder: 7,
  },
  {
    key: "medium",
    label: "Medium",
    handle: "sagu94271",
    href: "https://sagu94271.medium.com/",
    icon: "medium",
    color: "#000000",
    sortOrder: 8,
  },
  {
    key: "sessionize",
    label: "Sessionize",
    handle: "sagar-lad",
    href: "https://sessionize.com/sagar-lad/",
    icon: "sessionize",
    color: "#000000",
    sortOrder: 9,
  },
];

async function main() {
  console.log("Seeding database...");

  const adminEmail = process.env.ADMIN_EMAIL ?? "sagarlad692@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 8) {
    throw new Error(
      "ADMIN_PASSWORD must be set (min 8 characters) before seeding."
    );
  }

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: await hash(adminPassword, 12) },
    create: {
      email: adminEmail,
      name: "Sagar Lad",
      role: "ADMIN",
      passwordHash: await hash(adminPassword, 12),
    },
  });

  const categories = new Map<string, string>();
  for (const name of [
    "Life Lessons",
    "Money",
    "Books",
    "Productivity",
    "Startups",
    "Anxiety",
    "Confidence",
    "Habits",
    "Happiness",
    "Health",
    "Relationship",
    "Motivation",
    "Technology",
    "Career",
    "Soft Skills",
    "Mindset",
    "Communication",
    "Emotional Intelligence",
  ]) {
    const cat = await prisma.category.upsert({
      where: { slug: name.toLowerCase().replace(/ /g, "-") },
      update: {},
      create: { name, slug: name.toLowerCase().replace(/ /g, "-") },
    });
    categories.set(name, cat.id);
  }

  for (const p of POSTS) {
    await prisma.post.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: TIP_CONTENT,
        featured: p.featured,
        published: true,
        authorId: admin.id,
        categoryId: categories.get(p.category),
      },
    });
  }

  for (const b of BOOKS) {
    const exists = await prisma.book.findFirst({ where: { title: b.title } });
    if (exists) {
      await prisma.book.update({
        where: { id: exists.id },
        data: {
          tagline: b.tagline,
          description: b.description,
          imageUrl: b.imageUrl,
          buyUrl: b.buyUrl,
          featured: b.featured,
          sortOrder: b.sortOrder,
        },
      });
    } else {
      await prisma.book.create({ data: b });
    }
  }

  for (const b of READ_BOOKS) {
    const exists = await prisma.book.findFirst({ where: { title: b.title } });
    if (exists) {
      await prisma.book.update({
        where: { id: exists.id },
        data: {
          type: b.type,
          author: b.author,
          learning: b.learning,
          imageUrl: READ_COVERS[b.title],
          buyUrl: b.buyUrl,
          sortOrder: b.sortOrder,
          published: true,
        },
      });
    } else {
      await prisma.book.create({ data: { ...b, imageUrl: READ_COVERS[b.title] } });
    }
  }

  for (const v of VIDEOS) {
    const exists = await prisma.video.findFirst({ where: { embedUrl: v.embedUrl } });
    if (exists) {
      await prisma.video.update({
        where: { id: exists.id },
        data: { title: v.title, sortOrder: v.sortOrder, published: true },
      });
    } else {
      await prisma.video.create({ data: { ...v, published: true } });
    }
  }

  for (const s of SOCIAL_LINKS) {
    const exists = await prisma.socialLink.findUnique({ where: { key: s.key } });
    if (exists) {
      await prisma.socialLink.update({ where: { key: s.key }, data: s });
    } else {
      await prisma.socialLink.create({ data: s });
    }
  }

  console.log("Seed complete.");
  console.log(`Admin login: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
