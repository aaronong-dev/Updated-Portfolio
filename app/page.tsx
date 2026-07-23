import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HashScroll from "@/components/HashScroll";
import Profile from "@/components/Profile";
import Projects from "@/components/Projects";

export default function Home() {
  return (
    <main>
      <HashScroll />
      <Hero />
      <Profile />
      <Projects />
      <Contact />
      <Footer />
    </main>
  );
}
