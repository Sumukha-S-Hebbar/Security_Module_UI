
import TowercoHeader from './header';

export default function TowercoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <TowercoHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
