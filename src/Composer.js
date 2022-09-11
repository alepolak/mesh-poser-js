import React, { Component }  from "react";
import './Composer.css';
import Sidebar from "./Sidebar";
import * as THREE from 'three';
import { STLExporter } from "./STLExporter";
import {ANIMATION_FRAME_RATE} from "./const"

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
                activeFrame: undefined,
                activeIndex: undefined,
                activeMaxFrame: undefined,
                last: undefined,
                list: [],
                mixer: undefined,
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
            const animationAction = this.state.animations.mixer.clipAction(object.animations[0]);
            this.setState(prevState => ({
                ...prevState,
                animations: {
                    ...prevState.animations,
                    active: animationAction,
                    list: [animationAction],
                },
            }));
        }
    };

    /** On Model Load.
     * 
     * Handles the loading of a new file from the computer.
     * @param {Event of loading a file} event 
     */
    onModelLoad = (event) => {
        const reader = new FileReader();  
        
        // Remove old model from scene.
        this.state.renderer.scene.remove(this.state.model.mesh);
        
        // Save model name.
        this.setState(prevState => ({
            ...prevState,
            model: {
                ...prevState.model,
                modelName: event.currentTarget.files[0].name.split('.')[0]
            },
        }));
        
        // Set Events.
        reader.addEventListener('progress', onLoadingProgress);
        reader.addEventListener('error', onModelLoadingError);
        reader.addEventListener("load", function(event) {

            const defaultMaterial = new THREE.MeshStandardMaterial({ color: 0xa3a2a2, metalness: 0.1, flatShading: true });
            const contents = event.target.result;
            const loader = new FBXLoader();
            let modelReady = false;

            // Parse model
            const object = loader.parse(contents);
            const size = getObjectSize(object);

            // Set object default animation
            setDefaultAnimation(object);

            // Change scale input value
            this.state.references.scaleInput.current.value = size.y;
            
            // Setup the mesh
            object.traverse( function ( o ) {
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
        });
        
        reader.readAsArrayBuffer(event.target.files[0]);
    };

    /** Update Model Scale.
     * 
     * Handles the scale of the model based on the original size.
     */
    onUpdateScale = () => {  
        const newScale = this.state.references.scaleInput.current.valueAsNumber / this.state.model.originalScale;
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
            onUpdateScale();
        } else {
            input.target.value = 1;
        }
    }

    /** On Animation Load.
     * 
     * Handles the loading of animation files from the computer.
     * @param {Event of loading a file} event 
     */
    onAnimationLoad = (event) => {
        
        if(event.target.files.length > 0) {
            const reader = new FileReader();

            // Set Events.
            reader.addEventListener('progress', onLoadingProgress);
            reader.addEventListener('error', onAnimationLoadingError);
            reader.addEventListener("load", function(event) {
            
                const contents = event.target.result;   
                const loader = new FBXLoader();

                // Parse model
                const object = loader.parse(contents);
                
                // Save animations in model
                object.traverse( function ( o ) {
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
            });
            
            readMultipleFiles(reader, event.target.files);
        }
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
        onLoadingError(error);
    };

    onAnimationLoadingError = (error) => {
        onLoadingError(error);
    };

    onLoadingError = (error) => {
        console.log(error);
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
     * @param {animation index} i 
     */
    onAnimationSelected = (i) => {
        this.setState(prevState => ({
            ...prevState,
            animations: {
                ...prevState.animations,
                active: this.state.animations.list[i],
                activeIndex: i,
            },
        }));
    };

    /** Get Animation buttons
     * 
     * Create a radio button per every animation loaded.
     * @returns a list of animation radio buttons.
     */
    getAnimationButtons = () => {
        return this.state.animations.list.map( function(animation, i){
            return (
                <label className='animation__play__radio' key={i}>
                    <input type="radio" value="option1" onChange={() => {onAnimationSelected(i)}} checked={this.state.animations.activeIndex === i} />
                    Animation {i} 
                </label>
            )
        }); 
    };

    /** Set Active Action (animation)
     * 
     * @param {new action} toAction 
     */
    setAction = (toAction) => {
        if (toAction !== this.state.animations.active) {
            this.setState(prevState => ({
                ...prevState,
                animations: {
                    ...prevState.animations,
                    active: toAction,
                    last: activeAction,
                    singleFrameModeActive: true,
                },
            }));
        }
    };

    /** On Changed Animation
     * 
     * Handles the transition from one animation into the other.
     */
    onChangedAnimation = () => {
        this.state.animations.last?.fadeOut(1);
        
        if(activeAction) {
            this.state.animations.active.reset();
            this.state.animations.active.fadeIn(1);
            this.state.animations.active.play();
            this.state.animations.active.paused = false;

            this.setState(prevState => ({
                ...prevState,
                animations: {
                    ...prevState.animations,
                    activeFrame: 0,
                    activeMaxFrame: this.state.animations.active.getClip().duration,
                }
            }));
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
            if(this.state.animations.activeMaxFrame != framesInAnimation) {
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
        if (singleFrameMode) {
            setSingleFrameMode(false);
            unPauseAllActions();
        } else {     
            setSingleFrameMode(true);
            pauseAllActions();
        }
    };

    /** Pause All Actions
     * 
     */
    pauseAllActions = () => {
        animationActions.forEach( function ( action ) {
            action.paused = true;
        } );
    };

    /** Unpause All Actions
     * 
     */
    unPauseAllActions = () => {
        animationActions.forEach( function ( action ) {
            action.paused = false;
        } );
    };

    /** Bake animation.
     * 
     * Bake the skinned mesh of the model.
     */
    bake = () => {
        const loader = new STLLoader();
        let posedMeshList = [];
        let geom;

        scene.traverse( function ( mesh ) {
            if ( !mesh.isSkinnedMesh ) 
                return;

            if ( mesh.geometry.isBufferGeometry !== true ) 
                throw new Error( 'Only BufferGeometry supported.' );
            
            const posedObject = getPosedMesh(mesh);
            const posedMesh = loader.parse(posedObject.buffer);
            posedMeshList.push(posedMesh); 
        });

        
        // Join all the meshes together
        geom = mergeBufferGeometries(posedMeshList);
        geom.computeBoundingBox();

        // Creates the final mesh
        var finalMesh = new THREE.Mesh(
                geom,
                new THREE.MeshBasicMaterial({ color: 0xd3d3d3d3 })
        );

        saveFile(finalMesh);
    };

    /** SaveFile.
     * 
     * Save a mesh as an STL file.
     * @param {mesh to export as an STL} mesh 
     */
    saveFile = (mesh) => {
        var str = getPosedMesh(mesh);
        var blob = new Blob( [str], { type : 'text/plain' } ); // Generate Blob from the string
        saveAs( blob, `${modelName}.stl` ); //Save the Blob to file.stl
    };

    /** Get Posed Mesh
     * 
     * Uses the STLExporter to create a mesh of the model posed.
     * @param {Sknned mesh} skinnedMesh 
     * @returns 
     */
    getPosedMesh = (skinnedMesh) => {
        var posedMeshData = stlExporter.parse( skinnedMesh, { binary: true } ); // Export the scene
        return posedMeshData;
    };


    /** Initialize Render
     * 
     * Initialize the 3D renderer with all the components inside (camera, lighting, etc).
     * @param {animation mixer} animationMixer 
     */
    initializeRender = (animationMixer) => {
        // attributes
        let camera, controls;
        const renderer = new THREE.WebGLRenderer();
        const clock = new THREE.Clock();
        THREE.Cache.enabled = true;

        // Scene
        scene.add(new THREE.AxesHelper(15))

        // Background and fog
        scene.background = new THREE.Color( 0x303030 );
        scene.fog = new THREE.Fog( 0x303030, 10, 50 );

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
        container.current.innerHTML = '';
        container.current.appendChild(renderer.domElement);

        // Camera
        camera = getCamera();
        controls = new OrbitControls(camera, renderer.domElement);

        // Controls
        controls.enableDamping = true
        controls.target.set(0, 1, 0)
    
        // Compose scene
        scene.add(getGround());
        scene.add(getHemiLight());
        scene.add(getDirectLight());
    
        function animate() {
            requestAnimationFrame(animate);
        
            controls.update();
        
            animationMixer.update(clock.getDelta());
        
            renderer.render(scene, camera);
        };
        
        animate();
    };

    render() {
        return(
            <div className='app'>
                <Sidebar 
                    animationFrame={animationFrame}
                    bake={bake}
                    getAnimationButtons={getAnimationButtons}
                    hasAnimations={animationActions.length > 1}
                    maxAnimationFrame={maxAnimationFrame}
                    modelReady={modelReady}
                    onAnimationLoad={onAnimationLoad}
                    onAnimationFrameChange={onAnimationFrameChange}
                    onModelLoad={onModelLoad}
                    onPauseContinue={onPauseContinue}
                    onScaleChange={onScaleChange}
                    scaleRef={scaleRef}
                    singleStepMode={singleFrameMode}
                />
                <div className='renderer' ref={container}></div>
            </div>
        );
    }
};

export default Composer;