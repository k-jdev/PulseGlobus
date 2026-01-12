import logo from "../../assets/images/navbar/logo.png";
import userIcon from "../../assets/svgs/navbar/user.svg";
import searchIcon from "../../assets/svgs/navbar/search.svg";
import { Button } from "../ui";

function Navbar() {
  return (
    <nav className="absolute top-0 left-0 w-full z-20 bg-white px-8 py-3 flex justify-between items-center">
      <div className="flex justify-between items-center">
        <img src={logo} alt="Logo" className="h-8 w-auto" />
        <div className="flex items-center gap-6 ml-6 bg-[#f5f7f9] border border-[#ebebec] rounded-full px-6 py-3">
          <img
            src={searchIcon}
            alt="Search"
            className="h-6 w-6"
            style={{
              filter:
                "invert(31%) sepia(96%) saturate(2448%) hue-rotate(213deg) brightness(97%) contrast(93%)",
            }}
          />
          <input
            className="bg-transparent outline-none text-[16px] font-medium text-black placeholder:text-black placeholder:opacity-50 tracking-[-0.64px] leading-[1.2] w-[700px]"
            type="text"
            placeholder="Search markets, events, or topics..."
          />
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
