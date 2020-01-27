// // You can use NPM to import files into scripts. As shown here you can load multiple things from one file.
// // import { ship, largeAsteroid, bullet, mediumAsteroid, smallAsteroid, noises } from '../assets/loader';

// // Again using NPM to import the Bullet class from the './bullet.ts' file.
// // import { Bullet } from './bullet';

// // These are the main libraries you will use. PIXI manages the rendering where Matter manages the physics.
// // You can add more libraries just like this. Just make sure to use NPM to install them before trying to
// // import them. `npm install <package_name>[@<version>]`
// import * as PIXI from "pixi.js";
// import * as Box2D from "./Box2D/Box2D";
// import { Rat, Box as BoxSprite } from "../assets/loader";
// import { Box } from "../assets/classes/Box";
// import { Circle } from "../assets/classes/Circle";
// import { CustomShape } from "../assets/classes/CustomShape";
// import { OneBodyManyTriangles } from "../assets/classes/OneBodyManyTriangles";
// import { b2Vec2, b2BodyDef, b2BodyType } from "./Box2D/Box2D";
// import { TestOneFixture } from "../assets/classes/TestOneFixture";
// import { TestManyFixture } from "../assets/classes/TestManyFixture";
// import { GrowingBox } from "../assets/classes/GrowingBox";
// //import * as Box from "../assets/classes/Box";



// // Saving a reference to the PIXI asset loader for ease of use.
// const loader = PIXI.Loader.shared;

// // Prepare frames
// export class GameApp {
//   private app: PIXI.Application;
//   private frameCount: number = 0;
//   private timePassed: number = 0;
//   private boxtimeInterval = 0;
//   private growingBoxtimeInterval = 2;
//   private cstimeInterval = 5;
//   private circleInterval = 0.1;
//   private boxes = [];
//   private growingBoxes = [];
//   private cslist = [];
//   private trianglelist = [];
//   private oneFixtureList = [];
//   private manyFixtureList = [];
//   private circles = [];
//   private gravity = new Box2D.b2Vec2(0, -100);
//   private worldB2: Box2D.b2World;
//   private ground: Box2D.b2Body;
//   private fps = [];
//   private boxCount = [];
//   private triangleInterval: number = 2.5;
//   private clicked:boolean = false;

//   private texture: PIXI.Texture;
//   private bodyType:b2BodyType;


//   constructor(parent: HTMLElement, width: number, height: number) {
//     this.app = new PIXI.Application({
//       width,
//       height,
//       backgroundColor: 0x000000
//     });

//     this.worldB2 = new Box2D.b2World(
//       this.gravity,
//       1,
//       new PIXI.Point(width, height)
//     );

//     this.worldB2.SetContinuousPhysics(true);
//     this.worldB2.SetWarmStarting(true);
//     const bd = new Box2D.b2BodyDef();
//     this.ground = this.worldB2.CreateBody(bd);
//     let groundPosition = this.worldB2.PixelToWorldVector(
//       new PIXI.Point(width / 2, 50)
//     );

//     const groundShape = new Box2D.b2EdgeShape();
//     const leftWallShape = new Box2D.b2EdgeShape();
//     const rightWallShape = new Box2D.b2EdgeShape();
//     groundShape.Set(
//       new Box2D.b2Vec2(-width / 2, 0),
//       new Box2D.b2Vec2(width / 2, 0)
//     );

//     leftWallShape.Set(
//       new Box2D.b2Vec2(-width / 2, 100000),
//       new Box2D.b2Vec2(-width / 2, 0)
//     );

//     rightWallShape.Set(
//       new Box2D.b2Vec2(width / 2, 1000000),
//       new Box2D.b2Vec2(width / 2, 0)
//     );
//     this.ground.CreateFixture(groundShape, 0.0);
//     this.ground.CreateFixture(leftWallShape, 0.0);
//     this.ground.CreateFixture(rightWallShape, 0.0);

//     this.ground.SetPosition(groundPosition);

//     console.log(this.ground.GetPosition().x, this.ground.GetPosition().y);

//     // Binding the PIXI renderer to the wep page.
//     parent.replaceChild(this.app.view, parent.lastElementChild);

//     let callBack = (e:Event) => this.onMouseDown(e as MouseEvent);
//         document.addEventListener('mousedown', callBack);

//     // init Pixi loader
//     loader
//       .add("Box", BoxSprite) // .add(name, path)
//       .on("progress", this.progress) // Executes the given function on the given event. In this case whenever progress is made.
//       .load(this.onAssetsLoaded.bind(this)); // Executes the given function when the loader has finished loading.

//     this.app.ticker.add(this.update.bind(this));
//   }

//   private onMouseDown(e:MouseEvent){
//     this.clicked = true;
// }

//   private onAssetsLoaded() {
//     console.log(`Assets loaded succesfully.`);
//     this.texture = PIXI.Texture.from("Box");
//     this.bodyType = Box2D.b2BodyType.b2_dynamicBody;
//     document.getElementById("loadJson").onclick = () => this.generateJSON();
//   }

//   private createBox(position: PIXI.IPoint) {
//     let size: number = 25;

//     let box = new Box(this.worldB2, this.texture, this.bodyType, position, size);
//     this.app.stage.addChild(box.sprite);
//     this.boxes.push(box);
//   }

//   private createGrowingBox(position: PIXI.IPoint, startSize:number, minSize:number, maxSize:number) {
//     let box = new GrowingBox(this.worldB2, this.texture, this.bodyType, position, startSize, minSize, maxSize);
//     this.app.stage.addChild(box.sprite);
//     this.growingBoxes.push(box);
//   }

//   private createCircle(position: PIXI.IPoint, r:number) {
//     let bodyType = Box2D.b2BodyType.b2_dynamicBody;

//     let circle = new Circle(this.worldB2, bodyType, position, r, this.app);
//     this.circles.push(circle);
//   }

//   private createCS(position: PIXI.IPoint, size:number, r:number, amount: number) {

//     let cs = new CustomShape(this.worldB2, this.texture, this.bodyType, position, size, r, amount, this.app);
//     this.app.stage.addChild(cs.sprite);
//     this.cslist.push(cs);

//   }

//   private createTriangleBody(position: PIXI.IPoint, size:number, riblength:number, amount: number) {

//     let triangle = new OneBodyManyTriangles(this.worldB2, this.texture, this.bodyType, position, size, riblength, amount, this.app,);
//     this.app.stage.addChild(triangle.sprite);
//     this.trianglelist.push(triangle);
//   }

//   private progress(loader, resources) {
//     console.log(`loading: ${resources.name}`);
//     console.log(`progress ${loader.progress}%`);
//   }

//   private generateJSON = () => {
//     var newObject = {
//       fps: this.fps,
//       boxes: this.boxCount
//     };

//     let jsonse = JSON.stringify(newObject);

//     var blob = new Blob([jsonse], { type: "application/json" });
//     var url = URL.createObjectURL(blob);

//     var a = document.createElement("a");
//     a.href = url;
//     a.download = "fps.json";
//     a.textContent = "Download fps.json";

//     document.getElementById("button").appendChild(a);
//   };

//   private update(delta) {
//     this.worldB2.Step(1 / 60, 8, 3);
//     this.worldB2.ClearForces();

//     if (this.circles.length < 10000) {
//       let newPos = new PIXI.Point(
//         (window.innerWidth - 100) * Math.random() + 50,
//         window.innerHeight + 100
//       );
//       this.createCircle(newPos, 4);
//       this.circleInterval = 0.1;
//     }

//     if (this.cstimeInterval <= 0 && this.cslist.length < 1000) {
//       let newPos = new PIXI.Point(
//         (window.innerWidth - 100) * Math.random() + 50,
//         window.innerHeight + 500
//       );
//       this.createCS(newPos, Math.random() * 25 + 25, Math.random() * 25 + 5, Math.random() * 25);
//       this.cstimeInterval = 5;
//     }

//     // if (this.triangleInterval < 1 && this.trianglelist.length < 1000) {
//     //   let newPos = new PIXI.Point(
//     //     (window.innerWidth - 100) * Math.random() + 50,
//     //     window.innerHeight + 500
//     //   );
//     //   this.createTriangleBody(newPos, Math.random() * 25 + 25, Math.random() * 50 + 20, Math.random() * 25);
//     //   this.triangleInterval = 5;
//     // }

//     // if (this.boxtimeInterval <= 0 && this.boxes.length < 50) {
//     //   let newPos = new PIXI.Point(
//     //     (window.innerWidth - 100) * Math.random() + 50,
//     //     window.innerHeight + 100
//     //   );
//     //   this.createBox(newPos);
//     //   this.boxtimeInterval = 2;
//     // }

//     // if (this.oneFixtureList.length < 10000 && this.clicked) {
//     //   let newPos = new PIXI.Point(
//     //       (window.innerWidth - 100) * Math.random() + 50,
//     //       window.innerHeight - 100
//     //     );

//     //     let object = new TestOneFixture(this.worldB2, this.bodyType, newPos, this.app);
//     //     this.oneFixtureList.push(object);
//     // }

//     // if (this.manyFixtureList.length < 1000 && this.clicked) {
//     //   let newPos = new PIXI.Point(
//     //       (window.innerWidth - 100) * Math.random() + 50,
//     //       window.innerHeight - 100
//     //     );

//     //     let object = new TestManyFixture(this.worldB2, this.bodyType, newPos, this.app);
//     //     this.manyFixtureList.push(object);
//     // }

//     // if (this.growingBoxes.length < 10000 && this.clicked) {
//     //   let newPos = new PIXI.Point(
//     //       (window.innerWidth - 100) * Math.random() + 50,
//     //       window.innerHeight - 100
//     //     );

//     //   this.createGrowingBox(newPos, 30, 10, 200);
//     //   this.growingBoxtimeInterval = 2;
//     // }

//     if (this.boxtimeInterval > 0) {
//       this.boxtimeInterval -= delta/60;
//     }

//     if (this.growingBoxtimeInterval > 0) {
//       this.growingBoxtimeInterval -= delta/60;
//     }

//     if (this.cstimeInterval > 0) {
//       this.cstimeInterval -= delta/60;
//     }

//     if (this.triangleInterval > 0) {
//       this.triangleInterval -= delta/60;
//     }

//     if(this.circleInterval > 0) {
//       this.circleInterval -= delta/60;
//     }

//     for (let index = 0; index < this.boxes.length; index++) {
//       const element: Box = this.boxes[index];
//       element.onUpdate();
//     }
    
//     for (let index = 0; index < this.manyFixtureList.length; index++) {
//       const element: TestManyFixture = this.manyFixtureList[index];
//       element.onUpdate();
//     }

//     for (let index = 0; index < this.oneFixtureList.length; index++) {
//       const element: TestOneFixture = this.oneFixtureList[index];
//       element.onUpdate();
//     }

//     for (let index = 0; index < this.cslist.length; index++) {
//       const element: CustomShape = this.cslist[index];
//       element.onUpdate();
//     }

//     for (let index = 0; index < this.circles.length; index++) {
//       const element: Circle = this.circles[index];
//       element.onUpdate();
//     }

//     for (let index = 0; index < this.trianglelist.length; index++) {
//       const element: OneBodyManyTriangles = this.trianglelist[index];
//       element.onUpdate();
//     }

//     for (let index = 0; index < this.growingBoxes.length; index++) {
//       const element: OneBodyManyTriangles = this.growingBoxes[index];
//       element.onUpdate();
//     }

//     // Logs FPS.
//     this.fps.push(Math.round(this.app.ticker.FPS));
//     this.boxCount.push(this.growingBoxes.length);
    
//     this.app.view.width = window.innerWidth;
//     this.app.view.height = window.innerHeight;

//     this.frameCount++;
//     this.timePassed += delta / 60;
//     //this.timeInterval += delta / 60;
//   }
// }

import { App } from "../assets/classes/Explain";

export class GameApp{
  constructor(){
    let example = new App();
  }
}