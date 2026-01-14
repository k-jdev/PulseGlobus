import logo from "../../assets/images/navbar/logo.png";
import userIcon from "../../assets/svgs/navbar/user.svg";
import { Button } from "../ui";
import { Search } from "../Search";

function Navbar() {
  return (
    <nav className="absolute top-0 left-0 w-full z-20 bg-white px-8 py-3 flex justify-between items-center">
      <div className="flex justify-between items-center">
        <img src={logo} alt="Logo" className="h-8 w-auto" />
        <div className="ml-6">
          <Search />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary">$PULSE</Button>
        <Button
          variant="primary"
          className="py-4 flex justify-between items-center gap-5"
        >
          <span>$0x2F3...ssd</span>
          <img src={userIcon} alt="User Icon" />
        </Button>
      </div>
    </nav>
  );
}

export default Navbar;
