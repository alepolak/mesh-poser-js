import React, {useRef, useEffect} from 'react';
import * as THREE from 'three';
import GUI from 'lil-gui'; 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { saveAs } from 'file-saver';
import { STLExporter } from './STLExporter';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

const Poser = () => {

    const container = useRef();
    const info = useRef();
    let initialized = false;

    let scene , renderer , camera , stats ;
    let model , skeleton , mixer , clock ;

    const crossFadeControls  = [];

    let idleAction , walkAction , runAction ;
    let idleWeight , walkWeight , runWeight ;
    let actions , settings ;

    let singleStepMode = false;
    let sizeOfNextStep = 0;

    useEffect(() => {
        if(!initialized) {
            initialized = true;
            init();
        }
    },);
    

    function init() {
        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
        camera.position.set( 1, 2, - 3 );
        camera.lookAt( 0, 1, 0 );

        clock = new THREE.Clock();

        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xa0a0a0 );
        scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );

        const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
        hemiLight.position.set( 0, 20, 0 );
        scene.add( hemiLight );

        const dirLight = new THREE.DirectionalLight( 0xffffff );
        dirLight.position.set( - 3, 10, - 10 );
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 2;
        dirLight.shadow.camera.bottom = - 2;
        dirLight.shadow.camera.left = - 2;
        dirLight.shadow.camera.right = 2;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 40;
        scene.add( dirLight );

        // scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

        // ground

        const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        scene.add( mesh );


        /** LOAD SCENE */
        
        const LoadScene = (sceneToLoad, animationArray) => {
            model = sceneToLoad;
            model.name = "Robotito";
            scene.add( model );

            model.traverse( function ( object  ) {

                if ( object.isMesh ) {

                    object.castShadow = true;
                }

            } );

            //

            skeleton = new THREE.SkeletonHelper( model );
            skeleton.visible = false;
            scene.add( skeleton );

            //

            createPanel();


            //

            const animations = animationArray;

            mixer = new THREE.AnimationMixer( model );

            idleAction = mixer.clipAction( animations[ 0 ] );
            walkAction = mixer.clipAction( animations[ 3 ] );
            runAction = mixer.clipAction( animations[ 1 ] );

            actions = [ idleAction, walkAction, runAction ];

            activateAllActions();

            animate();

        };

        /** GLTF LOADER */
        const loader = new GLTFLoader();
        loader.load( '../models/Soldier.glb', function ( gltf  ) {
            LoadScene(gltf.scene, gltf.animations);
        } );

        
        /** FBX LOADER */
        const fbxLoader = new FBXLoader();
        fbxLoader.load(
            '../models/Dummy.fbx',
            (object) => {
                // object.traverse(function (child) {
                //     if ((child as THREE.Mesh).isMesh) {
                //         // (child as THREE.Mesh).material = material
                //         if ((child as THREE.Mesh).material) {
                //             ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).transparent = false
                //         }
                //     }
                // })
                object.scale.set(.01, .01, .01)
                LoadScene(object);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        )


        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.enabled = true;
        if(container != null)
            container.current?.appendChild( renderer.domElement );

        window.addEventListener( 'resize', onWindowResize );

    }

    function createPanel() {

        const panel = new GUI( { width: 310 } );

        const folder0 = panel.addFolder( 'BAKE' );
        const folder1 = panel.addFolder( 'Visibility' );
        const folder2 = panel.addFolder( 'Activation/Deactivation' );
        const folder3 = panel.addFolder( 'Pausing/Stepping' );
        const folder4 = panel.addFolder( 'Crossfading' );
        const folder5 = panel.addFolder( 'Blend Weights' );
        const folder6 = panel.addFolder( 'General Speed' );

        settings = {    
            'bake': bake,
            'show model': true,
            'show skeleton': false,
            'deactivate all': deactivateAllActions,
            'activate all': activateAllActions,
            'pause/continue': pauseContinue,
            'make single step': toSingleStepMode,
            'modify step size': 0.05,
            'from walk to idle': function () {

                prepareCrossFade( walkAction, idleAction, 1.0 );

            },
            'from idle to walk': function () {

                prepareCrossFade( idleAction, walkAction, 0.5 );

            },
            'from walk to run': function () {

                prepareCrossFade( walkAction, runAction, 2.5 );

            },
            'from run to walk': function () {

                prepareCrossFade( runAction, walkAction, 5.0 );

            },
            'use default duration': true,
            'set custom duration': 3.5,
            'modify idle weight': 0.0,
            'modify walk weight': 1.0,
            'modify run weight': 0.0,
            'modify time scale': 1.0
        };

        folder0.add( settings, 'bake' );
        folder1.add( settings, 'show model' ).onChange( showModel );
        folder1.add( settings, 'show skeleton' ).onChange( showSkeleton );
        folder2.add( settings, 'deactivate all' );
        folder2.add( settings, 'activate all' );
        folder3.add( settings, 'pause/continue' );
        folder3.add( settings, 'make single step' );
        folder3.add( settings, 'modify step size', 0.01, 0.1, 0.001 );
        crossFadeControls.push( folder4.add( settings, 'from walk to idle' ) );
        crossFadeControls.push( folder4.add( settings, 'from idle to walk' ) );
        crossFadeControls.push( folder4.add( settings, 'from walk to run' ) );
        crossFadeControls.push( folder4.add( settings, 'from run to walk' ) );
        folder4.add( settings, 'use default duration' );
        folder4.add( settings, 'set custom duration', 0, 10, 0.01 );
        folder5.add( settings, 'modify idle weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight  ) {

            setWeight( idleAction, weight );

        } );
        folder5.add( settings, 'modify walk weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight  ) {

            setWeight( walkAction, weight );

        } );
        folder5.add( settings, 'modify run weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight  ) {

            setWeight( runAction, weight );

        } );
        folder6.add( settings, 'modify time scale', 0.0, 1.5, 0.01 ).onChange( modifyTimeScale );

        folder0.open();
        folder1.open();
        folder2.open();
        folder3.open();
        folder4.open();
        folder5.open();
        folder6.open();

    }


    function showModel( visibility  ) {

        model.visible = visibility;

    }


    function showSkeleton( visibility  ) {

        skeleton.visible = visibility;

    }


    function modifyTimeScale( speed  ) {

        mixer.timeScale = speed;

    }


    function deactivateAllActions() {

        actions.forEach( function ( action  ) {

            action.stop();

        } );

    }

    function bake() {
        console.log("BAKE");
        model.traverse( function ( object ) {
            console.log(object.isSkinnedMesh);
            if ( !object.isSkinnedMesh ) return;
            if ( object.geometry.isBufferGeometry !== true ) throw new Error( 'Only BufferGeometry supported.' );
            SaveFile(object);
        });
    }

    const SaveFile = (mesh) => {
        var exporter = new STLExporter();
        var str = exporter.parse( mesh, { binary: true } ); // Export the scene
        var blob = new Blob( [str], { type : 'text/plain' } ); // Generate Blob from the string
        saveAs( blob, 'file.stl' ); //Save the Blob to file.stl
    }


    function activateAllActions() {

        setWeight( idleAction, settings[ 'modify idle weight' ] );
        setWeight( walkAction, settings[ 'modify walk weight' ] );
        setWeight( runAction, settings[ 'modify run weight' ] );

        actions.forEach( function ( action  ) {

            action.play();

        } );

    }

    function pauseContinue() {

        if ( singleStepMode ) {

            singleStepMode = false;
            unPauseAllActions();

        } else {

            if ( idleAction.paused ) {

                unPauseAllActions();

            } else {

                pauseAllActions();

            }

        }

    }

    function pauseAllActions() {

        actions.forEach( function ( action  ) {

            action.paused = true;

        } );

    }

    function unPauseAllActions() {

        actions.forEach( function ( action  ) {

            action.paused = false;

        } );

    }

    function toSingleStepMode() {

        unPauseAllActions();

        singleStepMode = true;
        sizeOfNextStep = settings[ 'modify step size' ];

    }

    function prepareCrossFade( startAction , endAction , defaultDuration  ) {

        // Switch default / custom crossfade duration (according to the user's choice)

        const duration = setCrossFadeDuration( defaultDuration );

        // Make sure that we don't go on in singleStepMode, and that all actions are unpaused

        singleStepMode = false;
        unPauseAllActions();

        // If the current action is 'idle' (duration 4 sec), execute the crossfade immediately;
        // else wait until the current action has finished its current loop

        if ( startAction === idleAction ) {

            executeCrossFade( startAction, endAction, duration );

        } else {

            synchronizeCrossFade( startAction, endAction, duration );

        }

    }

    function setCrossFadeDuration( defaultDuration  ) {

        // Switch default crossfade duration <-> custom crossfade duration

        if ( settings[ 'use default duration' ] ) {

            return defaultDuration;

        } else {

            return settings[ 'set custom duration' ];

        }

    }

    function synchronizeCrossFade( startAction , endAction , duration  ) {

        mixer.addEventListener( 'loop', onLoopFinished );

        function onLoopFinished( event  ) {

            if ( event.action === startAction ) {

                mixer.removeEventListener( 'loop', onLoopFinished );

                executeCrossFade( startAction, endAction, duration );

            }

        }

    }

    function executeCrossFade( startAction , endAction , duration  ) {

        // Not only the start action, but also the end action must get a weight of 1 before fading
        // (concerning the start action this is already guaranteed in this place)

        setWeight( endAction, 1 );
        endAction.time = 0;

        // Crossfade with warping - you can also try without warping by setting the third parameter to false

        startAction.crossFadeTo( endAction, duration, true );

    }

    // This function is needed, since animationAction.crossFadeTo() disables its start action and sets
    // the start action's timeScale to ((start animation's duration) / (end animation's duration))

    function setWeight( action , weight  ) {

        action.enabled = true;
        action.setEffectiveTimeScale( 1 );
        action.setEffectiveWeight( weight );

    }

    // Called by the render loop

    function updateWeightSliders() {

        settings[ 'modify idle weight' ] = idleWeight;
        settings[ 'modify walk weight' ] = walkWeight;
        settings[ 'modify run weight' ] = runWeight;

    }

    // Called by the render loop

    function updateCrossFadeControls() {

        if ( idleWeight === 1 && walkWeight === 0 && runWeight === 0 ) {

            crossFadeControls[ 0 ].disable();
            crossFadeControls[ 1 ].enable();
            crossFadeControls[ 2 ].disable();
            crossFadeControls[ 3 ].disable();

        }

        if ( idleWeight === 0 && walkWeight === 1 && runWeight === 0 ) {

            crossFadeControls[ 0 ].enable();
            crossFadeControls[ 1 ].disable();
            crossFadeControls[ 2 ].enable();
            crossFadeControls[ 3 ].disable();

        }

        if ( idleWeight === 0 && walkWeight === 0 && runWeight === 1 ) {

            crossFadeControls[ 0 ].disable();
            crossFadeControls[ 1 ].disable();
            crossFadeControls[ 2 ].disable();
            crossFadeControls[ 3 ].enable();

        }

    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }

    function animate() {

        // Render loop

        requestAnimationFrame( animate );

        idleWeight = idleAction.getEffectiveWeight();
        walkWeight = walkAction.getEffectiveWeight();
        runWeight = runAction.getEffectiveWeight();

        // Update the panel values if weights are modified from "outside" (by crossfadings)

        updateWeightSliders();

        // Enable/disable crossfade controls according to current weight values

        updateCrossFadeControls();

        // Get the time elapsed since the last frame, used for mixer update (if not in single step mode)

        let mixerUpdateDelta = clock.getDelta();

        // If in single step mode, make one step and then do nothing (until the user clicks again)

        if ( singleStepMode ) {

            mixerUpdateDelta = sizeOfNextStep;
            sizeOfNextStep = 0;

        }

        // Update the animation mixer, the stats panel, and render this frame

        mixer.update( mixerUpdateDelta );

        //stats.update();

        renderer.render( scene, camera );

    }


    return(
        <div>
            <div ref={container}></div>
        </div>
    );
};

export default Poser;

