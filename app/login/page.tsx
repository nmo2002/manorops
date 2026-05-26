import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-stone-900 rounded-xl mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">ManorOps</h1>
          <p className="text-sm text-stone-500 mt-1">Estate Operations Platform</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 mb-1">Sign in</h2>
          <p className="text-sm text-stone-500 mb-6">Enter your credentials to access the dashboard</p>
          <LoginForm />
        </div>
        <p className="text-center text-xs text-stone-400 mt-6">
          Demo: edward@hargrove.com · demo1234
        </p>
      </div>
    </div>
  );
}
