import { NavLinksClient } from "./NavLinksClient";
import { UserSectionClient } from "./UserSectionClient";
import { NavbarLogo } from "../ui/resizable-navbar";

export default async function MainNavbar() {
  return (
    <nav className="fixed z-20 flex w-full items-center justify-between px-8 py-2">
      <NavbarLogo />
      <NavLinksClient />
      <UserSectionClient />
    </nav>
  );
}
