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

export class Box {
    private bodyDef: BOX2D.b2BodyDef;
    public sprite: PIXI.Sprite;
    public body: BOX2D.b2Body;
    private world: b2World;
    private angle: number;

    constructor(
        world: BOX2D.b2World,
        texture: PIXI.Texture,
        bodyType: b2BodyType,
        position: PIXI.IPoint,
        size: number
        ) {

      this.sprite = new PIXI.Sprite(texture);
      this.sprite.width = size;
      this.sprite.height = size;
      this.sprite.position = position;
      this.sprite.pivot = new PIXI.Point(
        this.sprite.width / 2,
        this.sprite.height / 2);
      this.bodyDef = new b2BodyDef();
      this.bodyDef.type = bodyType;

      let newPos = world.PixelToWorldVector(position);

      this.bodyDef.position.Set(newPos.x, newPos.y);
      this.world = world;
      this.body = world.CreateBody(this.bodyDef);
      let poligonShape = new BOX2D.b2PolygonShape();
      let shapeScaleInPixels = new PIXI.Point(
        this.sprite.width / 2,
        this.sprite.height / 2
      );

      let shapeScale = world.PixelToWorldVector(shapeScaleInPixels);
      poligonShape.SetAsBox(size / 2, size / 2);

      let fixtureDef = new b2FixtureDef();
      fixtureDef.shape = poligonShape;
      fixtureDef.density = 1;
      fixtureDef.friction = 1;
      fixtureDef.restitution = 0.99;
      this.body.CreateFixture(fixtureDef);

      this.sprite.anchor = new PIXI.Point(0.5, 0.5);
      this.body.SetAngularVelocity(30);
    }

    public onUpdate = () => {
      this.sprite.position = this.world.WorldToPixelVector(
        this.body.GetPosition()
      );
      this.sprite.rotation = -this.body.GetAngle();
    };
}
