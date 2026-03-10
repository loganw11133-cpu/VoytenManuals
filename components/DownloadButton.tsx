'use client';

import { Download } from 'lucide-react';

interface DownloadButtonProps {
  pdfUrl: string;
  manualId: number;
  fileSize: string;
  pageCount: number | null;
}

export default function DownloadButton({ pdfUrl, manualId, fileSize, pageCount }: DownloadButtonProps) {
  const handleDownload = () => {
    // Track the download asynchronously — don't block the actual download
    fetch('/api/downloads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ manual_id: manualId }),
    }).catch(() => {}); // Silently fail tracking
  };

  return (
    <div className="bg-[#1a3a5c]/5 rounded-xl p-6 border border-[#1a3a5c]/10">
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
          className="flex items-center gap-2 bg-[#1a3a5c] hover:bg-[#0f2840] text-white px-8 py-3.5 rounded-xl font-bold transition-colors"
        >
          <Download size={20} />
          Download Manual
        </a>
      </div>
    </div>
  );
}
