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

export class OneBodyManyTriangles {private bodyDef: BOX2D.b2BodyDef;
  public sprite: PIXI.Sprite;
  public body: b2Body;
  private world: b2World;
  private triangleGraphic: PIXI.Graphics = new PIXI.Graphics();
  private smallRadius: number;
  private bigRadius: number;
  private riblength: number;
  private roundedAmount:number;
  private theta:number;
  private radius:number;

  private colors:number[] = [];

  constructor(
      world: BOX2D.b2World,
      texture: PIXI.Texture,
      bodyType: b2BodyType,
      position: PIXI.IPoint,
      size: number,
      riblength:number,
      amount: number,
      app:PIXI.Application
      ) {

    this.riblength = riblength;
    this.smallRadius = (this.riblength/2) * Math.tan(30 / 180 * Math.PI);
    this.bigRadius = (this.riblength/2) / Math.cos(30 / 180 * Math.PI);
    this.roundedAmount = Math.round(amount);

    for(let i = 0; i < this.roundedAmount; i++){
      this.colors[i] = Math.random() * 16777216;
    }

    app.stage.addChild(this.triangleGraphic);

    this.sprite = new PIXI.Sprite(texture);
    this.sprite.width = size;
    this.sprite.height = size;
    this.sprite.position = position;
    this.bodyDef = new b2BodyDef();
    this.bodyDef.type = bodyType;
    
    let newPos = world.PixelToWorldVector(position);

    this.bodyDef.position.Set(newPos.x, newPos.y);
    this.world = world;
    this.body = world.CreateBody(this.bodyDef);
    let boxShape = new BOX2D.b2PolygonShape();
    boxShape.SetAsBox(size * 0.5, size * 0.5);

    let fixtureDef = new b2FixtureDef();
    fixtureDef.shape = boxShape;
    fixtureDef.density = 1;
    fixtureDef.friction = 0.5;
    fixtureDef.restitution = 0.5;
    this.body.CreateFixture(fixtureDef);

    this.sprite.anchor = new PIXI.Point(0.5, 0.5);
    this.body.SetAngularVelocity(Math.random() * 2 * Math.PI - Math.PI);

    var R = this.bigRadius/Math.sin(Math.PI/this.roundedAmount) - this.smallRadius;
    if(this.roundedAmount == 1) R = size/2;
    if(this.roundedAmount == 2) R = size/2;
    if(this.roundedAmount == 4 && R < size/2) R = size/2;
    if(this.roundedAmount != 1 && this.roundedAmount != 2 && this.roundedAmount != 4 && R < ((size/2) * Math.SQRT2)) { R = (size/2) * Math.SQRT2 } 

    this.radius = R;
    this.theta = (360/this.roundedAmount) * Math.PI / 180;
    var offset = Math.atan((this.riblength/2) / R);

    for(let i = 0; i < this.roundedAmount; i++){
      var vertices:PIXI.Point[] = [];
      var angle = this.theta * i;

      var AM = this.riblength/2 / Math.sin(offset);
      vertices.push(new PIXI.Point(Math.sin(angle - offset) * AM, Math.cos(angle - offset) * AM ));
      vertices.push(new PIXI.Point(Math.sin(angle) * (this.radius + this.bigRadius + this.smallRadius), Math.cos(angle) * (this.radius + this.bigRadius + this.smallRadius)));
      vertices.push(new PIXI.Point(Math.sin(angle + offset) * AM, Math.cos(angle + offset) * AM));

      var polyDef:b2PolygonShape = new b2PolygonShape();
        polyDef.Set(vertices, vertices.length);
      
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
    this.sprite.position = this.world.WorldToPixelVector(
      this.body.GetPosition()
    );
    this.sprite.rotation = -angle;

    let pos = this.world.WorldToPixelVector(this.body.GetPosition());

    this.triangleGraphic.clear();

    this.triangleGraphic.position.x = pos.x;
    this.triangleGraphic.position.y = pos.y;

    let currentFixture:b2Fixture = this.body.GetFixtureList();

    var i = 0;
    while(currentFixture.m_next != null){

      var vertices = currentFixture.m_shape.m_vertices;

      this.triangleGraphic.beginFill(this.colors[i], 1);

      this.triangleGraphic.moveTo(-vertices[0].x, -vertices[0].y);
      this.triangleGraphic.lineTo(-vertices[1].x, -vertices[1].y);
      this.triangleGraphic.lineTo(-vertices[2].x, -vertices[2].y);
      this.triangleGraphic.closePath();

      currentFixture = currentFixture.m_next;
      i++;
    }

    this.triangleGraphic.rotation = -angle;
  };
}
