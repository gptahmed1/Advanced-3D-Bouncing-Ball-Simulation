import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import Stats from 'https://cdn.skypack.dev/stats.js';

class PhysicsSimulation {
  constructor(ball, faces, options = {}) {
    if (!ball || !faces) {
      throw new Error('Ball and faces must be provided to PhysicsSimulation');
    }
    this.ball = ball;
    this.faces = faces;
    this.initialPosition = ball.position.clone();
    this.initialVelocity = new THREE.Vector3(0.1, 0.1, 0.1);
    this.ballVelocity = this.initialVelocity.clone();
    this.gravity = new THREE.Vector3(0, -0.001, 0);
    this.dampening = options.dampening || 0.98;
    this.radius = options.radius || 0.3;
    this.collisionCount = 0;
    this.currentSpeed = 1;
    
    this.setupControls();
  }

  setupControls() {
    const speedControl = document.getElementById('speedControl');
    const gravityControl = document.getElementById('gravityControl');
    const resetButton = document.getElementById('resetButton');

    if (!speedControl || !gravityControl || !resetButton) {
      throw new Error('Required control elements not found');
    }

    const updateValueDisplay = (input) => {
      const display = input.parentElement.querySelector('.value-display');
      if (display) {
        display.textContent = `${parseFloat(input.value).toFixed(3)}x`;
      }
    };

    speedControl.addEventListener('input', (e) => {
      const speed = parseFloat(e.target.value);
      if (!isNaN(speed) && this.currentSpeed) {
        this.ballVelocity.multiplyScalar(speed / this.currentSpeed);
        this.currentSpeed = speed;
        updateValueDisplay(e.target);
      }
    });

    gravityControl.addEventListener('input', (e) => {
      const gravity = parseFloat(e.target.value);
      if (!isNaN(gravity)) {
        this.gravity.y = -gravity;
        updateValueDisplay(e.target);
      }
    });

    resetButton.addEventListener('click', () => this.reset());
  }

  reset() {
    if (this.ball && this.initialPosition && this.initialVelocity) {
      this.ball.position.copy(this.initialPosition);
      this.ballVelocity.copy(this.initialVelocity);
      this.collisionCount = 0;
    }
  }

  update(delta) {
    if (!this.ball || !this.ballVelocity || !this.gravity) return;

    const halfDelta = delta * 0.5;
    const acceleration = this.gravity.clone();
    
    const deltaVelocity = this.ballVelocity.clone().multiplyScalar(delta);
    const deltaAcceleration = acceleration.clone().multiplyScalar(0.5 * delta * delta);
    this.ball.position.add(deltaVelocity).add(deltaAcceleration);
    
    this.ballVelocity.add(acceleration.clone().multiplyScalar(delta));
    
    this.checkCollisions();
    
    this.ballVelocity.multiplyScalar(0.999);
  }

  checkCollisions() {
    if (!this.faces || !this.ball) return;

    for (const face of this.faces) {
      if (!face.v1 || !face.v2 || !face.v3) continue;

      const plane = new THREE.Plane().setFromCoplanarPoints(face.v1, face.v2, face.v3);
      const distance = plane.distanceToPoint(this.ball.position);
      
      if (Math.abs(distance) < this.radius) {
        this.collisionCount++;
        
        const reflection = this.ballVelocity.clone().reflect(plane.normal);
        const energyLoss = Math.max(0.5, 1 - (this.collisionCount * 0.01));
        this.ballVelocity.copy(reflection.multiplyScalar(this.dampening * energyLoss));
        
        const correction = plane.normal.clone()
          .multiplyScalar(this.radius - Math.sign(distance) * distance)
          .multiplyScalar(1.01);
        this.ball.position.add(correction);
      }
    }
  }
}

class Scene {
  constructor() {
    try {
      this.init();
      this.createGeometry();
      this.createLights();
      this.setupAnimation();
      this.setupResizeHandler();
      this.setupStats();
    } catch (error) {
      console.error('Error initializing scene:', error);
    }
  }

  init() {
    const canvas = document.getElementById('canvas');
    if (!canvas) throw new Error('Canvas element not found');

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance"
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    this.camera.position.set(0, 0, 15);
    this.camera.lookAt(0, 0, 0);
  }

  createGeometry() {
    if (!this.scene) return;

    const geometry = new THREE.DodecahedronGeometry(5, 0);
    geometry.computeVertexNormals();
    const nonIndexedGeometry = geometry.toNonIndexed();
    
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      wireframe: true,
      wireframeLinewidth: 2,
      transparent: true,
      opacity: 0.8
    });

    this.rhombicosidodecahedron = new THREE.Mesh(nonIndexedGeometry, material);
    this.rhombicosidodecahedron.castShadow = true;
    this.rhombicosidodecahedron.receiveShadow = true;
    this.scene.add(this.rhombicosidodecahedron);

    const ballGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const ballMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffff00,
      emissive: 0x444400,
      shininess: 50,
      specular: 0x666666
    });
    
    this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
    this.ball.castShadow = true;
    this.ball.receiveShadow = true;
    this.scene.add(this.ball);

    const faces = this.getFaceData(nonIndexedGeometry);
    this.physics = new PhysicsSimulation(this.ball, faces, {
      dampening: 0.98,
      radius: 0.3
    });
  }

  getFaceData(geometry) {
    if (!geometry?.attributes?.position) return [];

    const positions = geometry.attributes.position.array;
    const faces = [];
    
    for (let i = 0; i < positions.length; i += 9) {
      const v1 = new THREE.Vector3().fromArray(positions, i);
      const v2 = new THREE.Vector3().fromArray(positions, i + 3);
      const v3 = new THREE.Vector3().fromArray(positions, i + 6);
      
      faces.push({ 
        v1, v2, v3,
        normal: new THREE.Vector3()
          .crossVectors(v2.clone().sub(v1), v3.clone().sub(v1))
          .normalize()
      });
    }
    return faces;
  }

  createLights() {
    if (!this.scene) return;

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0xffffff, 1, 100);
    mainLight.position.set(10, 10, 10);
    mainLight.castShadow = true;
    this.scene.add(mainLight);

    const fillLight = new THREE.PointLight(0x8080ff, 0.5, 100);
    fillLight.position.set(-10, -10, -10);
    this.scene.add(fillLight);
  }

  setupStats() {
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);
  }

  setupAnimation() {
    if (!this.scene || !this.camera || !this.renderer || !this.physics) return;

    let lastTime = performance.now();
    const rotationControl = document.getElementById('rotationControl');
    let rotationSpeed = 0.001;

    if (rotationControl) {
      rotationControl.addEventListener('input', (e) => {
        rotationSpeed = parseFloat(e.target.value);
      });
    }

    const animate = () => {
      if (this.stats) this.stats.begin();

      const currentTime = performance.now();
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      if (this.physics) this.physics.update(deltaTime);
      
      if (this.rhombicosidodecahedron) {
        this.rhombicosidodecahedron.rotation.x += rotationSpeed;
        this.rhombicosidodecahedron.rotation.y += rotationSpeed;
      }
      
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
      
      if (this.stats) this.stats.end();
      requestAnimationFrame(animate);
    };

    animate();
  }

  setupResizeHandler() {
    if (!this.camera || !this.renderer) return;

    window.addEventListener('resize', () => {
      if (this.camera && this.renderer) {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      }
    });
  }
}

// Initialize the scene when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    new Scene();
  } catch (error) {
    console.error('Failed to initialize scene:', error);
  }
});