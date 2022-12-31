import React from 'react';
import './video-player.css';

const VideoPlayer = (props) => {
    return(
        <video className="video__player" key={props.key} autoPlay loop muted>
            <source src={props.url} type="video/webm" className='video__source'/>
        </video>
    );
};

export default VideoPlayer;