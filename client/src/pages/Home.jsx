export default function Home() {
  return (
    <main className="min-w-0 flex-1 px-6 py-10 md:px-12">
       <h1 className="text-4xl font-bold tracking-tight">Welcome</h1>
          <p className="mt-4 max-w-2xl leading-7 text-neutral-400">
            Log your expenses, mark the ones that repeat every month, and see
            where your money actually goes.
          </p>
          <h2 className="mt-10 border-b border-neutral-800 pb-2 text-2xl font-semibold">
            Getting started
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-neutral-800 p-5">
              <h3 className="font-semibold">Add an expense</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Amount, category, date — that's it.
              </p>
            </div>
            <div className="rounded-lg border border-neutral-800 p-5">
              <h3 className="font-semibold">Check your summary</h3>
              <p className="mt-1 text-sm text-neutral-400">
                See your spending by category for any month.
              </p>
            </div>
          </div>
    
    </main>
  )
}