import React from 'react';
import './video-player.css';

const VideoPlayer = (props) => {

    const onError = (event) => {
        console.log(event);
    };

    return(
        <video className="video__player" width="318" height="333" onError={onError}>
            <source src={props.url} type="video/webm"/>
        </video>
    );
};

export default VideoPlayer;