import React from "react";
import './FileButton.css';

const FileButton = (props) => {
    return (
        props.isMultiple ?
            <input className='file__button' data-content={props.buttonLabel} type="file" accept=".fbx" onChange={props.onModelLoad} multiple/>
            :
            <input className='file__button' data-content={props.buttonLabel} type="file" accept=".fbx" onChange={props.onModelLoad} />
    );
};

export default FileButton;
