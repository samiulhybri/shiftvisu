export interface Sidebar {
  name: string,
  path?: string,
  icon: string,
  selected?:boolean
  child: SidebarChild[]
}
interface SidebarChild {
  name: string,
  path: string,
  icon: string,
}