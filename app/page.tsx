import Dashboard from "./components/Dashboard";
import { Footer } from "./components/Footer";
import { Gradients } from "./components/Gradients";
import Header from "./components/Header";

type Props = {
  searchParams: {
    url?: string;
    voice?: string;
  };
};

export default function Home({ searchParams }: Props) {
  return (
    <main className="flex min-h-screen pb-16 flex-col items-center justify-between relative">
      <Header />
      <Dashboard url={searchParams?.url} voice={searchParams?.voice} />
      <Gradients />
      <Footer />
    </main>
  );
}
