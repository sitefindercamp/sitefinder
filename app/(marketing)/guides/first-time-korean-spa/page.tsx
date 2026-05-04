import { Container } from "@/components/layout/container";

export const metadata = {
  title: "First-Time Campground Guide",
};

export default function FirstTimeKoreanSpaGuidePage() {
  return (
    <Container className="py-16">
      <article className="surface mx-auto max-w-4xl p-8 sm:p-10">
        <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
          Guide
        </p>
        <h1 className="mt-3 text-4xl font-semibold">First-time campground guide</h1>
        <p className="mt-6 text-base leading-7 text-muted-foreground">
          This guide page is ready for editorial content about amenities,
          hookups, pricing, and what guests should expect during a first stay.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {[
            {
              title: "What to expect",
              body: "A clear overview of arrival, check-in, site setup, quiet hours, and campground basics.",
            },
            {
              title: "What to bring",
              body: "A practical checklist for first stays, including hookups, leveling, water, and comfort items.",
            },
            {
              title: "Campground etiquette",
              body: "Simple, respectful guidance around noise, pets, shared facilities, fires, and site boundaries.",
            },
            {
              title: "Pricing and amenities",
              body: "A plain-language explanation of nightly rates, hookups, bathhouses, laundry, and other features.",
            },
          ].map((section) => (
            <div
              key={section.title}
              className="rounded-lg border border-border bg-background/80 p-5"
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
