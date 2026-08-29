import { LegalDocument } from "@/components/legal/legal-document";
import {
  TERMS_INTRO,
  TERMS_SECTIONS,
  TERMS_UPDATED,
} from "@/lib/legal/terms-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'utilisation — carrousels.studio",
  description: "Conditions d'utilisation de carrousels.studio",
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Conditions d'utilisation"
      updated={TERMS_UPDATED}
      intro={TERMS_INTRO}
      sections={TERMS_SECTIONS}
    />
  );
}
