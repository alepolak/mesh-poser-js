import React from 'react';
import './modal.css';

const Modal = () => {

    const showPrevButton = true;
    const isLastStep = false;

    const onClose = () => {};
    const onPrevious = () => {};
    const onNext = () => {};

    return (
        <div className='modal__background'>
            <div className='modal'> 
                <div className='title__header'> 
                    <h1>Title</h1>   
                    <div className='top__button__container'>
                        <button className='button__close'onClick={onClose}>x</button>
                    </div>                
                </div>
                <div className='container'>
                    container
                </div>
                <div className='steps'>
                    { showPrevButton && <button className='button__prev'onClick={onPrevious}> <strong>&lt;</strong> </button>}
                    steps
                    { 
                    isLastStep ? 
                        <button className='button__finish' onClick={onClose}> finish </button>
                        :
                        <button className='button__next' onClick={onNext}> <strong>&gt;</strong> </button>
                    }

                </div>
            </div>
        </div>
    );
};

export default Modal;