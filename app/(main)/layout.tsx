import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";

// English site chrome (Nav/Footer) lives in this route-group layout, not the
// root layout, specifically so /ar can render its own RTL nav/footer without
// the English ones also appearing above/below it.
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
      <Footer />
    </>
  );
}
