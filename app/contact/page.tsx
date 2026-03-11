import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Voyten Electric — Request Parts, Quotes & Manual Support',
  description: 'Contact Voyten Electric for electrical parts, manual requests, quotes, and technical support. Call 1-800-458-4001 or submit a request online. Circuit breakers, motor controls, switchgear, and more. 173 Voyten Blvd, Polk, PA 16342.',
  alternates: {
    canonical: 'https://voytenmanuals.com/contact',
  },
};

interface ContactPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const formType = (params.type === 'manual-request' ? 'manual-request' : params.type === 'quote' ? 'quote' : 'contact') as 'contact' | 'quote' | 'manual-request';

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-[#1a1a1a] text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-slate-300 text-lg max-w-2xl">
            Need a manual, a replacement part, or expert help? We&#39;re here to assist. Reach out by phone, email, or the form below.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Call Us</h3>
                  <p className="text-slate-500 text-sm">Talk to an expert now</p>
                </div>
              </div>
              <a href="tel:1-800-458-4001" className="text-2xl font-bold text-[#1a1a1a] hover:underline block">
                1-800-458-4001
              </a>
              <a href="tel:814-432-5893" className="text-sm text-slate-500 hover:text-[#1a1a1a] mt-1 block">
                Local: (814) 432-5893
              </a>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Email</h3>
                  <p className="text-slate-500 text-sm">We respond within 24 hours</p>
                </div>
              </div>
              <a href="mailto:info@voytenelectric.com" className="text-[#1a1a1a] font-medium hover:underline">
                info@voytenelectric.com
              </a>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Location</h3>
                  <p className="text-slate-500 text-sm">Voyten Electric</p>
                </div>
              </div>
              <p className="text-slate-700">173 Voyten Blvd, Polk, PA 16342</p>
              <p className="text-slate-500 text-sm mt-1">Serving customers nationwide</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-slate-900">Hours</h3>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Monday – Friday</span>
                  <span className="text-slate-800 font-medium">8:00 AM – 5:00 PM ET</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Saturday – Sunday</span>
                  <span className="text-slate-800 font-medium">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  {formType === 'quote' ? 'Request a Quote' : formType === 'manual-request' ? 'Request a Manual' : 'Send Us a Message'}
                </h2>
                <p className="text-slate-500 mt-1">
                  {formType === 'quote'
                    ? 'Tell us what parts you need and we\'ll get back to you with pricing and availability.'
                    : formType === 'manual-request'
                    ? 'Describe the manual you\'re looking for and we\'ll do our best to find it.'
                    : 'Fill out the form below and we\'ll get back to you as soon as possible.'
                  }
                </p>
              </div>
              <LeadCaptureForm type={formType} compact />
            </div>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h4 className="font-bold text-slate-900 mb-1">Looking for a part?</h4>
                <p className="text-slate-500 text-sm">
                  Voyten Electric stocks thousands of electrical parts. Use our manuals to find part numbers, then call us for availability.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h4 className="font-bold text-slate-900 mb-1">Missing a manual?</h4>
                <p className="text-slate-500 text-sm">
                  Our library is growing every day. If we don&#39;t have what you need, submit a request and we&#39;ll track it down.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
