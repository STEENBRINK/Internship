abstract class IUpdate {
    public Update():void{

    }
}

abstract class World implements IUpdate{
    public Create(){

    }

    public Update(){

    }

    protected Step(){

    }
}

class Box2DWorld extends World{

    constructor(){
        super();
        this.Create();
    }

    public Create(){

    }

    protected Step(){

    }

    public Update(){
        this.Step();
    }
}

class MatterJSWorld extends World{

    constructor(){
        super();
        this.Create();
    }

    public Create(){

    }

    protected Step(){

    }

    public Update(){
        this.Step();
    }
}

class PhysicsHandler{
    private world: World;

    public CreateWorld(world:World){
        this.world = world;
    }
}

abstract class Loader{
    constructor(sprites:Map<string, number>){
        this.load(sprites)
    }

    protected load(sprites:Map<string,number>){
    }
}

class PixiLoader extends Loader{
    constructor(sprites:Map<string, number>){
        super(sprites);
    }

    protected load(sprites:Map<string, number>){
        //it runs this load, if you want the load class from the partent, call super()
    }
}

export class App {
    private physicsHanlder;
    private assetsLoader;

    constructor(){
        this.physicsHanlder = new PhysicsHandler();
        this.physicsHanlder.CreateWorld(new Box2DWorld());
        this.physicsHanlder.CreateWorld(new MatterJSWorld());

        let myResources:Map<string, number> = new Map<string, number>();

        myResources.set("PlayerSprite", 1);
        myResources.set("EnemySprite", 2);

        this.assetsLoader = new PixiLoader(myResources);
    }
}

