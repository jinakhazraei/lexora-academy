export type Stat = { value: string; label: string };

export const stats: Stat[] = [
  { value: "1,200+", label: "Students taught" },
  { value: "92%", label: "Success rate" },
  { value: "8 yrs", label: "Experience" },
  { value: "+1.5", label: "Avg. IELTS band gain" },
];

export type WhyItem = {
  icon: "people" | "speech" | "cap" | "chip" | "grid" | "target" | "clock" | "globe";
  title: string;
  desc: string;
};

export const whyItems: WhyItem[] = [
  { icon: "people", title: "Small Class Sizes", desc: "More speaking time, more personal feedback, every session." },
  { icon: "speech", title: "Speaking-Focused Learning", desc: "Real conversation practice from day one, not just grammar drills." },
  { icon: "cap", title: "Experienced Instructors", desc: "Certified teachers with years of classroom and exam-prep experience." },
  { icon: "chip", title: "AI-Assisted Learning", desc: "Instant writing and speaking feedback between lessons." },
  { icon: "grid", title: "Interactive Classrooms", desc: "Discussion, roleplay and group work over passive lectures." },
  { icon: "target", title: "Personalized Learning", desc: "A study plan built around your goals, schedule and level." },
  { icon: "clock", title: "Flexible Schedules", desc: "Morning, evening and weekend classes to fit your life." },
  { icon: "globe", title: "International Curriculum", desc: "Aligned with global standards for IELTS, TOEFL and beyond." },
];

export type Course = {
  id: "general" | "ielts" | "toefl" | "business" | "private";
  tag: string;
  name: string;
  image: string;
  overview: string;
  whoFor: string;
  objectives: string[];
  duration: string;
  schedule: string;
};

export const courses: Course[] = [
  {
    id: "general",
    tag: "General English",
    name: "General English",
    image: "/images/textbook-about-town.jpg",
    overview: "Build real-world fluency across all four skills, from beginner to advanced.",
    whoFor: "Anyone starting or continuing their English journey.",
    objectives: [
      "Progress through CEFR levels A1–C2",
      "Build vocabulary for daily situations",
      "Practice speaking in every class",
    ],
    duration: "3 months per level",
    schedule: "Mon–Thu, evenings",
  },
  {
    id: "ielts",
    tag: "IELTS",
    name: "IELTS Preparation",
    image: "/images/ielts-listening-writing.jpg",
    overview: "Targeted preparation across all four IELTS sections with mock exams.",
    whoFor: "Students applying to universities or immigration programs abroad.",
    objectives: [
      "Master task response for Writing 1 & 2",
      "Build speaking fluency under time pressure",
      "Practice with full-length mock exams",
    ],
    duration: "2–4 months",
    schedule: "Flexible, 3x per week",
  },
  {
    id: "toefl",
    tag: "TOEFL",
    name: "TOEFL Preparation",
    image: "/images/student-writing-worksheet.jpg",
    overview: "Focused practice on the TOEFL iBT format for academic English.",
    whoFor: "Students applying to US and international universities.",
    objectives: [
      "Practice integrated listening-speaking tasks",
      "Improve academic vocabulary",
      "Simulate full practice tests",
    ],
    duration: "2–3 months",
    schedule: "Flexible, 3x per week",
  },
  {
    id: "business",
    tag: "Business English",
    name: "Business English",
    image: "/images/video-call-laptop.jpg",
    overview: "Professional communication for meetings, presentations and negotiation.",
    whoFor: "Professionals who use English at work.",
    objectives: [
      "Practice presentations and negotiation",
      "Write professional emails",
      "Prepare for job interviews in English",
    ],
    duration: "Ongoing, modular",
    schedule: "Weekly, flexible",
  },
  {
    id: "private",
    tag: "Private Lessons",
    name: "Private Lessons",
    image: "/images/students-textbook-certificates.jpg",
    overview: "One-on-one lessons designed entirely around your goals and pace.",
    whoFor: "Students who want a fully personalized plan.",
    objectives: [
      "Build a custom curriculum",
      "Track progress with regular reviews",
      "Adjust pace as you improve",
    ],
    duration: "Flexible",
    schedule: "By appointment",
  },
];

export const coursesFull = courses.filter((c) => c.id !== "general");

export const generalLevels = [
  { level: "A1", label: "Beginner" },
  { level: "A2", label: "Elementary" },
  { level: "B1", label: "Intermediate" },
  { level: "B2", label: "Upper-Int." },
  { level: "C1", label: "Advanced" },
  { level: "C2", label: "Proficient" },
];

export const aiFeatures = [
  { title: "AI Placement Test", desc: "Get matched to the right level in minutes." },
  { title: "AI Writing Feedback", desc: "Instant, detailed feedback on structure and grammar." },
  { title: "AI Speaking Evaluation", desc: "Pronunciation and fluency scoring after every recording." },
  { title: "AI Grammar Assistant", desc: "Catches patterns your teacher can dig deeper into." },
  { title: "Vocabulary Builder", desc: "Spaced repetition tuned to your course content." },
  { title: "Personalized Study Plans", desc: "A weekly plan that adapts as you progress." },
  { title: "Progress Dashboard", desc: "See your growth across all four skills over time." },
];

export type Testimonial = {
  name: string;
  photo: string;
  quote: string;
  achievement: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Ani K.",
    photo: "/images/student-glasses-laptop.jpg",
    quote:
      "My teacher pushed me to actually speak from the first week. Three months later I felt ready for my interview.",
    achievement: "IELTS Band 7.5",
  },
  {
    name: "Davit M.",
    photo: "/images/hands-typing-notebook.jpg",
    quote:
      "The AI writing feedback caught mistakes I kept repeating for years. My essays finally have structure.",
    achievement: "Admitted to a university in Germany",
  },
  {
    name: "Lilit S.",
    photo: "/images/student-writing-worksheet.jpg",
    quote: "Small class, real conversations every session. I stopped being afraid to make mistakes out loud.",
    achievement: "TOEFL 105/120",
  },
];

export const faqItems = [
  {
    q: "Do I need to take a placement test before enrolling?",
    a: "Yes — every new student takes a short AI-assisted placement test so we can recommend the right course and level.",
  },
  {
    q: "How long is each course?",
    a: "It depends on the course and your starting level. We’ll give you an exact timeline during your free consultation.",
  },
  {
    q: "Are classes online or in-person?",
    a: "Both are available. Many students combine in-person classes in Yerevan with online practice tools.",
  },
  {
    q: "Can I switch courses later?",
    a: "Yes, you can move between General English, IELTS, TOEFL or Business English as your goals change.",
  },
  {
    q: "How do I book a free consultation?",
    a: "Use the contact form, WhatsApp us, or email mahtablexora@gmail.com and we’ll schedule a time that works for you.",
  },
];

export const contact = {
  whatsappNumber: "37443499855",
  whatsappDisplay: "+374 43 499 855",
  email: "mahtablexora@gmail.com",
  hours: "Mon–Sat, 10:00–19:00",
  location: "Yerevan, Armenia",
  mapEmbedSrc:
    "https://maps.google.com/maps?q=40.213277,44.517551&ll=40.213277,44.517551&z=16&output=embed",
};

export const navLinks = [
  { label: "Courses", href: "/courses" },
  { label: "IELTS", href: "/courses#ielts" },
  { label: "TOEFL", href: "/courses#toefl" },
  { label: "Business English", href: "/courses#business" },
  { label: "About", href: "/#why-lexora" },
];
