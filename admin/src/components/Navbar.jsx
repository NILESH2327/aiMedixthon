import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useRef ,useCallback ,useLayoutEffect ,useEffect} from "react";

import { navbarStyles as ns } from "../assets/dummyStyles";
import logopng from "../assets/logo.png";

import {
  Calendar,
  Calendar1,
  Grid,
  HomeIcon,
  Home,
  List,
  PlusSquare,
  UserPlus,
  Users,
  Menu,
  X
} from "lucide-react";
// import {useClerk ,useAuth ,UserButton } from "@clerk/clerk-react"
import { useClerk, useAuth, useUser, UserButton } from "@clerk/react";

const Navbar = () => {
  // Mobile menu open/close state
  const [open, setOpen] = useState(false);

  // Reference to navigation container
  const navInnerRef = useRef(null);

  // Optional indicator reference
  const indicatorRef = useRef(null);

  // Current route information
  const location = useLocation();

  // Programmatic navigation
  const navigate = useNavigate();

  // clerk
  const clerk = useClerk?.();
  const {getToken ,isLoaded:authLoaded} = useAuth();
  const {isSignedIn ,user,isLoaded:userLoaded}= useUser();

  // sliding active indicator

    const moveIndicator = useCallback(() => {
    const container = navInnerRef.current;
    const ind = indicatorRef.current;
    if (!container || !ind) return;

    const active = container.querySelector(".nav-item.active");
    if (!active) {
      ind.style.opacity = "0";
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();

    const left = activeRect.left - containerRect.left + container.scrollLeft;
    const width = activeRect.width;

    ind.style.transform = `translateX(${left}px)`;
    ind.style.width = `${width}px`;
    ind.style.opacity = "1";
  }, []);

  useLayoutEffect(() => {
    moveIndicator();
    const t = setTimeout(() => {
      moveIndicator();
    }, 120);
    return () => clearTimeout(t);
  }, [location.pathname, moveIndicator]);

  useEffect(() => {
    const container = navInnerRef.current;
    if (!container) return;

    const onScroll = () => {
      moveIndicator();
    };
    container.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      moveIndicator();
    });
    ro.observe(container);
    if (container.parentElement) ro.observe(container.parentElement);

    window.addEventListener("resize", moveIndicator);

    moveIndicator();

    return () => {
      container.removeEventListener("scroll", onScroll);
      ro.disconnect();
      window.removeEventListener("resize", moveIndicator);
    };
  }, [moveIndicator]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

// when user Signe in fetch a token 
   useEffect(()=>{
      let mounted = true;
      const storeToken = async()=>{
        if(!authLoaded || !userLoaded){
          return ;
        }
        if(!isSignedIn){
          try{

            localStorage.removeItem("clerk_token")
          }catch (e){
             // ignore err


          }

          return ;
        }
        try{
          if(getToken){
            const token = await getToken();
            if(!mounted)return;
            if(token){
                try{
                  localStorage.setItem("clerk_token" ,token);
                }catch(e){
                   console.warn("failed to write clerk token in localstorage ",e);
                }
            }
          }

        }catch(err){
          console.warn("cloud not retieve clerk token" ,err);


        }
      }
      storeToken();
      return ()=>{
        mounted = false;
      }
   },[isSignedIn ,authLoaded ,userLoaded ,getToken]);


   // to open clerk login box 
   const handleOpenSignIn =()=>{
         if(!clerk || !clerk.openSignIn){
          console.warn("clerk is not available");
          return;
         }

         clerk.openSignIn();
         navigate("/h");
   };

  const handleSignOut = async () => {
    if (!clerk || !clerk.signOut) {
      console.warn("clerk is not available");
      return;
    }
    try {

      await clerk.signOut();

    }catch(e){
      console.error("sign out failed" ,err);
    
    }finally{
      try{
          localStorage.removeItem("clerk_token");
      }catch(e){
        //ig
      }

      navigate("/");
      
       

    }

    
   }

  return (
    <header className={ns.header}>
      <nav className={ns.navContainer}>
        <div className={ns.flexContainer}>
          
          {/* ================= LOGO SECTION ================= */}
          <div className={ns.logoContainer}>
            
            {/* Logo Image */}
            <img
              src={logopng}
              alt="logo"
              className={ns.logoImage}
            />

            {/* Logo Text */}
            <Link to="/">
              <div className={ns.logoLink}>Medixthon</div>
              <div className={ns.logoSubtext}>
                Healthcare Solution
              </div>
            </Link>
          </div>

          {/* ================= CENTER NAVIGATION ================= */}
          <div className={ns.centerNavContainer}>
            <div className={ns.glowEffect}>
              <div className={ns.centerNavInner}>

                <div
                  ref={navInnerRef}
                  tabIndex={0}
                  className={ns.centerNavScrollContainer}
                  style={{
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  <CenterNavItem
                    to="/h"
                    label="Dashboard"
                    icon={<HomeIcon size={16} />}
                  />

                  <CenterNavItem
                    to="/add"
                    label="Add Doctor"
                    icon={<UserPlus size={16} />}
                  />

                  <CenterNavItem
                    to="/list"
                    label="List Doctors"
                    icon={<Users size={16} />}
                  />

                  <CenterNavItem
                    to="/appointments"
                    label="Appointments"
                    icon={<Calendar size={16} />}
                  />

                  <CenterNavItem
                    to="/service-dashboard"
                    label="Service Dashboard"
                    icon={<Grid size={16} />}
                  />

                  <CenterNavItem
                    to="/add-service"
                    label="Add Service"
                    icon={<PlusSquare size={16} />}
                  />

                  <CenterNavItem
                    to="/list-service"
                    label="List Services"
                    icon={<List size={16} />}
                  />

                  <CenterNavItem
                    to="/service-appointments"
                    label="Service Appointments"
                    icon={<Calendar1 size={16} />}
                  />
                </div>



              </div>
            </div>
          </div>

          {/* right side */}
          <div className={ns.rightContainer}>
            {isSignedIn ? (
              <button onClick={handleSignOut} className={ns.signOutButton + " " + ns.cursorPointer} >
                     Sign Out
              </button>
            ) :(
              <div className="hidden lg:flex  items-center gap-2">
                 <button onClick={handleOpenSignIn}
                 className={ns.loginButton + " "+ ns.cursorPointer}>
                  Login
                  </button>

              </div>

            )
          }

          {/* mobile toggle */}
          <button onClick={()=>setOpen((v)=>!v)} className={ns.mobileMenuButton}>
           
            
          
            {open ? <X size={18}/> : <Menu size={18}/> }

          </button>

          </div>

        </div>

        {/* mobile navigation */}
        { open && (
          <div className={ns.mobileOverlay} onClick={()=> setOpen(false)}/>

          
        )}
        { open && (
          <div className={ns.mobileMenuContainer} id ="mobile-menu">
              <div className={ns.mobileMenuInner}>
                 <MobileItem
                to="/h"
                label="Dashboard"
                icon={<Home size={16} />}
                onClick={() => setOpen(false)}
              />

              <MobileItem
                to="/add"
                label="Add Doctor"
                icon={<UserPlus size={16} />}
                onClick={() => setOpen(false)}
              />
              <MobileItem
                to="/list"
                label="List Doctors"
                icon={<Users size={16} />}
                onClick={() => setOpen(false)}
              />
              <MobileItem
                to="/appointments"
                label="Appointments"
                icon={<Calendar size={16} />}
                onClick={() => setOpen(false)}
              />

              <MobileItem
                to="/service-dashboard"
                label="Service Dashboard"
                icon={<Grid size={16} />}
                onClick={() => setOpen(false)}
              />
              <MobileItem
                to="/add-service"
                label="Add Service"
                icon={<PlusSquare size={16} />}
                onClick={() => setOpen(false)}
              />
              <MobileItem
                to="/list-service"
                label="List Services"
                icon={<List size={16} />}
                onClick={() => setOpen(false)}
              />
              <MobileItem
                to="/service-appointments"
                label="Service Appointments"
                icon={<Calendar size={16} />}
                onClick={() => setOpen(false)}
              />
              {/* yaha se shuru karo 3:55:30 */}
              <div className={ns.mobileAuthContainer}>
                {isSignedIn ? (
                  <button  onClick= {()=>{
                    handleSignOut();
                    setOpen(false);
                  }}   className={ns.mobileSignOutButton}>
                    Sign Out
                  </button>

                ) : (
                  <div className="space-y-2">
                    <button onClick={()=>{
                      handleOpenSignIn();
                      setOpen(false);
                    }} className={ns.mobileLoginButton + " "+ ns.cursorPointer}>
                      Login


                    </button>

                  </div>
                )}
              </div>

              </div>
          </div>

          
        )}


      
      </nav>
    </header>
  );
};

export default Navbar;

/* =======================================================
   REUSABLE NAV ITEM COMPONENT
======================================================= */

function CenterNavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-item ${
          isActive ? "active" : ""
        } ${ns.centerNavItemBase} ${
          isActive
            ? ns.centerNavItemActive
            : ns.centerNavItemInactive
        }`
      }
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}

function MobileItem ({to,icon,label ,onClick}){

  return (
    <NavLink to={to} onClick ={onClick} className={({isActive})=>
    `${ns.mobileItemBase}${
      isActive ?  ns.mobileItemActive :ns.mobileItemInactive
    }`}>

      {icon}
      <span className="font-medium text-sm">{label}</span>


    </NavLink>
  )

}