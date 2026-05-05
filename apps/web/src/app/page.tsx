import { Navbar } from '@/components/layout/Navbar';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[80vh] flex-col items-center justify-center bg-navy-900 text-white">
        <h1 className="font-display text-5xl font-bold text-terracotta-400">PlantaViva</h1>
        <p className="mt-4 text-xl text-navy-100">
          Visualizações arquitetónicas com IA — em breve
        </p>
        <a
          href="/dashboard"
          className="mt-8 rounded bg-terracotta-500 px-8 py-3 text-lg font-semibold text-white hover:bg-terracotta-400 transition"
        >
          Aceder ao painel
        </a>
      </main>
    </>
  );
}
