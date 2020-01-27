import * as BOX2D from "../../app/Box2D/Box2D";
import * as PIXI from "pixi.js";

export class GameObject {
  private bodyDef: BOX2D.b2BodyDef;
  public sprite: PIXI.Sprite;
  public body: BOX2D.b2Body;
  public pixiToBox2D: number[][] = [];
  public box2DToPixi: number[][] = [];

  constructor(parameters) {
    this.pixiToBox2D[0] = [1, 0, 0.01];
    this.pixiToBox2D[1] = [0, 1, -0.01];
    this.pixiToBox2D[2] = this.box2DToPixi[2] = [0, 0, 1];
    this.box2DToPixi[0] = [1, 0, 100];
    this.box2DToPixi[1] = [0, 1, -100];
    
    
  }
}
