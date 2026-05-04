import type { Metadata } from "next";

import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the terms and conditions governing use of SiteFinder.Camp, including rules for user accounts, listings, and advertising.",
};

const LAST_UPDATED = "May 2, 2026";
const CONTACT_EMAIL = "hello@sitefinder.camp";
const SITE_URL = "https://sitefinder.camp";
const COMPANY_NAME = "SiteFinder.Camp";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="pb-24">
      <Container className="max-w-3xl py-16">
        {/* Header */}
        <div className="mb-12 border-b border-border pb-10">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            Legal
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Please read these terms carefully before using {COMPANY_NAME}. By
            accessing or using our website, you agree to be bound by them.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Body */}
        <div className="space-y-12 text-base leading-7">

          <Section title="1. About SiteFinder.Camp">
            <p>
              {COMPANY_NAME} ({SITE_URL}) is a directory and information
              resource for RV parks and campgrounds. We provide campground
              listings, editorial guides, and advertising opportunities to
              connect visitors with campground businesses.
            </p>
          </Section>

          <Section title="2. Acceptance of Terms">
            <p>
              By visiting or using {SITE_URL}, creating an account, submitting
              a review, or purchasing advertising, you agree to these Terms of
              Service and our{" "}
              <a href="/privacy" className="text-primary underline-offset-4 hover:underline">
                Privacy Policy
              </a>
              . If you do not agree, please do not use the site.
            </p>
          </Section>

          <Section title="3. User Accounts">
            <p>
              You may create an account to submit reviews, save favorite campgrounds,
              and access other features. You are responsible for maintaining
              the confidentiality of your login credentials and for all
              activity under your account.
            </p>
            <p>
              You agree to provide accurate, current information when
              registering. We reserve the right to suspend or terminate
              accounts that violate these terms or that we believe are being
              used fraudulently.
            </p>
          </Section>

          <Section title="4. User-Submitted Reviews">
            <p>
              Reviews submitted to {COMPANY_NAME} must be honest, based on
              genuine personal experience, and must not contain:
            </p>
            <ul className="ml-5 list-disc space-y-1">
              <li>False or misleading information</li>
              <li>Hate speech, harassment, or discriminatory content</li>
              <li>Spam, advertising, or promotional material</li>
              <li>Personal information about staff or other individuals</li>
              <li>Content that infringes any third-party intellectual property rights</li>
            </ul>
            <p>
              By submitting a review, you grant {COMPANY_NAME} a non-exclusive,
              royalty-free, perpetual licence to display, edit, and distribute
              that content on the site and in related marketing materials. We
              reserve the right to remove any review at our discretion.
            </p>
          </Section>

          <Section title="5. Campground Listings">
            <p>
              Campground listings on {COMPANY_NAME} are provided for informational
              purposes only. We do not endorse, guarantee, or warrant the
              accuracy of any listing information, including hours, pricing,
              amenities, or ownership details.
            </p>
            <p>
              Campground owners may claim and manage their listings subject to
              our verification process. Owners are responsible for keeping their
              information accurate and up to date.
            </p>
          </Section>

          <Section title="6. Advertising">
            <p>
              Businesses may purchase advertising placements on {COMPANY_NAME}.
              All advertisements are subject to our review and must comply with
              applicable laws and our content standards. We reserve the right
              to reject or remove any advertisement for any reason.
            </p>
            <p>
              Sponsored content and paid placements will be clearly identified
              as such. {COMPANY_NAME} is not responsible for the products or
              services advertised by third parties.
            </p>
          </Section>

          <Section title="7. Intellectual Property">
            <p>
              All content on {COMPANY_NAME} that is not user-submitted —
              including text, design, logos, and code — is the property of
              {" "}{COMPANY_NAME} and may not be reproduced, distributed, or
              used without written permission.
            </p>
          </Section>

          <Section title="8. Disclaimer of Warranties">
            <p>
              {COMPANY_NAME} is provided &ldquo;as is&rdquo; without warranties
              of any kind. We do not guarantee that the site will be
              uninterrupted, error-free, or that any information on it is
              accurate, complete, or current.
            </p>
            <p>
              Visiting a campground listed on {COMPANY_NAME} is at your own risk. We
              are not liable for any experience, injury, loss, or damage arising
              from your use of any listed business.
            </p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, {COMPANY_NAME} and its
              operators shall not be liable for any indirect, incidental,
              special, or consequential damages arising from your use of the
              site, even if we have been advised of the possibility of such
              damages.
            </p>
          </Section>

          <Section title="10. Third-Party Links">
            <p>
              The site may contain links to third-party websites. These links
              are provided for convenience only. We have no control over and
              assume no responsibility for the content, privacy policies, or
              practices of any third-party sites.
            </p>
          </Section>

          <Section title="11. Changes to These Terms">
            <p>
              We may update these Terms of Service from time to time. When we
              do, we will update the &ldquo;Last updated&rdquo; date at the top
              of this page. Continued use of the site after changes are posted
              constitutes your acceptance of the revised terms.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>
              If you have any questions about these terms, please contact us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

        </div>
      </Container>
    </div>
  );
}
