import React, {useRef, useEffect, useState} from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { saveAs } from 'file-saver';
import { STLExporter } from './STLExporter';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { mergeBufferGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils';
import './Poser.css';
import Sidebar from './Sidebar';

const Poser = () => {

    const ANIMATION_FRAME_RATE = 30;

    let container = useRef();
    let scaleRef = useRef();
    let [initialized, setInitialized] = useState(false);

    // Model
    let [modelName, setModelName] = useState();
    let [fbxModel, setFbxModel] = useState();
    let [fbxLastModel, setFbxLastModel] = useState();
    let [fbxScale, setFbxScale] = useState();
    let [fbxOriginalScale, setFbxOriginalScale] = useState();
    let [modelReady, setModelReady] = useState();    

    // Animations
    let [animationMixer, setAnimationMixer] = useState();
    let [animationActions, setAnimationActions] = useState([]);
    let [activeAction, setActiveAction] = useState();
    let [lastAction, setLastAction] = useState();
    let [animationFrame, setAnimationFrame] = useState(0);
    let [maxAnimationFrame, setMaxAnimationFrame] = useState(30);
    let [singleFrameMode, setSingleFrameMode] = useState(false);
    let [selectedAnimationIndex, setSelectedAnimationIndex] = useState();

    let [scene, setScene] = useState(new THREE.Scene());
    let [stlExporter, setStlExporter] = useState(new STLExporter());

    useEffect(() => {
        if(!initialized && modelReady && animationMixer){
            setInitialized(true);
            initializeRender(animationMixer);
        }

        if(fbxModel && fbxModel !== fbxLastModel) {
            setFbxLastModel(fbxModel);
            scene.add(fbxModel);
        }

        if(fbxScale) {
            fbxModel.scale.set(fbxScale,fbxScale,fbxScale);
        }

        if(modelReady && animationMixer) {
            onChangedAnimation();
        }

    },[fbxModel, fbxScale, animationActions, activeAction, animationMixer, modelReady, maxAnimationFrame]);

    /** Get Object Size
     * 
     * @param {model} object 
     * @returns the size of the model. 
     */
    const getObjectSize = (object) => {
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
    const setDefaultAnimation = (object) => {
        var mix = new THREE.AnimationMixer(object);
        setAnimationMixer(mix);

        if(object.animations.length !== 0) {
            const animationAction = mix.clipAction(object.animations[0]);
            setAnimationActions([animationAction]);
            setActiveAction(animationActions[0]);
        }
    };

    /** On Model Load.
     * 
     * Handles the loading of a new file from the computer.
     * @param {Event of loading a file} event 
     */
    const onModelLoad = (event) => {
        setModelName(event.currentTarget.files[0].name.split('.')[0]);
        scene.remove(fbxModel);
        const reader = new FileReader();  
        reader.addEventListener('progress', onLoadingProgress);
        reader.addEventListener('error', onModelLoadingError);
        reader.addEventListener("load", function(event) {

            const contents = event.target.result;
        
            const loader = new FBXLoader();
            const object = loader.parse(contents);
            
            setDefaultAnimation(object);
            const size = getObjectSize(object);
            setFbxOriginalScale(size.y);       
            setFbxScale(1 / fbxOriginalScale);
            scaleRef.current.value = size.y;

            object.traverse( function ( o ) {
                if(o.isMesh) {
                    o.receiveShadow = true;
                    o.castShadow = true;
                    setModelReady(true);
                }
            });
            
            setFbxModel(object);
        });
        
        reader.readAsArrayBuffer(event.target.files[0]);
    };

    /** Update Model Scale.
     * 
     * Handles the scale of the model based on the original size.
     */
     const onUpdateScale = () => {  
        setFbxScale(scaleRef.current.valueAsNumber / fbxOriginalScale);
    };

    /** On Scale Change
     * 
     * Updates the scale of the model based on the input value.
     * @param {input component} input 
     */
    const onScaleChange = (input) => {
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
    const onAnimationLoad = (event) => {
        
        if(event.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('progress', onLoadingProgress);
            reader.addEventListener('error', onAnimationLoadingError);
            reader.addEventListener("load", function(e) {
            
                const contents = e.target.result;
                
                const loader = new FBXLoader();
                const object = loader.parse(contents);
                
                object.traverse( function ( o ) {
                    if(o.animations.length > 0) {
                        const animationAction = animationMixer.clipAction(o.animations[0]);
                        setAnimationActions(prevArray => [...prevArray, animationAction]);
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
    const readMultipleFiles = (reader, files) => {
        const readFile = (index) => {
          if( index >= files.length ) {
            setModelReady(true);
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
    const onModelLoadingError = (error) => {
        onLoadingError(error);
    };

    const onAnimationLoadingError = (error) => {
        onLoadingError(error);
    };

    const onLoadingError = (error) => {
        console.log(error);
    };

    /** Loading progress
     * 
     * Handles the "progress bar" of loading something.
     * @param {*} e 
     */
    const onLoadingProgress = (e) => {
        console.log((e.loaded / e.total) * 100 + '% loaded');
    };

    /** On Animation Selected
     * 
     * Set the selected animation and save the index.
     * @param {animation index} i 
     */
    const onAnimationSelected = (i) => {
        setSelectedAnimationIndex(i);
        setAction(animationActions[i]);
    };

    /** Get Animation buttons
     * 
     * Create a radio button per every animation loaded.
     * @returns a list of animation radio buttons.
     */
    const getAnimationButtons = () => {
        return animationActions.map( function(animation, i){
            return (
                <label className='animation__play__radio' key={i}>
                    <input type="radio" value="option1" onChange={() => {onAnimationSelected(i)}} checked={selectedAnimationIndex === i} />
                    Animation {i} 
                </label>
            )
        }); 
    };

    /** Set Active Action (animation)
     * 
     * @param {new action} toAction 
     */
    const setAction = (toAction) => {
        if (toAction !== activeAction) {
            setSingleFrameMode(false);
            setLastAction(activeAction);
            setActiveAction(toAction);
        }
    };

    /** On Changed Animation
     * 
     * Handles the transition from one animation into the other.
     */
    const onChangedAnimation = () => {
        lastAction?.fadeOut(1);
        
        if(activeAction) {
            setAnimationFrame(0);
            activeAction.reset();
            activeAction.paused = false;
            activeAction.fadeIn(1);
            activeAction.play();
            setAnimationFrameCount(activeAction.getClip().duration);
        }
    };

    /** Set Animation Frame Count
     * 
     * Set the amount of frames of the animation based on the duration of it. 
     * @param {animation duration} time 
     */
    const setAnimationFrameCount = (time) => {

        if(!time) {
            setMaxAnimationFrame(30);
        } else {
            var framesInAnimation = Math.round(time * ANIMATION_FRAME_RATE);
            if(maxAnimationFrame != framesInAnimation) {
                setMaxAnimationFrame(framesInAnimation === 0 ? 30 : framesInAnimation);
            }
        }
    };

    /** On Animation Frame Change
     * 
     * Set the animation on a specific frame based on the slider value.
     * @param {slider component} slider 
     */
    const onAnimationFrameChange = (slider) => {
        var frame = slider.target.value;
        setAnimationFrame(frame);
        setSingleFrameMode(true);
        activeAction?.play();
        activeAction.paused = true;
        activeAction.time = frame / ANIMATION_FRAME_RATE;
        animationMixer.update(0.1);
    };

    /** On Pause Continue
     * 
     * Toggles between animation play loop and single frame mode.
     */
    const onPauseContinue = () => {
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
    const pauseAllActions = () => {
        animationActions.forEach( function ( action ) {
            action.paused = true;
        } );
    };

    /** Unpause All Actions
     * 
     */
    const unPauseAllActions = () => {
        animationActions.forEach( function ( action ) {
            action.paused = false;
        } );
    };

    /** Bake animation.
     * 
     * Bake the skinned mesh of the model.
     */
    const bake = () => {
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
    const saveFile = (mesh) => {
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
    const getPosedMesh = (skinnedMesh) => {
        var posedMeshData = stlExporter.parse( skinnedMesh, { binary: true } ); // Export the scene
        return posedMeshData;
    };


    /** Initialize Render
     * 
     * Initialize the 3D renderer with all the components inside (camera, lighting, etc).
     * @param {animation mixer} animationMixer 
     */
    const initializeRender = (animationMixer) => {
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
};

export default Poser;

