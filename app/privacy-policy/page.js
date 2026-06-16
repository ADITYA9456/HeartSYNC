import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How HeartSYNC collects, uses, stores, and protects your information.',
};

const updatedOn = 'June 16, 2026';

const sections = [
  {
    title: 'Information we collect',
    body: [
      'We collect the information you give us directly, such as account details, profile information, couple setup data, chat messages, shared memories, date entries, gallery uploads, music preferences, and other content you choose to save in HeartSYNC.',
      'We may also collect device, log, and usage information needed to keep the app secure, reliable, and fast.',
    ],
  },
  {
    title: 'How we use information',
    body: [
      'We use your information to create and maintain your account, power realtime chat and notifications, sync your couple space, improve the app, detect abuse, and provide AI features you choose to use.',
      'We may also use limited information to troubleshoot issues, prevent fraud, and comply with legal obligations.',
    ],
  },
  {
    title: 'Sharing and storage',
    body: [
      'HeartSYNC is built as a private space for two. We do not sell your personal information.',
      'We may share data only with service providers that help operate the app, such as hosting, authentication, storage, media delivery, analytics, messaging, and push notification infrastructure.',
      'Your content may be stored in our backend systems and third-party services used to run the product, subject to their own security and retention practices.',
    ],
  },
  {
    title: 'Security',
    body: [
      'We use technical and organizational safeguards designed to protect your information, including authenticated sessions, CSRF protection, and server-side handling of sensitive credentials.',
      'No online system can be guaranteed to be completely secure, so we cannot promise absolute protection.',
    ],
  },
  {
    title: 'Your choices',
    body: [
      'You can update or remove content through the app where those controls are available. If you want us to delete your account or specific data, contact us using the details below.',
      'If you disable permissions such as notifications, some app features may stop working as expected.',
    ],
  },
  {
    title: 'Changes to this policy',
    body: [
      'We may update this Privacy Policy from time to time. When we do, we will revise the date above and, when appropriate, notify you in the app or by another reasonable method.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="glass-card flex flex-col gap-8 p-6 sm:p-8 lg:p-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
            Legal
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
            This policy explains how HeartSYNC handles information inside your private couple space.
            It is meant to be simple, direct, and limited to the product you are using.
          </p>
          <p className="text-sm text-muted">Updated on {updatedOn}</p>
        </header>

        <div className="grid gap-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-3xl border border-white/10 bg-white/35 p-5 dark:bg-white/5">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-muted sm:text-base">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/35 p-5 dark:bg-white/5">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
            If you have questions about this policy or want data-related help, reach out through the
            app support channel or the contact details you have been provided by the service owner.
          </p>
        </section>

        <div>
          <Link href="/" className="text-sm font-semibold text-primary hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}