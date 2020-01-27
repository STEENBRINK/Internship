import * as PIXI from "pixi.js";
import * as BOX2D from "../../app/Box2D/Box2D";
import {
  b2BodyDef,
  b2Body,
  b2World,
  b2FixtureDef,
  b2BodyType,
  b2ContactEdge,
  b2Vec2,
  b2Fixture
} from "../../app/Box2D/Box2D";
import { GameApp } from "../../app/app";

export class GrowingBox {
    private bodyDef: BOX2D.b2BodyDef;
    public sprite: PIXI.Sprite;
    public body: BOX2D.b2Body;
    private world: b2World;
    private angle: number;
    private isGrowing: boolean;
    private maxSize:number;
    private minSize:number;
    private currentSize:number;

    constructor(
        world: BOX2D.b2World,
        texture: PIXI.Texture,
        bodyType: b2BodyType,
        position: PIXI.IPoint,
        startSize: number,
        minSize: number,
        maxSize: number
        ) {

      this.maxSize = maxSize;
      this.minSize = minSize;
      this.currentSize = startSize;

      this.sprite = new PIXI.Sprite(texture);
      this.sprite.width = startSize;
      this.sprite.height = startSize;
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
      poligonShape.SetAsBox(startSize / 2, startSize / 2);

      let fixtureDef = new b2FixtureDef();
      fixtureDef.shape = poligonShape;
      fixtureDef.density = this.currentSize/2;
      fixtureDef.friction = 0.5;
      fixtureDef.restitution = 0.5;
      this.body.CreateFixture(fixtureDef);

      this.sprite.anchor = new PIXI.Point(0.5, 0.5);
      this.body.SetAngularVelocity(Math.random() * Math.PI * 2 - Math.PI);
    }

    public onUpdate = () => {

      if(this.isGrowing)
      {
        this.currentSize++;
        if(this.currentSize >= this.maxSize) this.isGrowing = false;
      }
      else
      {
        this.currentSize--;
        if(this.currentSize <= this.minSize) this.isGrowing = true;
      }

      let poligonShape = new BOX2D.b2PolygonShape();
      poligonShape.SetAsBox(this.currentSize / 2, this.currentSize / 2);

      let fixtureDef = new b2FixtureDef();
      fixtureDef.shape = poligonShape;
      fixtureDef.density = this.currentSize/2;
      fixtureDef.friction = 0.5;
      fixtureDef.restitution = 0.5;

      let currentFixture:b2Fixture = this.body.GetFixtureList();

      this.body.CreateFixture(fixtureDef);
      this.body.DestroyFixture(currentFixture);

      this.sprite.position = this.world.WorldToPixelVector(
        this.body.GetPosition()
      );
      this.sprite.width = this.currentSize;
      this.sprite.height = this.currentSize;
      this.sprite.rotation = -this.body.GetAngle();
    };
}
