import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";

import LoginFormPage from './components/LoginFormModal';
import SignupFormPage from "./components/SignupFormModal";
import Navigation from "./components/Navigation";
import NotebooksList from "./components/NotebooksList"
import NotesList from "./components/NotesList"
import EditNoteForm from "./components/EditNoteForm"
import CreateNoteForm from "./components/CreateNoteForm"
import SplashPage from './components/SplashPage';
import Footer from "./components/Footer"
import * as sessionActions from "./store/session";
import './components/NotebooksList/NotebookList.css'

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  const user = useSelector(state => {
    if (state.session.user != null) {
      return state.session.user.username
    }
  })

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && (
        <Switch>
          <Route path="/login">
            <LoginFormPage />
          </Route>
          <Route path="/notebooks" exact>
            <div className='page-content'>
              <NotebooksList />
            </div>
          </Route>
          <Route path="/signup">
            <SignupFormPage />
          </Route>
          <Route path="/notebooks/:id/notes" exact>
            <div className='page-content'>
              <NotebooksList />
              <NotesList />
              <CreateNoteForm />
            </div>
          </Route>
          <Route path='/notebooks/:id/notes/:noteId' exact>
            <div className='page-content'>
              <NotebooksList />
              <NotesList />
              <EditNoteForm/>
            </div>
          </Route>
          <Route path='/' exact>
            <SplashPage user={user} />
            <Footer />
          </Route>
        </Switch>
      )}
    </>
  );
}



export default App;
