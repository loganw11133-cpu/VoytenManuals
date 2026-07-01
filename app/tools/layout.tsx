import RepeatVisitorCta from '@/components/RepeatVisitorCta';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <RepeatVisitorCta />
    </>
  );
}
