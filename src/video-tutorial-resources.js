function getBrowserName(userAgent) {
    // The order matters here, and this may report false positives for unlisted browsers.

    if (userAgent.includes("Firefox")) {
        // "Mozilla/5.0 (X11; Linux i686; rv:104.0) Gecko/20100101 Firefox/104.0"
        return "Mozilla Firefox";
    } else if (userAgent.includes("SamsungBrowser")) {
        // "Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G955F Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/9.4 Chrome/67.0.3396.87 Mobile Safari/537.36"
        return "Samsung Internet";
    } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
        // "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36 OPR/90.0.4480.54"
        return "Opera";
    } else if (userAgent.includes("Trident")) {
        // "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729)"
        return "Microsoft Internet Explorer";
    } else if (userAgent.includes("Edge")) {
        // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
        return "Microsoft Edge (Legacy)";
    } else if (userAgent.includes("Edg")) {
        // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36 Edg/104.0.1293.70"
        return "Microsoft Edge (Chromium)";
    } else if (userAgent.includes("Chrome")) {
        // "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
        return "Google Chrome or Chromium";
    } else if (userAgent.includes("Safari")) {
        // "Mozilla/5.0 (iPhone; CPU iPhone OS 15_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Mobile/15E148 Safari/604.1"
        return "Apple Safari";
    } else {
        return "unknown";
    }
}
  
const browserName = getBrowserName(navigator.userAgent);
const isSafari = browserName === "Apple Safari";

export const getFormatByBrowser = () => {
    return isSafari ? "mp4" : "webm";
};

const load_model = `https://animation-to-stl.netlify.app/tutorial/load-model.${getFormatByBrowser()}`;
const camera_control = `https://animation-to-stl.netlify.app/tutorial/camera-control.${getFormatByBrowser()}`;
const load_animations = `https://animation-to-stl.netlify.app/tutorial/load-animations.${getFormatByBrowser()}`;
const animation_control = `https://animation-to-stl.netlify.app/tutorial/animation-control.${getFormatByBrowser()}`;
const exportFile = `https://animation-to-stl.netlify.app/tutorial/export.${getFormatByBrowser()}`;

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