import React, { Component }  from "react";
import './Composer.css';
import Sidebar from "./Sidebar";
import * as THREE from 'three';
import { STLExporter } from "./STLExporter";
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ANIMATION_FRAME_RATE } from "./const";
import { mergeBufferGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils';
import { saveAs } from 'file-saver';

class Composer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            references: {
                rendererContainer: React.createRef(),
                scaleInput: React.createRef(),
            },
            model: {
                isReady: false,
                lastMesh: undefined,
                modelName: undefined,
                mesh: undefined,
                originalScale: undefined,
                scale: undefined,
            },
            animations: {
                active: undefined,
                activeFrame: 0,
                activeIndex: undefined,
                activeMaxFrame: 0,
                last: undefined,
                list: [],
                mixer: undefined,
                singleFrameModeActive: false,
            },
            renderer: {
                camera: undefined,
                controls: undefined,
                renderer: undefined,
                scene: new THREE.Scene(),
                started: false,
            },
            exporters: {
                stlExporter: new STLExporter(),
            }
        };
    };

    /** Get Object Size
     * 
     * @param {model} object 
     * @returns the size of the model. 
     */
    getObjectSize = (object) => {
        let box3 = new THREE.Box3().setFromObject(object);
        let size = new THREE.Vector3();
        box3.getSize(size);
        return size;
    };

    /** Set Default Animation.
     * 
     * Handles the assignment of the default animation of the object.
     * @param {model} object 
     */
    setDefaultAnimation = (object) => {
        var mix = new THREE.AnimationMixer(object);
        this.setState(prevState => ({
            ...prevState,
            animations: {
                ...prevState.animations,
                mixer: mix,
            },
        }));

        if(object.animations.length !== 0) {
            const animationAction = mix.clipAction(object.animations[0]);
            this.setState(prevState => ({
                ...prevState,
                animations: {
                    ...prevState.animations,
                    active: animationAction,
                    list: [animationAction],
                    mixer: mix,
                },
            }));
        }
    };

    /** On Model Load.
     * 
     * Handles the loading of a new file from the computer.
     * @param {Event of loading a file} event 
     */
    loadModel = (event) => {
        if( event.currentTarget.files.length > 0 ) {
            const reader = new FileReader();  
            
            // Remove old model from scene.
            this.state.renderer.scene.remove(this.state.model.mesh);
            const modelName = event.currentTarget.files[0].name.split('.')[0];

            // Save model name.
            this.setState(prevState => ({
                ...prevState,
                model: {
                    ...prevState.model,
                    modelName: modelName,
                },
            }));
            
            // Set Events.
            reader.addEventListener('progress', this.onLoadingProgress);
            reader.addEventListener('error', this.onModelLoadingError);
            reader.addEventListener("load", this.onModelLoad);
            
            reader.readAsArrayBuffer(event.target.files[0]);
        }
    };

    
    isZero(size) {
        return size.x === 0 && size.y === 0 && size.z === 0;
    };

    onModelLoad = (event) => {
        const defaultMaterial = new THREE.MeshStandardMaterial({ color: 0xa3a2a2, metalness: 0.1, flatShading: true });
        const contents = event.target.result;
        const loader = new FBXLoader();
        let modelReady = false;

        // Parse model
        const object = loader.parse(contents);
        const size = this.getObjectSize(object);

        if(!this.isZero(size)) {
            // Set object default animation
            this.setDefaultAnimation(object);
            
            // Change scale input value
            this.state.references.scaleInput.current.value = size.y;
            
            // Setup the mesh
            object.traverse( ( o ) => {
                if(o.isMesh) {
                    o.material = defaultMaterial;
                    o.castShadow = true;
                    o.receiveShadow = true;
                    modelReady = true;
                }
            });
            
            // Save the scale, mesh and modelReady
            this.setState(prevState => ({
                ...prevState,
                model: {
                    ...prevState.model,
                    isReady: modelReady,
                    mesh: object,
                    originalScale: size.y,
                    scale: 1 / size.y,
                }
            }));
        } else {
            this.onModelLoadingError(`This model doesn't have a skin, maybe it's an animation`);
        }
    };


    /** Update Model Scale.
     * 
     * Handles the scale of the model based on the original size.
     */
    onUpdateScale = () => {  
        const newScale = this.state.references.scaleInput.current.valueAsNumber / this.state.model.originalScale;
        this.state.model.mesh.scale.set(newScale,newScale,newScale);
        this.setState(prevState => ({
            ...prevState,
            model: {
                ...prevState.model,
                scale: newScale,
            },
        }));
    };

    /** On Scale Change
     * 
     * Updates the scale of the model based on the input value.
     * @param {input component} input 
     */
    onScaleChange = (input) => {
        if(input.target.value > 0) {
            this.onUpdateScale();
        } else {
            input.target.value = 1;
        }
    }

    /** On Animation Load.
     * 
     * Handles the loading of animation files from the computer.
     * @param {Event of loading a file} event 
     */
    loadAnimations = (event) => {
        
        if(event.target.files.length > 0) {
            const reader = new FileReader();

            // Set Events.
            reader.addEventListener('progress', this.onLoadingProgress);
            reader.addEventListener('error', this.onAnimationLoadingError);
            reader.addEventListener("load", this.onLoadAnimation);
            
            this.readMultipleFiles(reader, event.target.files);
        }
    };

    onLoadAnimation = (event) => {
        const contents = event.target.result;   
        const loader = new FBXLoader();

        // Parse model
        const object = loader.parse(contents);
        
        // Save animations in model
        object.traverse( ( o ) => {
            if(o.animations.length > 0) {
                const newAnimation = this.state.animations.mixer.clipAction(o.animations[0]);
                this.setState(prevState => ({
                    ...prevState,
                    animations: {
                        ...prevState.animations,
                        list: [...this.state.animations.list, newAnimation]
                    },
                }));
            }
        });
    };

    /** Read multiple files
     * 
     * Reads one or multiple files recieved.
     * @param {File reader} reader 
     * @param {Files trying to be loaded} files 
     */
    readMultipleFiles = (reader, files) => {
        const readFile = (index) => {
          if( index >= files.length ) {
            this.setState(prevState => ({
                ...prevState,
                model: {
                    ...prevState.model,
                    isReady: true 
            }}));
            return;
          } 
          var file = files[index];
          reader.onload = function(e) {
            readFile(index+1);
          }
          reader.readAsArrayBuffer(file);
        };
        
        readFile(0);
    };

    /* ERROR HANDLING */
    onModelLoadingError = (error) => {
        this.onLoadingError(`MODEL LOADING ERROR\n${error}`);
    };

    onAnimationLoadingError = (error) => {
        this.onLoadingError(`ANIMATION LOADING ERROR\n${error}`);
    };

    onLoadingError = (error) => {
        console.error(error);      
        alert(error);
    };

    /** Loading progress
     * 
     * Handles the "progress bar" of loading something.
     * @param {*} e 
     */
    onLoadingProgress = (e) => {
        console.log((e.loaded / e.total) * 100 + '% loaded');
    };

    /** On Animation Selected
     * 
     * Set the selected animation and save the index.
     * @param {Index of the selected animation} i 
     */
    onAnimationSelected = (i) => {
        this.setAction(i);
    };

    /** Set Active Action (animation)
     * 
     * @param {Index of the selected animation} animationIndex 
     */
    setAction = (animationIndex) => {
        const newAnimation = this.state.animations.list[animationIndex];
        if (newAnimation !== this.state.animations.active) {

            const oldAnimation = this.state.animations.active;
            const animationTime = newAnimation.getClip().duration;

            this.setState(prevState => ({
                ...prevState,
                animations: {
                    ...prevState.animations,
                    active: newAnimation,
                    activeFrame: 0,         
                    activeIndex: animationIndex,
                    activeMaxFrame: Math.round(animationTime * ANIMATION_FRAME_RATE),
                    last: oldAnimation ?? newAnimation,
                    singleFrameModeActive: false,
                },
            }));

            this.onChangedAnimation(newAnimation);
        }
    };

    /** On Changed Animation
     * 
     * Handles the transition from one animation into the other.
     * @param {The new animation that is going to be set} animation 
     */
    onChangedAnimation = (animation) => {
        this.state.animations.active.paused = true;
        this.state.animations.active?.fadeOut(1);
        
        if(animation) {
            animation.reset();
            animation.fadeIn(1);
            animation.paused = false;
            animation.time = 0;
            animation.play();
        }
    };

    /** Set Animation Frame Count
     * 
     * Set the amount of frames of the animation based on the duration of it. 
     * @param {animation duration} time 
     */
    setAnimationFrameCount = (time) => {
        let maxFrames = 30;

        if(time) {
            var framesInAnimation = Math.round(time * ANIMATION_FRAME_RATE);
            if(this.state.animations.activeMaxFrame !== framesInAnimation) {
                maxFrames = framesInAnimation === 0 ? 30 : framesInAnimation;
            }
        }

        this.setState(prevState => ({
            ...prevState,
            animations: {
                ...prevState.animations,
                activeMaxFrame: maxFrames,
            }
        }));
        
    };

    /** On Animation Frame Change
     * 
     * Set the animation on a specific frame based on the slider value.
     * @param {slider component} slider 
     */
    onAnimationFrameChange = (slider) => {
        var frame = slider.target.value;

        this.setState(prevState => ({
            ...prevState,
            animations: {
                ...prevState.animations,
                activeFrame: frame,
                singleFrameModeActive: true,
            }
        }));

        this.state.animations.active?.play();
        this.state.animations.active.paused = true;
        this.state.animations.active.time = frame / ANIMATION_FRAME_RATE;
        this.state.animations.mixer.update(0.1);
    };

    /** On Pause Continue
     * 
     * Toggles between animation play loop and single frame mode.
     */
    onPauseContinue = () => {
        if (this.state.animations.singleFrameModeActive) {
            this.unPauseAllActions();
        } else {     
            this.pauseAllActions();
        }

        this.setState(prevState => ({
            ...prevState,
            animations: {
                ...prevState.animations,
                singleFrameModeActive: !this.state.animations.singleFrameModeActive,
            }
        }));
    };

    /** Pause All Actions
     * 
     */
    pauseAllActions = () => {
        this.state.animations.list.forEach( function ( animation ) {
            animation.paused = true;
        } );
    };

    /** Unpause All Actions
     * 
     */
    unPauseAllActions = () => {
        this.state.animations.list.forEach( function ( animation ) {
            animation.paused = false;
        } );
    };

    /** Bake animation.
     * 
     * Bake the skinned mesh of the model.
     */
    bake = () => {
        const loader = new STLLoader();
        let posedMeshList = [];
        let geometries;

        // Traverse the scene to find the models
        this.state.renderer.scene.traverse( ( mesh ) => {
            if ( !mesh.isSkinnedMesh ) 
                return;

            if ( mesh.geometry.isBufferGeometry !== true ) 
                throw new Error( 'Only BufferGeometry supported.' );
            
            const posedObject = this.getPosedMesh(mesh);
            const posedMesh = loader.parse(posedObject.buffer);
            posedMeshList.push(posedMesh); 
        });

        
        // Join all the meshes together
        geometries = mergeBufferGeometries(posedMeshList);
        geometries.computeBoundingBox();

        // Creates the final mesh
        var finalMesh = new THREE.Mesh(
                geometries,
                new THREE.MeshBasicMaterial({ color: 0xd3d3d3d3 })
        );

        this.saveFile(finalMesh);
    };

    /** SaveFile.
     * 
     * Save a mesh as an STL file.
     * @param {mesh to export as an STL} mesh 
     */
    saveFile = (mesh) => {
        var str = this.getPosedMesh(mesh);
        var blob = new Blob( [str], { type : 'text/plain' } ); // Generate Blob from the string
        saveAs( blob, `${this.state.model.modelName}.stl` ); //Save the Blob to file.stl
    };

    /** Get Posed Mesh
     * 
     * Uses the STLExporter to create a mesh of the model posed.
     * @param {Sknned mesh} skinnedMesh 
     * @returns 
     */
    getPosedMesh = (skinnedMesh) => {
        var posedMeshData = this.state.exporters.stlExporter.parse( skinnedMesh, { binary: true } ); // Export the scene
        return posedMeshData;
    };


    /** Initialize Render
     * 
     * Initialize the 3D renderer with all the components inside (camera, lighting, etc).
     */
    initializeRender = () => {
        // attributes
        let camera, controls;
        const renderer = new THREE.WebGLRenderer();
        THREE.Cache.enabled = true;

        // Scene
        this.state.renderer.scene.add(new THREE.AxesHelper(15))

        // Background and fog
        this.state.renderer.scene.background = new THREE.Color( 0x303030 );
        this.state.renderer.scene.fog = new THREE.Fog( 0x303030, 10, 50 );

        // Lights
        const getHemiLight = () => {
            const hemiLight = new THREE.HemisphereLight( 0xfafafa, 0xfce3a2, 0.5);
            hemiLight.position.set( 0, 20, 0 );
            return hemiLight;
        };
        
        const getDirectLight = () => {
            const dirLight = new THREE.DirectionalLight( 0xfafafa );
            dirLight.position.set( - 3, 10, 10 );
            dirLight.lookAt(0,1,0);
            dirLight.castShadow = true;
            dirLight.shadow.camera.top = 2;
            dirLight.shadow.camera.bottom = - 2;
            dirLight.shadow.camera.left = - 2;
            dirLight.shadow.camera.right = 2;
            dirLight.shadow.camera.near = 0.1;
            dirLight.shadow.camera.far = 40;
            return dirLight;
        };

        // Ground
        const getGround = () => {
            const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0x575757, depthWrite: false } ) );
            mesh.rotation.x = - Math.PI / 2;
            mesh.receiveShadow = true;
            return mesh;
        };

        // Camera
        const getCamera = () => {
            var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
            camera.position.set( 1, 2, 3 );
            camera.lookAt( 0, 1, 0 );
            return camera;
        };

        // Render
        renderer.setSize(window.innerWidth, window.innerHeight);
        this.state.references.rendererContainer.current.innerHTML = '';
        this.state.references.rendererContainer.current.appendChild(renderer.domElement);

        // Camera
        camera = getCamera();
        controls = new OrbitControls(camera, renderer.domElement);

        // Controls
        controls.enableDamping = true
        controls.target.set(0, 1, 0)

        this.setState(prevState => ({
            ...prevState,
            renderer: {
                ...prevState.renderer,
                camera: camera,
                controls: controls,
                renderer: renderer,
            }
        }));
    
        // Compose scene
        this.state.renderer.scene.add(getGround());
        this.state.renderer.scene.add(getHemiLight());
        this.state.renderer.scene.add(getDirectLight());
    };

    startRenderer() {
        
        this.setState(prevState => ({
            ...prevState,
            renderer: {
                ...prevState.renderer,
                started: true,
            }
        }));

        const animationMixer = this.state.animations.mixer;
        const updateAnimationFrame = () => {this.updateActiveFrame(this);}
        const camera = this.state.renderer.camera;
        const clock = new THREE.Clock();
        const controls = this.state.renderer.controls;
        const renderer = this.state.renderer.renderer;
        const scene = this.state.renderer.scene;

        function animate() {
            requestAnimationFrame(() => {animate(this)});
        
            controls.update();

            updateAnimationFrame(this);
        
            animationMixer.update(clock.getDelta());
        
            renderer.render(scene, camera);
        };
        
        animate();
    }

    /** Update Active Frame
     * 
     * On every tick of the animation, the active frame is calculated based on the active animation time and the animation frame rate.
     */
    updateActiveFrame() {
        const activeFrame = Math.trunc(this.state.animations.active.time * ANIMATION_FRAME_RATE);

        this.setState(prevState => ({
            ...prevState,
            animations: {
                ...prevState.animations,
                activeFrame: activeFrame,
            }
        }));
    }

    componentDidUpdate() {
        if(this.state.animations.mixer && !this.state.renderer.started) {
            this.startRenderer();
        }

        if(this.state.model.mesh && this.state.model.mesh !== this.state.model.lastMesh) {
            this.setState(prevState => ({
                ...prevState,
                model: {
                    ...prevState.model,
                    lastMesh: this.state.model.mesh,
                }
            }));
            this.state.renderer.scene.add(this.state.model.mesh);
        }
    }
    
    componentDidMount() {
        this.initializeRender();
    }

    render() {
        return(
            <div className='app'>
                <Sidebar 
                    activeIndex={this.state.animations.activeIndex}
                    animationFrame={this.state.animations.activeFrame}
                    animationList={this.state.animations.list}
                    bake={this.bake}
                    getAnimationButtons={this.getAnimationButtons}
                    hasAnimations={this.state.animations.list.length > 1}
                    maxAnimationFrame={this.state.animations.activeMaxFrame}
                    modelReady={this.state.model.isReady}
                    onAnimationFrameChange={this.onAnimationFrameChange}
                    onAnimationLoad={this.loadAnimations}
                    onAnimationSelected={this.onAnimationSelected}
                    onModelLoad={this.loadModel}
                    onPauseContinue={this.onPauseContinue}
                    onScaleChange={this.onScaleChange}
                    scaleRef={this.state.references.scaleInput}
                    singleStepMode={this.state.animations.singleFrameModeActive}
                />
                <div className='renderer' ref={this.state.references.rendererContainer}></div>
            </div>
        );
    }
};

export default Composer;