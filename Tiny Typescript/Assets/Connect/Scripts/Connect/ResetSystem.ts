/// <reference path="LevelSystem.ts"/>

namespace game {

    @ut.executeAfter(game.LevelSystem)
    @ut.executeBefore(game.ClickHandler)
    export class ResetSystem extends ut.ComponentSystem {
        
        OnUpdate():void {
            //return;
            this.world.forEach([ConnectManager, Resetter, LevelSlider], (manager, resetter, slider)=> {
                if(slider.IsInTransition || slider.GoToNextLevel || slider.GoToPreviousLevel) {
                    manager.IsLocked = true;
                    return;
                }
                switch(resetter.ResetType){
                    case ResetTypes.NONE:
                        return;
                    case ResetTypes.CurrentData:
                        //console.log("resetting data");
                        manager.CurrentGoalType = GoalTypes.NONE;
                        manager.CurrentNumber = -1;
                        if(resetter.WithLock) manager.IsLocked = true;
                        resetter.ResetType = ResetTypes.NONE;
                        return;

                    case ResetTypes.Level:
                        //console.log("resetting level");

                        manager.CurrentGoalType = GoalTypes.NONE;
                        manager.CurrentNumber = -1;

                        this.world.forEach([TileData], (tileData) =>{
                            if (tileData.TileType == TileTypes.LINE) {
                                tileData.TileType = TileTypes.EMPTY;
                                tileData.GoalType = GoalTypes.NONE;
                            }
                            tileData.NumberInLine = 0;
                            tileData.ConnectedTo = new Vector2();
                            tileData.HasConnection = false;
                        });
                        this.world.forEach([WinConditions], (winConditions)=>{
                            winConditions.HasCompletedMouse = false;
                            winConditions.HasCompletedCat = false;
                            winConditions.HasCompletedBunny = false;
                            winConditions.HasCompletedDog = false;
                        });
                        if(resetter.WithLock) manager.IsLocked = true;
                        if(resetter.WithVisuals) this.DestroyVisuals();
                        resetter.ResetType = ResetTypes.NONE;
                        return;
                }
            });
        }

        private DestroyVisuals():void{
            let destroy: Array<ut.Entity> = new Array<ut.Entity>();
            this.world.forEach([ut.Entity, DestroyOnLevelSlide], (e) => {
                destroy.push(EntityUtils.CopyEntity(e));
            });
            
            for(let i = 1; i <= destroy.length; i++) {
                EntityUtils.DestroyEntity(this.world, destroy[i-1], true);
            }
        }
    }
}