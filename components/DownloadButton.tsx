'use client';

import { Download, Phone, Wrench } from 'lucide-react';
import { csrfFetch } from '@/lib/csrf-client';

interface DownloadButtonProps {
  pdfUrl: string;
  manualId: number;
  fileSize: string;
  pageCount: number | null;
}

// Temporary: PDFs hosted on electricalpartmanuals.com are unreachable
// due to domain redirect. Remove this check once files.electricalpartmanuals.com is live.
function isEpmUrl(url: string): boolean {
  return url.includes('electricalpartmanuals.com');
}

export default function DownloadButton({ pdfUrl, manualId, fileSize, pageCount }: DownloadButtonProps) {
  const hasValidPdf = pdfUrl && pdfUrl !== '' && pdfUrl !== 'NONE';

  const handleDownload = () => {
    // Track the download asynchronously — don't block the actual download
    csrfFetch('/api/downloads', { manual_id: manualId }).catch(() => {});
  };

  if (!hasValidPdf) {
    return (
      <div className="bg-[#1a1a1a]/5 rounded-xl p-6 border border-[#1a1a1a]/10">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-bold text-slate-900 text-lg">PDF Not Available Online</h3>
            <p className="text-slate-500 text-sm">
              Contact Voyten Electric for documentation and replacement parts.
            </p>
          </div>
          <a
            href="tel:1-800-458-4001"
            className="flex items-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-8 py-3.5 rounded-xl font-bold transition-colors"
          >
            <Phone size={20} />
            1-800-458-4001
          </a>
        </div>
      </div>
    );
  }

  // Temporary fallback for PDFs hosted on electricalpartmanuals.com (redirect loop)
  if (isEpmUrl(pdfUrl)) {
    return (
      <div className="rounded-xl overflow-hidden border border-amber-200">
        <div className="bg-amber-50 px-6 py-4 flex items-center gap-3 border-b border-amber-200">
          <Wrench size={18} className="text-amber-600 flex-shrink-0" />
          <p className="text-amber-800 text-sm font-medium">
            Website Maintenance underway: We are working on getting these manuals added ASAP, please check back in a few days.
          </p>
        </div>
        <div className="bg-[#1a1a1a]/5 p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-bold text-slate-900 text-lg">Need This Manual Now?</h3>
              <p className="text-slate-500 text-sm">
                Call us and we&apos;ll send it to you directly.
                {fileSize ? ` (${fileSize}` : ''}
                {fileSize && pageCount ? ` · ${pageCount} pages)` : fileSize ? ')' : ''}
                {!fileSize && pageCount ? ` (${pageCount} pages)` : ''}
              </p>
            </div>
            <a
              href="tel:1-800-458-4001"
              className="flex items-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-8 py-3.5 rounded-xl font-bold transition-colors"
            >
              <Phone size={20} />
              1-800-458-4001
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a]/5 rounded-xl p-6 border border-[#1a1a1a]/10">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-bold text-slate-900 text-lg">Download PDF</h3>
          <p className="text-slate-500 text-sm">
            {fileSize || 'PDF'}
            {pageCount ? ` · ${pageCount} pages` : ''}
          </p>
        </div>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDownload}
          className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#111111] text-white px-8 py-3.5 rounded-xl font-bold transition-colors"
        >
          <Download size={20} />
          Download Manual
        </a>
      </div>
    </div>
  );
}
