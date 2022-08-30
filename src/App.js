import logo from './logo.svg';
import './App.css';
import { Home } from './components/Home';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Chat } from './components/Chat';




function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route index element={<Home/>}></Route>
          <Route path="/:room" element={<Chat/>}></Route>

        </Routes>
      </BrowserRouter>
      {/* <Home></Home> */}
    </div>
  );
}

export default App;
