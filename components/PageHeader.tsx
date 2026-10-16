export function PageHeader({ title, intro, children }: { title: string; intro?: string; children?: React.ReactNode }) {
  return (
    <header className="pb-12 pt-24 max-sm:pb-8 max-sm:pt-14">
      <h1 className="m-0 text-[clamp(36px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.03em]">{title}</h1>
      {intro && <p className="mb-0 mt-4 max-w-[36em] text-[19px] text-muted">{intro}</p>}
      {children}
    </header>
  );
}
