
namespace game {

    /** New System */
    export class ConnectSystem extends ut.ComponentSystem {

        private tileDistance:number;
        private backgroundTileSize:number;
        private boundsX:Vector2;
        private boundsY:Vector2;
        private lineThickness:number;
        private lineCoords:Vector4;
        private isEvenLevel:boolean;
        private currentGoalType:GoalTypes;
        private currentTile:Vector2;
        private currentNumber:number = -1;
        private isCompleted:boolean = false;
        private resetNextFrame:boolean = false;
        private isLocked:boolean = false;
        private isSetup:boolean = false;
        private isInTransition:boolean = false;

        OnUpdate():void {
            return;
            let spawnLine:boolean = false;
            
            this.world.forEach([ut.Entity, LevelSlider, CurrentRoot], (e, levelSlider, currentRoot) => {
                this.world.forEach([ut.Entity, ut.Core2D.TransformLocalPosition, ut.Core2D.TransformNode, ut.Core2D.TransformLocalScale, BackgroundType, Level, IsNewBackground], (bgEntity, bgPos, bgNode, bgScale, bgType, bgLevel) => {
                    //console.log("setup background");
                    bgType.Type = this.currentGoalType;
                    bgType.GridPosition = this.currentTile;
                    if(this.isEvenLevel) {
                        bgPos.position = new Vector3((this.currentTile.x * this.tileDistance - (this.tileDistance / 2)), (this.currentTile.y * this.tileDistance) - (this.tileDistance / 2), 0);
                    }else {
                        bgPos.position = new Vector3((this.currentTile.x * this.tileDistance), (this.currentTile.y * this.tileDistance), 0);
                    }
                    bgLevel.LevelIndex = levelSlider.LevelIndex;
                    //console.log("setting current root");
                    bgLevel.Root = currentRoot.RootEntity;
                    bgNode.parent = currentRoot.RootEntity;
                    bgScale.scale = new Vector3(this.backgroundTileSize, this.backgroundTileSize, 1);
                    this.world.removeComponent(bgEntity, IsNewBackground);
                });
                
                this.world.forEach([ut.Entity, ut.Core2D.TransformLocalPosition, ut.Core2D.TransformLocalScale, ut.Core2D.TransformNode, LineType, Level, IsNewLine], (lEntity, lPos, lScale, lNode, lType, lLevel) => {
                    lType.Type = this.currentGoalType;
                    lType.StartPoint = new Vector2(this.lineCoords.x, this.lineCoords.y);
                    lType.EndPoint = new Vector2(this.lineCoords.z, this.lineCoords.w);
                    if(this.isEvenLevel) {
                        if(Math.round(this.lineCoords.x) == Math.round(this.lineCoords.z)){
                            if(this.lineCoords.y > this.lineCoords.w) {
                                lPos.position = new Vector3(this.lineCoords.x*this.tileDistance - this.tileDistance/2, this.lineCoords.w*this.tileDistance, 0);
                                lScale.scale = new Vector3(this.lineThickness, this.tileDistance, 1);
                            }else{
                                lPos.position = new Vector3(this.lineCoords.x*this.tileDistance - this.tileDistance/2, this.lineCoords.y*this.tileDistance, 0);
                                lScale.scale = new Vector3(this.lineThickness, this.tileDistance, 1);
                            }
                        }else if(Math.round(this.lineCoords.y) == Math.round(this.lineCoords.w)){
                            if(this.lineCoords.x > this.lineCoords.z) {
                                lPos.position = new Vector3(this.lineCoords.z*this.tileDistance, this.lineCoords.y*this.tileDistance - this.tileDistance/2, 0);
                                lScale.scale = new Vector3(this.tileDistance, this.lineThickness, 1);
                            }else{
                                lPos.position = new Vector3(this.lineCoords.x*this.tileDistance, this.lineCoords.y*this.tileDistance - this.tileDistance/2, 0);
                                lScale.scale = new Vector3(this.tileDistance, this.lineThickness, 1);
                            }
                        }
                    }else {
                        if(Math.round(this.lineCoords.x) == Math.round(this.lineCoords.z)){
                            if(this.lineCoords.y > this.lineCoords.w) {
                                lPos.position = new Vector3(this.lineCoords.x*this.tileDistance, this.lineCoords.w*this.tileDistance + this.tileDistance/2, 0);
                                lScale.scale = new Vector3(this.lineThickness, this.tileDistance, 1);
                            }else{
                                lPos.position = new Vector3(this.lineCoords.x*this.tileDistance, this.lineCoords.y*this.tileDistance + this.tileDistance/2, 0);
                                lScale.scale = new Vector3(this.lineThickness, this.tileDistance, 1);
                            }
                        }else if(Math.round(this.lineCoords.y) == Math.round(this.lineCoords.w)){
                            if(this.lineCoords.x > this.lineCoords.z) {
                                lPos.position = new Vector3(this.lineCoords.z*this.tileDistance + this.tileDistance/2, this.lineCoords.y*this.tileDistance, 0);
                                lScale.scale = new Vector3(this.tileDistance, this.lineThickness, 1);
                            }else{
                                lPos.position = new Vector3(this.lineCoords.x*this.tileDistance + this.tileDistance/2, this.lineCoords.y*this.tileDistance, 0);
                                lScale.scale = new Vector3(this.tileDistance, this.lineThickness, 1);
                            }
                        }
                    }
                    lLevel.LevelIndex = levelSlider.LevelIndex;
                    lLevel.Root = currentRoot.RootEntity;
                    lNode.parent = currentRoot.RootEntity;
                    this.world.removeComponent(lEntity, IsNewLine);
                });

                this.isInTransition = levelSlider.IsInTransition;
                
                if (this.isCompleted && !this.isInTransition) {
                    console.log("going to next level");
                    levelSlider.GoToNextLevel = true;
                    this.isInTransition = true;
                    this.isCompleted = false;
                    this.isSetup = false;
                    //this.Reset(true);
                }
            });
            
            if(!this.isInTransition) {
                if (!this.isSetup) {
                    //console.log("doing setup");
                    this.world.forEach([WinConditions, Level, Grid], (winConditions, level, grid) => {
                        console.log("grid found");
                        this.world.forEach([LevelSlider], (slider) => {
                            if(slider.LevelIndex == level.LevelIndex) {
                                winConditions.HasCompletedMouse = false;
                                winConditions.HasCompletedCat = false;
                                winConditions.HasCompletedBunny = false;
                                winConditions.HasCompletedDog = false;
                                this.world.forEach([CurrentRoot], (currentRoot) => {
                                    this.world.forEach([ut.Entity, IsRoot], (e, isRoot) => {
                                        currentRoot.RootEntity = e;
                                    });
                                });
                                //console.log(grid.Tiles.length);
                                switch (grid.Tiles.length) {
                                    case 9:
                                        this.tileDistance = 2.2;
                                        this.backgroundTileSize = 1.8;
                                        this.boundsX= new Vector2(-1, 1);
                                        this.boundsY = new Vector2(-1, 1);
                                        this.lineThickness = 0.3;
                                        this.isEvenLevel = false;
                                        break;
                                    case 16:
                                        this.tileDistance = 1.65;
                                        this.backgroundTileSize = 1.3;
                                        this.isEvenLevel = true;
                                        this.boundsX= new Vector2(-1, 2);
                                        this.boundsY = new Vector2(-1, 2);
                                        this.lineThickness = 0.22;
                                        break;
                                    case 25:
                                        this.tileDistance = 1.32;
                                        this.backgroundTileSize = 1.015;
                                        this.isEvenLevel = false;
                                        this.boundsX= new Vector2(-2, 2);
                                        this.boundsY = new Vector2(-2, 2);
                                        this.lineThickness = 0.18;
                                        break;
                                    default:
                                        throw "grid amount not calculable";
                                }
                            }
                        });
                    });
                    //console.log("setup done");
                    this.isSetup = true;
                }
            }
            
            if(this.resetNextFrame) {
                this.Reset(true);
                this.resetNextFrame = false;
            }

            this.world.forEach([ut.Entity, Clicker], (entity, clicker) => {
                let click = clicker.Points[clicker.Points.length - 1];
                if(click != undefined) {
                    let clickX;
                    let clickY;
                    if(this.isEvenLevel) {
                        clickX = Math.round((click.x+(this.tileDistance/2)) / this.tileDistance);
                        clickY = Math.round((click.y+(this.tileDistance/2)) / this.tileDistance);
                        ////console.log(clickX + "  " + clickY);
                    }else{
                        clickX = Math.round(click.x / this.tileDistance);
                        clickY = Math.round(click.y / this.tileDistance);                        
                    }
                    this.world.forEach([ut.Entity, Tile, TileData], (tilEntity, tile, tileData) => {                        
                        if ((clicker.EndPoint.x == Global.NOT_A_NUMBER)) {
                            if(!this.isLocked) {
                                if (Math.round(tile.Position.x) == clickX && Math.round(tile.Position.y) == clickY) {
                                    switch (tileData.TileType) {
                                        case TileTypes.SOURCE:
                                            //console.log("source");
                                            if (this.currentGoalType != undefined && this.currentGoalType != tileData.GoalType) {
                                                //console.log("0");
                                                this.Reset(true);
                                                //console.log("1");
                                                break;
                                            }
                                            if(Math.round(this.currentNumber) == 0) break;
                                            //console.log("2");
                                            if (tileData.HasConnection) {
                                                //console.log("3");
                                                this.currentGoalType = tileData.GoalType;
                                                this.currentTile = tile.Position;
                                                this.currentNumber = 0;
                                                //console.log("4");
                                                this.CutLine(tileData, tileData.GoalType);
                                                break;
                                            }
                                            //console.log("5");
                                            this.currentGoalType = tileData.GoalType;
                                            this.currentTile = tile.Position;
                                            this.currentNumber = 0;
                                            tileData.NumberInLine = 0;
                                            tileData.HasConnection = true;
                                            tileData.IsBackgroundSet = false;
                                            //console.log("source done");
                                            break;
                                        case TileTypes.EMPTY:
                                            //console.log("empty");
                                            if (this.currentGoalType == undefined || this.currentTile == undefined) break;
                                            tileData.GoalType = this.currentGoalType;
                                            tileData.TileType = TileTypes.LINE;
                                            tileData.NumberInLine = ++this.currentNumber;
                                            tileData.ConnectedTo = this.currentTile;
                                            this.lineCoords = new Vector4(this.currentTile.x, this.currentTile.y, tile.Position.x, tile.Position.y);
                                            this.currentTile = tile.Position;
                                            tileData.HasConnection = true;
                                            tileData.IsBackgroundSet = false;
                                            spawnLine = true;
                                            break;
                                        case TileTypes.LINE:
                                            //console.log("line");
                                            if (this.currentTile == undefined) {
                                                this.currentGoalType = tileData.GoalType;
                                                this.currentTile = tile.Position;
                                                this.CutLine(tileData, tileData.GoalType);
                                            }

                                            if (this.currentGoalType == tileData.GoalType) {
                                                this.currentNumber = tileData.NumberInLine;
                                                if ((Math.round(this.currentTile.x) == Math.round(tile.Position.x)) &&
                                                    (Math.round(this.currentTile.y) == Math.round(tile.Position.y))) {
                                                    break;
                                                }
                                            } else {
                                                this.currentNumber++;
                                                this.RemoveBackground(tile.Position);
                                                tileData.IsBackgroundSet = false;
                                            }
                                            var oldType = tileData.GoalType;
                                            tileData.GoalType = this.currentGoalType;
                                            this.CutLine(tileData, oldType);
                                            tileData.ConnectedTo = this.currentTile;
                                            this.lineCoords = new Vector4(this.currentTile.x, this.currentTile.y, tile.Position.x, tile.Position.y);
                                            tileData.NumberInLine = this.currentNumber;
                                            this.currentTile = tile.Position;
                                            tileData.HasConnection = true;
                                            spawnLine = true;
                                            break;
                                        case TileTypes.GOAL:
                                            //console.log("goal");
                                            if (this.currentGoalType == undefined) break;
                                            if (this.currentGoalType != tileData.GoalType) {
                                                this.Reset(true);
                                                break;
                                            }
                                            if (tileData.HasConnection) break;
                                            tileData.ConnectedTo = this.currentTile;
                                            this.lineCoords = new Vector4(this.currentTile.x, this.currentTile.y, tile.Position.x, tile.Position.y);
                                            tileData.NumberInLine = ++this.currentNumber;
                                            this.currentTile = tile.Position;
                                            this.resetNextFrame = true;
                                            tileData.HasConnection = true;
                                            tileData.IsBackgroundSet = false;
                                            this.SetWinCondition(this.currentGoalType, true);
                                            spawnLine = true;
                                            break;
                                        default:
                                            throw "How is this even possible exception";
                                    }
                                }else{
                                    if((clickX < this.boundsX.x || clickX > this.boundsX.y) ||
                                       (clickY < this.boundsY.x || clickX > this.boundsY.y)) this.Reset(true);
                                }
                                if (tileData.HasConnection && !tileData.IsBackgroundSet) {
                                    this.SpawnBackground(tileData.GoalType);
                                    if(spawnLine)this.SpawnLine(tileData.GoalType);
                                    
                                    tileData.IsBackgroundSet = true;
                                }
                            }
                        }else{
                            if(this.isLocked) {
                                this.isLocked = false;
                                //console.log("else");
                            }
                            this.Reset(false);
                        }
                    });
                }
            });
            
            this.world.forEach([ButtonData, ButtonState], (data, state) => {
                if(!data.Clicked) return;
                data.Clicked = false;
                if(state.Next){
                    this.world.forEach([LevelSlider], (slider) => {
                        slider.GoToNextLevel = true;
                        this.isInTransition = true;
                        this.isSetup = false;
                        this.Reset(true);
                    });
                }else{
                    this.world.forEach([LevelSlider], (slider) => {
                        slider.GoToPreviousLevel = true;
                        this.isInTransition = true;
                        this.isSetup = false;
                        this.Reset(true);
                    });
                }
            });
        }

        private SpawnLine(goalType:GoalTypes):void{
            let name:string;
            switch (goalType) {
                case GoalTypes.Dog:
                    name = "dog";
                    break;
                case GoalTypes.Bunny:
                    name = "bunny";
                    break;
                case GoalTypes.Cat:
                    name = "cat";
                    break;
                case GoalTypes.Mouse:
                    name = "mouse";
                    break;
                case GoalTypes.NONE:
                    throw "Tried to spawn a background on NONE";
            }
            let temp = ut.EntityGroup.instantiate(this.world, "game." + name + "_line")[0];
        }

        private SpawnBackground(goalType:GoalTypes):void{
            //console.log("spawn Background");
            let name:string;
            switch (goalType) {
                case GoalTypes.Dog:
                    name = "dog";
                    break;
                case GoalTypes.Bunny:
                    name = "bunny";
                    break;
                case GoalTypes.Cat:
                    name = "cat";
                    break;
                case GoalTypes.Mouse:
                    name = "mouse";
                    break;
                case GoalTypes.NONE:
                    throw "Tried to spawn a background on NONE";
            }
            let temp = ut.EntityGroup.instantiate(this.world, "game." + name + "_bg")[0];
        }

        private SetWinCondition(goalType:GoalTypes, goalCompleted:boolean):void {
            this.world.forEach([WinConditions], (winConditions) => {
                switch (goalType){
                    case GoalTypes.Dog:
                        //console.log("dog completion" + goalCompleted);
                        winConditions.HasCompletedDog = goalCompleted;
                        break;
                    case GoalTypes.Bunny:
                        //console.log("bunny completion" + goalCompleted);
                        winConditions.HasCompletedBunny = goalCompleted;
                        break;
                    case GoalTypes.Cat:
                        //console.log("cat completion" + goalCompleted);
                        winConditions.HasCompletedCat = goalCompleted;
                        break;
                    case GoalTypes.Mouse:
                        //console.log("mouse completion" + goalCompleted);
                        winConditions.HasCompletedMouse = goalCompleted;
                        break;
                }

                this.isCompleted = (
                    (winConditions.MustCompleteDog == winConditions.HasCompletedDog) &&
                    (winConditions.MustCompleteBunny == winConditions.HasCompletedBunny) &&
                    (winConditions.MustCompleteCat == winConditions.HasCompletedCat) &&
                    (winConditions.MustCompleteMouse == winConditions.HasCompletedMouse)
                );
                //console.log(this.isCompleted);
            })
        }
        
        private Reset(shouldLock:boolean):void{
            ////console.log("reset");
            this.currentTile = undefined;
            this.currentGoalType = undefined;
            this.currentNumber = -1;
            if(!shouldLock)return;
            this.isLocked = true;
        }
            
        private CutLine(givenData:TileData, oldGoalType:GoalTypes):void{
            this.world.forEach([TileData, Tile], (tileData, tile) => {
                if(tileData.NumberInLine > givenData.NumberInLine && tileData.GoalType == oldGoalType) {
                    if (tileData.TileType == TileTypes.LINE) {
                        tileData.TileType = TileTypes.EMPTY;
                        tileData.GoalType = GoalTypes.NONE;
                    }
                    tileData.NumberInLine = 0;
                    this.RemoveBackground(tile.Position);
                    tileData.ConnectedTo = new Vector2();
                    tileData.IsBackgroundSet = false;
                    tileData.HasConnection = false;
                    this.RemoveLineSameType(tile.Position, oldGoalType);
                }
                if(tileData.NumberInLine == givenData.NumberInLine){
                    if(givenData.GoalType != oldGoalType) {
                        this.RemoveLineOtherType(tile.Position, givenData.GoalType);
                    }
                    if(tileData.TileType == TileTypes.GOAL && oldGoalType == tileData.GoalType  ){
                        this.RemoveLineStart(tile.Position, oldGoalType);
                    }
                }
                
            });
            this.SetWinCondition(oldGoalType, false);
        }
        
        private RemoveBackground(pos:Vector2){
            this.world.forEach([ut.Entity, BackgroundType], (entity, background) => {
                if ((Math.round(background.GridPosition.x) == Math.round(pos.x)) &&
                    (Math.round(background.GridPosition.y) == Math.round(pos.y))) {
                    this.world.destroyEntity(entity);
                }
            });
        }
        
        private RemoveLineSameType(pos:Vector2, type:GoalTypes):void{
            this.world.forEach([ut.Entity, LineType], (entity, line) => {
                if ((Math.round(line.EndPoint.x) == Math.round(pos.x)) &&
                    (Math.round(line.EndPoint.y) == Math.round(pos.y)) && 
                    (type == line.Type)) {
                    
                    this.world.destroyEntity(entity);
                }
            });
        }

        private RemoveLineOtherType(pos:Vector2, type:GoalTypes):void{
            this.world.forEach([ut.Entity, LineType], (entity, line) => {
                if ((Math.round(line.EndPoint.x) == Math.round(pos.x)) &&
                    (Math.round(line.EndPoint.y) == Math.round(pos.y)) &&
                    (type != line.Type)) {

                    this.world.destroyEntity(entity);
                }
            });
        }
        
        private RemoveLineStart(pos:Vector2, type:GoalTypes):void{
            this.world.forEach([ut.Entity, LineType], (entity, line) => {
                if ((Math.round(line.StartPoint.x) == Math.round(pos.x)) &&
                    (Math.round(line.StartPoint.y) == Math.round(pos.y))) {

                    this.world.destroyEntity(entity);
                }
            });
        }
    }
}

