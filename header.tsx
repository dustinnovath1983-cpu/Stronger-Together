import { useContext } from "react";
import { Link, useLocation } from "wouter";
import { AuthContext } from "@/App";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const [location] = useLocation();

  if (!user) return null;

  const navItems = [
    { href: "/", label: "Learn", active: location === "/" },
    { href: "/modules", label: "Practice", active: location.startsWith("/modules") },
    { href: "/chat", label: "AI Coach", active: location.startsWith("/chat") },
    { href: "/assessment", label: "Assessment", active: location.startsWith("/assessment") },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-slate-200" data-testid="header-navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-primary cursor-pointer" data-testid="logo">
                  RelationshipWise
                </h1>
              </Link>
            </div>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span 
                    className={`px-3 py-2 text-sm font-medium cursor-pointer transition-colors ${
                      item.active 
                        ? "text-slate-900" 
                        : "text-muted hover:text-primary"
                    }`}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" data-testid="notifications-button">
              <Bell className="h-5 w-5 text-muted" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center" data-testid="user-avatar">
                <span className="text-white text-sm font-medium">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-slate-900" data-testid="user-name">
                {user.name}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                data-testid="logout-button"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
