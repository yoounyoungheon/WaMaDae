export default function Layout({ children }: { children: React.ReactNode; }) {
  return (
    <div>
      <div className="xl:px-96 lg:px-80 base:px-72 sm:px-40">{children}</div>
    </div>
  );
}