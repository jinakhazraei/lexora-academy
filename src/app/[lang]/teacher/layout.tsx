import { I18nProvider } from "@/i18n/client";
import { getDictionary } from "@/i18n/dictionaries";

/**
 * The teacher area is in English for now, whatever language the URL has. Shared pieces
 * (score cards, essay feedback) read this provider, so they switch to English here too.
 */
export default function TeacherLayout({ children }: LayoutProps<"/[lang]/teacher">) {
  return (
    <I18nProvider lang="en" t={getDictionary("en")}>
      <div lang="en">{children}</div>
    </I18nProvider>
  );
}
