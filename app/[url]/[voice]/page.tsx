import { Voice } from "@/app/types";
import Dashboard from "@/app/components/Dashboard";
import { Footer } from "@/app/components/Footer";
import { Gradients } from "@/app/components/Gradients";
import Header from "@/app/components/Header";

type Props = {
  params: {
    url: string;
    voice: Voice;
  };
};

export default function Home({ params: { url, voice } }: Props) {
  return (
    <main className="flex min-h-screen pb-16 flex-col items-center justify-between relative">
      <Header />
      <Dashboard url={url} voice={voice} />
      <Gradients />
      <Footer />
    </main>
  );
}
