
import AgencyHeader from './header';

export default function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <AgencyHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
