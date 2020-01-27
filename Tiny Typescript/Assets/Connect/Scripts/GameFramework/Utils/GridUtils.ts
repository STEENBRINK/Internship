namespace game {
	export class GridUtils {
		/** Returns a tile at specified gridcoordinates in the provided grid */
		static GetTile(world: ut.World, gridEntity: ut.Entity, x: number, y: number): ut.Entity {
			let grid = world.hasComponent(gridEntity, Grid) ? world.getComponentData(gridEntity, Grid) : null;
			if (grid == null) {
				console.error("Provided entity does not contain the game.Grid component.");
				return null;
			}

			let result: ut.Entity = null;
			grid.Tiles.forEach((t) => {
				if (result != null) { return; }
				let tile = world.hasComponent(t, Tile) ? world.getComponentData(t, Tile) : null;
				if (tile == null) { return; }
				if (tile.Position.x == Math.floor(x) && tile.Position.y == Math.floor(y)) {
					result = t;
				}
			});

			return result;
		}

		/** Returns the world position of the provided Tile Entity */
		static GetTileWorldPosition(world: ut.World, tileEntity: ut.Entity): Vector3 {
			if (!world.hasComponent(tileEntity, ut.Core2D.TransformLocalPosition)) {
				console.error("Provided entity does not contain the ut.Core2D.TransformLocalPosition component.");
				return null;
			}
			return world.getComponentData(tileEntity, ut.Core2D.TransformLocalPosition).position;
		}

		/** Returns whether or not the provided tile is of the provided type */
		static CheckTileType(world: ut.World, tileEntity: ut.Entity, type: TileType): boolean {
			if (!world.hasComponent(tileEntity, Tile)) {
				console.error("Provided entity does not contain the game.Tile component.");
				return null;
			}
			return world.getComponentData(tileEntity, Tile).Type === type;
		}

		/** Returns whether the specified amount of goals of the goalType are directly linked */
		static CheckGoalsFound(world: ut.World, tileEntity: ut.Entity, goalType: TileType, goalAmount: number): boolean {
			//SKELETON: check for a direct connection between which all tiles are of a certain type / certain types.
			return true;
		}

		/** If can move, moves the tileType of this tile to the other and vice versa */
		static MoveTo(world: ut.World, thisTileEntity: ut.Entity, otherTileEntity: ut.Entity): boolean {
			//SKELETON FUNCTION -- NOT READY FOR USE
			if (!GridUtils.CanMove(world, otherTileEntity, [TileType.WALL])) { return false; }
			let thisTile = world.getComponentData(thisTileEntity, Tile);
			let otherTile = world.getComponentData(otherTileEntity, Tile);
			let thisTileType = thisTile.Type;
			thisTile.Type = otherTile.Type;
			otherTile.Type = thisTileType;
		}

		/** Returns whether the provided tile is of a type that can be traversed, determined by the provided disallowed types. */
		static CanMove(world: ut.World, tileEntity: ut.Entity, DisallowedTypes: TileType[]): boolean {
			if (tileEntity == null || tileEntity.isNone() || !world.hasComponent(tileEntity, Tile)) {
				console.error("Provided entity does not contain the game.Tile component.");
				return null;
			}
			let allowed = true;
			let type = world.getComponentData(tileEntity, Tile).Type;
			DisallowedTypes.forEach((t) => {
				if (!allowed) { return; }
				if (t === type) {
					allowed = false;
					return;
				}
			});
			return allowed;
		}

		/** Returns the largest array of consecutive tileEntities of the same type as the provided tile in a straight line. */
		static CheckAmountInARow(world: ut.World, grid: ut.Entity, tileEntity: ut.Entity): ut.Entity[] {
			if (!world.hasComponent(tileEntity, Tile)) {
				console.error("Provided entity does not contain the game.Tile component.");
				return null;
			}
			let origin = world.getComponentData(tileEntity, Tile);

			let horizontalRow = new Array<ut.Entity>();
			let verticalRow = new Array<ut.Entity>();
			horizontalRow.push(tileEntity);
			verticalRow.push(tileEntity);

			for (let i = 1; GridUtils.GetTile(world, grid, origin.Position.x - i, origin.Position.y) != null && GridUtils.CheckTileType(world, GridUtils.GetTile(world, grid, origin.Position.x - i, origin.Position.y), origin.Type); i++) {
				horizontalRow.push(GridUtils.GetTile(world, grid, origin.Position.x - i, origin.Position.y));
			}
			for (let i = 1; GridUtils.GetTile(world, grid, origin.Position.x + i, origin.Position.y) != null && GridUtils.CheckTileType(world, GridUtils.GetTile(world, grid, origin.Position.x + i, origin.Position.y), origin.Type); i++) {
				horizontalRow.push(GridUtils.GetTile(world, grid, origin.Position.x + i, origin.Position.y));
			}
			for (let i = 1; GridUtils.GetTile(world, grid, origin.Position.x, origin.Position.y - i) != null && GridUtils.CheckTileType(world, GridUtils.GetTile(world, grid, origin.Position.x, origin.Position.y - i), origin.Type); i++) {
				verticalRow.push(GridUtils.GetTile(world, grid, origin.Position.x, origin.Position.y - i));
			}
			for (let i = 1; GridUtils.GetTile(world, grid, origin.Position.x, origin.Position.y + i) != null && GridUtils.CheckTileType(world, GridUtils.GetTile(world, grid, origin.Position.x, origin.Position.y + i), origin.Type); i++) {
				verticalRow.push(GridUtils.GetTile(world, grid, origin.Position.x, origin.Position.y + i));
			}

			return horizontalRow.length > verticalRow.length ? horizontalRow : verticalRow;
		}
	}
}