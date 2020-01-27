import * as PIXI from "pixi.js";
import * as BOX2D from "../../app/Box2D/Box2D";
import {
  b2BodyDef,
  b2Body,
  b2World,
  b2FixtureDef,
  b2BodyType,
  b2PolygonShape,
  b2Fixture
} from "../../app/Box2D/Box2D";

export class TestManyFixture {private bodyDef: BOX2D.b2BodyDef;
  public sprite: PIXI.Sprite;
  public body: b2Body;
  private world: b2World;
  private triangleGraphic: PIXI.Graphics = new PIXI.Graphics();
  private vertices:PIXI.Point[] = [];
  private colors:number[] = [];

  constructor(
      world: BOX2D.b2World,
      bodyType: b2BodyType,
      position: PIXI.IPoint,
      app:PIXI.Application
      ) {

    for(let i = 0; i < 7; i++){
      this.colors[i] = Math.random() * 16777216;
    }

    app.stage.addChild(this.triangleGraphic);
    this.triangleGraphic.pivot = new PIXI.Point(-32, 0);

    this.bodyDef = new b2BodyDef();
    this.bodyDef.type = bodyType;
    
    let newPos = world.PixelToWorldVector(position);

    this.bodyDef.position.Set(newPos.x, newPos.y);
    this.world = world;
    this.body = world.CreateBody(this.bodyDef);

    this.body.SetAngularVelocity(Math.random() * 2 * Math.PI - Math.PI);

    this.vertices.push(new PIXI.Point(0, 8));
    this.vertices.push(new PIXI.Point(0, 16));
    this.vertices.push(new PIXI.Point(12, 28));
    this.vertices.push(new PIXI.Point(16, 28));
    this.vertices.push(new PIXI.Point(24, 24));
    this.vertices.push(new PIXI.Point(32, 16));
    this.vertices.push(new PIXI.Point(32, 12));
    this.vertices.push(new PIXI.Point(20, 0));
    this.vertices.push(new PIXI.Point(8, 0));

    for(let i = 1; i < 8; i++)
    {
      var temp:PIXI.Point[] = [this.vertices[0], this.vertices[i], this.vertices[i+1]];
      var polyDef:b2PolygonShape = new b2PolygonShape();
      polyDef.Set(temp, 3);
      
      let fixtureTriangleDef = new b2FixtureDef();
        fixtureTriangleDef.shape = polyDef;
        fixtureTriangleDef.density = 1;
        fixtureTriangleDef.friction = 0.5;
        fixtureTriangleDef.restitution = 0.5;
      this.body.CreateFixture(fixtureTriangleDef);
    }
  }

  public onUpdate = () => {

    let angle = this.body.GetAngle();

    let pos = this.world.WorldToPixelVector(this.body.GetPosition());

    this.triangleGraphic.clear();

    let currentFixture:b2Fixture = this.body.GetFixtureList();

    this.triangleGraphic.beginFill(0x00ff00, 1);
    this.triangleGraphic.lineStyle(2, 0xff0000, 1);
    
    this.triangleGraphic.moveTo(-this.vertices[0].x, -this.vertices[0].y);
    this.triangleGraphic.lineTo(-this.vertices[1].x, -this.vertices[1].y);

    for(let i = 2; i < this.vertices.length; i++){
      this.triangleGraphic.lineTo(-this.vertices[i].x, -this.vertices[i].y);
    }

    this.triangleGraphic.closePath();

    this.triangleGraphic.position.x = pos.x;
    this.triangleGraphic.position.y = pos.y;

    this.triangleGraphic.rotation = -angle;
  };
}
