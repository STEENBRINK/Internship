
namespace game {
	/** System to automatically add tile entities to the Grid component on a grid entity */
	export class GridTileLoadingSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([ut.Entity, GridTileLoader], (entity, loader) => {
				if (!this.world.hasComponent(loader.GridReference, Grid)) {
					console.error("[GridTileLoadingSystem] Referenced grid entity does not contain the game.Grid component.");
					return;
				}

				let grid = this.world.getComponentData(loader.GridReference, Grid);
				grid.Tiles.push(entity);
				this.world.setComponentData(loader.GridReference, grid);
				this.world.removeComponent(entity, GridTileLoader);
			});
		}
	}
}
