import type { Metadata } from "next";

import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Privacy Policy | KSpa Online",
  description:
    "Learn how KSpa Online collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "April 28, 2026";
const CONTACT_EMAIL = "hello@kspa.online";
const SITE_URL = "https://kspa.online";
const COMPANY_NAME = "KSpa Online";

export default function PrivacyPolicyPage() {
  return (
    <div className="pb-24">
      <Container className="max-w-3xl py-16">
        {/* Header */}
        <div className="mb-12 border-b border-border pb-10">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            Legal
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Your privacy matters to us. This policy explains what information we
            collect, how we use it, and what choices you have.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Body */}
        <div className="prose-policy space-y-12 text-base leading-7 text-foreground">

          <section>
            <h2 className="text-xl font-semibold">1. Who we are</h2>
            <p className="mt-4 text-muted-foreground">
              {COMPANY_NAME} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the website at{" "}
              <a
                href={SITE_URL}
                className="text-primary underline-offset-4 hover:underline"
              >
                {SITE_URL}
              </a>
              . We are an online directory that helps people discover Korean
              spas, jjimjilbangs, and wellness centers across the United States.
            </p>
            <p className="mt-3 text-muted-foreground">
              If you have questions about this policy, contact us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Information we collect</h2>

            <h3 className="mt-6 text-base font-semibold">
              Information you provide directly
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <strong className="text-foreground">Account registration</strong> —
                when you create an account, we collect your email address and a
                password (stored securely via Supabase Auth; we never see your
                plaintext password).
              </li>
              <li>
                <strong className="text-foreground">Spa submissions</strong> — if
                you submit a spa listing, we collect the spa&apos;s name, address,
                city, state, website, phone number, and your contact email.
              </li>
              <li>
                <strong className="text-foreground">Reviews</strong> — when you
                write a review, we collect your rating, written feedback, and the
                account email associated with your session.
              </li>
              <li>
                <strong className="text-foreground">Claim requests</strong> — if
                you request to claim a spa listing as its owner, we collect your
                name, email address, and any message you provide.
              </li>
              <li>
                <strong className="text-foreground">Advertising inquiries</strong> —
                if you submit an advertising inquiry, we collect your name,
                company name, email address, phone number, and the nature of
                your interest.
              </li>
              <li>
                <strong className="text-foreground">Contact messages</strong> —
                any messages you send us directly via email.
              </li>
            </ul>

            <h3 className="mt-6 text-base font-semibold">
              Information collected automatically
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <strong className="text-foreground">Usage data</strong> — pages
                visited, time on site, referring URLs, and browser type,
                collected via Vercel Analytics (privacy-friendly, no cross-site
                tracking).
              </li>
              <li>
                <strong className="text-foreground">IP address</strong> — logged
                by our hosting provider (Vercel) for security and abuse
                prevention. We do not store or link IP addresses to user
                profiles.
              </li>
              <li>
                <strong className="text-foreground">Cookies and local storage</strong> —
                we use a session cookie issued by Supabase Auth to keep you
                logged in. We do not use advertising cookies or third-party
                tracking pixels.
              </li>
              <li>
                <strong className="text-foreground">Ad impressions</strong> — if
                you view a sponsored listing, we record that an impression
                occurred (tied to the campaign, not to your personal identity).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. How we use your information</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>To operate the directory and display spa listings.</li>
              <li>
                To create and manage your account and authenticate your
                sessions.
              </li>
              <li>
                To moderate reviews and spa submissions before they are
                published.
              </li>
              <li>
                To process spa ownership claim requests and notify you of their
                outcome.
              </li>
              <li>
                To respond to advertising inquiries and send transactional emails
                related to those inquiries.
              </li>
              <li>
                To improve the site using aggregated, anonymized usage
                analytics.
              </li>
              <li>
                To detect and prevent spam, fraud, or abuse of our platform.
              </li>
              <li>
                To comply with legal obligations when required by applicable law.
              </li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              We do not sell your personal information. We do not use your data
              to build advertising profiles or share it with data brokers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              4. How we share your information
            </h2>
            <p className="mt-4 text-muted-foreground">
              We share information only in the following limited circumstances:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <strong className="text-foreground">Service providers</strong> —
                we use Supabase (database and authentication), Vercel (hosting
                and analytics), and MailerLite (transactional email). Each
                provider only receives the data necessary to perform their
                service and is bound by data processing agreements.
              </li>
              <li>
                <strong className="text-foreground">Legal requirements</strong> —
                we may disclose information if required by law, court order, or
                to protect the rights, property, or safety of our users or the
                public.
              </li>
              <li>
                <strong className="text-foreground">Business transfers</strong> —
                if {COMPANY_NAME} is acquired or merges with another entity, your
                information may be transferred as part of that transaction. We
                will notify you before your data is subject to a different
                privacy policy.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Data retention</h2>
            <p className="mt-4 text-muted-foreground">
              We retain your personal information for as long as your account is
              active or as needed to provide our services. If you delete your
              account, we will delete or anonymize your personal data within 30
              days, except where we are required to retain it for legal or
              regulatory reasons.
            </p>
            <p className="mt-3 text-muted-foreground">
              Submitted spa listings and published reviews may remain on the
              site after account deletion in anonymized form, since they
              constitute factual directory information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Your rights and choices</h2>
            <p className="mt-4 text-muted-foreground">
              Depending on where you live, you may have the following rights
              regarding your personal data:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <strong className="text-foreground">Access</strong> — request a
                copy of the personal data we hold about you.
              </li>
              <li>
                <strong className="text-foreground">Correction</strong> — ask us
                to correct inaccurate or incomplete data.
              </li>
              <li>
                <strong className="text-foreground">Deletion</strong> — request
                that we delete your personal data (&quot;right to be
                forgotten&quot;).
              </li>
              <li>
                <strong className="text-foreground">Portability</strong> —
                receive your data in a structured, machine-readable format.
              </li>
              <li>
                <strong className="text-foreground">Opt-out of emails</strong> —
                any marketing emails will include an unsubscribe link. You
                cannot opt out of transactional emails directly related to your
                account activity.
              </li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              To exercise any of these rights, email us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Cookies</h2>
            <p className="mt-4 text-muted-foreground">
              We use only essential cookies necessary for the site to function:
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Cookie</th>
                    <th className="px-4 py-3 text-left font-medium">Purpose</th>
                    <th className="px-4 py-3 text-left font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-muted-foreground">
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">sb-*</td>
                    <td className="px-4 py-3">
                      Supabase authentication session
                    </td>
                    <td className="px-4 py-3">Session / 1 week</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">__vercel_*</td>
                    <td className="px-4 py-3">
                      Vercel deployment infrastructure
                    </td>
                    <td className="px-4 py-3">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-muted-foreground">
              We do not use advertising, tracking, or analytics cookies. You can
              disable cookies in your browser settings; however, doing so will
              prevent you from staying logged in.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Children&apos;s privacy</h2>
            <p className="mt-4 text-muted-foreground">
              {COMPANY_NAME} is not directed to children under the age of 13. We
              do not knowingly collect personal information from children under
              13. If we learn that we have inadvertently collected such
              information, we will delete it promptly. If you believe a child
              under 13 has provided us with personal data, please contact us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Security</h2>
            <p className="mt-4 text-muted-foreground">
              We take reasonable technical and organizational measures to protect
              your personal information, including TLS encryption in transit,
              row-level security policies in our database, and restricted access
              to admin functions. No method of transmission over the internet is
              100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              10. Third-party links
            </h2>
            <p className="mt-4 text-muted-foreground">
              Spa listings may include links to external websites (spa websites,
              Google Maps, Yelp, etc.). We are not responsible for the privacy
              practices of those websites. We encourage you to review the privacy
              policy of any third-party site you visit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              11. California residents (CCPA)
            </h2>
            <p className="mt-4 text-muted-foreground">
              If you are a California resident, you have additional rights under
              the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                The right to know what personal information we collect, use,
                disclose, or sell.
              </li>
              <li>
                The right to delete personal information we have collected from
                you.
              </li>
              <li>
                The right to opt out of the sale of personal information. We do
                not sell personal information.
              </li>
              <li>
                The right to non-discrimination for exercising your CCPA rights.
              </li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              To submit a verifiable consumer request, email us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              12. Changes to this policy
            </h2>
            <p className="mt-4 text-muted-foreground">
              We may update this Privacy Policy from time to time. When we do,
              we will update the &quot;Last updated&quot; date at the top of this page. If
              we make material changes, we will notify registered users by email.
              Your continued use of {COMPANY_NAME} after changes take effect
              constitutes your acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">13. Contact us</h2>
            <p className="mt-4 text-muted-foreground">
              If you have questions, concerns, or requests related to this
              Privacy Policy, please reach out:
            </p>
            <div className="mt-4 rounded-2xl border border-border bg-muted/30 px-6 py-5 text-muted-foreground">
              <p className="font-medium text-foreground">{COMPANY_NAME}</p>
              <p className="mt-1">
                Email:{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p className="mt-1">
                Website:{" "}
                <a
                  href={SITE_URL}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {SITE_URL}
                </a>
              </p>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
