/// <reference path="LevelSystem.ts"/>

namespace game {

    @ut.executeAfter(game.LevelSystem)
    export class WinConditionSystem extends ut.ComponentSystem {

        OnUpdate():void {
            //return;            
            this.world.forEach([SetWinCondition, LevelManager], (setWinCondition, lvlManager) => {
                
                if(setWinCondition.GoalType == GoalTypes.NONE) return;
                
                this.world.forEach([WinConditions], (winConditions) => {
                    switch (setWinCondition.GoalType){
                        case GoalTypes.Dog:
                            //console.log("dog completion" + goalCompleted);
                            winConditions.HasCompletedDog = setWinCondition.IsCompleted;
                            break;
                        case GoalTypes.Bunny:
                            //console.log("bunny completion" + goalCompleted);
                            winConditions.HasCompletedBunny = setWinCondition.IsCompleted;
                            break;
                        case GoalTypes.Cat:
                            //console.log("cat completion" + goalCompleted);
                            winConditions.HasCompletedCat = setWinCondition.IsCompleted;
                            break;
                        case GoalTypes.Mouse:
                            //console.log("mouse completion" + goalCompleted);
                            winConditions.HasCompletedMouse = setWinCondition.IsCompleted;
                            break;
                    }

                    winConditions.IsCompleted = (
                        (winConditions.MustCompleteDog == winConditions.HasCompletedDog) &&
                        (winConditions.MustCompleteBunny == winConditions.HasCompletedBunny) &&
                        (winConditions.MustCompleteCat == winConditions.HasCompletedCat) &&
                        (winConditions.MustCompleteMouse == winConditions.HasCompletedMouse)
                    );

                    if(winConditions.IsCompleted) lvlManager.Action = LevelMangerActions.GoToNextLevel;
                });
                
                setWinCondition.GoalType = GoalTypes.NONE;
            });
        }
    }
}
