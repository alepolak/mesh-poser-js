import React, { Component }  from "react";
import './Composer.css';
import Sidebar from "./Sidebar";
import * as THREE from 'three';
import { STLExporter } from "./STLExporter";

class Composer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            references: {
                rendererContainer: React.createRef(),
                scaleRef: React.createRef(),
            },
            model: {
                modelName: undefined,
                mesh: undefined,
                lastMesh: undefined,
                scale: undefined,
                originalScale: undefined,
                isReady: false,
            },
            animations: {
                mixer: undefined,
                list: [],
                activeIndex: undefined,
                active: undefined,
                last: undefined,
                activeFrame: undefined,
                activeMaxFrame: undefined,
                singleFrameModeActive: false,
            },
            renderer: {
                scene: new THREE.Scene(),
            },
            exporters: {
                stlExporter: new STLExporter(),
            }
        };
    };

    render() {
        return(
            <div className="asd"> hola</div>
        )
    }
};

export default Composer;