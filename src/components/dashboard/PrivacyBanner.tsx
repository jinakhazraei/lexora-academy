import { acceptPrivacy } from "@/app/dashboard/actions";
import { ConsentFields } from "@/components/ConsentFields";
import { SubmitButton } from "@/components/forms";

/** Shown to students who haven't accepted the policy yet (e.g. signed up with Google). */
export function PrivacyBanner() {
  return (
    <form action={acceptPrivacy} className="mb-8 rounded-[20px] border border-[#ecdcab] bg-[#fffaf0] p-5 sm:p-6">
      <div className="mb-1 font-sans text-[15px] font-bold text-navy">One step before we save your work</div>
      <p className="mb-4 font-sans text-[13.5px] leading-relaxed text-muted">
        We need your permission to store your essays, scores and teacher feedback. Until then, nothing is saved.
      </p>
      <ConsentFields />
      <SubmitButton pendingLabel="Saving…" className="mt-4">
        Save my choice
      </SubmitButton>
    </form>
  );
}
