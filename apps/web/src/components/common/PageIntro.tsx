type PageIntroProps = {
  title: string;
  description: string;
};

export function PageIntro({ title, description }: PageIntroProps) {
  return (
    <section className="bg-brand-cream py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-brand-coffee md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-brand-coffee/70">{description}</p>
      </div>
    </section>
  )
}
