import React, {useState, useEffect} from 'react';
import './modal.css';
import VideoPlayer  from '../video-player';
import { tutorial_videos, tutorial_description, tutorial_title } from '../../video-paths';

const Modal = (props) => {
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        console.log(`Rendering: `,activeStep);
    },[activeStep]);


    const onClose = () => {
        props.onClose();
    };

    const onPrevious = () => {       
        setActiveStep(activeStep-1);
    };

    const onNext = () => {
        setActiveStep(activeStep+1);
    };

    const moveToStep = (step) => {
        setActiveStep(step);
    };

    const getSteps = () => {
        return tutorial_videos.map((m,i) => {
            return <input className='step__radio' type="radio" key={i} value={i} checked={i === activeStep} onChange={() => moveToStep(i)} name="stpe" />
        });
    };

    const getVideoAndDescription = () => {
        return(
            <>
                <VideoPlayer url={tutorial_videos[activeStep]} key={tutorial_videos[activeStep]}></VideoPlayer>
                <p className='description__text'> {tutorial_description[activeStep]} </p>
            </>
        );
    };

    return (
        <div className='modal__background'>
            <div className='modal'> 
                <div className='title__header'> 
                    <p className='title'> { tutorial_title[activeStep].toUpperCase() } </p>   
                    <div className='top__button__container'>
                        <button className='button__close'onClick={onClose}>x</button>
                    </div>                
                </div>
                <div className='container'>
                    {getVideoAndDescription()}
                </div>
                <div className='steps'>
                    <div className='prev__button_container'>
                        { activeStep !== 0 && <button className='button__prev' onClick={onPrevious}> <strong>&lt;</strong> </button>}
                    </div>
                    <div className='steps__container'>
                        {getSteps()}
                    </div>
                    <div className='next__button_container'>
                        { 
                        activeStep === tutorial_videos.length-1 ? 
                        <button className='button__finish' onClick={onClose}> <strong> Done </strong> </button>
                        :
                        <button className='button__next' onClick={onNext}> <strong>&gt;</strong> </button>
                        }
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Modal;