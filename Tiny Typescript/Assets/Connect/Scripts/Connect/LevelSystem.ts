namespace game {

    export class LevelSystem extends ut.ComponentSystem {
        
        OnUpdate():void {
            //return;
            this.world.forEach([LevelManager, ConnectManager, LevelSlider, Resetter], (lvlManager, manager, slider, resetter)=> {
                if(lvlManager.Action == LevelMangerActions.NONE) return;
                //console.log("setting slider");
                (lvlManager.Action == LevelMangerActions.GoToNextLevel) ? slider.GoToNextLevel = true : slider.GoToPreviousLevel = true;
                manager.IsSetup = false;
                resetter.ResetType = ResetTypes.CurrentData;
                resetter.WithLock = true;
                lvlManager.Action = LevelMangerActions.NONE;
            });
        }
    }
}
