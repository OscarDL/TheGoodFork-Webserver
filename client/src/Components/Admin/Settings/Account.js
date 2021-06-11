import React, { useContext, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { Button, TextField } from "@material-ui/core"

import { Context } from "../../../Context/Provider"
import { updateData } from "../../../Functions/auth"

function Account() {
  const [{user}, dispatch] = useContext(Context)
  const [newUser, setNewUser] = useState(user)
  
  const handleUpdate = (e) => {
    e.preventDefault()

    updateData(newUser).then((response) => {
      if (response.success) {
        dispatch({
          type: "LOGIN",
          user: response.user
        })
        toast("Informations mises à jour avec succès.", {type: "success"})
      } else {
        toast(response, {type: "error"})
      }
    })
  }

  useEffect(() => {
    document.title = "Informations de compte"
  }, [])
  
  return (
    <div className="modal">
      <div className="modal__container">
        <form onSubmit={handleUpdate}>
          <h1>Informations de compte</h1>
          <div style={{display: "flex", flexDirection: "column"}}>

            <div style={{display: "flex", gap: "10px", marginBottom: "30px", width: "100%"}}>
              <TextField
                label="Prénom"
                variant="outlined"
                style={{width: "50%"}}
                value={newUser.firstName}
                onChange={e => setNewUser({...newUser, firstName: e.target.value})}
              />
              <TextField
                label="Nom"
                variant="outlined"
                style={{width: "50%"}}
                value={newUser.lastName}
                onChange={e => setNewUser({...newUser, lastName: e.target.value})}
              />
            </div>
          
            <TextField
              variant="outlined"
              label="Adresse email"
              value={newUser.email}
              onChange={e => setNewUser({...newUser, email: e.target.value})}
            />

          </div>
          <Button type="submit">Mettre à jour</Button>
        </form>
      </div>
    </div>
  )
}

export default Account