import React, { useState, useEffect, useRef } from "react";
import { navbarStyles } from "../assets/dummyStyles";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useClerk, UserButton } from "@clerk/react";
import logo from "../assets/logo.png";

import {
  UsersRound,
  LogIn,
  Menu,
  X,
} from "lucide-react";

const STORAGE_KEY = "doctorToken_v1";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [isDoctorLoggedIn, setIsDoctorLoggedIn] = useState(() => {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEY));
    } catch {
      return false;
    }
  });

  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);

  const clerk = useClerk();
  const isSignedIn = !!clerk.user;

  // Hide navbar on scroll down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Sync doctor login state
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setIsDoctorLoggedIn(Boolean(e.newValue));
      }
    };

    window.addEventListener("storage", onStorage);

    return () =>
      window.removeEventListener("storage", onStorage);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        navRef.current &&
        !navRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, [isOpen]);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Doctors", href: "/doctors" },
    { label: "Services", href: "/services" },
    { label: "Appointments", href: "/appointments" },
    { label: "Contact", href: "/contact" },
    { label: "AI Tools", href: "/tools" },
  ];

  return (
    <>
      <div className={navbarStyles.navbarBorder}></div>

      <nav
        ref={navRef}
        className={`${navbarStyles.navbarContainer} ${
          showNavbar
            ? "translate-y-0"
            : "-translate-y-full"
        } transition-transform duration-300`}
      >
        <div className={navbarStyles.contentWrapper}>
          <div className={navbarStyles.flexContainer}>
            {/* Logo */}
            <Link
              to="/"
              className={navbarStyles.logoLink}
            >
              <div className={navbarStyles.logoContainer}>
                <div className={navbarStyles.logoImageWrapper}>
                  <img
                    src={logo}
                    alt="MedConnect Logo"
                    className={navbarStyles.logoImage}
                  />
                </div>
              </div>

              <div
                className={
                  navbarStyles.logoTextContainer
                }
              >
                <h1 className={navbarStyles.logoTitle}>
                  Medixthon
                </h1>

                <p
                  className={
                    navbarStyles.logoSubtitle
                  }
                >
                  Healthcare Solutions
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className={navbarStyles.desktopNav}>
              <div
                className={
                  navbarStyles.navItemsContainer
                }
              >
                {navItems.map((item) => {
                  const isActive =
                    location.pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`${navbarStyles.navItem} ${
                        isActive
                          ? navbarStyles.navItemActive
                          : navbarStyles.navItemInactive
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Side */}
            <div
              className={navbarStyles.rightContainer}
            >
              <Link
                to="/doctor-admin/login"
                className={
                  navbarStyles.doctorAdminButton
                }
              >
                <UsersRound
                  className={
                    navbarStyles.doctorAdminIcon
                  }
                />

                <span
                  className={
                    navbarStyles.doctorAdminText
                  }
                >
                  Doctor Admin
                </span>
              </Link>

              {!isSignedIn ? (
                <button
                  onClick={() =>
                    clerk.openSignIn()
                  }
                  className={
                    navbarStyles.loginButton
                  }
                >
                  <LogIn
                    className={
                      navbarStyles.loginIcon
                    }
                  />
                  <span>Login</span>
                </button>
              ) : (
                <UserButton afterSignOutUrl="/" />
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() =>
                setIsOpen(!isOpen)
              }
              className={
                navbarStyles.mobileToggle
              }
            >
              {isOpen ? (
                <X
                  className={
                    navbarStyles.toggleIcon
                  }
                />
              ) : (
                <Menu
                  className={
                    navbarStyles.toggleIcon
                  }
                />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div
            className={
              navbarStyles.mobileMenu
            }
          >
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.href;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() =>
                    setIsOpen(false)
                  }
                  className={`${navbarStyles.mobileMenuItem} ${
                    isActive
                      ? navbarStyles.mobileMenuItemActive
                      : ""
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              to="/doctor-admin/login"
              onClick={() =>
                setIsOpen(false)
              }
              className={
                navbarStyles.mobileDoctorAdminButton
              }
            >
              Doctor Admin
            </Link>

            {isSignedIn ? (
              <div
                className={
                  navbarStyles.mobileUserContainer
                }
              >
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <div
                className={
                  navbarStyles.mobileLoginContainer
                }
              >
                <button
                  onClick={() => {
                    setIsOpen(false);
                    clerk.openSignIn();
                  }}
                  className={
                    navbarStyles.mobileLoginButton
                  }
                >
                  <LogIn
                    className={
                      navbarStyles.loginIcon
                    }
                  />
                  <span>Login</span>
                </button>
              </div>
            )}
          </div>
        )}

        {navbarStyles.animationStyles && (
          <style>
            {navbarStyles.animationStyles}
          </style>
        )}
      </nav>
    </>
  );
};

export default Navbar;