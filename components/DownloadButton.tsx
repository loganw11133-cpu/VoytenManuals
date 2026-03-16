'use client';

import { Download, Phone } from 'lucide-react';

interface DownloadButtonProps {
  pdfUrl: string;
  manualId: number;
  fileSize: string;
  pageCount: number | null;
}

export default function DownloadButton({ pdfUrl, manualId, fileSize, pageCount }: DownloadButtonProps) {
  const hasValidPdf = pdfUrl && pdfUrl !== '' && pdfUrl !== 'NONE';

  const handleDownload = () => {
    // Track the download asynchronously — don't block the actual download
    fetch('/api/downloads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ manual_id: manualId }),
    }).catch(() => {}); // Silently fail tracking
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
