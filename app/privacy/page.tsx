import { LegalDocument } from "@/components/legal/legal-document";
import {
  PRIVACY_INTRO,
  PRIVACY_SECTIONS,
  PRIVACY_UPDATED,
} from "@/lib/legal/privacy-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — carrousels.studio",
  description: "Politique de confidentialité de carrousels.studio",
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Politique de confidentialité"
      updated={PRIVACY_UPDATED}
      intro={PRIVACY_INTRO}
      sections={PRIVACY_SECTIONS}
    />
  );
}
