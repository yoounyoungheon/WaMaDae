import { ManagerNav } from "@/app/ui/component/nav/nav";

export default function Layout({ children }: { children: React.ReactNode; }) {
  return (
    <div>
      <div><ManagerNav/></div>
      <div>{children}</div>
    </div>
  );
}