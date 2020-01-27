/// <reference path="LevelSystem.ts"/>

namespace game {

    @ut.executeAfter(game.LevelSystem)
    @ut.executeBefore(game.ClickHandler)
    export class MyButtonSystem extends ut.ComponentSystem {
        
        OnUpdate():void {
            //return;
            this.world.forEach([LevelManager, Resetter, LevelSlider], (lvlManager, resetter, slider) =>{

                this.world.forEach([ButtonData, ButtonState], (data, state)=>{
                    if(slider.IsInTransition || slider.GoToNextLevel || slider.GoToPreviousLevel) data.Clicked = false;
                    if(!data.Clicked) return;
                    data.Clicked = false;
                    //console.log("clicked");
                    lvlManager.Action = (state.Next) ? LevelMangerActions.GoToNextLevel : lvlManager.Action = LevelMangerActions.GoToPreviousLevel;
                });

                this.world.forEach([ButtonData, ResetButton], (data)=>{
                    if(slider.IsInTransition || slider.GoToNextLevel || slider.GoToPreviousLevel) data.Clicked = false;
                    if(!data.Clicked) return;
                    data.Clicked = false;
                    resetter.ResetType = ResetTypes.Level;
                    resetter.WithLock = true;
                    resetter.WithVisuals = true;
                });
            });
        }
    }
}
