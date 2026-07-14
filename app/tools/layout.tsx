import RepeatVisitorCta from '@/components/RepeatVisitorCta';
import DecoderQuoteModal from '@/components/DecoderQuoteModal';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <RepeatVisitorCta />
      <DecoderQuoteModal />
    </>
  );
}
