import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, ArrowRight, Shield, Lock, BarChart3, CheckCircle, Wrench, FileText, Users, Package, TrendingUp, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";

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
            <a href="#features" className="hover:text-neutral-900 transition-colors">Features</a>
            <a href="#preview" className="hover:text-neutral-900 transition-colors">Preview</a>
            <a href="#why" className="hover:text-neutral-900 transition-colors">Why ManorOps</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-neutral-600">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-neutral-900 text-white hover:bg-neutral-800">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-full px-3 py-1 text-xs text-neutral-600 font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Purpose-built for estate managers & family offices
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-neutral-900 leading-[1.1] tracking-tight mb-6">
            The operating system
            <br />
            <span className="text-neutral-400">for private estates.</span>
          </h1>
          <p className="text-lg text-neutral-500 leading-relaxed mb-10 max-w-2xl mx-auto">
            Stop juggling spreadsheets, emails, and sticky notes. ManorOps gives estate managers
            a single, secure hub for every property, vendor, task, and document.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login">
              <Button className="bg-neutral-900 text-white hover:bg-neutral-800 h-12 px-8 text-sm font-medium">
                Start Managing Your Estate
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#preview">
              <Button variant="outline" className="h-12 px-8 text-sm font-medium border-neutral-200 text-neutral-700 hover:bg-neutral-50">
                See it in action
              </Button>
            </a>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Private by default</span>
            <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> Secure data storage</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> No setup fees</span>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="preview" className="bg-neutral-950 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-white tracking-tight mb-3">Everything in one view</h2>
            <p className="text-neutral-400 text-sm max-w-md mx-auto">A clean, structured dashboard built around how estate managers actually work</p>
          </div>

          {/* Fake dashboard mockup */}
          <div className="rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl max-w-5xl mx-auto">
            <div className="flex" style={{ height: "420px" }}>
              {/* Sidebar */}
              <div className="w-48 bg-neutral-900 border-r border-neutral-800 flex flex-col shrink-0">
                <div className="px-4 py-4 border-b border-neutral-800 flex items-center gap-2">
                  <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5 text-neutral-900" />
                  </div>
                  <span className="text-white text-xs font-semibold">ManorOps</span>
                </div>
                <div className="px-3 py-3 border-b border-neutral-800">
                  <div className="bg-neutral-800 rounded-lg px-2.5 py-2 border border-neutral-700">
                    <div className="text-neutral-500 text-xs mb-0.5 uppercase tracking-wider" style={{ fontSize: "9px" }}>Estate</div>
                    <div className="text-white text-xs font-medium truncate">Hargrove Family</div>
                  </div>
                </div>
                <nav className="px-2 py-2 space-y-0.5 flex-1">
                  {[
                    { icon: BarChart3, label: "Overview", active: true },
                    { icon: MapPin, label: "Properties" },
                    { icon: Users, label: "Vendors" },
                    { icon: Wrench, label: "Maintenance" },
                    { icon: FileText, label: "Documents" },
                    { icon: Package, label: "Inventory" },
                    { icon: TrendingUp, label: "Financials" },
                  ].map((item) => (
                    <div key={item.label} className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg ${item.active ? "bg-white" : "text-neutral-400"}`}>
                      <item.icon className={`w-3 h-3 shrink-0 ${item.active ? "text-neutral-900" : ""}`} />
                      <span className={`text-xs ${item.active ? "text-neutral-900 font-medium" : ""}`}>{item.label}</span>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Main content */}
              <div className="flex-1 bg-neutral-50 overflow-hidden">
                {/* Topbar */}
                <div className="h-10 bg-white border-b border-neutral-200 flex items-center px-5 justify-between">
                  <div>
                    <div className="text-xs font-semibold text-neutral-900">Overview</div>
                    <div className="text-neutral-400" style={{ fontSize: "10px" }}>Estate at a glance</div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center text-white" style={{ fontSize: "9px", fontWeight: 600 }}>JH</div>
                </div>

                <div className="p-4 space-y-3 overflow-hidden">
                  {/* Stat cards */}
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { label: "Properties", value: "3", color: "bg-neutral-900 text-white" },
                      { label: "Open Tasks", value: "8", color: "bg-amber-50 text-amber-700" },
                      { label: "Vendors", value: "12", color: "bg-blue-50 text-blue-700" },
                      { label: "Documents", value: "24", color: "bg-violet-50 text-violet-700" },
                      { label: "Inventory", value: "67", color: "bg-emerald-50 text-emerald-700" },
                    ].map((card) => (
                      <div key={card.label} className="bg-white border border-neutral-200 rounded-lg p-2.5">
                        <div className={`w-5 h-5 rounded-md ${card.color} flex items-center justify-center mb-1.5`} style={{ fontSize: "8px", fontWeight: 700 }}>
                          {card.value}
                        </div>
                        <div className="text-neutral-900 font-bold text-sm">{card.value}</div>
                        <div className="text-neutral-400" style={{ fontSize: "9px" }}>{card.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Financial snapshot */}
                  <div className="bg-white border border-neutral-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-neutral-900">Financial Snapshot</span>
                      <span className="text-neutral-400" style={{ fontSize: "9px" }}>View financials →</span>
                    </div>
                    <div className="flex items-end gap-4">
                      <div>
                        <div className="text-lg font-bold text-neutral-900">$141,290</div>
                        <div className="text-neutral-400" style={{ fontSize: "9px" }}>2026 YTD spend</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1" style={{ fontSize: "9px" }}>
                          <span className="text-neutral-400">Budget utilization</span>
                          <span className="text-neutral-500">55% of $255,000</span>
                        </div>
                        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: "55%" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Maintenance + Docs */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white border border-neutral-200 rounded-lg p-2.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-neutral-900">Upcoming Maintenance</span>
                      </div>
                      <div className="space-y-1.5">
                        {[
                          { title: "HVAC seasonal inspection", prop: "Hamptons Estate", priority: "HIGH", days: "6d" },
                          { title: "Pool chemical check", prop: "Aspen Lodge", priority: "MEDIUM", days: "2d" },
                          { title: "Generator load test", prop: "Manhattan Apt", priority: "HIGH", days: "4d" },
                        ].map((t) => (
                          <div key={t.title} className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-neutral-900 truncate" style={{ fontSize: "9px", fontWeight: 500 }}>{t.title}</div>
                              <div className="text-neutral-400 truncate" style={{ fontSize: "8px" }}>{t.prop}</div>
                            </div>
                            <span className={`text-xs px-1 py-0.5 rounded font-medium shrink-0 ${t.priority === "HIGH" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`} style={{ fontSize: "8px" }}>{t.priority}</span>
                            <span className="text-neutral-400 shrink-0" style={{ fontSize: "8px" }}>{t.days}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-lg p-2.5">
                      <div className="text-xs font-semibold text-neutral-900 mb-2">Documents Expiring</div>
                      <div className="space-y-1.5">
                        {[
                          { title: "Homeowner's Insurance", days: "28d left", urgent: true },
                          { title: "Service Contract — HVAC", days: "59d left", urgent: false },
                          { title: "Property Tax Filing", days: "72d left", urgent: false },
                        ].map((d) => (
                          <div key={d.title} className="flex items-center justify-between gap-2">
                            <span className="text-neutral-700 truncate" style={{ fontSize: "9px" }}>{d.title}</span>
                            <span className={`shrink-0 font-medium ${d.urgent ? "text-amber-600" : "text-neutral-400"}`} style={{ fontSize: "8px" }}>{d.days}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-neutral-100 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
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
        <div className="max-w-xl mb-16">
          <h2 className="text-3xl font-semibold text-neutral-900 tracking-tight mb-4">
            Built around how estates actually operate
          </h2>
          <p className="text-neutral-500">
            Not a generic project management tool. Every feature was designed specifically
            for the workflows of estate managers and household staff.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: MapPin,
              title: "Multi-Property Portfolio",
              description: "Manage primary residences, vacation homes, and investment properties from one dashboard. Each property gets its own operating manual, vendor list, and task history.",
            },
            {
              icon: Wrench,
              title: "Maintenance Scheduling",
              description: "Schedule recurring tasks — seasonal HVAC, pool service, generator tests — with automatic next-occurrence creation when you mark a task complete.",
            },
            {
              icon: Users,
              title: "Vendor Management",
              description: "Every contractor and service provider in one place. Contact details, service history, and property assignments — find who you need in seconds.",
            },
            {
              icon: FileText,
              title: "Document Vault",
              description: "Upload and store insurance policies, warranties, deeds, and contracts. Expiration alerts mean you'll never let a policy lapse unnoticed.",
            },
            {
              icon: TrendingUp,
              title: "Financial Tracking",
              description: "Track spend against annual budgets per property. Log expenses by category, see YTD totals, and know exactly where the money is going.",
            },
            {
              icon: Package,
              title: "Household Inventory",
              description: "Catalog high-value assets room by room. Appliances, systems, art, and equipment — with purchase records and warranty expiration tracking.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group p-6 border border-neutral-100 rounded-xl hover:border-neutral-300 hover:shadow-sm transition-all bg-white"
            >
              <div className="w-10 h-10 bg-neutral-50 border border-neutral-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-neutral-900 group-hover:border-neutral-900 transition-all">
                <feature.icon className="w-5 h-5 text-neutral-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2 text-sm">{feature.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why ManorOps */}
      <section id="why" className="bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-semibold text-white tracking-tight mb-6">
                Your principals expect nothing less than perfect
              </h2>
              <p className="text-neutral-400 leading-relaxed mb-8">
                Estate managers are judged on flawless execution. A missed HVAC service,
                a lapsed insurance policy, a vendor contact that can't be found — these aren't
                small mistakes. ManorOps eliminates the operational gaps that create those moments.
              </p>
              <ul className="space-y-3">
                {[
                  "Every property, vendor, and task visible at a glance",
                  "Document expiry alerts before they become problems",
                  "Recurring maintenance handled automatically",
                  "Full financial picture across the entire portfolio",
                  "Operating manuals for every property — accessible anywhere",
                  "Private, secure, and built for discretion",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-neutral-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Trust signals */}
            <div className="space-y-4">
              {[
                {
                  icon: Lock,
                  title: "Private by design",
                  desc: "Your data is yours. No third-party sharing, no analytics on your household operations.",
                },
                {
                  icon: Shield,
                  title: "Secure infrastructure",
                  desc: "Hosted on enterprise-grade infrastructure with encrypted data at rest and in transit.",
                },
                {
                  icon: BarChart3,
                  title: "Full operational visibility",
                  desc: "From a single task to the full portfolio budget — everything is tracked and reportable.",
                },
              ].map((item) => (
                <div key={item.title} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex gap-4">
                  <div className="w-9 h-9 bg-neutral-800 rounded-lg flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-neutral-300" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white mb-1">{item.title}</div>
                    <div className="text-sm text-neutral-400 leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-semibold text-neutral-900 tracking-tight mb-4">
          Ready to run your estate like a professional operation?
        </h2>
        <p className="text-neutral-500 mb-8 max-w-md mx-auto">
          Set up in minutes. No training required. Built for estate managers who don't have time to waste.
        </p>
        <Link href="/login">
          <Button className="bg-neutral-900 text-white hover:bg-neutral-800 h-12 px-10 text-sm font-medium">
            Get Started Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
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
          <div>© {new Date().getFullYear()} ManorOps. Private estate operations platform.</div>
        </div>
      </footer>
    </div>
  );
}
