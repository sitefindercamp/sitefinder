import { Container } from "@/components/layout/container";

export const metadata = {
  title: "First-Time Korean Spa Guide",
};

export default function FirstTimeKoreanSpaGuidePage() {
  return (
    <Container className="py-16">
      <article className="surface mx-auto max-w-4xl p-8 sm:p-10">
        <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
          Guide
        </p>
        <h1 className="mt-3 text-4xl font-semibold">First-time Korean spa guide</h1>
        <p className="mt-6 text-base leading-7 text-muted-foreground">
          This guide page is ready for editorial content about etiquette,
          amenities, pricing, and what guests should expect during a first visit.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {[
            {
              title: "What to expect",
              body: "A calm overview of entry flow, bathing areas, shared lounges, and how jjimjilbang-style spaces typically work.",
            },
            {
              title: "What to bring",
              body: "A practical checklist for first visits, including payment expectations, spare clothes, and comfort tips.",
            },
            {
              title: "Spa etiquette",
              body: "Simple, respectful guidance around showering, quiet spaces, shared rooms, and common norms.",
            },
            {
              title: "Pricing and amenities",
              body: "A plain-language explanation of day passes, add-on services, sauna rooms, body scrubs, and other features.",
            },
          ].map((section) => (
            <div
              key={section.title}
              className="rounded-[24px] border border-border bg-background/80 p-5"
            >
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </article>
    </Container>
  );
}
