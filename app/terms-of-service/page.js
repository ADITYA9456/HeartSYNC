import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service',
  description: 'Rules and conditions for using HeartSYNC.',
};

const updatedOn = 'June 16, 2026';

const sections = [
  {
    title: 'Acceptance of terms',
    body: [
      'By using HeartSYNC, you agree to these Terms of Service and to any additional rules or notices we provide inside the app.',
      'If you do not agree, do not use the service.',
    ],
  },
  {
    title: 'Eligibility and account responsibility',
    body: [
      'You must use the service in a lawful way and keep your account credentials private.',
      'You are responsible for activity that happens through your account and for the content you upload, send, or share.',
    ],
  },
  {
    title: 'Acceptable use',
    body: [
      'Do not use HeartSYNC to harass, threaten, impersonate, abuse, exploit, or violate the rights of others.',
      'Do not attempt to access systems, data, or accounts without permission, and do not interfere with the security or availability of the service.',
    ],
  },
  {
    title: 'Content and features',
    body: [
      'You keep ownership of the content you create, but you give HeartSYNC the permissions needed to store, process, display, and transmit that content so the product can work.',
      'AI features, messaging, music integrations, notifications, and media uploads are provided for convenience and may occasionally be unavailable or produce imperfect results.',
    ],
  },
  {
    title: 'Service changes and availability',
    body: [
      'We may change, suspend, or discontinue any part of the service at any time, with or without notice, where allowed by law.',
      'We do not guarantee uninterrupted or error-free operation.',
    ],
  },
  {
    title: 'Termination',
    body: [
      'We may suspend or terminate access if we believe these terms have been violated, if the service is being misused, or if we need to protect the platform or its users.',
    ],
  },
  {
    title: 'Limitation of liability',
    body: [
      'To the maximum extent allowed by law, HeartSYNC is provided on an as-is basis. We are not liable for indirect, incidental, special, or consequential damages arising from your use of the service.',
    ],
  },
  {
    title: 'Changes to these terms',
    body: [
      'We may update these Terms of Service from time to time. Continued use of the service after changes take effect means you accept the updated terms.',
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="glass-card flex flex-col gap-8 p-6 sm:p-8 lg:p-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
            Legal
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Terms of Service</h1>
          <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
            These terms describe the basic rules for using HeartSYNC. They are intentionally kept
            short so the product can stay focused on the private experience for two people.
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
            If you need help with these terms, contact the service owner through the support channel
            used for the app.
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