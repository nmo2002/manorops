import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Wrench, Users, FileText, Package, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";

const features = [
  {
    icon: Building2,
    title: "Multi-Property Management",
    description:
      "Maintain a complete operational picture across every home — primary, vacation, and investment properties — from one unified view.",
  },
  {
    icon: Users,
    title: "Vendor Relationships",
    description:
      "Keep every contractor, specialist, and service provider organized with contact details, service history, and property assignments.",
  },
  {
    icon: Wrench,
    title: "Maintenance Scheduling",
    description:
      "Track every task with priority levels, due dates, and vendor assignments. Never miss a seasonal service or critical repair.",
  },
  {
    icon: FileText,
    title: "Document Vault",
    description:
      "Centralize insurance policies, warranties, deeds, and contracts. Track expiration dates and access critical files instantly.",
  },
  {
    icon: Package,
    title: "Household Inventory",
    description:
      "Catalog high-value assets room by room — appliances, systems, and equipment — with purchase records and warranty tracking.",
  },
];

export default async function LandingPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-neutral-100 bg-white/95 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-neutral-900 rounded-md flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-neutral-900 tracking-tight">ManorOps</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-neutral-500">
            <a href="#features" className="hover:text-neutral-900 transition-colors">
              Features
            </a>
            <a href="#why" className="hover:text-neutral-900 transition-colors">
              Why ManorOps
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-neutral-600">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-neutral-900 text-white hover:bg-neutral-800">
                Enter Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-full px-3 py-1 text-xs text-neutral-600 font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Built for family offices and estate managers
          </div>
          <h1 className="text-5xl md:text-6xl font-semibold text-neutral-900 leading-tight tracking-tight mb-6">
            Private estate operations,
            <br />
            <span className="text-neutral-400">organized in one place.</span>
          </h1>
          <p className="text-lg text-neutral-500 leading-relaxed mb-10 max-w-2xl">
            ManorOps is the operational backbone for managing multiple homes and estates. Properties,
            vendors, maintenance, documents, and inventory — all in one clean, private dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/login">
              <Button className="bg-neutral-900 text-white hover:bg-neutral-800 h-11 px-6 text-sm font-medium">
                Enter Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="h-11 px-6 text-sm font-medium border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            >
              Book a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-neutral-100 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-3 gap-8">
            {[
              { value: "3–12", label: "Properties managed per estate" },
              { value: "40+", label: "Hours saved per month" },
              { value: "100%", label: "Document visibility" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-semibold text-neutral-900 mb-1">{stat.value}</div>
                <div className="text-sm text-neutral-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-neutral-900 tracking-tight mb-4">
            Everything an estate needs to run smoothly
          </h2>
          <p className="text-neutral-500 max-w-xl">
            Designed for the complexity of managing exceptional properties — not generic project
            management tools repurposed for the job.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 border border-neutral-100 rounded-xl hover:border-neutral-200 hover:shadow-sm transition-all bg-white"
            >
              <div className="w-10 h-10 bg-neutral-50 border border-neutral-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-neutral-900 group-hover:border-neutral-900 transition-all">
                <feature.icon className="w-5 h-5 text-neutral-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-medium text-neutral-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why ManorOps */}
      <section id="why" className="bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight mb-6">
                The operating layer your properties deserve
              </h2>
              <p className="text-neutral-400 leading-relaxed mb-8">
                Managing a single estate is a full-time operation. Managing a portfolio of exceptional
                properties requires an entirely different level of coordination. ManorOps gives estate
                managers, household staff, and family offices the clarity they need.
              </p>
              <ul className="space-y-4">
                {[
                  "Single dashboard for all properties and staff",
                  "Vendor and contractor relationship management",
                  "Preventive maintenance scheduling and tracking",
                  "Document and warranty expiration alerts",
                  "High-value asset inventory with valuations",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-neutral-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-neutral-800 rounded-2xl p-8 border border-neutral-700">
              <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-6">
                Estate Overview
              </div>
              <div className="space-y-4">
                {[
                  { label: "Properties", value: "3", sub: "Primary, Vacation, Secondary" },
                  { label: "Open Tasks", value: "6", sub: "2 high priority" },
                  { label: "Active Vendors", value: "5", sub: "All properties" },
                  { label: "Documents", value: "8", sub: "2 expiring soon" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-3 border-b border-neutral-700 last:border-0"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{item.label}</div>
                      <div className="text-xs text-neutral-500">{item.sub}</div>
                    </div>
                    <div className="text-2xl font-semibold text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-semibold text-neutral-900 tracking-tight mb-4">
          Ready to bring order to your estate?
        </h2>
        <p className="text-neutral-500 mb-8 max-w-md mx-auto">
          Join estate managers and family offices who trust ManorOps to keep their properties running
          without friction.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/login">
            <Button className="bg-neutral-900 text-white hover:bg-neutral-800 h-11 px-8 text-sm font-medium">
              Enter Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Button
            variant="outline"
            className="h-11 px-8 text-sm font-medium border-neutral-200 text-neutral-700"
          >
            Book a Demo
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-neutral-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-neutral-900 rounded-md flex items-center justify-center">
              <Building2 className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium text-neutral-900">ManorOps</span>
          </div>
          <div>© 2025 ManorOps. Private estate operations platform.</div>
        </div>
      </footer>
    </div>
  );
}
