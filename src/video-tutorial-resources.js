const load_model = "https://animation-to-stl.netlify.app/tutorial/load-model.webm";
const camera_control = "https://animation-to-stl.netlify.app/tutorial/camera-control.webm";
const load_animations = "https://animation-to-stl.netlify.app/tutorial/load-animations.webm";
const animation_control = "https://animation-to-stl.netlify.app/tutorial/animation-control.webm";
const exportFile = "https://animation-to-stl.netlify.app/tutorial/export.webm";

export const tutorial_videos = [
    load_model,
    camera_control,
    load_animations,
    animation_control,
    exportFile,
];

const load_model_description = "Ready to start? Just click the 'Load Model' button in the sidebar and import your FBX file. Don't forget to scale it to fit the screen, and voila! Your model is set.";
const camera_control_description = "To control the camera you can use at any point the left mouse button to rotate, the right mouse button to translate, and the mouse wheel to zoom in and out.";
const load_animations_description = "To add animations, use the 'Load Animation' button in the sidebar to import your FBX file. You can import multiple animations and select the one you want to play.";
const animation_control_description = "To control your model's animation, use the play button to start the animation and the stop button to pause it. You can also use the slider to set the animation to a specific frame.";
const exportFile_description = "To export your model baked in the selected frame, press the 'Bake Mesh' button on the sidebar. This will open window where you can choose the name and location of the STL file.";

export const tutorial_description = [
    load_model_description,
    camera_control_description,
    load_animations_description,
    animation_control_description,
    exportFile_description,
];


const load_model_title = "Importing your model";
const camera_control_title = "Camera control";
const load_animations_title = "Adding animations";
const animation_control_title = "Animation control";
const exportFile_title = "Exporting your model";

export const tutorial_title = [
    load_model_title,
    camera_control_title,
    load_animations_title,
    animation_control_title,
    exportFile_title,
];