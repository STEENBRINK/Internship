import * as PIXI from "pixi.js";
import * as BOX2D from "../../app/Box2D/Box2D";
import {
  b2BodyDef,
  b2Body,
  b2World,
  b2FixtureDef,
  b2BodyType,
  b2ContactEdge,
  b2Vec2
} from "../../app/Box2D/Box2D";
import { GameApp } from "../../app/app";

export class Circle {
    private bodyDef: BOX2D.b2BodyDef;
    public body: BOX2D.b2Body;
    private world: b2World;
    private angle: number;
    private circleGraphic:PIXI.Graphics = new PIXI.Graphics();
    private radius:number;

    constructor(
        world: BOX2D.b2World,
        bodyType: b2BodyType,
        position: PIXI.IPoint,
        r: number,
        app: PIXI.Application
        ) {

      app.stage.addChild(this.circleGraphic);

      this.radius = r;
      this.bodyDef = new b2BodyDef();
      this.bodyDef.type = bodyType;

      let newPos = world.PixelToWorldVector(position);

      this.bodyDef.position.Set(newPos.x, newPos.y);
      this.world = world;
      this.body = world.CreateBody(this.bodyDef);
      
      let circleShape = new BOX2D.b2CircleShape(r);

      let fixtureCDef = new b2FixtureDef();
      fixtureCDef.shape = circleShape;
      fixtureCDef.density = 20;
      fixtureCDef.friction = 0.1;
      fixtureCDef.restitution = 0.99;
      this.body.CreateFixture(fixtureCDef);

      this.body.SetAngularVelocity(0);
    }

    public SetPosition(): void {}

    public onUpdate = () => {
      this.circleGraphic.clear();
      this.circleGraphic.beginFill(0xffffff);
      let pos = this.world.WorldToPixelVector(this.body.GetPosition());
      this.circleGraphic.drawCircle(pos.x, pos.y, this.radius);
      this.circleGraphic.endFill();
    };
}
