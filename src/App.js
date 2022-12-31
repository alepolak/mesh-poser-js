import './App.css';
import Composer from './Composer';
import Modal from './components/modal/modal';

function App() {

  const showModal = true;

  return (
    <div className="App">
      { showModal && <Modal/>}
      <Composer/>
    </div>
  );
}

export default App;
