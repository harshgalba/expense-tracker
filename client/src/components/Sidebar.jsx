import NavLinks from './NavLinks'

// Desktop sidebar: hidden on phones, shown from md (768px) up
function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-neutral-800 px-6 py-8 md:block">
      <NavLinks />
    </aside>
  )
}

export default Sidebar
