import React from 'react';
import './modal.css';
import VideoPlayer  from '../video-player';

const Modal = () => {

    const showPrevButton = true;
    const isLastStep = false;

    const onClose = () => {};
    const onPrevious = () => {};
    const onNext = () => {};

    const videoPath = 'file:///C:\DATA\Proyectos\Paginas Web\Web\mesh-poser\client\public\tutorial\animation-control.webm';
    const video2 = '/media/animation-control.webm';

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
                    <VideoPlayer url={videoPath}></VideoPlayer>
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