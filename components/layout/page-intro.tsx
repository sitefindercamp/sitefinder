type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-4xl font-semibold">{title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{description}</p>
    </div>
  );
}

