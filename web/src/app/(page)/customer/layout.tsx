export default function Layout({ children }: { children: React.ReactNode; }) {
  return (
    <div>
      <div className="p-10 text-center bg-yellow-50">로고(캐럿셀 들어가야 할 듯)</div>
      <div className="">{children}</div>
    </div>
  );
}