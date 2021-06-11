import React, { useEffect, useState } from "react"
import BeatLoader from "react-spinners/BeatLoader"
import { deleteDish, getDishes } from "../../../Functions/dishes"
import { toast } from "react-toastify"

import "./Dishes.css"
import Details from "./Details"

function Dish({dish, selected, setSelected, setRefresh}) {
  const setDish = (e) => {
    if (!e.target.className?.includes("dish__delete")) {
      document.querySelectorAll(`.dish:not(#id${dish._id})`).forEach((el) => el.classList.remove("selected"))

      if (dish === selected) {
        document.getElementById("id" + dish._id).classList.remove("selected")
        setSelected(null)
      } else {
        document.getElementById("id" + dish._id).classList.add("selected")
        setSelected(dish)
      }
    }
  }

  const handleDelete = () => {
    if (window.confirm("Etes-vous sûr de vouloir supprimer " + dish.name + " ?")) {
      deleteDish(dish).then((response) => {
        if (response.success) {
          setRefresh(true)
          setSelected(null)
          toast(dish.name + " supprimé avec succès.", {type: "success"})
        } else {
          toast(response, {type: "error"})
        }
      })
    }
  }

  return (
    <div className="dish" onClick={setDish} id={"id" + dish._id}>
      <span style={{display: "flex", alignItems: "center", gap: "10px"}}>
        <img src={dish.image} alt="dish" height="40px" />
        <h3>{dish.name}</h3>
      </span>
      <span className="material-icons-outlined dish__delete" style={{cursor: "pointer"}} onClick={handleDelete}>delete</span>
    </div>
  )
}

function Dishes() {
  const [type, setType] = useState("all")
  const [dishes, setDishes] = useState(null)
  const [refresh, setRefresh] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    document.title = "Menu et plats"

    if (refresh) getDishes().then((response) => {
      setRefresh(false)

      if (response.success) {
        setDishes(response.dishes)
      } else {
        setDishes([])
        toast(response, {type: "error"})
      }
    })
  }, [refresh, setDishes])

  return (
    <div className="dishes">
      
      {dishes ? (
        <>
          <div className="dishes__left">
            <div className="content__header">
              <h2>Liste des plats</h2>

              <div className="options">
                <button className="button" onClick={() => {
                  document.querySelectorAll(".dish").forEach(el => el.classList.remove("selected"))
                  setSelected({})
                }}>
                  <span className="material-icons-round">add_circle_outline</span>
                  <span>Nouveau</span>
                </button>
              </div>
            </div>
            
            <select title="Type" style={{margin: "10px auto 20px"}} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">Tous les plats</option>
              <option value="appetizer">Entrées</option>
              <option value="mainDish">Plats principaux</option>
              <option value="dessert">Desserts</option>
              <option value="drink">Boissons</option>
              <option value="alcohol">Alcools</option>
            </select>

            <div className="dishes__list">
              {(type === "all" || type === "appetizer") && <>
                <h2 className="title">Entrées</h2>
                {dishes.filter((dish) => dish.type === "appetizer").sort((a, b) => a.name.localeCompare(b.name)).map((dish) => (
                  <Dish key={dish._id} dish={dish} selected={selected} setSelected={setSelected} setRefresh={setRefresh}/>
                ))}
              </>}

              {(type === "all" || type === "mainDish") && <>
                <h2 className="title">Plats principaux</h2>
                {dishes.filter((dish) => dish.type === "mainDish").sort((a, b) => a.name.localeCompare(b.name)).map((dish) => (
                  <Dish key={dish._id} dish={dish} selected={selected} setSelected={setSelected} setRefresh={setRefresh}/>
                ))}
              </>}

              {(type === "all" || type === "dessert") && <>
                <h2 className="title">Desserts</h2>
                {dishes.filter((dish) => dish.type === "dessert").sort((a, b) => a.name.localeCompare(b.name)).map((dish) => (
                  <Dish key={dish._id} dish={dish} selected={selected} setSelected={setSelected} setRefresh={setRefresh}/>
                ))}
              </>}

              {(type === "all" || type === "drink") && <>
                <h2 className="title">Boissons</h2>
                {dishes.filter((dish) => dish.type === "drink").sort((a, b) => a.name.localeCompare(b.name)).map((dish) => (
                  <Dish key={dish._id} dish={dish} selected={selected} setSelected={setSelected} setRefresh={setRefresh}/>
                ))}
              </>}

              {(type === "all" || type === "alcohol") && <>
                <h2 className="title">Alcools</h2>
                {dishes.filter((dish) => dish.type === "alcohol").sort((a, b) => a.name.localeCompare(b.name)).map((dish) => (
                  <Dish key={dish._id} dish={dish} selected={selected} setSelected={setSelected} setRefresh={setRefresh}/>
                ))}
              </>}
            </div>
          </div>

          <div className="dishes__right container">
            {selected && <Details dish={selected} setRefresh={setRefresh} setSelected={setSelected}/>}
          </div>
        </>
      ) : (
        <div className="loader">
          <BeatLoader color="#805a48" loading={true}/>
        </div>
      )}
    </div>
  )
}

export default Dishes