import Dashboard from "./components/dashboard";
import Header from "./components/header";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Header />
      <Dashboard />
    </main>
  );
}
