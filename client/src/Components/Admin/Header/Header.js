import { Link } from "react-router-dom"
import React, { useContext, useEffect } from "react"

import { logout } from "../../../Functions/auth"
import { Context } from "../../../Context/Provider"

import "./Header.css"


function Header() {
  const [{user, sidebar}] = useContext(Context)

  useEffect(() => {
    const dropdown = (e) => {
      if(!e.target.className.includes("dropdown")) {
        document.querySelector("#user") && document.querySelector("#user").classList.remove("open")
        document.querySelector("#stats") && document.querySelector("#stats").classList.remove("open")
      }
    }
    document.addEventListener("click", dropdown)

    return () => document.removeEventListener("click", dropdown)
  }, [])


  const handleLogout = () => logout().then(() => {
    localStorage.removeItem("isSignedIn")
    return window.location.pathname = "/"
  })

  
  return (
    <div className="header">
      <div className={sidebar ? "branding" : "branding hidden"}>
        <img src="https://res.cloudinary.com/thegoodfork/image/upload/v1620079806/TGF_brown.png" height="60px" alt="Logo"/>
      </div>
      
      <div className="nav">
        <nav>
          <Link to="/dishes" className={window.location.pathname.startsWith("/dishes") ? "selected" : null}>
            <span className="material-icons-round">restaurant</span><span>Menu &amp; plats</span>
          </Link>
          <Link to="/staff" className={window.location.pathname.startsWith("/staff") ? "selected" : null}>
            <span className="material-icons-outlined">admin_panel_settings</span><span>Personnel</span>
          </Link>
          <Link to="/tables" className={window.location.pathname.startsWith("/tables") ? "selected" : null}>
            <span className="material-icons-outlined">chair</span><span>Tables</span>
          </Link>

          <div className={window.location.pathname.startsWith("/stats") ? "dropdown selected" : "dropdown"}>
            <ul className="dropdown__list" id="stats" style={{left: 0}}>
              <li><Link to="/stats/sales">Ventes détaillées</Link></li>
              <li><Link to="/stats/revenue">Revenu quotidien</Link></li>
            </ul>

            <div className="dropdown__content" onClick={() => document.querySelector("#stats").classList.toggle("open")}>
              <span className="dropdown__open material-icons-outlined dropdown__icon">insights</span>
              <span className="dropdown__open dropdown__title">Statistiques</span>
              <span className="dropdown__open material-icons-round dropdown__arrow">expand_more</span>
            </div>
          </div>
        </nav>
      </div>

      <div className="nav">
        <div className={window.location.pathname.startsWith("/settings") ? "dropdown selected" : "dropdown"}>
          <ul className="dropdown__list" id="user">
            <li><Link to="/settings/account">Modifier mon compte</Link></li>
            <li><Link to="/settings/password">Modifier mot de passe</Link></li>
            <li><span onClick={handleLogout}>Déconnexion</span></li>
          </ul>

          <div className="dropdown__content" onClick={() => document.querySelector("#user").classList.toggle("open")}>
            <span className="dropdown__open material-icons-outlined dropdown__icon">account_circle</span>
            <span className="dropdown__open dropdown__title">{user.firstName} {user.lastName.slice(0,1)}.</span>
            <span className="dropdown__open material-icons-round dropdown__arrow">expand_more</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header