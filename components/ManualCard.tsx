import Link from 'next/link';
import { FileText, Download, Building2, Tag } from 'lucide-react';
import { formatFileSize, type Manual } from '@/lib/manuals-db';

interface ManualCardProps {
  manual: Manual;
}

export default function ManualCard({ manual }: ManualCardProps) {
  return (
    <Link
      href={`/manual/${manual.slug}`}
      className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-[#1a1a1a]/30 hover:shadow-lg transition-all"
    >
      {/* Icon / Visual */}
      <div className="bg-slate-50 group-hover:bg-[#1a1a1a]/5 transition-colors px-5 py-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-[#1a1a1a]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#1a1a1a] transition-colors">
          <FileText className="w-6 h-6 text-[#1a1a1a] group-hover:text-white transition-colors" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm leading-snug group-hover:text-[#1a1a1a] transition-colors">
            {manual.title}
          </h3>
          {manual.manual_number && (
            <p className="text-xs text-slate-400 mt-1 font-mono">#{manual.manual_number}</p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="px-5 py-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-500 min-w-0">
            <span className="flex items-center gap-1 truncate">
              <Building2 size={12} />
              {manual.manufacturer}
            </span>
            <span className="flex items-center gap-1 truncate">
              <Tag size={12} />
              {manual.category}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#1a1a1a] font-medium flex-shrink-0">
            <Download size={12} />
            {manual.page_count ? `${manual.page_count}p` : 'PDF'}
            {manual.file_size_bytes ? ` · ${formatFileSize(manual.file_size_bytes)}` : ''}
          </div>
        </div>
      </div>
    </Link>
  );
}
