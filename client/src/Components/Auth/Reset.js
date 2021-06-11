import { useParams } from "react-router"
import React, { useEffect, useState } from "react"
import { Button, TextField, InputAdornment } from "@material-ui/core"
import { toast } from "react-toastify"

import { resetPassword } from "../../Functions/auth"

function Reset() {
  const {token} = useParams()
  const [reset, setReset] = useState({
    token: token,
    password: null,
    passCheck: null
  })

  const handleReset = (e) => {
    e.preventDefault()
  
    resetPassword(reset).then((response) => {
      toast(response, {type: response.success ? "success" : "error"})
      window.location.pathname = response.success ? "/login" : "/forgot"
    })
  }

  useEffect(() => {
    document.title = "Nouveau mot de passe"
  }, [])

  return (
    <div className="auth">
      <div className="branding header">
        <img src="https://res.cloudinary.com/thegoodfork/image/upload/v1620079806/TGF_brown.png" height="60px" alt="Logo"/>
      </div>

      <div className="modal__container">
        <form onSubmit={handleReset}>
          <h1>Choisissez un mot de passe</h1>
          <div style={{display: "flex", flexDirection: "column"}}>

            <TextField
              InputProps={{
                startAdornment: <InputAdornment position="start">
                  <span className="material-icons-outlined">lock</span>
                </InputAdornment>
              }}
              variant="outlined"
              label="Nouveau mot de passe"
              style={{marginBottom: "30px"}}
              onChange={e => setReset({...reset, password: e.target.value})}
            />

            <TextField
              InputProps={{
                startAdornment: <InputAdornment position="start">
                  <span className="material-icons-outlined">lock</span>
                </InputAdornment>
              }}
              variant="outlined"
              label="Confirmation"
              onChange={e => setReset({...reset, passCheck: e.target.value})}
            />

          </div>
          <Button type="submit">Réinitialiser</Button>
        </form>
      </div>
    </div>
  )
}

export default Reset