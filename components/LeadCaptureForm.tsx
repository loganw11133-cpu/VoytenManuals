'use client';

import { useState } from 'react';
import { Send, CheckCircle, Phone } from 'lucide-react';

interface LeadCaptureFormProps {
  type: 'quote' | 'manual-request' | 'contact';
  manualTitle?: string;
  manualId?: number;
  sourcePage?: string;
  compact?: boolean;
}

export default function LeadCaptureForm({ type, manualTitle, manualId, sourcePage, compact = false }: LeadCaptureFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type,
          manual_id: manualId,
          manual_title: manualTitle,
          source_page: sourcePage || window.location.pathname,
        }),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', company: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
        <h3 className="font-bold text-green-900 text-lg mb-1">Request Received!</h3>
        <p className="text-green-700 text-sm mb-3">
          Our team at Voyten Electric will get back to you shortly.
        </p>
        <p className="text-green-600 text-sm flex items-center justify-center gap-2">
          <Phone size={14} />
          Need it faster? Call <a href="tel:1-800-458-4001" className="font-bold underline">1-800-458-4001</a>
        </p>
      </div>
    );
  }

  const titles: Record<string, string> = {
    'quote': 'Request a Quote',
    'manual-request': 'Request a Manual',
    'contact': 'Get in Touch',
  };

  const descriptions: Record<string, string> = {
    'quote': 'Looking for a replacement part? Voyten Electric can help.',
    'manual-request': "Can't find the manual you need? Let us know and we'll track it down.",
    'contact': 'Questions? Our electrical experts are ready to help.',
  };

  return (
    <div className={compact ? '' : 'bg-white border border-slate-200 rounded-xl p-6'}>
      {!compact && (
        <div className="mb-5">
          <h3 className="font-bold text-slate-900 text-lg">{titles[type]}</h3>
          <p className="text-slate-500 text-sm mt-1">{descriptions[type]}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className={compact ? 'grid sm:grid-cols-2 gap-3' : 'space-y-3'}>
          <input
            type="text"
            placeholder="Your Name *"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent placeholder:text-slate-400"
          />
          <input
            type="email"
            placeholder="Email Address *"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent placeholder:text-slate-400"
          />
        </div>
        <div className={compact ? 'grid sm:grid-cols-2 gap-3' : 'space-y-3'}>
          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent placeholder:text-slate-400"
          />
          <input
            type="text"
            placeholder="Company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent placeholder:text-slate-400"
          />
        </div>
        <textarea
          placeholder={
            type === 'quote'
              ? 'What part(s) do you need? Include model numbers, quantities, etc.'
              : type === 'manual-request'
              ? 'Describe the manual you need — equipment type, model, manufacturer...'
              : 'How can we help?'
          }
          rows={compact ? 2 : 3}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent placeholder:text-slate-400 resize-none"
        />

        {manualTitle && (
          <p className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
            Regarding: <span className="font-medium text-slate-700">{manualTitle}</span>
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full bg-[#1a1a1a] hover:bg-[#111111] text-white py-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {status === 'submitting' ? (
            'Submitting...'
          ) : (
            <>
              <Send size={16} />
              {type === 'quote' ? 'Request Quote' : type === 'manual-request' ? 'Submit Request' : 'Send Message'}
            </>
          )}
        </button>

        {status === 'error' && (
          <p className="text-red-600 text-sm text-center">Something went wrong. Please try again or call us at 1-800-458-4001.</p>
        )}
      </form>
    </div>
  );
}
