import React, { useEffect, useState } from "react"
import { Button, TextField } from "@material-ui/core"
import { toast } from "react-toastify"

import { createDish, editDish } from "../../../Functions/dishes"

function Details({dish, setRefresh, setSelected}) {
  const [newDish, setNewDish] = useState(dish)

  useEffect(() => {
    setNewDish(
      Object.keys(dish).length > 0 ? dish : {
        name: "",
        price: 0,
        image: "",
        detail: "",
        stock: null,
        type: "appetizer"
      }
    )
  }, [dish])

  const handleEdit = (e) => {
    e.preventDefault()

    editDish({...newDish, stock: newDish.stock || null}).then((response) => {
      if (response.success) {
        setRefresh(true)
        toast(newDish.name + " mis à jour avec succès.", {type: "success"})
      } else {
        toast(response, {type: "error"})
      }
    })
  }

  const handleCreate = (e) => {
    e.preventDefault()
    
    createDish({...newDish, stock: newDish.stock || null}).then((response) => {
      if (response.success) {
        setSelected({})
        setRefresh(true)
        toast(newDish.name + " ajouté avec succès.", {type: "success"})
      } else {
        toast(response, {type: "error"})
      }
    })
  }

  return (
    <div className="details__container">
      <form onSubmit={dish._id ? handleEdit : handleCreate}>
        <h1>{dish._id ? ("Modifier : " + dish.name) : "Nouveau plat"}</h1>
        <div style={{display: "flex", flexDirection: "column"}}>

          <select
            title="Type"
            value={newDish.type}
            style={{margin: "0 auto 30px"}}
            onChange={(e) => setNewDish({...newDish, type: e.target.value})}
          >
            <option value="appetizer">Entrée</option>
            <option value="mainDish">Plat principal</option>
            <option value="dessert">Dessert</option>
            <option value="drink">Boisson</option>
            <option value="alcohol">Alcool</option>
          </select>

          <TextField
            label="Nom"
            variant="outlined"
            value={newDish.name ?? ""}
            style={{marginBottom: "30px"}}
            onChange={e => setNewDish({...newDish, name: e.target.value})}
          />
          <TextField
            label="Détails"
            variant="outlined"
            value={newDish.detail ?? ""}
            style={{marginBottom: "30px"}}
            onChange={e => setNewDish({...newDish, detail: e.target.value})}
          />

          <div style={{display: "flex", gap: "10px", marginBottom: "30px", width: "100%"}}>
            <TextField
              label="Prix"
              variant="outlined"
              style={{width: "50%"}}
              value={newDish.price ?? ""}
              onChange={e => setNewDish({...newDish, price: e.target.value})}
            />
            <TextField
              label="Stock"
              variant="outlined"
              style={{width: "50%"}}
              value={newDish.stock ?? ""}
              onChange={e => setNewDish({...newDish, stock: e.target.value})}
            />
          </div>
          
          <TextField
            variant="outlined"
            value={newDish.image ?? ""}
            label="Image (URL Cloudinary)"
            style={{marginBottom: "30px"}}
            onChange={e => setNewDish({...newDish, image: e.target.value})}
          />

        </div>
        <Button type="submit">{dish._id ? "Modifier" : "Créer"}</Button>
      </form>
    </div>
  )
}

export default Details