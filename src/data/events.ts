export type EventType = "Study Jam" | "Workshop" | "Session" | "Hackathon" | "Bootcamp";

export interface Event {
  type: EventType;
  title: string;
  slug: string;
  date: string;
  shortDate: string;
  month: string;
  location: string;
  description: string;
  longDescription: string;
  topics: string[];
  gradient: string;
  badgeColor: string;
  typeColor: string;
  bannerColor1: string;
  bannerColor2: string;
  attendance: string;
  duration: string;
  format: string;
  index: number;
  interCollege?: boolean;
  featured?: boolean;
  isFeatured?: boolean;
  isInterCollege?: boolean;
}

export const events: Event[] = [
  {
    type: "Study Jam", title: "Gen AI Study Jams — Season 2025", slug: "gen-ai-study-jams-2025",
    date: "September 14–15, 2025", shortDate: "Sep 14–15", month: "September",
    location: "APSIT, Thane",
    description: "A 2-day Google-curated study jam diving into Generative AI, Gemini API, and Responsible AI practices. Hands-on labs and peer learning with 80+ participants.",
    longDescription: "A 2-day Google-curated study jam diving into Generative AI, Gemini API, and Responsible AI practices. Hands-on labs and peer learning with 80+ participants. Students explored prompt engineering techniques, built applications using the Gemini API, and learned about responsible AI development practices. The event featured live coding sessions, group discussions, and hands-on labs following official Google learning paths.",
    topics: ["Gemini API", "Prompt Engineering", "Responsible AI", "PaLM Overview", "Multimodal AI"],
    gradient: "from-[#FBBC04] to-[#F4A700]", badgeColor: "#FBBC04", typeColor: "#FBBC04",
    bannerColor1: "#FBBC04", bannerColor2: "#F4A700",
    attendance: "80+", duration: "2 Days", format: "In-Person", index: 1,
  },
  {
    type: "Workshop", title: "Flutter Forward — Building Cross-Platform Apps", slug: "flutter-forward",
    date: "October 4, 2025", shortDate: "Oct 4", month: "October",
    location: "APSIT, Thane",
    description: "A full-day hands-on workshop on Flutter development. From setting up Dart to deploying a complete app on Android and iOS.",
    longDescription: "A full-day hands-on workshop on Flutter development covering everything from Dart basics to deploying a complete cross-platform application. Participants built a working app from scratch, learning widget composition, state management with Provider, Firebase integration for backend services, and deployment workflows for both Android and iOS platforms.",
    topics: ["Dart Basics", "Widget Tree", "State Management", "Firebase Integration", "App Deployment"],
    gradient: "from-[#4285F4] to-[#1A73E8]", badgeColor: "#4285F4", typeColor: "#4285F4",
    bannerColor1: "#4285F4", bannerColor2: "#1A73E8",
    attendance: "60+", duration: "1 Day", format: "In-Person", index: 2,
  },
  {
    type: "Session", title: "DSA Masterclass — Crack the Coding Interview", slug: "dsa-masterclass",
    date: "October 18, 2025", shortDate: "Oct 18", month: "October",
    location: "Pillai College of Engineering, Panvel",
    description: "An inter-college session on Data Structures & Algorithms, targeted at students prepping for placements.",
    longDescription: "An inter-college session on Data Structures & Algorithms, targeted at students preparing for placements and coding interviews. The session covered key topics including arrays, strings, trees, graphs, and dynamic programming with live problem-solving demonstrations. Industry mentors shared interview tips and common patterns seen in technical interviews at top tech companies.",
    topics: ["Arrays & Strings", "Trees & Graphs", "Dynamic Programming", "System Design Intro", "Interview Tips"],
    gradient: "from-[#34A853] to-[#1E8E3E]", badgeColor: "#34A853", typeColor: "#34A853",
    bannerColor1: "#34A853", bannerColor2: "#1E8E3E",
    attendance: "120+", duration: "4 Hours", format: "Inter-College",
    interCollege: true, isInterCollege: true, index: 3,
  },
  {
    type: "Hackathon", title: "HackAPSIT 2025 — 24 Hours of Innovation", slug: "hackapsit-2025",
    date: "November 1–2, 2025", shortDate: "Nov 1–2", month: "November",
    location: "APSIT, Thane",
    description: "APSIT's flagship 24-hour hackathon. 50+ teams from 5 colleges competed across tracks: AI/ML, Web3, Sustainability, and Health Tech. Prize pool: ₹50,000.",
    longDescription: "APSIT's flagship 24-hour hackathon brought together 50+ teams from 5 colleges to compete across multiple innovation tracks. Teams built solutions in AI/ML, Web3, Sustainability, and Health Tech, with a total prize pool of ₹50,000. The event featured mentorship sessions, sponsor booths, midnight snacks, and an electrifying demo day where teams pitched their projects to a panel of industry judges.",
    topics: ["AI/ML Track", "Web3 Track", "Sustainability", "Health Tech", "Open Innovation"],
    gradient: "from-[#EA4335] to-[#C62828]", badgeColor: "#EA4335", typeColor: "#EA4335",
    bannerColor1: "#EA4335", bannerColor2: "#C62828",
    attendance: "200+", duration: "24 Hours", format: "In-Person",
    featured: true, isFeatured: true, index: 4,
  },
  {
    type: "Bootcamp", title: "Tech Winter Bootcamp — Full Stack Foundations", slug: "tech-winter-bootcamp",
    date: "November 22–24, 2025", shortDate: "Nov 22–24", month: "November",
    location: "APSIT, Thane",
    description: "A 3-day intensive bootcamp covering the full stack — from HTML/CSS to React, Node.js, and deployment.",
    longDescription: "A 3-day intensive bootcamp covering the complete full-stack development journey. Day 1 focused on HTML, CSS, and JavaScript fundamentals. Day 2 introduced React with component-based architecture and state management. Day 3 covered Node.js, Express, Git workflows, and deployment to Vercel. The bootcamp included built-in mentorship, code reviews, and culminated in a project showcase.",
    topics: ["HTML/CSS/JS", "React Fundamentals", "Node & Express", "Git & GitHub", "Deployment"],
    gradient: "from-[#7C3AED] to-[#5B21B6]", badgeColor: "#7C3AED", typeColor: "#7C3AED",
    bannerColor1: "#7C3AED", bannerColor2: "#5B21B6",
    attendance: "90+", duration: "3 Days", format: "In-Person", index: 5,
  },
  {
    type: "Workshop", title: "Cloud Study Bootcamp — Google Cloud Fundamentals", slug: "cloud-study-bootcamp",
    date: "December 6, 2025", shortDate: "Dec 6", month: "December",
    location: "MGM College, Navi Mumbai",
    description: "An inter-college Google Cloud workshop covering GCP core services, Cloud Functions, BigQuery, and serverless deployment.",
    longDescription: "An inter-college Google Cloud workshop co-hosted with GDG on Campus MGM. Participants explored GCP core services, built Cloud Functions, queried datasets with BigQuery, and deployed a serverless application. The workshop provided hands-on experience with enterprise-grade cloud infrastructure in a beginner-friendly format.",
    topics: ["GCP Fundamentals", "Cloud Functions", "BigQuery", "Vertex AI", "Serverless Deployment"],
    gradient: "from-[#4285F4] to-[#1A73E8]", badgeColor: "#4285F4", typeColor: "#4285F4",
    bannerColor1: "#4285F4", bannerColor2: "#1A73E8",
    attendance: "75+", duration: "1 Day", format: "Inter-College",
    interCollege: true, isInterCollege: true, index: 6,
  },
  {
    type: "Session", title: "Open Source 101 — Your First Pull Request", slug: "open-source-101",
    date: "December 20, 2025", shortDate: "Dec 20", month: "December",
    location: "APSIT, Thane",
    description: "An evening session demystifying open-source contribution. Live walkthroughs of Git workflow, PR etiquette, and GSoC tips.",
    longDescription: "An evening session dedicated to demystifying open-source contribution for beginners. The session included live walkthroughs of Git workflows, pull request etiquette, finding good-first issues on GitHub, and practical tips for getting accepted into Google Summer of Code. Participants made their first contributions to real open-source projects during the session.",
    topics: ["Git Workflow", "PR Reviews", "GitHub Actions", "GSOC Tips", "OSS Communities"],
    gradient: "from-[#34A853] to-[#1E8E3E]", badgeColor: "#34A853", typeColor: "#34A853",
    bannerColor1: "#34A853", bannerColor2: "#1E8E3E",
    attendance: "55+", duration: "3 Hours", format: "Evening Session", index: 7,
  },
  {
    type: "Workshop", title: "Android Dev Day — Kotlin & Jetpack Compose", slug: "android-dev-day",
    date: "January 11, 2026", shortDate: "Jan 11", month: "January",
    location: "APSIT, Thane",
    description: "Hands-on modern Android development using Kotlin and Jetpack Compose. Built a complete news reader app from scratch.",
    longDescription: "A hands-on workshop on modern Android development using Kotlin and Jetpack Compose. Participants built a complete news reader app from scratch, guided by GDG tech leads. Topics covered Kotlin fundamentals, Compose UI toolkit, navigation patterns, ViewModel with StateFlow for state management, and Material 3 design implementation.",
    topics: ["Kotlin Basics", "Jetpack Compose", "Navigation", "ViewModel & StateFlow", "Material 3"],
    gradient: "from-[#4285F4] to-[#1A73E8]", badgeColor: "#4285F4", typeColor: "#4285F4",
    bannerColor1: "#4285F4", bannerColor2: "#1A73E8",
    attendance: "65+", duration: "1 Day", format: "In-Person", index: 8,
  },
];
