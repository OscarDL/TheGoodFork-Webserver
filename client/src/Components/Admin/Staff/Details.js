import React, { useEffect, useState } from "react"
import { Button, TextField } from "@material-ui/core"
import { toast } from "react-toastify"

import { createStaff, editStaff } from "../../../Functions/staff"

function Details({staff, setRefresh, setSelected}) {
  const [newStaff, setNewStaff] = useState(staff)

  useEffect(() => {
    setNewStaff(
      Object.keys(staff).length > 0 ? staff : {
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        passCheck: "",
        type: "admin"
      }
    )
  }, [staff])

  const handleEdit = (e) => {
    e.preventDefault()

    editStaff(newStaff).then((response) => {
      if (response.success) {
        setRefresh(true)
        toast(`${newStaff.firstName} ${newStaff.lastName} mis à jour avec succès.`, {type: "success"})
      } else {
        toast(response, {type: "error"})
      }
    })
  }

  const handleCreate = (e) => {
    e.preventDefault()
    
    createStaff(newStaff).then((response) => {
      if (response.success) {
        setSelected({})
        setRefresh(true)
        toast(`${newStaff.firstName} ${newStaff.lastName} créé avec succès.`, {type: "success"})
      } else {
        toast(response, {type: "error"})
      }
    })
  }

  return (
    <div className="details__container">
      <form onSubmit={staff._id ? handleEdit : handleCreate}>
        <h1>{staff._id ? ("Modifier : " + staff.firstName + " " + staff.lastName) : "Nouveau membre"}</h1>
        <div style={{display: "flex", flexDirection: "column"}}>

          <select
            title="Type"
            value={newStaff.type}
            style={{margin: "0 auto 30px"}}
            onChange={(e) => setNewStaff({...newStaff, type: e.target.value})}
          >
            <option value="admin">Administrateur</option>
            <option value="barman">Barman</option>
            <option value="cook">Cuisinier</option>
            <option value="waiter">Serveur</option>
          </select>

          <div style={{display: "flex", gap: "10px", marginBottom: "30px", width: "100%"}}>
            <TextField
              label="Prénom"
              variant="outlined"
              style={{width: "50%"}}
              value={newStaff.firstName ?? ""}
              onChange={e => setNewStaff({...newStaff, firstName: e.target.value})}
            />
            <TextField
              label="Nom"
              variant="outlined"
              style={{width: "50%"}}
              value={newStaff.lastName ?? ""}
              onChange={e => setNewStaff({...newStaff, lastName: e.target.value})}
            />
          </div>

          <TextField
            variant="outlined"
            label="Adresse email"
            value={newStaff.email ?? ""}
            style={{marginBottom: "30px"}}
            onChange={e => setNewStaff({...newStaff, email: e.target.value})}
          />
          
          {staff._id ? (
            <TextField
              type="password"
              variant="outlined"
              style={{marginBottom: "30px"}}
              label="Changer le mot de passe"
              value={newStaff.password ?? ""}
              onChange={e => setNewStaff({...newStaff, password: e.target.value})}
            />
          ) : (
            <div style={{display: "flex", gap: "10px", marginBottom: "30px", width: "100%"}}>
              <TextField
                type="password"
                variant="outlined"
                label="Mot de passe"
                style={{width: "50%"}}
                value={newStaff.password ?? ""}
                onChange={e => setNewStaff({...newStaff, password: e.target.value})}
              />
              <TextField
                type="password"
                variant="outlined"
                label="Confirmation"
                style={{width: "50%"}}
                value={newStaff.passCheck ?? ""}
                onChange={e => setNewStaff({...newStaff, passCheck: e.target.value})}
              />
            </div>
          )}

        </div>
        <Button type="submit">{staff._id ? "Mettre à jour" : "Créer"}</Button>
      </form>
    </div>
  )
}

export default Details