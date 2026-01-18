import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/images/navbar/logo.png";
import { Button } from "../ui";
import { Search } from "../Search";
import { Theme } from "../GlobusMapbox/constants/mapConfig";
import { TimeFilter } from "../../App";
import { ConnectWallet } from "../ConnectWallet";

// Icons
import sunIcon from "../../assets/svgs/mainNavigation/sun.svg";
import moonIcon from "../../assets/svgs/mainNavigation/moon.svg";
import moonBlueIcon from "../../assets/svgs/mainNavigation/moon-blue.svg";

interface NavbarProps {
  theme?: Theme;
  onThemeChange?: ((theme: Theme) => void) | null;
  timeFilter?: TimeFilter;
  onTimeFilterChange?: (filter: TimeFilter) => void;
  onMobileMenuChange?: (isOpen: boolean) => void;
  onSearchFocus?: () => void;
}

function Navbar({
  theme = "light",
  onThemeChange,
  timeFilter = "24h",
  onTimeFilterChange,
  onMobileMenuChange,
  onSearchFocus,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleMobileMenuToggle = (isOpen: boolean) => {
    setIsMobileMenuOpen(isOpen);
    onMobileMenuChange?.(isOpen);

    if (isOpen) {
      setIsMobileSearchOpen(false);
    }
  };

  const timeFilters: TimeFilter[] = ["1h", "6h", "24h"];

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex absolute top-0 left-0 w-full z-20 bg-white px-8 py-3 justify-between items-center">
        <div className="flex justify-between items-center">
          <img src={logo} alt="Logo" className="h-8 w-auto" />
          <div className="ml-6">
            <Search onFocus={onSearchFocus} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary">$PULSE</Button>
          <ConnectWallet />
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="flex md:hidden absolute top-0 left-0 w-full z-20 bg-white border-b border-[#ebebec] px-4 py-3 items-center gap-4 h-[72px]">
        {/* Search Input */}
        <div className="flex-1">
          <Search
            isMobile={true}
            onFocus={() => setIsMobileSearchOpen(true)}
            onClose={() => setIsMobileSearchOpen(false)}
          />
        </div>

        {/* Menu Button - hide when search is open */}
        {!isMobileSearchOpen && (
          <button
            onClick={() => handleMobileMenuToggle(!isMobileMenuOpen)}
            className="flex items-center gap-3 flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M3 12H21M3 6H21M3 18H21"
                stroke="#1B2430"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[16px] font-semibold text-black tracking-[-0.32px] uppercase">
              Menu
            </span>
          </button>
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed inset-0 z-30 bg-[#f5fcff] flex flex-col"
          >
            {/* Header - same structure as Mobile Navbar */}
            <motion.nav
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex bg-white border-b border-[#ebebec] px-4 pt-[18px] pb-3 items-center gap-4 h-[72px]"
            >
              {/* Logo in place of Search */}
              <div className="flex-1">
                <img src={logo} alt="Logo" className="h-8 w-auto" />
              </div>

              <button
                onClick={() => handleMobileMenuToggle(false)}
                className="flex items-center gap-3 flex-shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="#1B2430"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[16px] font-semibold text-black tracking-[-0.32px] uppercase">
                  Close
                </span>
              </button>
            </motion.nav>

            {/* Menu Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="flex-1 flex flex-col justify-between p-5 overflow-y-auto"
            >
              <div className="flex flex-col gap-5">
                {/* Theme Section */}
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.2,
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                  className="border-l border-t border-black/25 pl-5 pt-5"
                >
                  <p className="text-[16px] font-medium text-black/55 tracking-[-0.64px] mb-5">
                    0.001
                  </p>
                  <div className="flex items-center justify-between">
                    <h2 className="text-[48px] font-bold text-black tracking-[-0.96px] uppercase leading-none">
                      Theme
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onThemeChange?.("light")}
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          theme === "light"
                            ? "bg-[#1452f0] border border-black/10"
                            : "bg-black/5"
                        }`}
                      >
                        <img
                          src={sunIcon}
                          alt="Light"
                          className={`w-6 h-6 ${
                            theme === "light" ? "brightness-0 invert" : ""
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => onThemeChange?.("dark")}
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          theme === "dark"
                            ? "bg-[#1452f0] border border-black/10"
                            : "bg-black/5"
                        }`}
                      >
                        <img
                          src={theme === "dark" ? moonBlueIcon : moonIcon}
                          alt="Dark"
                          className={`w-6 h-6 ${
                            theme === "dark" ? "brightness-0 invert" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Markets Section */}
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.3,
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                  className="border-l border-t border-black/25 pl-5 pt-5"
                >
                  <p className="text-[16px] font-medium text-black/55 tracking-[-0.64px] mb-5">
                    0.002
                  </p>
                  <h2 className="text-[48px] font-bold text-black tracking-[-0.96px] uppercase leading-none mb-5">
                    Markets
                  </h2>
                  <div className="flex gap-2">
                    {timeFilters.map((filter) => (
                      <button
                        key={filter}
                        onClick={() => onTimeFilterChange?.(filter)}
                        className={`h-12 px-6 rounded-full text-[15px] font-medium tracking-[-0.3px] ${
                          timeFilter === filter
                            ? "bg-[#1452f0] text-white border border-black/10"
                            : "bg-black/5 text-black"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Docs Section */}
                <motion.a
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.4,
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                  href="https://docs.pulseterminal.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-l border-t border-black/25 pl-5 pt-5 block"
                >
                  <p className="text-[16px] font-medium text-black/55 tracking-[-0.64px] mb-5">
                    0.003
                  </p>
                  <h2 className="text-[48px] font-bold text-black tracking-[-0.96px] uppercase leading-none">
                    Docs
                  </h2>
                </motion.a>

                {/* $PULSE Section */}
                <motion.a
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.5,
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                  href="https://pulseterminal.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-l border-t border-black/25 pl-5 pt-5 block"
                >
                  <p className="text-[16px] font-medium text-black/55 tracking-[-0.64px] mb-5">
                    0.004
                  </p>
                  <h2 className="text-[48px] font-bold text-black tracking-[-0.96px] uppercase leading-none">
                    $PULSE
                  </h2>
                </motion.a>

                {/* Wallet Section */}
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.6,
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                  className="border-l border-t border-black/25 pl-5 pt-5"
                >
                  <p className="text-[16px] font-medium text-black/55 tracking-[-0.64px] mb-5">
                    0.005
                  </p>
                  <h2 className="text-[48px] font-bold text-black tracking-[-0.96px] uppercase leading-none mb-5">
                    Wallet
                  </h2>
                  <ConnectWallet
                    isMobile={true}
                    className="bg-black/5 text-black hover:bg-black/10"
                  />
                </motion.div>
              </div>

              {/* Social Links */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 0.7,
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
                className="flex gap-1 mt-4"
              >
                <button className="w-14 h-14 bg-black/5 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M11.9814 2.50012C14.6944 2.49479 15.0287 2.50734 16.082 2.55286C16.9718 2.59131 17.5979 2.71734 18.1289 2.89856L18.3516 2.97961C18.9496 3.20993 19.4484 3.51429 19.9521 4.01672C20.456 4.51943 20.7626 5.01608 20.9961 5.6134V5.61438C21.223 6.19295 21.3833 6.86286 21.4316 7.88196C21.4817 8.93666 21.4938 9.26848 21.499 11.9806C21.5042 14.693 21.4934 15.0254 21.4473 16.0812C21.4032 17.0974 21.2448 17.7708 21.0205 18.3497L21.0195 18.3507C20.7887 18.9489 20.4843 19.447 19.9824 19.9513C19.4809 20.4552 18.9835 20.7614 18.3857 20.9952C17.8064 21.2216 17.138 21.3825 16.1191 21.4308C15.0641 21.4808 14.7309 21.493 12.0186 21.4982C9.30644 21.5034 8.97269 21.4926 7.91992 21.4464C6.90296 21.4019 6.22961 21.2435 5.65039 21.0197C5.05065 20.7882 4.55289 20.4838 4.04883 19.9816C3.54472 19.4793 3.23804 18.9821 3.00488 18.3849V18.3839L2.92285 18.1622C2.73952 17.6326 2.61186 17.0071 2.56934 16.1173C2.51832 15.0622 2.50614 14.7306 2.50098 12.0177C2.49573 9.3044 2.50625 8.97089 2.55273 7.91809C2.59766 6.90043 2.75537 6.22707 2.97949 5.64758C3.18166 5.12414 3.4407 4.67773 3.83887 4.23645L4.01758 4.04797C4.51978 3.54396 5.01736 3.23672 5.61426 3.00403H5.61523C6.19316 2.77705 6.86511 2.61643 7.88184 2.56848H7.88281C8.93744 2.51706 9.26817 2.50528 11.9814 2.50012ZM11.9893 6.36438C8.87729 6.37051 6.35948 8.89825 6.36523 12.0099C6.37136 15.122 8.89931 17.6398 12.0107 17.6339C15.1221 17.6279 17.6405 15.1005 17.6348 11.9884C17.6288 8.87625 15.1012 6.35832 11.9893 6.36438ZM10.9102 9.38391C11.4273 9.16849 11.9972 9.11075 12.5469 9.21887C13.0967 9.32711 13.603 9.59588 14 9.99133C14.3969 10.3867 14.6669 10.8913 14.7773 11.4406C14.8739 11.9211 14.8443 12.4174 14.6924 12.881L14.6201 13.0782C14.4333 13.5317 14.1321 13.9275 13.748 14.2286L13.5791 14.3517C13.1138 14.6639 12.5662 14.831 12.0059 14.8322C11.6338 14.8329 11.2649 14.7609 10.9209 14.6193L10.6689 14.5001C10.4235 14.3695 10.1977 14.2039 10 14.007L9.81348 13.8009C9.63654 13.5862 9.49212 13.3458 9.38477 13.088L9.29004 12.8263C9.20894 12.5606 9.16755 12.2838 9.16699 12.005L9.17383 11.795C9.20391 11.378 9.32608 10.9728 9.53125 10.6085L9.64062 10.4298C9.91234 10.0214 10.2851 9.69123 10.7207 9.47083L10.9102 9.38391ZM17.3242 4.95227C16.8735 4.95321 16.4412 5.13301 16.123 5.45227C15.8049 5.77159 15.6272 6.20465 15.6279 6.6554C15.6285 6.99163 15.7287 7.32049 15.916 7.59973C16.1032 7.87873 16.369 8.09567 16.6797 8.22375C16.9905 8.35186 17.3325 8.38561 17.6621 8.31946C17.9918 8.25326 18.2949 8.09087 18.5322 7.85266C18.7696 7.61444 18.9302 7.31051 18.9951 6.98059C19.06 6.65079 19.0257 6.30944 18.8965 5.99915C18.7673 5.68889 18.5493 5.42366 18.2695 5.23743C17.9896 5.05122 17.6604 4.95161 17.3242 4.95227Z"
                      fill="black"
                      stroke="black"
                    />
                  </svg>
                </button>
                <button className="w-14 h-14 bg-black/5 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M17.1387 5.57043L16.7559 5.47766C16.4213 5.39694 16.0815 5.33821 15.7393 5.30286H15.7383C15.3027 5.25115 14.8237 5.21399 14.4648 5.21399C12.7238 5.21399 11.347 5.62667 10.4131 6.58411C9.48174 7.53889 9.08307 8.94161 9.08301 10.714V11.5363H7.02148V15.6027H9.08301V21.1124C5.26393 19.8769 2.49916 16.2823 2.49902 12.0363C2.49902 6.76784 6.7544 2.49915 11.999 2.49915C17.2437 2.49915 21.499 6.76784 21.499 12.0363C21.4989 16.7172 18.1391 20.606 13.7109 21.4152V15.6027H16.333L16.4072 15.1925L16.6465 13.8849L16.9688 12.1261L17.0762 11.5363H13.7109V10.9513C13.7109 10.3577 13.8029 9.98372 13.9482 9.74622C14.0366 9.60279 14.1638 9.4876 14.3135 9.41223L14.3164 9.41028C14.5004 9.31572 14.7541 9.24842 15.1025 9.22083L15.4844 9.20715C15.6834 9.20687 15.883 9.20881 16.082 9.21399L16.0859 9.21497C16.255 9.21787 16.4245 9.22655 16.5928 9.24231L17.1387 9.29407V5.57043Z"
                      fill="black"
                      stroke="black"
                    />
                  </svg>
                </button>
                <a
                  href="https://t.me/pulseterminalio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 bg-black/5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M19.9932 4.5946H19.9941C20.0294 4.59388 20.1094 4.59855 20.1963 4.62C20.2802 4.64073 20.3381 4.67001 20.3711 4.69519C20.4207 4.74224 20.4547 4.80758 20.4629 4.88171L20.4668 4.90906C20.4817 4.99787 20.5001 5.18355 20.5 5.3573L20.4932 5.52332C20.2192 8.48601 19.0232 15.7137 18.4121 19.0604C18.1616 20.4367 17.7277 20.5757 17.5996 20.5878H17.5977C17.2155 20.6244 16.8561 20.5015 16.4336 20.2469C16.2212 20.1189 16.0046 19.9652 15.7666 19.7919C15.5335 19.6221 15.2779 19.4316 15.0088 19.2509C14.2025 18.7082 13.5711 18.2686 12.9434 17.83C12.3154 17.3912 11.6895 16.9533 10.8994 16.4188V16.4178C10.4721 16.1293 10.2863 15.9153 10.2139 15.7733C10.1589 15.6654 10.1607 15.5867 10.207 15.4784C10.2673 15.3377 10.399 15.1672 10.6221 14.9344C10.7301 14.8217 10.8483 14.7057 10.9785 14.577C11.1065 14.4505 11.2436 14.3137 11.3799 14.1688V14.1678C11.5053 14.0341 12.7259 12.8875 13.9688 11.6835C14.5811 11.0902 15.1919 10.4899 15.6562 10.0116C15.8877 9.77319 16.0873 9.55968 16.2344 9.3905C16.3074 9.30654 16.3732 9.22657 16.4248 9.15613C16.4504 9.1212 16.4774 9.0824 16.501 9.04187C16.5199 9.00927 16.5581 8.94084 16.5781 8.85437L16.5801 8.84558C16.5979 8.76196 16.6047 8.64303 16.5869 8.52039C16.5717 8.41532 16.5292 8.24675 16.4014 8.09949L16.3408 8.03796L16.2744 7.98425C16.1163 7.87078 15.9454 7.84378 15.8213 7.84265C15.6873 7.84148 15.5653 7.86978 15.5098 7.88269C15.4219 7.9031 15.3414 7.9491 15.3252 7.95789C15.2857 7.97933 15.2394 8.00704 15.1885 8.03796C15.0855 8.10051 14.9459 8.18858 14.7725 8.30164C14.4246 8.5284 13.9262 8.86231 13.2783 9.30164C11.9818 10.1808 10.0792 11.4888 7.57129 13.2245L7.56738 13.2274C6.87622 13.7147 6.3176 13.9031 5.87109 13.8915H5.86719C5.60176 13.8864 5.17017 13.8054 4.65723 13.6737C4.40693 13.6095 4.14688 13.5357 3.8916 13.4589L3.15332 13.2245C2.53686 13.0185 2.08157 12.8903 1.75977 12.7303C1.60568 12.6537 1.5381 12.5947 1.51172 12.5614C1.50035 12.5471 1.49764 12.5449 1.50098 12.5175C1.49724 12.5471 1.49259 12.4827 1.68164 12.3387C1.86006 12.2029 2.14686 12.0463 2.56445 11.8759L2.57227 11.8729L2.5791 11.869C7.94783 9.46985 11.5227 7.89027 13.3105 7.12878H13.3115C15.8698 6.03725 17.4031 5.40135 18.3818 5.03699C19.3694 4.66935 19.7392 4.59925 19.9932 4.5946Z"
                      fill="black"
                      stroke="black"
                    />
                  </svg>
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
