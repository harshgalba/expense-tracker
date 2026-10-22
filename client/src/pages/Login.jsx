export default function Login() {
  return (
    <main className="min-w-0 flex-1 px-6 py-10 md:px-12">
      <h1 className="text-2xl font-semibold">Log in</h1>

      <form className="mt-6 max-w-sm space-y-4">
        <label className="block">
          <span className="text-sm text-neutral-400">Email</span>
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm text-neutral-400">Password</span>
          <input
            type="password"
            name="password"
            required
            className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2"
          />
        </label>

        <button
          type="submit"
          className="rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-400"
        >
          Log in
        </button>
      </form>
    </main>
  )
}