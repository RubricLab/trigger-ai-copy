import Input from "./components/input";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Input
        label="Your landing page:"
        type="url"
        required
        placeholder="trigger.dev"
        clearable
      />
    </main>
  );
}
