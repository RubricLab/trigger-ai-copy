import Dashboard from "./components/Dashboard";
import { Footer } from "./components/Footer";
import { Gradients } from "./components/Gradients";
import Header from "./components/Header";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between relative">
      <Header />
      <Dashboard />
      <Gradients />
      <Footer />
    </main>
  );
}
