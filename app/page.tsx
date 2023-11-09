import { Voice } from "@/app/types";
import Dashboard from "./components/Dashboard";
import { Footer } from "./components/Footer";
import { Gradients } from "./components/Gradients";
import Header from "./components/Header";

type Props = {
  searchParams: {
    url?: string;
    voice?: Voice;
  };
};

export default function Home({ searchParams: { url, voice } }: Props) {
  return (
    <main className="flex min-h-screen pb-16 flex-col items-center justify-between relative">
      <Header />
      <Dashboard url={url} voice={voice} />
      <Gradients />
      <Footer />
    </main>
  );
}
