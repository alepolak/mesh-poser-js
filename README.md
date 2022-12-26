# 3D Model Animation Exporter
A web app that allows you to upload a 3D model and its animations, and export a baked 3D model in a specific frame of the animation as a STL file for 3D printing.

## Features
- Upload a 3D model and its animations in FBX format.
- Preview the animation and select a specific frame to bake.
- Export the baked 3D model in the selected frame as a STL file, ready for 3D printing.

## Usage
1. Go to: [animation-to-stl.netlify.app](https://animation-to-stl.netlify.app/).
2. Click the `Load Model` button to select a 3D model file (remember that the model needs to be a FBX file).
3. The 3D model is going to appear in the screen. 
4. Click `Load Animations` to select animations for that model (remember that the animations needs to be in a FBX file).
5. The list of animations is going to appear in the sidebar.
6. Select any animation to start playing it.
7. You can pause the animation at any frame or use the slider to select any particular frame.
8. Click `Bake mesh` to export the model as a STL file.

### Tools
- You can use the `Scale Input` to change the model size.
- You can use the mouse scroll wheel to zoom in/out.
- You can use the mouse left click to rotate the camera.
- You could use the mouse right click to pan the camera.

## Examples
- [How to load a custom model](https://www.loom.com/share/3b592a51f62741c9a2c7255c0805cb0b).
- [How to load a character with animations](https://www.loom.com/share/910fccfda36a4847bdad9bd2241c2f50).
- For 3D models an animations, you could use: [Mixamo](https://www.mixamo.com/#/).

## Installation
The app is built with React and THREEjs. If you want to run the app locally, you have to:

- Clone this repository to your local machine
- Navigate to the root directory of the repository
- Run: `npm install` 
- Rune: `npm run start`

## Contributing
If you would like to contribute to this project, please fork the repository and create a pull request with your changes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Known Issues
1. If you load a model, animations and then you load a model again, the app stops working and you need to refresh.
2. Some FBX model are not loading correctly.