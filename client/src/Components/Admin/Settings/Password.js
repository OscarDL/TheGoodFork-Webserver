import React, { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { Button, TextField } from "@material-ui/core"

import { updatePassword } from "../../../Functions/auth"

function Password() {
  const [current, setCurrent] = useState("")
  const [password, setPassword] = useState("")
  const [passCheck, setPassCheck] = useState("")
  
  const handleUpdate = (e) => {
    e.preventDefault()

    updatePassword(current, password, passCheck).then((response) => {
      if (response.success) {
        setCurrent("")
        setPassword("")
        setPassCheck("")
        toast("Mot de passe mis à jour avec succès.", {type: "success"})
      } else {
        toast(response, {type: "error"})
      }
    })
  }

  useEffect(() => {
    document.title = "Nouveau mot de passe"
  }, [])
  
  return (
    <div className="modal">
      <div className="modal__container">
        <form onSubmit={handleUpdate}>
          <h1>Nouveau mot de passe</h1>
          <div style={{display: "flex", flexDirection: "column"}}>
          
            <TextField
              value={current}
              type="password"
              variant="outlined"
              label="Mot de passe actuel"
              style={{marginBottom: "30px"}}
              onChange={e => setCurrent(e.target.value)}
            />

            <div style={{display: "flex", gap: "10px", width: "100%"}}>
              <TextField
                type="password"
                value={password}
                variant="outlined"
                style={{width: "50%"}}
                label="Nouveau mot de passe"
                onChange={e => setPassword(e.target.value)}
              />
              <TextField
                type="password"
                value={passCheck}
                variant="outlined"
                label="Confirmation"
                style={{width: "50%"}}
                onChange={e => setPassCheck(e.target.value)}
              />
            </div>

          </div>
          <Button type="submit">Modifier</Button>
        </form>
      </div>
    </div>
  )
}

export default Password