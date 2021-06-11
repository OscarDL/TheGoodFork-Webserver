import { Link } from "react-router-dom"
import React, { useContext, useEffect, useState } from "react"
import { Button, TextField, InputAdornment } from "@material-ui/core"
import { toast } from "react-toastify"

import "./Auth.css"
import { login } from "../../Functions/auth"
import { Context } from "../../Context/Provider"

function Login() {
  const [, dispatch] = useContext(Context)
  
  const [remember, setRemember] = useState(false)
  const [user, setUser] = useState({email: null, password: null})

  useEffect(() => {
    document.title = "TheGoodFork - Connexion"
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
  
    login(user, remember).then((response) => {
      if (response.success) {
        localStorage.setItem("isSignedIn", response.success)
      }
      else {
        toast(response, {type: "error"})
      }

      dispatch({type: "LOGIN", user: response.success ? response.user : {}})
    })
  }

  return (
    <div className="auth">
      <div className="branding header">
        <img src="https://res.cloudinary.com/thegoodfork/image/upload/v1620079806/TGF_brown.png" height="60px" alt="Logo"/>
      </div>

      <div className="modal__container">
        <form onSubmit={handleLogin}>
          <h1>Portail administrateur</h1>
          <div style={{display: "flex", flexDirection: "column"}}>

            <TextField
              InputProps={{
                startAdornment: <InputAdornment position="start">
                  <span className="material-icons-outlined">account_circle</span>
                </InputAdornment>
              }}
              variant="outlined"
              label="Adresse email"
              onChange={e => setUser({...user, email: e.target.value})}
            />
            <label htmlFor="remember">
              <input
                id="remember"
                type="checkbox"
                defaultChecked={remember}
                onChange={() => setRemember(!remember)}
              /> Rester connnecté (16h)
            </label>
            
            <TextField
              InputProps={{
                startAdornment: <InputAdornment position="start">
                  <span className="material-icons-outlined">lock</span>
                </InputAdornment>
              }}
              type="password"
              variant="outlined"
              label="Mot de passe"
              onChange={e => setUser({...user, password: e.target.value})}
            />
            <Link to="/forgot" className="forgot">Mot de passe oublié ?</Link>

          </div>
          <Button type="submit">Connexion</Button>
        </form>
      </div>
    </div>
  )
}

export default Login