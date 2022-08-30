import React, {useRef, useEffect, useState} from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { saveAs } from 'file-saver';
import { STLExporter } from './STLExporter';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import './Poser.css';
import Sidebar from './Sidebar';
import icons from './Icons';

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
    let [singleStepMode, setSingleStepMode] = useState(false);
    let [selectedAnimationIndex, setSelectedAnimationIndex] = useState();

    let [scene, setScene] = useState(new THREE.Scene());

    useEffect(() => {
        if(!initialized && modelReady && animationMixer){
            setInitialized(true);
            init(animationMixer);
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
    
        console.log(`Use Effect --> ${modelReady}`);

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
            setAnimationActions(prevArray => [...prevArray, animationAction]);
            setActiveAction(animationActions[0]);
        }
    };

    /** On File Change.
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

    const onModelLoadingError = (error) => {
        onLoadingError(error);
    };

    const onAnimationLoadingError = (error) => {
        onLoadingError(error);
    };

    const onLoadingError = (error) => {
        console.log(error);
    };

    const onLoadingProgress = (e) => {
        console.log((e.loaded / e.total) * 100 + '% loaded');
    };

    const onAnimationSelected = (i) => {
        setSelectedAnimationIndex(i);
        setAction(animationActions[i]);
    };

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

    const setAction = (toAction) => {
        if (toAction !== activeAction) {
            setSingleStepMode(false);
            setLastAction(activeAction);
            setActiveAction(toAction);
        }
    };

    const onChangedAnimation = () => {
        lastAction?.fadeOut(1);
        
        if(activeAction) {
            activeAction.reset();
            activeAction.paused = false;
            activeAction.fadeIn(1);
            activeAction.play();
            setAnimationFrameCount(activeAction.getClip().duration);
        }
    };

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

    /** Update Model Scale.
     * 
     */
    const onUpdateScale = () => {
        setFbxScale(scaleRef.current.valueAsNumber / fbxOriginalScale);
    };

    /** Bake animation.
     * 
     * Bake the skinned mesh of the model.
     */
    function bake() {
        console.log("BAKE");
        scene.traverse( function ( object ) {
            if ( !object.isSkinnedMesh ) return;
            if ( object.geometry.isBufferGeometry !== true ) throw new Error( 'Only BufferGeometry supported.' );
            SaveFile(object);
        });
    };

    /** SaveFile.
     * 
     * Save a mesh as an STL file.
     * @param {mesh to export as an STL} mesh 
     */
    const SaveFile = (mesh) => {
        var exporter = new STLExporter();
        var str = exporter.parse( mesh, { binary: true } ); // Export the scene
        var blob = new Blob( [str], { type : 'text/plain' } ); // Generate Blob from the string
        saveAs( blob, `${modelName}.stl` ); //Save the Blob to file.stl
    };

    const onAnimationFrameChange = (e) => {
        var frame = e.target.value;
        setAnimationFrame(frame);
        setSingleStepMode(true);
        activeAction?.play();
        activeAction.paused = true;
        activeAction.time = frame / ANIMATION_FRAME_RATE;
        animationMixer.update(0.1);
    };

    const onPauseContinue = () => {
        if (singleStepMode) {
            setSingleStepMode(false);
            unPauseAllActions();
        } else {     
            setSingleStepMode(true);
            pauseAllActions();
        }
    };

    const pauseAllActions = () => {
        animationActions.forEach( function ( action ) {
            action.paused = true;
        } );
    };

    const unPauseAllActions = () => {
        animationActions.forEach( function ( action ) {
            action.paused = false;
        } );
    };

    const init = (animationMixer) => {
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
                onUpdateScale={onUpdateScale}
                scaleRef={scaleRef}
            />
            <div className='renderer' ref={container}></div>
        </div>
    );
};

export default Poser;

