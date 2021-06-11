import BeatLoader from "react-spinners/BeatLoader"
import React, { useContext, useEffect } from "react"
import { BrowserRouter as Router } from "react-router-dom"
import { Slide, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import "./App.css"
import { Context } from "../Context/Provider"
import LoggedInRoutes from "../Routes/LoggedInRoutes"
import LoggedOutRoutes from "../Routes/LoggedOutRoutes"
import { logout, getUserData } from "../Functions/auth"

function App() {
  const [{user}, dispatch] = useContext(Context)

  useEffect(() => { // check signed in state
    const signedIn = localStorage.getItem("isSignedIn")
    if (signedIn) {
      getUserData().then((response) => {
        if (!response.success) {
          logout().then(() => localStorage.removeItem("isSignedIn"))
        }
        
        dispatch({ type: "LOGIN", user: response.user ?? {} })
      })
    } else {
      return dispatch({ type: "LOGIN", user: {} })
    }
  }, [dispatch])

  return (
    <div className="app">
      <ToastContainer
        transition={Slide}
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      {user ? (
        <Router>
          {user._id ? <LoggedInRoutes/> : <LoggedOutRoutes/>}
        </Router>
      ) : (
        <div className="loader">
          <BeatLoader color="#805a48" loading={true}/>
        </div>
      )}
    </div>
  )
}

export default App