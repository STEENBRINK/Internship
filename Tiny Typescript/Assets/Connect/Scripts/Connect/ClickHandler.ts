/// <reference path="LevelSystem.ts"/>

namespace game {

    @ut.executeAfter(game.LevelSystem)
    export class ClickHandler extends ut.ComponentSystem {

        OnUpdate():void {
            //return;
            this.world.forEach([Clicker, ConnectManager, LevelSlider, Drawer, Cutter, Resetter, SetWinCondition], (clicker, manager, slider, drawer, cutter, resetter, setWinCondition) => {
                //stop if game is resetting or the slider is in transition
                if(slider.IsInTransition || resetter.ResetType != ResetTypes.NONE || slider.GoToNextLevel || slider.GoToPreviousLevel ) return;

                //gets the click, stops if it is undefined
                let click = clicker.Points[clicker.Points.length - 1];
                if(click == undefined) return;

                //get the coords of the click, based on weather the level has an even amount of tiles or not
                let clickX;
                let clickY;
                if(drawer.HasEvenAmountOfTiles) {
                    clickX = Math.round((click.x+(drawer.TileDistance/2)) / drawer.TileDistance);
                    clickY = Math.round((click.y+(drawer.TileDistance/2)) / drawer.TileDistance);
                }else{
                    clickX = Math.round(click.x / drawer.TileDistance);
                    clickY = Math.round(click.y / drawer.TileDistance);
                }

                //if the click has ended stops and if the game was locked enable it again
                if ((clicker.EndPoint.x != Global.NOT_A_NUMBER)) {
                    if(manager.IsLocked) {
                        manager.IsLocked = false;
                    }
                    if(manager.CurrentGoalType != GoalTypes.NONE){
                        resetter.ResetType = ResetTypes.CurrentData;
                        resetter.WithLock = false;
                    }
                    return;
                }

                //stop when the game is locked
                if(manager.IsLocked) return;

                //stop when the click is outside of bounds
                if((clickX < manager.GridBounds.x || clickX > manager.GridBounds.y) ||
                   (clickY < manager.GridBounds.z || clickY > manager.GridBounds.w)) {
                    if(manager.CurrentGoalType == GoalTypes.NONE) return;
                    resetter.ResetType = ResetTypes.CurrentData;
                    resetter.WithLock = true;
                    return;
                }

                //get all the tiles in the world
                this.world.forEach([Tile, TileData], (tile, tileData) => {

                    //stops if the tile is not at the click position
                    if (Math.round(tile.Position.x) != clickX || Math.round(tile.Position.y) != clickY) return;
                    //console.log(tile.Position.x + " & " + tile.Position.y)

                    //start the logic based on the tile clicked
                    switch (tileData.TileType) {
                        
                        //source tile
                        case TileTypes.SOURCE:
                            //console.log("source");
                            //if a goal is already set, but is not the same as the tile clicked on, marks reset and breaks
                            if (manager.CurrentGoalType != GoalTypes.NONE && manager.CurrentGoalType != tileData.GoalType) {
                                resetter.ResetType = ResetTypes.CurrentData;
                                resetter.WithLock = true;
                                break;
                            }
                            
                            //if the number of the tile is 0, break
                            if((Math.round(manager.CurrentNumber) == 0) && manager.CurrentGoalType == tileData.GoalType) break;
                            
                            //cuts old line if connection was already present, setup first time connection variables if not
                            if (tileData.HasConnection) {
                                cutter.GoalType = tileData.GoalType;
                                cutter.From = tile.Position;
                                cutter.Number = 0;
                                manager.WaitForCut = true;
                            }else{
                                tileData.NumberInLine = 0;
                                tileData.HasConnection = true;
                                tileData.IsBackgroundSet = false;
                            }
                            
                            manager.CurrentGoalType = tileData.GoalType;
                            manager.CurrentTile = tile.Position;
                            manager.CurrentNumber = 0;
                            break;
                            
                        //empty tile
                        case TileTypes.EMPTY:
                            //console.log("empty");
                            //if no goal is set, breaks                            
                            if (manager.CurrentGoalType == GoalTypes.NONE) break;
                            
                            //first time connection setup
                            tileData.GoalType = manager.CurrentGoalType;
                            tileData.TileType = TileTypes.LINE;
                            tileData.NumberInLine = ++manager.CurrentNumber;
                            tileData.ConnectedTo = manager.CurrentTile;
                            drawer.LineCoords = new Vector4(manager.CurrentTile.x, manager.CurrentTile.y, tile.Position.x, tile.Position.y);
                            manager.CurrentTile = tile.Position;
                            tileData.HasConnection = true;
                            tileData.IsBackgroundSet = false;
                            tileData.IsLineSet = false;
                            break;
                            
                        //tile with a line already in it
                        case TileTypes.LINE:
                            //console.log("line");
                            
                            //if no goal was set, get the goal from the line and cuts it from this point
                            if (manager.CurrentGoalType == GoalTypes.NONE) {
                                manager.CurrentGoalType = tileData.GoalType;
                                manager.CurrentTile = tile.Position;
                                cutter.From = tile.Position;
                                cutter.GoalType = manager.CurrentGoalType;
                                cutter.Number = tileData.NumberInLine;
                                manager.WaitForCut = true;
                            }

                            //if the current tile is the same as the tile last frame, break, else setup connection data
                            if (manager.CurrentGoalType == tileData.GoalType) {
                                manager.CurrentNumber = tileData.NumberInLine;
                                if ((Math.round(manager.CurrentTile.x) == Math.round(tile.Position.x)) &&
                                    (Math.round(manager.CurrentTile.y) == Math.round(tile.Position.y))) {
                                    break;
                                }
                            } else {
                                manager.CurrentNumber++;
                                tileData.IsBackgroundSet = false;
                                tileData.IsLineSet = false;
                            }
                            cutter.GoalType = tileData.GoalType;
                            cutter.Number = tileData.NumberInLine;
                            cutter.From = tile.Position;
                            tileData.GoalType = manager.CurrentGoalType;
                            tileData.ConnectedTo = manager.CurrentTile;
                            drawer.LineCoords = new Vector4(manager.CurrentTile.x, manager.CurrentTile.y, tile.Position.x, tile.Position.y);
                            tileData.NumberInLine = manager.CurrentNumber;
                            manager.CurrentTile = tile.Position;
                            break;
                            
                        //goal tile
                        case TileTypes.GOAL:
                            //console.log("goal");

                            //if the tile is already connected, break
                            if (tileData.HasConnection) break;
                            
                            //if no goal is set, break
                            if (manager.CurrentGoalType == GoalTypes.NONE) break;
                            
                            //if goal is not the same as the tiles goal, reset and break
                            if (manager.CurrentGoalType != tileData.GoalType) {
                                resetter.ResetType = ResetTypes.CurrentData;
                                resetter.WithLock = true;
                                break;
                            }
                            
                            //connection setup
                            tileData.ConnectedTo = manager.CurrentTile;
                            drawer.LineCoords = new Vector4(manager.CurrentTile.x, manager.CurrentTile.y, tile.Position.x, tile.Position.y);
                            tileData.NumberInLine = ++manager.CurrentNumber;
                            manager.CurrentTile = tile.Position;
                            resetter.ResetType = ResetTypes.CurrentData;
                            resetter.WithLock = true;
                            tileData.HasConnection = true;
                            tileData.IsBackgroundSet = false;
                            tileData.IsLineSet = false;
                            setWinCondition.GoalType = manager.CurrentGoalType;
                            setWinCondition.IsCompleted = true;
                            manager.HasCompletedObjective = true;
                            break;
                        default:
                            throw "How is this even possible exception";
                    }
                });
            });
        }
    }
}
