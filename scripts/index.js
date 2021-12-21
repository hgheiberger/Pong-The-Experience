//Initialize scene
const scene = new THREE.Scene();

//Initialize camera
const fov = 75;
const nearClipping = 0.1;
const farClipping = 1000;
const camera = new THREE.PerspectiveCamera(fov, innerWidth / innerHeight, nearClipping, farClipping);
camera.position.z = 50;

//Initialize renderer
const mainCanvas = document.getElementById("mainCanvas");
const renderer = new THREE.WebGLRenderer({canvas: mainCanvas, alpha: false});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);

//Initialize raycaster
const mouse = {x: undefined, y: undefined};
const raycaster = new THREE.Raycaster();


//Creates background plane
const height = 400;
const width = 400;
const widthSegments = 50;
const heightSegments = 50;
const planeGeometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
const planeMaterial = new THREE.MeshPhongMaterial({ 
                                                    side: THREE.DoubleSide,
                                                    flatShading: THREE.FlatShading,
                                                    vertexColors: true
                                                  });
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);

//Adds color attribute to plane
const initialColor = {
    r: 0,
    g: .19,
    b: 0.4
}

const colors = [];
for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++){
    colors.push(initialColor.r, initialColor.g, initialColor.b);
}
planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

//Add background plane texture
const {array} = planeMesh.geometry.attributes.position;
const randomValues = [];
for(let i = 0; i < array.length; i++){
    //Creates vertices
    if (i % 3 === 0){
        const vertexX = array[i];
        const vertexY = array[i + 1];
        const vertexZ = array[i + 2];

        array[i] = vertexX + (Math.random() - 0.5) * 5;
        array[i + 1] = vertexY + (Math.random() - 0.5) * 5;
        array[i + 2] = vertexZ + (Math.random() - 0.5) * 5;
    }

    //Generates corresponding random values (for oscillation animation)
    randomValues.push(Math.random() - 0.5);
}

//Adds original position attribute
planeMesh.geometry.attributes.position.originalPosition = planeMesh.geometry.attributes.position.array;

//Adds random position attribute (for oscillation animation)
planeMesh.geometry.attributes.position.randomValues = randomValues;

console.log(planeMesh.geometry.attributes.position)

//Creates background light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0,0.5,1);
scene.add(light);


//Defines animation loop
let frame = 0;
function animate() {
    requestAnimationFrame(animate);
    frame += 0.01;

    //Casts ray from camera in direction of mouse
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(planeMesh);

    //Adds vertex oscillation
    const { array, originalPosition, randomValues} = planeMesh.geometry.attributes.position;

    for (let i = 0; i < array.length; i += 3){
        array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.006;
        array[i + 1] = originalPosition[i + 1] + Math.sin(frame + randomValues[i]) * 0.006;

    }

    //Re-renders modified vertices
    planeMesh.geometry.attributes.position.needsUpdate = true;

    //Updates color of hovered vertices
    if (intersects.length > 0){
        const hoverColor = {
            r: 0.1,
            g: 0.5,
            b: 1
        }

        const { color } = intersects[0].object.geometry.attributes;
        
        //Vertice 1
        color.setX(intersects[0].face.a, hoverColor.r);
        color.setY(intersects[0].face.a, hoverColor.g);
        color.setZ(intersects[0].face.a, hoverColor.b);

        //Vertice 2
        color.setX(intersects[0].face.b, hoverColor.r);
        color.setY(intersects[0].face.b, hoverColor.g);
        color.setZ(intersects[0].face.b, hoverColor.b);

        //Vertice 3
        color.setX(intersects[0].face.c, hoverColor.r);
        color.setY(intersects[0].face.c, hoverColor.g);
        color.setZ(intersects[0].face.c, hoverColor.b);

        //Re-renders modified vertices
        color.needsUpdate = true;

        //Fades color back to original
        gsap.to(hoverColor, {
            r: initialColor.r,
            g: initialColor.g,
            b: initialColor.b,
            duration: 1,
            onUpdate: () => {
                //Vertice 1
                color.setX(intersects[0].face.a, hoverColor.r);
                color.setY(intersects[0].face.a, hoverColor.g);
                color.setZ(intersects[0].face.a, hoverColor.b);

                //Vertice 2
                color.setX(intersects[0].face.b, hoverColor.r);
                color.setY(intersects[0].face.b, hoverColor.g);
                color.setZ(intersects[0].face.b, hoverColor.b);

                //Vertice 3
                color.setX(intersects[0].face.c, hoverColor.r);
                color.setY(intersects[0].face.c, hoverColor.g);
                color.setZ(intersects[0].face.c, hoverColor.b);

                //Re-renders modified vertices
                color.needsUpdate = true;
            }
        });
    }

    //Redraws scene
    renderer.render(scene, camera);
}

//Begins animation loop
animate();

//Add hover effect
addEventListener('mousemove', (event) => {
    //Normalizes mouse position to Three.JS origin
    mouse.x = (event.clientX / innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / innerHeight) * 2 + 1;

});

//Resize canvas on window resize
window.addEventListener('resize', () =>
{
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})
