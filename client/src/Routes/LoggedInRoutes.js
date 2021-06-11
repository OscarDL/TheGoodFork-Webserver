import React from "react"
import { Route, Switch, Redirect } from "react-router"

import Header from "../Components/Admin/Header/Header"
import Account from "../Components/Admin/Settings/Account"
import Password from "../Components/Admin/Settings/Password"

import Staff from "../Components/Admin/Staff/Staff"
import Dishes from "../Components/Admin/Dishes/Dishes"
import Tables from "../Components/Admin/Tables/Tables"

import Sales from "../Components/Admin/Stats/Sales"
import Revenue from "../Components/Admin/Stats/Revenue"


export default function LoggedInRoutes() {
  return (
    <Switch>
      <Route path="/dishes">
        <Header/>
        <div className="body">
          <Dishes/>
        </div>
      </Route>

      <Route path="/staff">
        <Header/>
        <div className="body">
          <Staff/>
        </div>
      </Route>

      <Route path="/tables">
        <Header/>
        <div className="body">
          <Tables/>
        </div>
      </Route>

      <Route exact path={["/stats/sales", "/stats"]}>
        <Header/>
        <div className="body">
          <Sales/>
        </div>
      </Route>

      <Route exact path="/stats/revenue">
        <Header/>
          <div className="body">
          <Revenue/>
        </div>
      </Route>

      <Route exact path={["/settings/account", "/settinsg"]}>
        <Header/>
          <div className="body">
          <Account/>
        </div>
      </Route>
      
      <Route exact path="/settings/password">
        <Header/>
          <div className="body">
          <Password/>
        </div>
      </Route>

      <Route render={() => <Redirect to="/dishes"/>}/>
    </Switch>
  )
}