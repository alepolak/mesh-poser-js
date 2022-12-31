import React, {useState, useEffect} from 'react'
import './App.css';
import Composer from './Composer';
import Modal from './components/modal/modal';

function App() {

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {

  }, [showModal]);

  const closeModal = () => {
    setShowModal(false);
  }

  const openModal = () => {
    setShowModal(true);
  }

  return (
    <div className="App">
      { showModal && <Modal onClose={closeModal}/>}
      <Composer openModal={openModal}/>
    </div>
  );
}

export default App;
