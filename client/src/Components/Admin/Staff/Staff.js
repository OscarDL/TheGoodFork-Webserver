import React, { useContext, useEffect, useState } from "react"
import BeatLoader from "react-spinners/BeatLoader"
import { deleteStaff, getStaff } from "../../../Functions/staff"
import { toast } from "react-toastify"

import "./Staff.css"
import Details from "./Details"
import { Context } from "../../../Context/Provider"

function Staff({user = {}, staff, selected, setSelected, setRefresh}) {
  const setStaff = (e) => {
    if (!e.target.className?.includes("staff__delete")) {
      document.querySelectorAll(`.staff:not(#id${staff._id})`).forEach((el) => el.classList.remove("selected"))
      
      if (staff === selected) {
        document.getElementById("id" + staff._id).classList.remove("selected")
        setSelected(null)
      } else {
        document.getElementById("id" + staff._id).classList.add("selected")
        setSelected(staff)
      }
    }
  }

  const handleDelete = () => {
    if (window.confirm(`Etes-vous sûr de vouloir supprimer ${staff.firstName} ${staff.lastName} ?`)) {
      deleteStaff(staff).then((response) => {
        if (response.success) {
          setRefresh(true)
          setSelected(null)
          toast(`${staff.firstName} ${staff.lastName} supprimé avec succès.`, {type: "success"})
        } else {
          toast(response, {type: "error"})
        }
      })
    }
  }

  return (staff._id !== user._id) ? (
    <div className="staff" onClick={setStaff} id={"id" + staff._id}>
      <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
        <span className="material-icons" style={{fontSize: "40px"}}>how_to_reg</span>
        <h3>{staff.firstName} {staff.lastName}</h3>
      </div>
      {user._id !== staff._id && ( // Don't allow to delete yourself
        <span className="material-icons-outlined staff__delete" style={{cursor: "pointer"}} onClick={handleDelete}>delete</span>
      )}
    </div>
  ) : null
}

function StaffList() {
  const [{user}] = useContext(Context)
  const [type, setType] = useState("all")
  const [staff, setStaff] = useState(null)
  const [refresh, setRefresh] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    document.title = "Liste du personnel"

    if (refresh) getStaff().then((response) => {
      setRefresh(false)

      if (response.success) {
        setStaff(response.staff)
      } else {
        setStaff([])
        toast(response, {type: "error"})
      }
    })
  }, [refresh, setStaff])

  return (
    <div className="staff__container">
      
      {staff ? (
        <>
          <div className="staff__left">
            <div className="content__header">
              <h2>Liste du personnel</h2>

              <div className="options">
                <button className="button" onClick={() => {
                  document.querySelectorAll(".staff").forEach(el => el.classList.remove("selected"))
                  setSelected({})
                }}>
                  <span className="material-icons-round">add_circle_outline</span>
                  <span>Nouveau</span>
                </button>
              </div>
            </div>
            
            <select title="Type" style={{margin: "10px auto 20px"}} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">Tous les types</option>
              <option value="admin">Administrateurs</option>
              <option value="barman">Barmans</option>
              <option value="cook">Cuisiniers</option>
              <option value="waiter">Serveurs</option>
            </select>

            <div className="staff__list">
              {(type === "all" || type === "admin") && <>
                <h2 className="title">Administrateurs</h2>
                {staff.filter((staff) => staff.type === "admin").sort((a, b) => a.firstName.localeCompare(b.firstNameame)).map((staff) => (
                  <Staff key={staff._id} user={user} staff={staff} selected={selected} setSelected={setSelected} setRefresh={setRefresh}/>
                ))}
              </>}

              {(type === "all" || type === "barman") && <>
                <h2 className="title">Barmans</h2>
                {staff.filter((staff) => staff.type === "barman").sort((a, b) => a.firstName.localeCompare(b.firstName)).map((staff) => (
                  <Staff key={staff._id} staff={staff} selected={selected} setSelected={setSelected} setRefresh={setRefresh}/>
                ))}
              </>}

              {(type === "all" || type === "cook") && <>
                <h2 className="title">Cuisiniers</h2>
                {staff.filter((staff) => staff.type === "cook").sort((a, b) => a.firstName.localeCompare(b.firstName)).map((staff) => (
                  <Staff key={staff._id} staff={staff} selected={selected} setSelected={setSelected} setRefresh={setRefresh}/>
                ))}
              </>}

              {(type === "all" || type === "waiter") && <>
                <h2 className="title">Serveurs</h2>
                {staff.filter((staff) => staff.type === "waiter").sort((a, b) => a.firstName.localeCompare(b.firstName)).map((staff) => (
                  <Staff key={staff._id} staff={staff} selected={selected} setSelected={setSelected} setRefresh={setRefresh}/>
                ))}
              </>}
            </div>
          </div>

          <div className="staff__right container">
            {selected && <Details staff={selected} setRefresh={setRefresh} setSelected={setSelected}/>}
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

export default StaffList