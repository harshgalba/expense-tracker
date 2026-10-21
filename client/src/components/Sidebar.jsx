const navGroups = [
  {
    title: 'Overview',
    links: ['Dashboard'],
  },
  {
    title: 'Money',
    links: ['Expenses', 'Categories', 'Recurring'],
  },
]
function Sidebar() {
    return (
        <aside className="hidden w-64 shrink-0 border-r border-neutral-800 px-6 py-8 md:block">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="block rounded-md px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>
    )
}
export default Sidebar