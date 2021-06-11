import React from "react"
import { Route, Switch, Redirect } from "react-router"

import Login from "../Components/Auth/Login"
import Reset from "../Components/Auth/Reset"
import Forgot from "../Components/Auth/Forgot"


export default function LoggedOutRoutes() {
  return (
    <Switch>
      <Route path="/login">
        <Login/>
      </Route>
      
      <Route path="/forgot">
        <Forgot/>
      </Route>
      
      <Route path="/reset/:token">
        <Reset/>
      </Route>

      {/* Redirect to the home page if the route doesn't exist */}
      <Route render={() => <Redirect to="/login"/>}/>
    </Switch>
  )
}