import React, { useEffect } from "react"

function Sales() {
  useEffect(() => {
    document.title = "Statistiques de ventes"
  }, [])

  return (
    <div className="container center" style={{width: "100%", alignItems: "normal"}}>
      <div className="modal__container center">
        <div className="center" style={{width: "100%"}}>
          <h1 style={{margin: 0}}>Statistiques de ventes - bientôt disponible.</h1>
        </div>
      </div>
    </div>
  )
}

export default Sales