import Link from "next/link";

type LegalSection = {
  title: string;
  paragraphs: string[];
};

type LegalDocumentProps = {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export function LegalDocument({ title, updated, intro, sections }: LegalDocumentProps) {
  return (
    <div className="k-page pb-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="k-link text-sm">
          ← Retour
        </Link>
        <h1 className="k-heading mt-4">{title}</h1>
        <p className="mt-2 text-sm k-text-muted">Dernière mise à jour : {updated}</p>

        <div className="k-card mt-6 space-y-8">
          <p className="text-sm leading-relaxed k-text-secondary">{intro}</p>

          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="k-subheading text-base">{section.title}</h2>
              <div className="mt-3 space-y-3">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed k-text-muted">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
