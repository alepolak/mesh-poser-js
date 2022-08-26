import React, {useRef, useEffect, useState} from 'react';
import * as THREE from 'three';
import GUI from 'lil-gui'; 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { saveAs } from 'file-saver';
import { STLExporter } from './STLExporter';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { DirectionalLight } from 'three';

const Poser = () => {

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

    //let [loader, setLoader] = useState(new THREE.FileLoader()); TODO --> REMOVE
    let [scene, setScene] = useState(new THREE.Scene());

    const getData = () => {
        return {
            a: modelReady,
            b: animationMixer,
        }
    };

    useEffect(() => {
        if(!initialized){
            setInitialized(true);
            init(getData);
        }

        if(fbxModel && fbxModel !== fbxLastModel) {
            setFbxLastModel(fbxModel);
            scene.add(fbxModel);
        }

        if(fbxScale) {
            fbxModel.scale.set(fbxScale,fbxScale,fbxScale);
        }

        if(modelReady) {
            onChangedAnimation();
        }

       
        console.log(`USE EFFECT --  modelReady: ${modelReady}, animationMixer: ${animationMixer}`);
    },[fbxModel, fbxScale, animationActions, activeAction, animationMixer, modelReady]);

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
            
            object.traverse( function ( o ) {
                if(o.isMesh) {
                    o.receiveShadow = true;
                    o.castShadow = true;
                    const size = getObjectSize(o);
                    setDefaultAnimation(o);
                    setFbxOriginalScale(size.y);       
                    setFbxScale(1 / fbxOriginalScale);
                    scaleRef.current.value = size.y;
                    setModelReady(true);
                }
            });
            
            setFbxModel(object);
        });
        
        reader.readAsArrayBuffer(event.target.files[0]);
    };

    const onAnimationLoad = (event) => {
        
        if(event.target.files.length > 0) {
            const animationName = event.currentTarget.files[0].name.split('.')[0];
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

    const getAnimationButtons = () => {
        return animationActions.map( function(animation, i){
            return <button key={i} onClick={() => {onAnimationClicked(i)} }> Animation {i} </button>
        }); 
    };

    const onAnimationClicked = (i) => {
        console.log(`Animation ${i} clicked`);
        setAction(animationActions[i]);
    };

    const setAction = (toAction) => {
        if (toAction != activeAction) {
            setLastAction(activeAction);
            setActiveAction(toAction);
        }
    };

    const onChangedAnimation = () => {
        lastAction?.fadeOut(1);
        activeAction?.reset();
        activeAction?.fadeIn(1);
        activeAction?.play();
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

    const init = (getData) => {

        let {modelReady, animationMixer} = getData();
        console.log(`modelReady: ${modelReady}, animationMixer: ${animationMixer}`);

        // attributes
        let camera, controls;
        const renderer = new THREE.WebGLRenderer();
        const clock = new THREE.Clock();
        THREE.Cache.enabled = true;

        // Scene
        scene.add(new THREE.AxesHelper(15))

        // Background and fog
        scene.background = new THREE.Color( 0xa0a0a0 );
        scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );

        // Lights
        const getHemiLight = () => {
            const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xfce3a2);
            hemiLight.position.set( 0, 20, 0 );
            return hemiLight;
        };
        
        const getDirectLight = () => {
            const dirLight = new THREE.DirectionalLight( 0xffffff );
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
            const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
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

        // Model and animations
        /*fbxLoader.load(
            '../models/swat.fbx',
            (object) => {
                object.scale.set(0.01, 0.01, 0.01)
                object.receiveShadow = true;
                object.castShadow = true;
                mixer = new THREE.AnimationMixer(object)
        
                const animationAction = mixer.clipAction(
                    object.animations[0]
                )
                animationActions.push(animationAction)
                animationsFolder.add(animations, 'default')
                activeAction = animationActions[0]
        
                scene.add(object)
        
                //add an animation from another file
                fbxLoader.load(
                    '../models/animation-kick.fbx',
                    (object) => {
                        console.log('loaded samba')
        
                        const animationAction = mixer.clipAction(
                            object.animations[0]
                        )
                        animationActions.push(animationAction)
                        animationsFolder.add(animations, 'samba')
        
                        //add an animation from another file
                        fbxLoader.load(
                            '../models/animation-zombie.fbx',
                            (object) => {
                                console.log('loaded bellydance')
                                const animationAction = mixer.clipAction(
                                    object.animations[0]
                                )
                                animationActions.push(animationAction)
                                animationsFolder.add(animations, 'bellydance')
        
                                //add an animation from another file
                                fbxLoader.load(
                                    '../models/animation-hiphop.fbx',
                                    (object) => {
                                        console.log('loaded goofyrunning');
                                        object.animations[0].tracks.shift() //delete the specific track that moves the object forward while running
                                        //console.dir((object as THREE.Object3D).animations[0])
                                        const animationAction = mixer.clipAction(
                                            object.animations[0]
                                        )
                                        animationActions.push(animationAction)
                                        animationsFolder.add(animations, 'goofyrunning')
        
                                        modelReady = true
                                    },
                                    (xhr) => {
                                        console.log(
                                            (xhr.loaded / xhr.total) * 100 + '% loaded'
                                        )
                                    },
                                    (error) => {
                                        console.log(error)
                                    }
                                )
                            },
                            (xhr) => {
                                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                            },
                            (error) => {
                                console.log(error)
                            }
                        )
                    },
                    (xhr) => {
                        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                    },
                    (error) => {
                        console.log(error)
                    }
                )
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        )*/
        
        // GUI
        const gui = new GUI();
        const animationsFolder = gui.addFolder('Animations');
        animationsFolder.open();      
        
        function animate() {
            let {a, b} = getData();
            console.log(`INSIDE ANIMATE modelReady: ${a}, animationMixer: ${b}`);

            requestAnimationFrame(animate);
        
            controls.update();
        
            if (a && b !== null) {
                b.update(clock.getDelta());
            }
        
            render();
            //stats.update()
        }
        
        function render() {
            renderer.render(scene, camera)
        }
        
        animate();
    };

    

    return(
        <div>  
            <div> 
                <input type="file" accept=".fbx" onChange={onModelLoad} />  
                <input ref={scaleRef} type="number" />
                <button onClick={onUpdateScale}> Update Scale </button>
            </div>
            <div>
                <input type="file" accept=".fbx" onChange={onAnimationLoad} multiple/>
                <div>
                    {getAnimationButtons()}
                </div> 
            </div>
            <div>     
                <button onClick={bake}> Bake mesh </button>
            </div>
            <div ref={container}></div>
        </div>
    );
};

export default Poser;

