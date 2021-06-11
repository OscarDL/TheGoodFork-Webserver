import React, { useEffect, useState } from "react"
import BeatLoader from "react-spinners/BeatLoader"
import { Button, TextField } from "@material-ui/core"
import { toast } from "react-toastify"

import { getTables, updateTables } from "../../../Functions/tables"

export default function Tables() {
  const [tables, setTables] = useState(null)

  const handleEdit = (e) => {
    e.preventDefault()

    updateTables(tables).then((response) => {
      if (response.success) {
        toast("Tables mises à jour avec succès.", {type: "success"})
      } else {
        toast(response, {type: "error"})
      }
    })
  }

  useEffect(() => {
    document.title = "Gestion des tables"

    getTables().then((response) => {
      if (response.success) {
        setTables(response.tables.amount)
      } else {
        toast(response, {type: "error"})
      }
    })
  }, [])

  return tables !== null ? (
    <div className="modal">
      <div className="modal__container">
        <form onSubmit={handleEdit}>
          <h1>Gestion des tables</h1>
          <div style={{display: "flex", flexDirection: "column"}}>
            
            <TextField
              value={tables}
              variant="outlined"
              label="Nombre de tables"
              onChange={e => setTables(e.target.value)}
            />

          </div>
          <Button type="submit">Modifier</Button>
        </form>
      </div>
    </div>
  ) : (
    <div className="loader">
      <BeatLoader color="#805a48" loading={true}/>
    </div>
  )
}