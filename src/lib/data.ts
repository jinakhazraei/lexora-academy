// Structure only: ids, images, links and order. All visible text lives in src/i18n/dictionaries.
import type { Dictionary } from "@/i18n/dictionaries";

export type WhyIcon = "people" | "speech" | "cap" | "chip" | "grid" | "target" | "clock" | "globe";
export const whyIcons: WhyIcon[] = ["people", "speech", "cap", "chip", "grid", "target", "clock", "globe"];

export type CourseId = "general" | "ielts" | "toefl" | "business" | "private";
export const courseIds: CourseId[] = ["general", "ielts", "toefl", "business", "private"];
export const detailCourseIds: CourseId[] = courseIds.filter((id) => id !== "general");

export const courseImages: Record<CourseId, string> = {
  general: "/images/textbook-about-town.jpg",
  ielts: "/images/ielts-listening-writing.jpg",
  toefl: "/images/student-writing-worksheet.jpg",
  business: "/images/video-call-laptop.jpg",
  private: "/images/students-textbook-certificates.jpg",
};

export type Course = Dictionary["content"]["courses"][CourseId] & { id: CourseId; image: string };

export function getCourse(t: Dictionary, id: CourseId): Course {
  return { ...t.content.courses[id], id, image: courseImages[id] };
}

export const levelCodes = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export type AiFeatureKey = keyof Dictionary["content"]["aiFeatures"];
export const aiFeatureList: { key: AiFeatureKey; status: "live" | "soon"; href?: string }[] = [
  { key: "placement", status: "soon" },
  { key: "writing", status: "live", href: "/writing" },
  { key: "speaking", status: "soon" },
  { key: "grammar", status: "live", href: "/writing" },
  { key: "vocabulary", status: "soon" },
  { key: "plans", status: "soon" },
  { key: "dashboard", status: "live", href: "/dashboard" },
];

export const testimonialPhotos = [
  "/images/student-glasses-laptop.jpg",
  "/images/hands-typing-notebook.jpg",
  "/images/student-writing-worksheet.jpg",
];

export const contact = {
  whatsappNumber: "37443499855",
  whatsappDisplay: "+374 43 499 855",
  email: "mahtablexora@gmail.com",
};

export type NavKey = "courses" | "pricing" | "ielts" | "writing" | "about";
export const navLinks: { key: NavKey; href: string }[] = [
  { key: "courses", href: "/courses" },
  { key: "pricing", href: "/pricing" },
  { key: "ielts", href: "/courses#ielts" },
  { key: "writing", href: "/writing" },
  { key: "about", href: "/#why-lexora" },
];
