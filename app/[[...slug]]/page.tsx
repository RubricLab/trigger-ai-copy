import { Voice } from "@/app/types";
import Dashboard from "@/app/components/Dashboard";
import { Footer } from "@/app/components/Footer";
import { Gradients } from "@/app/components/Gradients";
import Header from "@/app/components/Header";

type Props = {
  params: {
    slug?: string[];
  };
};

export default function Home({ params: { slug } }: Props) {
  const [url, voice] = slug || [];

  return (
    <main className="flex min-h-screen pb-16 flex-col items-center justify-between relative">
      <Header />
      <Dashboard url={url} voice={voice as Voice} />
      <Gradients />
      <Footer />
    </main>
  );
}
