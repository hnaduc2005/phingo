type AdminPageHeaderProps = {
  title: string;
  description: string;
};

export function AdminPageHeader({ title, description }: AdminPageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  )
}
