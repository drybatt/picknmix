import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const HERO_MODEL = 'box.glb';

const candies = [
  { name: 'Cola Bottle', description: 'Cola bottles are fizzy-flavored candies shaped like glass cola bottles. They’re usually made from sugar, glucose syrup and gelatin, with a cola flavor. Many are coated with sour sugar. and their dark brown color and curvy bottle shape make them one of the most iconic candy in pick and mix. Some people nibble the top off first, while some eat the whole thing in one bite.', model: 'models/cola-bottles.glb' },
  { name: 'Gummy Bear', description: 'One of the most iconic candies must be gummy bears, small, chewy, fruit-flavored candies that’s shaped like little bears. They’re made mostly from sugar, glucose syrup and gelatin, which gives them that soft, bouncy bite, and each one usually has its own flavor, such as strawberry, orange, lemon, etc. Gummy bears were invented in Germany in the 1920s by Hans Riegel, the founder of Haribo. Inspired by the dancing bears that performed at fairs and markets, Hans created the “dancing bear” candy. It was a hit, and now slowly turns into the gummy bears that’s now sold all over the world. Gummy bears are a pick and mix classic because they’re easy to love. I usually save my favourite favour (orange!!) for last.', model: 'models/gummy-bears.glb' },
  { name: 'Shark Gummy', description: 'Shark gummies are soft, chewy fruit flavored candies that’s shaped like little sharks. They’re usually made from gelatin, sugar and fruit flavoring, and often come in two-tone colors, like a blue top with a white belly, which makes them look like the real thing! I love them because of their design. I like to turn one around and look at the little details of the shape and coloring before I eat it.', model: 'models/shark-gummies.glb' },
  { name: 'Jazzy', description: 'Jazzies are milk chocolate flavoured discs covered in color candy sprinkles. I especially love the texture with the smooth white chocolate at the bottom and the little crunch from the sprinkles on top. There is also a white chocolate version of Jazzies that are often paired in a mix.', model: 'models/jazzies.glb'},
  { name: 'Sour Belts', description: 'Sour Belts are long chewy candy strips, usually coated in sour sugar. They tend to come in bright colors, and each color has its only fruity flavour. I love them because they are so fun to eat! You can eat them like a noodle, or pull them apart. The sour sugar on the surface are so tasty combining with the long strip underneath.', model: 'models/sour-belts.glb' },
  { name: 'Squashies', description: 'Swizzels Squashies are a soft squishy fruit flavoured sweet made by Swizzels. They are known for being extra soft and squashy, so they are easy to chew and don’t stick to your teeth unlike how tougher gummies can. They also come in a mix of bright colours with different fruit flavours, usually red on one end.', model: 'models/swizzels-squashies.glb' },
  { name: 'Jelly Bean', description: 'Jelly beans are bean-shaped candies with a hard, glossy shell but a chewy inside. The shell is made of hardened sugar, and the inside is chewy candy with a fruit flavor. They usually come in rainbow colors and each color usually has its own unique flavour. Many people like to sort them by color, and pick out at random to guess their flavor.', model: 'models/jelly-bean.glb' },
  { name: 'Chocolate Candy', description: 'Chocolate candy is small round button shaped candy with a crispy candy shell outside and milk chocolate inside. The shell always comes in bright colorful color, and each bite starts with a crunch then the sweetness of the chocolate. Me and my friends love to guess what color we got when we pick from the bag.', model: 'models/chocolate-candy.glb' },
  { name: 'Rocketz', description: 'Rockets are vibrant, tube-shaped gummies. They have a tangy or sour sugar coated outer layer wrapping around the creamy fondant centre. The candies come in bright color, and the sour to sweet taste after the candy dissolves in your mouth makes it really tasty!', model: 'models/rocketz.glb' }
];

const bins = document.querySelectorAll('.bin'); 
const popup = document.getElementById('popup');
const popupTitle = document.getElementById('popup-title');
const popupDesc = document.getElementById('popup-desc');
const popupViewer = document.getElementById('popup-viewer');
const heroViewer = document.getElementById('hero-viewer');

function makeStar() {
  const shape = new THREE.Shape();
  const points = 5;
  const outerRadius = 1.2;
  const innerRadius = 0.55;

  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.08,
    bevelSegments: 2
  });
  geometry.center();

  const material = new THREE.MeshStandardMaterial({ color: 0xc82a17, roughness: 0.4 });
  return new THREE.Mesh(geometry, material);
}

function makeBulkBox() {
  const group = new THREE.Group();

  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 2, 1.6),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      roughness: 0.1
    })
  );
  group.add(glass);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(glass.geometry),
    new THREE.LineBasicMaterial({ color: 0x555555 })
  );
  group.add(edges);

  const colors = [0xd7261e, 0xf5c518, 0x2e9e3f, 0x7b2d8e, 0xf47a20, 0x2a6fdb];
  for (let i = 0; i < 60; i++) {
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 20, 20),
      new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.3 })
    );
    ball.position.set(
      (Math.random() - 0.5) * 2.0,
      -0.8 + Math.random() * 1.0,
      (Math.random() - 0.5) * 1.2
    );
    group.add(ball);
  }

  return group;
}

const loader = new GLTFLoader();


function fitModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const scale = 2.9 / Math.max(size.x, size.y, size.z);
  model.scale.setScalar(scale);
  model.position.sub(center.multiplyScalar(scale));

  const holder = new THREE.Group();
  holder.add(model);
  return holder;
}



function startViewer(container, modelPath, makeFallback, cameraPosition) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(...cameraPosition);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const light = new THREE.DirectionalLight(0xffffff, 1.5);
  light.position.set(3, 4, 5);
  scene.add(light);

  if (modelPath) {
    loader.load(
      modelPath,
      (gltf) => {
        scene.add(fitModel(gltf.scene));
      },
      undefined,
      (error) => {
        console.error('Could not load ' + modelPath, error);
        scene.add(makeFallback());
      }
    );
  } else {
    scene.add(makeFallback());
  }

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  let animationId;
  function animate() {
    animationId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  return function stop() {
    cancelAnimationFrame(animationId);
    controls.dispose();
    renderer.dispose();
    container.innerHTML = '';
  };
}



startViewer(heroViewer, HERO_MODEL, makeBulkBox, [0, 1.5, 6]);

let stopPopupViewer = null;

bins.forEach((bin, index) => {
  bin.addEventListener('click', () => {
    popupTitle.textContent = candies[index].name;
    popupDesc.textContent = candies[index].description;
    popup.classList.add('open');
    stopPopupViewer = startViewer(popupViewer, candies[index].model, makeStar, [0, 0, 3.5]);
  });
});

popup.addEventListener('click', (event) => {
  if (event.target === popup) {
    popup.classList.remove('open');
    if (stopPopupViewer) {
      stopPopupViewer();
      stopPopupViewer = null;
    }
  }
});
document.addEventListener("mousedown", () => {
  document.body.classList.add("pressing");
});

document.addEventListener("mouseup", () => {
  document.body.classList.remove("pressing");
});

// If the mouse leaves the window while pressed, reset it
document.addEventListener("mouseleave", () => {
  document.body.classList.remove("pressing");
});
