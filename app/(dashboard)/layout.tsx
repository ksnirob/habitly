import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="mx-auto w-full max-w-md px-4 pb-28 pt-5 sm:max-w-2xl sm:px-6 md:max-w-3xl lg:max-w-7xl lg:px-8 lg:pb-8">{children}</main>
      <MobileNav />
    </div>
  );
}
