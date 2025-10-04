import { UserSectionClient } from "./UserSectionClient";
import { NavLinksClient } from "./NavLinksClient";
import { NavbarLogo } from "../ui/resizable-navbar";

export default async function MainNavbar() {
  return (
    <nav className="fixed z-20 w-full flex items-center justify-between py-2 px-8">
      <NavbarLogo />
      <NavLinksClient />
      <UserSectionClient />
    </nav>
  );
}
