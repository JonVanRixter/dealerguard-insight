export function AppFooter() {
  return (
    <footer className="shrink-0 border-t border-border bg-card px-6 py-3 flex items-center justify-between text-xs text-muted-foreground">
      <span>© {new Date().getFullYear()} The Compliance Guys. All rights reserved.</span>
      <span>Powered by <span className="font-semibold text-primary">The Compliance Guys</span></span>
    </footer>
  );
}
