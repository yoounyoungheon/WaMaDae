import { AdminLoginForm } from "@/app/ui/component/manager/admin-login-form";

export default async function ManagerHome() {

  return (
    <main>
      <div className="p-10 text-center text-3xl font-bol">와마대</div>
      <div className="px-5 grid grid-cols-3 gap-3 text-center">
        <div/>
        <AdminLoginForm/>
        <div/>
      </div>
    </main>
  );
}
