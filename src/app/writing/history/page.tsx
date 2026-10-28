import type { Metadata } from "next";
import Link from "next/link";
import { EssayList } from "@/components/EssayList";
import { BandDisclaimer } from "@/components/scores";
import { Eyebrow } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { listEssays } from "@/lib/queries";

export const metadata: Metadata = { title: "My Essays — Lexora Academy" };

export default async function EssayHistoryPage(props: PageProps<"/writing/history">) {
  const user = await requireUser("/writing/history");
  const params = await props.searchParams;
  const essays = await listEssays(user.id, 200);

  return (
    <div className="bg-cream px-4 py-14 sm:px-6 md:px-12 md:py-20">
      <div className="mx-auto max-w-[880px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow className="mb-3">Writing</Eyebrow>
            <h1 className="font-display text-[32px] font-semibold text-navy md:text-[38px]">My essays</h1>
          </div>
          <Link
            href="/writing"
            className="rounded-lg bg-gold px-5 py-3 font-sans text-[13.5px] font-bold text-navy hover:text-navy hover:brightness-95"
          >
            Write a new essay
          </Link>
        </div>

        {params.deleted && (
          <div role="status" className="mb-5 rounded-lg border border-border-soft bg-white px-4 py-3 font-sans text-[13px] text-muted">
            The essay and its scores were deleted.
          </div>
        )}

        <div className="rounded-[20px] border border-border-soft bg-white p-6">
          <EssayList essays={essays} emptyText="You haven't submitted an essay yet. Your first one will appear here." />
          {essays.length > 0 && <BandDisclaimer className="mt-5 border-t border-cream-alt pt-4" />}
        </div>
      </div>
    </div>
  );
}
