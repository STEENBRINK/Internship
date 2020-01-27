/// <reference path="LevelSystem.ts"/>

namespace game {

    @ut.executeAfter(game.LevelSystem)
    @ut.executeBefore(game.ClickHandler)
    export class SetupSystem extends ut.ComponentSystem {
        OnUpdate():void {
            //return;
            this.world.forEach([ConnectManager, Drawer, TileSizes, Resetter, LevelSlider], (manager, drawer, tileSizes, resetter, slider)=>{
                if(manager.IsSetup || slider.IsInTransition || slider.GoToNextLevel || slider.GoToPreviousLevel) return;

                this.world.forEach([Grid], (grid)=>{
                    let rowLength = Math.sqrt(grid.Tiles.length)
                    if(rowLength%1 != 0.0) throw "not a square grid -> SetupSystem";
                    drawer.TileDistance = tileSizes.TileDistance[rowLength];
                    drawer.TileSize = tileSizes.TileSize[rowLength];
                    drawer.LineThickness = tileSizes.LineThickness[rowLength];
                    drawer.HasEvenAmountOfTiles = (rowLength%2 == 0.0);
                    //console.log(drawer.HasEvenAmountOfTiles);

                    if(drawer.HasEvenAmountOfTiles){
                        let bounds = (rowLength)/2;
                        manager.GridBounds = new Vector4(-bounds+1, bounds, -bounds+1, bounds);
                    }else{
                        let bounds = (rowLength-1)/2;
                        manager.GridBounds = new Vector4(-bounds, bounds, -bounds, bounds);
                    }
                });

                this.world.forEach([CurrentRoot], (currentRoot) => {
                    this.world.forEach([ut.Entity, IsRoot], (e, isRoot) => {
                        currentRoot.RootEntity = e;
                    });
                });

                resetter.ResetType = ResetTypes.Level;
                manager.IsSetup = true;
            });
        }
    }
}
