import logo from './logo.svg';
import './App.css';
import { Home } from './components/Home';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Chat } from './components/Chat';
import 'animate.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />}></Route>
          <Route path="/:room/:user" element={<Chat />}></Route>
          <Route path="/:userParam" element={<Home />}></Route>
        </Routes>
      </BrowserRouter>
      {/* <Home></Home> */}
    </div>
  );
}

export default App;
