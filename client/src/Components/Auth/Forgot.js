import React, { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { Button, TextField, InputAdornment } from "@material-ui/core"
import { toast } from "react-toastify"

import { sendEmail } from "../../Functions/auth"

function Forgot() {
  const history = useHistory()
  const [email, setEmail] = useState(null)
  const [emailSent, setEmailSent] = useState(false)

  const handleForgot = (e) => {
    e.preventDefault()
  
    sendEmail(email).then((response) => {
      if (response.success) {
        setEmailSent(true)
      } else {
        toast(response, {type: "error"})
      }
    })

  }

  const goBack = (e) => {
    e.preventDefault()
    history.goBack()
  }

  useEffect(() => {
    document.title = "Récupération de compte"
  }, [])

  return (
    <div className="auth">
      <div className="branding header">
        <img src="https://res.cloudinary.com/thegoodfork/image/upload/v1620079806/TGF_brown.png" height="60px" alt="Logo"/>
      </div>

      <div className="modal__container">
        {!emailSent ? (
          <form onSubmit={handleForgot}>
            <Button onClick={goBack} className="back__button">
              <span className="material-icons-round" style={{fontSize: "48px"}}>chevron_left</span>
            </Button>

            <div style={{margin: "0 auto"}}>
              <h1>Mot de passe oublié</h1>
              <p>Veuillez entrer l'adresse email avec laquelle vous vous connectez.</p>
            </div>

            <div style={{display: "flex", flexDirection: "column"}}>
              <TextField
                InputProps={{
                  startAdornment: <InputAdornment position="start">
                    <span className="material-icons-outlined">account_circle</span>
                  </InputAdornment>
                }}
                variant="outlined"
                label="Adresse email"
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <Button type="submit">send email</Button>
          </form>
        ) : (
          <form style={{height: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
            <h1 style={{marginBottom: "30px"}}>Demande de récupération envoyée</h1>
            <p>Veuillez suivre les instructions envoyées par email.</p>
          </form>
        )}
      </div>
    </div>
  )
}

export default Forgot