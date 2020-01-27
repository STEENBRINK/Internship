/// <reference path="LevelSystem.ts"/>

namespace game {

    @ut.executeAfter(game.LevelSystem)
    @ut.executeBefore(game.ClickHandler)
    @ut.executeAfter(game.CutSystem)
    export class DrawSystem extends ut.ComponentSystem {
        
        OnUpdate():void {
            //return;
            this.world.forEach([TileData], (tileData)=>{
                if(!tileData.HasConnection || tileData.IsBackgroundSet) return;
                this.SpawnBackground(tileData.GoalType);
                tileData.IsBackgroundSet = true;
            });

            this.world.forEach([TileData], (tileData)=>{
                if(!tileData.HasConnection || tileData.IsLineSet || tileData.TileType == TileTypes.SOURCE) return;
                this.SpawnLine(tileData.GoalType);
                tileData.IsLineSet = true;
            });

            this.world.forEach([CurrentRoot, ConnectManager, LevelSlider, Drawer], (currentRoot, manager, slider, drawer)=>{
                this.world.forEach([ut.Entity, ut.Core2D.TransformLocalPosition, ut.Core2D.TransformNode, ut.Core2D.TransformLocalScale, BackgroundType, Level, IsNewBackground], (bgEntity, bgPos, bgNode, bgScale, bgType, bgLevel) => {
                
                    bgType.Type = manager.CurrentGoalType;
                    bgType.GridPosition = manager.CurrentTile;
                    bgLevel.LevelIndex = slider.LevelIndex;
                    bgLevel.Root = currentRoot.RootEntity;
                    bgNode.parent = currentRoot.RootEntity;
                    bgScale.scale = new Vector3(drawer.TileSize, drawer.TileSize, 1);
                    if(drawer.HasEvenAmountOfTiles){
                        bgPos.position = new Vector3((manager.CurrentTile.x * drawer.TileDistance - (drawer.TileDistance / 2)), (manager.CurrentTile.y * drawer.TileDistance) - (drawer.TileDistance / 2), 0);
                    }else {
                        bgPos.position = new Vector3((manager.CurrentTile.x * drawer.TileDistance), (manager.CurrentTile.y * drawer.TileDistance), 0);
                    }
                    this.world.removeComponent(bgEntity, IsNewBackground);
                });

                this.world.forEach([ut.Entity, ut.Core2D.TransformLocalPosition, ut.Core2D.TransformLocalScale, ut.Core2D.TransformNode, LineType, Level, IsNewLine], (lEntity, lPos, lScale, lNode, lType, lLevel) => {
                    lType.Type = manager.CurrentGoalType;
                    lType.StartPoint = new Vector2(drawer.LineCoords.x, drawer.LineCoords.y);
                    lType.EndPoint = new Vector2(drawer.LineCoords.z, drawer.LineCoords.w);
                    lLevel.LevelIndex = slider.LevelIndex;
                    lLevel.Root = currentRoot.RootEntity;
                    lNode.parent = currentRoot.RootEntity;

                    if(drawer.HasEvenAmountOfTiles) {
                        if(Math.round(drawer.LineCoords.x) == Math.round(drawer.LineCoords.z)){
                            if(drawer.LineCoords.y > drawer.LineCoords.w) {
                                lPos.position = new Vector3(drawer.LineCoords.x*drawer.TileDistance - drawer.TileDistance/2, drawer.LineCoords.w*drawer.TileDistance, 0);
                                lScale.scale = new Vector3(drawer.LineThickness, drawer.TileDistance, 1);
                            }else{
                                lPos.position = new Vector3(drawer.LineCoords.x*drawer.TileDistance - drawer.TileDistance/2, drawer.LineCoords.y*drawer.TileDistance, 0);
                                lScale.scale = new Vector3(drawer.LineThickness, drawer.TileDistance, 1);
                            }
                        }else if(Math.round(drawer.LineCoords.y) == Math.round(drawer.LineCoords.w)){
                            if(drawer.LineCoords.x > drawer.LineCoords.z) {
                                lPos.position = new Vector3(drawer.LineCoords.z*drawer.TileDistance, drawer.LineCoords.y*drawer.TileDistance - drawer.TileDistance/2, 0);
                                lScale.scale = new Vector3(drawer.TileDistance, drawer.LineThickness, 1);
                            }else{
                                lPos.position = new Vector3(drawer.LineCoords.x*drawer.TileDistance, drawer.LineCoords.y*drawer.TileDistance - drawer.TileDistance/2, 0);
                                lScale.scale = new Vector3(drawer.TileDistance, drawer.LineThickness, 1);
                            }
                        }
                    }else {
                        if(Math.round(drawer.LineCoords.x) == Math.round(drawer.LineCoords.z)){
                            if(drawer.LineCoords.y > drawer.LineCoords.w) {
                                lPos.position = new Vector3(drawer.LineCoords.x*drawer.TileDistance, drawer.LineCoords.w*drawer.TileDistance + drawer.TileDistance/2, 0);
                                lScale.scale = new Vector3(drawer.LineThickness, drawer.TileDistance, 1);
                            }else{
                                lPos.position = new Vector3(drawer.LineCoords.x*drawer.TileDistance, drawer.LineCoords.y*drawer.TileDistance + drawer.TileDistance/2, 0);
                                lScale.scale = new Vector3(drawer.LineThickness, drawer.TileDistance, 1);
                            }
                        }else if(Math.round(drawer.LineCoords.y) == Math.round(drawer.LineCoords.w)){
                            if(drawer.LineCoords.x > drawer.LineCoords.z) {
                                lPos.position = new Vector3(drawer.LineCoords.z*drawer.TileDistance + drawer.TileDistance/2, drawer.LineCoords.y*drawer.TileDistance, 0);
                                lScale.scale = new Vector3(drawer.TileDistance, drawer.LineThickness, 1);
                            }else{
                                lPos.position = new Vector3(drawer.LineCoords.x*drawer.TileDistance + drawer.TileDistance/2, drawer.LineCoords.y*drawer.TileDistance, 0);
                                lScale.scale = new Vector3(drawer.TileDistance, drawer.LineThickness, 1);
                            }
                        }
                    }
                    this.world.removeComponent(lEntity, IsNewLine);
                });
            });
        }

        private SpawnBackground(goalType:GoalTypes):void{
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
    }
}
