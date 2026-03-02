import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Pedie Tech privacy policy — how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <div className='w-full max-w-3xl mx-auto px-4 py-12'>
      <h1 className='text-3xl font-bold text-pedie-text mb-8'>
        Privacy Policy
      </h1>
      <p className='text-pedie-text-muted mb-4'>Last updated: February 2026</p>

      <div className='space-y-8 text-pedie-text-muted'>
        <section>
          <h2 className='text-xl font-semibold text-pedie-text mb-3'>
            1. Information We Collect
          </h2>
          <p>When you use Pedie Tech, we may collect:</p>
          <ul className='list-disc pl-6 mt-2 space-y-1'>
            <li>Account information (name, email, phone number)</li>
            <li>
              Payment details (M-Pesa number, PayPal email — processed by
              third-party providers)
            </li>
            <li>Order history and preferences</li>
            <li>Device and browser information for site optimization</li>
          </ul>
        </section>

        <section>
          <h2 className='text-xl font-semibold text-pedie-text mb-3'>
            2. How We Use Your Information
          </h2>
          <ul className='list-disc pl-6 space-y-1'>
            <li>Process and fulfill your orders</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Improve our products and services</li>
            <li>Communicate promotions (with your consent)</li>
            <li>Prevent fraud and ensure security</li>
          </ul>
        </section>

        <section>
          <h2 className='text-xl font-semibold text-pedie-text mb-3'>
            3. Data Sharing
          </h2>
          <p>
            We do not sell your personal data. We share information only with:
          </p>
          <ul className='list-disc pl-6 mt-2 space-y-1'>
            <li>
              Payment processors (Safaricom M-Pesa, PayPal) to process
              transactions
            </li>
            <li>Delivery partners to fulfill shipments</li>
            <li>
              Service providers who assist our operations (under strict
              confidentiality)
            </li>
          </ul>
        </section>

        <section>
          <h2 className='text-xl font-semibold text-pedie-text mb-3'>
            4. Data Security
          </h2>
          <p>
            We implement industry-standard security measures including
            encryption in transit (TLS), secure authentication via Supabase, and
            role-based access controls to protect your data.
          </p>
        </section>

        <section>
          <h2 className='text-xl font-semibold text-pedie-text mb-3'>
            5. Your Rights
          </h2>
          <p>
            Under the Kenya Data Protection Act (2019), you have the right to:
          </p>
          <ul className='list-disc pl-6 mt-2 space-y-1'>
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section>
          <h2 className='text-xl font-semibold text-pedie-text mb-3'>
            6. Cookies
          </h2>
          <p>
            We use essential cookies for authentication and session management.
            No third-party tracking cookies are used without your consent.
          </p>
        </section>

        <section>
          <h2 className='text-xl font-semibold text-pedie-text mb-3'>
            7. Contact Us
          </h2>
          <p>For privacy-related inquiries, contact us at:</p>
          <p className='mt-2'>
            <strong className='text-pedie-text'>Email:</strong> hello@pedie.tech
          </p>
        </section>
      </div>
    </div>
  )
}
