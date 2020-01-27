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
  b2Color,
  b2Draw
} from "../../app/Box2D/Box2D";

export class CustomShape {
    private bodyDef: BOX2D.b2BodyDef;
    public sprite: PIXI.Sprite;
    public body: BOX2D.b2Body;
    private world: b2World;
    private roundedAmount: number;
    private theta: number;
    private radius:number;
    private r:number;
    private circleGraphic:PIXI.Graphics = new PIXI.Graphics();
    private colors:number[] = []

    constructor(
        world: BOX2D.b2World,
        texture: PIXI.Texture,
        bodyType: b2BodyType,
        position: PIXI.IPoint,
        size: number,
        r:number,
        amount:number,
        app: PIXI.Application
      ) {

      app.stage.addChild(this.circleGraphic);

      this.roundedAmount = Math.round(amount);

      for(let i = 0; i < this.roundedAmount; i++){
        this.colors[i] = Math.random() * 16777216;
      }
      this.r = r;

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

      let poligonShape = new BOX2D.b2PolygonShape();
      poligonShape.SetAsBox(size * 0.5, size * 0.5);

      let fixtureDef = new b2FixtureDef();
      fixtureDef.shape = poligonShape;
      fixtureDef.density = 0.5;
      fixtureDef.friction = 0.5;
      fixtureDef.restitution = 0.5;
      this.body.CreateFixture(fixtureDef);

      var R = r/Math.sin(Math.PI/this.roundedAmount);
      if(this.roundedAmount == 2 || this.roundedAmount == 4) {
        if(R < size/2 + r) {R = size/2 + r }
      } else {
        if(R < ((size/2) * Math.SQRT2 + r)) { R = (size/2) * Math.SQRT2 + r } 
      } 

      if(this.roundedAmount == 1) R = size/2 + r;

      this.radius = R;

      this.theta = (360/this.roundedAmount) * Math.PI / 180;

      for(let i = 0; i < this.roundedAmount; i++){
        let circleShape = new BOX2D.b2CircleShape(r);
        circleShape.m_p.Set(Math.cos(this.theta * i) * this.radius, Math.sin(this.theta * i) * this.radius);

        let fixtureCDef = new b2FixtureDef();
        fixtureCDef.shape = circleShape;
        fixtureCDef.density = 1 * r;
        fixtureCDef.friction = 0.5;
        fixtureCDef.restitution = 0.5;
        this.body.CreateFixture(fixtureCDef);
      }

      this.sprite.anchor = new PIXI.Point(0.5, 0.5);
      this.body.SetAngularVelocity(Math.random() * 2 * Math.PI - Math.PI);
    }

    public SetPosition(): void {}

    public onUpdate = () => {

      var angle = this.body.GetAngle();
      this.sprite.position = this.world.WorldToPixelVector(this.body.GetPosition());
      this.sprite.rotation = -angle;

      let pos = this.world.WorldToPixelVector(this.body.GetPosition());

      this.circleGraphic.clear();

      for(let i = 0; i < this.roundedAmount; i++) {
        this.circleGraphic.beginFill(this.colors[i]);
        this.circleGraphic.drawCircle(pos.x + Math.cos( -(this.theta * i + angle)) * this.radius, pos.y + Math.sin( -(this.theta * i + angle)) * this.radius, this.r);
        this.circleGraphic.endFill();
      }
    };
}
