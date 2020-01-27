/// <reference path="LevelSystem.ts"/>

namespace game {

    @ut.executeAfter(game.LevelSystem)
    @ut.executeBefore(game.ClickHandler)
    export class CutSystem extends ut.ComponentSystem {
        
        OnUpdate():void {
            //return;
            this.world.forEach([Cutter, ConnectManager, SetWinCondition], (cutter, manager, setWinCondition) => {
                
                if(cutter.GoalType == GoalTypes.NONE) return;

                this.world.forEach([TileData, Tile], (tileData, tile) => {

                    if(tileData.NumberInLine > cutter.Number && tileData.GoalType == cutter.GoalType) {
                        if (tileData.TileType == TileTypes.LINE) {
                            tileData.TileType = TileTypes.EMPTY;
                            tileData.GoalType = GoalTypes.NONE;
                        }

                        tileData.NumberInLine = 0;
                        this.RemoveBackground(tile.Position);
                        tileData.ConnectedTo = new Vector2();
                        tileData.IsBackgroundSet = false;
                        tileData.HasConnection = false;
                        this.RemoveLineEnd(tile.Position, cutter.GoalType);
                    }

                    if(tileData.NumberInLine == manager.CurrentNumber && tileData.GoalType == manager.CurrentGoalType){

                        if(manager.CurrentGoalType != cutter.GoalType) {
                            this.RemoveLineEnd(tile.Position, cutter.GoalType);
                            this.RemoveBackground(tile.Position);
                        }

                        if(tileData.TileType == TileTypes.GOAL && cutter.GoalType == tileData.GoalType  ){
                            this.RemoveLineStart(tile.Position, cutter.GoalType);
                        }
                    }
                });
            
                setWinCondition.GoalType = cutter.GoalType;
                setWinCondition.IsCompleted = false;
                cutter.GoalType = GoalTypes.NONE;
                manager.WaitForCut = false;
            });
        }
        
        private RemoveBackground(pos:Vector2){
            this.world.forEach([ut.Entity, BackgroundType], (entity, background) => {
                if ((Math.round(background.GridPosition.x) == Math.round(pos.x)) &&
                    (Math.round(background.GridPosition.y) == Math.round(pos.y))) {
                    this.world.destroyEntity(entity);
                }
            });
        }
        
        private RemoveLineEnd(pos:Vector2, type:GoalTypes):void{
            this.world.forEach([ut.Entity, LineType], (entity, line) => {
                if ((Math.round(line.EndPoint.x) == Math.round(pos.x)) &&
                    (Math.round(line.EndPoint.y) == Math.round(pos.y)) && 
                    (type == line.Type)) {
                    
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
