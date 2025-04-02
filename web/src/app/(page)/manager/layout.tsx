export default function Layout({ children }: { children: React.ReactNode; }) {
  return (
    <div>
      <div className="p-1 text-center">nav</div>
      <div>{children}</div>
    </div>
  );
}