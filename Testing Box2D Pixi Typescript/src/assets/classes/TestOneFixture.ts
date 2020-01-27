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

export class TestOneFixture {private bodyDef: BOX2D.b2BodyDef;
  public sprite: PIXI.Sprite;
  public body: b2Body;
  private world: b2World;
  private triangleGraphic: PIXI.Graphics = new PIXI.Graphics();

  private colors:number[] = [];

  constructor(
      world: BOX2D.b2World,
      bodyType: b2BodyType,
      position: PIXI.IPoint,
      app:PIXI.Application
      ) {

    app.stage.addChild(this.triangleGraphic);
    this.triangleGraphic.pivot = new PIXI.Point(-32, 0);

    this.bodyDef = new b2BodyDef();
    this.bodyDef.type = bodyType;
    
    let newPos = world.PixelToWorldVector(position);

    this.bodyDef.position.Set(newPos.x, newPos.y);
    this.world = world;
    this.body = world.CreateBody(this.bodyDef);

    this.body.SetAngularVelocity(Math.random() * 2 * Math.PI - Math.PI);

    var vertices:PIXI.Point[] = [];
    vertices.push(new PIXI.Point(0, 8));
    vertices.push(new PIXI.Point(0, 12));
    vertices.push(new PIXI.Point(0, 16));
    vertices.push(new PIXI.Point(4, 20));
    vertices.push(new PIXI.Point(8, 24));
    vertices.push(new PIXI.Point(12, 28));
    vertices.push(new PIXI.Point(16, 28));
    vertices.push(new PIXI.Point(20, 26));
    vertices.push(new PIXI.Point(24, 24));
    vertices.push(new PIXI.Point(28, 20));
    vertices.push(new PIXI.Point(32, 16));
    vertices.push(new PIXI.Point(32, 12));
    vertices.push(new PIXI.Point(28, 12));
    vertices.push(new PIXI.Point(24, 12));
    vertices.push(new PIXI.Point(20, 0));
    vertices.push(new PIXI.Point(18, 0));
    vertices.push(new PIXI.Point(16, 0));
    vertices.push(new PIXI.Point(14, 0));
    vertices.push(new PIXI.Point(12, 0));
    vertices.push(new PIXI.Point(8, 0));

    var polyDef:b2PolygonShape = new b2PolygonShape();
      polyDef.Set(vertices, vertices.length);
    
    let fixtureTriangleDef = new b2FixtureDef();
      fixtureTriangleDef.shape = polyDef;
      fixtureTriangleDef.density = 1;
      fixtureTriangleDef.friction = 0.5;
      fixtureTriangleDef.restitution = 0.5;
    this.body.CreateFixture(fixtureTriangleDef);
  }

  public onUpdate = () => {

    let angle = this.body.GetAngle();

    let pos = this.world.WorldToPixelVector(this.body.GetPosition());

    this.triangleGraphic.clear();

    this.triangleGraphic.position.x = pos.x;
    this.triangleGraphic.position.y = pos.y;

    var vertices = this.body.GetFixtureList().m_shape.m_vertices;

    this.triangleGraphic.beginFill(0x00ff00, 1);
    this.triangleGraphic.lineStyle(2, 0xff0000, 1);

    this.triangleGraphic.moveTo(-vertices[0].x, -vertices[0].y);
    this.triangleGraphic.lineTo(-vertices[1].x, -vertices[1].y);
    this.triangleGraphic.lineTo(-vertices[2].x, -vertices[2].y);
    this.triangleGraphic.lineTo(-vertices[3].x, -vertices[3].y);
    this.triangleGraphic.lineTo(-vertices[4].x, -vertices[4].y);
    this.triangleGraphic.lineTo(-vertices[5].x, -vertices[5].y);
    this.triangleGraphic.lineTo(-vertices[6].x, -vertices[6].y);
    this.triangleGraphic.lineTo(-vertices[7].x, -vertices[7].y);
    this.triangleGraphic.lineTo(-vertices[8].x, -vertices[8].y);
    this.triangleGraphic.closePath();

    this.triangleGraphic.rotation = -angle;
  };
}
