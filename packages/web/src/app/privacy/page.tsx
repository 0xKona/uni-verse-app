import type { Metadata } from "next";
import Link from "next/link";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { cookies } from "next/headers";
import { TopNav } from "@/components/landing/top-nav";
import { LandingFooter } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Uni-Verse (an educational project) collects and handles your data, and your rights under UK data protection law.",
};

const GITHUB_URL = "https://github.com/0xKona/uni-verse-app";
const CONTACT_EMAIL = "konarobinson@proton.me";

function MailtoLink() {
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="font-medium text-primary underline underline-offset-2"
    >
      {CONTACT_EMAIL}
    </a>
  );
}

function Section({ children, id }: { children: React.ReactNode; id?: string }) {
  return <section id={id} className="mt-8">{children}</section>;
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-heading mb-2 text-xl font-semibold tracking-tight text-foreground">
      {children}
    </h2>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>;
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
      <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
      <span>{children}</span>
    </li>
  );
}

export default async function PrivacyPage() {
  const authenticated = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        return !!session.tokens;
      } catch {
        return false;
      }
    },
  });

  return (
    <div className="flex min-h-screen flex-col bg-cosmic">
      <TopNav authenticated={authenticated} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: August 2026 &middot; Applies to the UK (UK GDPR / Data
          Protection Act 2018)
        </p>

        <Section>
          <Heading>The short version</Heading>
          <Body>
            Uni-Verse is an <strong className="text-foreground">educational project</strong> — a
            university assignment demonstrating real-time messaging built on
            AWS. It is not a commercial service. It stores only the data you
            actively provide (account, messages, files you share), keeps it in
            the UK, uses it only to make the app work, and never sells or
            advertises against it. The fastest way to exercise your rights is to
            email the author at <MailtoLink />.
          </Body>
        </Section>

        <Section>
          <Heading>Who we are</Heading>
          <Body>
            Uni-Verse is a student portfolio project. The data controller is the
            project author (a university student), and this policy reflects how
            the deployed application is actually built — see the infrastructure
            code in the{" "}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline underline-offset-2"
            >
              GitHub repository
            </a>
            . Because the project is educational, it may change or be taken
            offline at any time.
          </Body>
        </Section>

        <Section>
          <Heading>What we collect and why</Heading>
          <Body>
            All data is provided by you in the course of using the app:
          </Body>
          <ul className="mt-3 space-y-2.5">
            <Item>
              <strong className="text-foreground">Account.</strong> Your email
              address at sign-up (used to verify the account and recover it if
              you forget your password), your username, and your profile
              preferences (language and automatic-translation setting).
            </Item>
            <Item>
              <strong className="text-foreground">Messages &amp; chats.</strong>{" "}
              The text you send, who you chat with, friendship connections,
              unread/read markers, and when messages were sent.
            </Item>
            <Item>
              <strong className="text-foreground">Files, images &amp; GIFs.</strong>{" "}
              Files and images you upload are stored as objects; GIFs you pick
              are referenced by their GIF URL. Avatars are stored and made
              publicly viewable so other users can see them in the app.
            </Item>
            <Item>
              <strong className="text-foreground">Translations.</strong> If
              auto-translation is on, message text is processed by Amazon
              Translate to create a translated copy that is stored with the
              message until the message is deleted.
            </Item>
            <Item>
              <strong className="text-foreground">Ephemeral signals.</strong>{" "}
              Typing indicators are temporary and are not stored after they are
              delivered.
            </Item>
          </ul>
          <Body>
            <strong className="text-foreground">Giphy.</strong> GIF search runs
            in your browser and talks to Giphy&rsquo;s public API. We do not
            receive or store your search terms; we store only the GIF you
            choose. Giphy&rsquo;s own privacy policy applies to that interaction.
          </Body>
        </Section>

        <Section>
          <Heading>How we use data &amp; legal basis</Heading>
          <Body>
            Everything is used solely to provide the real-time messaging and
            translation features you asked for. Under the UK GDPR the legal
            bases are:
          </Body>
          <ul className="mt-3 space-y-2.5">
            <Item>
              <strong className="text-foreground">Performance of the service</strong>{" "}
              (Article 6(1)(b)) — storing and delivering your messages, friends
              and preferences.
            </Item>
            <Item>
              <strong className="text-foreground">Your consent</strong> (Article
              6(1)(a)) — providing your email at sign-up and enabling
              auto-translation.
            </Item>
          </ul>
          <Body>
            No advertising, no analytics trackers, no selling or sharing of
            personal data for marketing.
          </Body>
        </Section>

        <Section>
          <Heading>Where data is stored</Heading>
          <Body>
            The application runs on Amazon Web Services in the{" "}
            <strong className="text-foreground">United Kingdom</strong>{" "}
            (eu-west-2, London). Processors are AWS (authentication, database,
            object storage, API, translation) and Giphy (GIF search, initiated
            from your browser). Transfers outside the UK do not otherwise occur
            as part of the app itself.
          </Body>
        </Section>

        <Section>
          <Heading>Retention &amp; deletion</Heading>
          <Body>
            Data is kept for as long as the service is running and is not
            automatically expired. Because this is an educational deployment:
          </Body>
          <ul className="mt-3 space-y-2.5">
            <Item>
              Test and demonstration data, and the development database, may be
              reset or removed at any time without notice.
            </Item>
            <Item>
              The whole environment may be destroyed when the project is
              concluded — all accounts, messages and uploaded files would then
              be deleted.
            </Item>
            <Item>
              AWS configuration enables point-in-time backups of the message
              database (typically a rolling ~35-day window) as part of the
              hosting platform.
            </Item>
          </ul>
          <Body>
            There is no self-serve &ldquo;delete account&rdquo; feature. To
            erase your account or data, email <MailtoLink /> and it will be
            removed promptly.
          </Body>
        </Section>

        <Section>
          <Heading>Your rights</Heading>
          <Body>
            Under the UK GDPR you have the right to access, correct and delete
            your personal data, to restrict or object to processing, and to data
            portability. Email <MailtoLink /> to exercise any
            of these — we respond within one month. You may also complain to the{" "}
            <a
              href="https://ico.org.uk"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline underline-offset-2"
            >
              Information Commissioner&rsquo;s Office
            </a>
            .
          </Body>
        </Section>

        <Section>
          <Heading>Security</Heading>
          <Body>
            Sign-in and access control use AWS Cognito, and every API request
            requires an authenticated session. Traffic is encrypted in transit
            (TLS), and data is encrypted at rest using AWS platform encryption.
            Files you share stay private by default; only avatars are public so
            they can be displayed in-app.
          </Body>
        </Section>

        <Section>
          <Heading>Children</Heading>
          <Body>
            Uni-Verse is not aimed at children and you must be at least 13 to
            create an account. Because it is an open educational demo, we advise
            everyone not to share real personal or sensitive information.
          </Body>
        </Section>

        <Section>
          <Heading>Changes &amp; contact</Heading>
          <Body>
            If this policy changes, the date above is updated. Questions? Email{" "}
            <MailtoLink />.
          </Body>
        </Section>

        <div className="mt-10 border-t border-border/60 pt-6">
          <Link
            href="/"
            className="text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            &larr; Back to Uni-Verse
          </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}