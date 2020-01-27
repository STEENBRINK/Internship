namespace game {

	/** Utility class for various hexagon grid related functions */
	export class HexGridUtils {
		/** Relative directional Vector3 objects for use in HexGrid coordinate calculations */
		public static HexDirections = [
			new Vector3(1, 0, -1), new Vector3(1, -1, 0), new Vector3(0, -1, 1),
			new Vector3(-1, 0, 1), new Vector3(-1, 1, 0), new Vector3(0, 1, -1)
		]

		/** Returns a tile at specified gridcoordinates in the provided grid */
		static GetTile(world: ut.World, gridEntity: ut.Entity, x: number, y: number, z: number): ut.Entity {
			let grid = world.hasComponent(gridEntity, Grid) ? world.getComponentData(gridEntity, Grid) : null;
			if (grid == null) {
				console.error("Provided entity does not contain the game.Grid component.");
				return null;
			}

			let result: ut.Entity = null;
			grid.Tiles.forEach((t) => {
				if (result != null) { return; }
				let hexTile = world.hasComponent(t, HexTile) ? world.getComponentData(t, HexTile) : null;
				if (hexTile == null) { return; }
				if (hexTile.Position.x == x && hexTile.Position.y == y && hexTile.Position.z == z) {
					result = t;
				}
			});

			return result;
		}

		/** Returns the world position of the center of the provided Tile Entity */
		static GetTileWorldPosition(world: ut.World, hexTile: ut.Entity): Vector3 {
			if (!world.hasComponent(hexTile, ut.Core2D.TransformLocalPosition)) {
				console.error("Provided entity does not contain the ut.Core2D.TransformLocalPosition component.");
				return null;
			}
			return world.getComponentData(hexTile, ut.Core2D.TransformLocalPosition).position;
		}

		/** Returns whether or not the provided tile is of the provided type */
		static CheckTileType(world: ut.World, hexTile: ut.Entity, type: TileType): boolean {
			if (!world.hasComponent(hexTile, HexTile)) {
				console.error("Provided entity does not contain the game.HexTile component.");
				return null;
			}
			return world.getComponentData(hexTile, HexTile).Type === type;
		}

		/** Returns neighbor hexTile in the provided direction
		 * 
		 * @param deltaPos HexGridUtils.HexDirections directions from NorthEast around to NorthWest [0-5]
		 */
		static GetNeighbor(world: ut.World, grid: ut.Entity, hexTile: ut.Entity, direction: number): ut.Entity {
			let tile = world.hasComponent(hexTile, HexTile) ? world.getComponentData(hexTile, HexTile) : null;
			if (tile == null) {
				console.error("Provided entity does not contain the game.HexTile component.");
				return null;
			}

			let deltaPos = HexGridUtils.HexDirections[direction];
			return HexGridUtils.GetTile(world, grid, tile.Position.x + deltaPos.x, tile.Position.y + deltaPos.y, tile.Position.z + deltaPos.z);
		}

		/** Finds and returns the largest cluster of adjacent hexTiles of the same type */
		static GetCluster(world: ut.World, grid: ut.Entity, hexTile: ut.Entity, cluster: Array<ut.Entity>): Array<ut.Entity> {
			if (!world.hasComponent(hexTile, HexTile)) {
				console.error("Provided entity does not contain the game.HexTile component.");
				return null;
			}
			if (cluster === undefined || cluster == null || cluster.length == 0) { cluster = new Array<ut.Entity>(); }
			console.log(world.getEntityName(hexTile));
			cluster.push(hexTile);
			for (let direction = 0; direction < HexGridUtils.HexDirections.length; direction++) {
				let neighbor = HexGridUtils.GetNeighbor(world, grid, hexTile, direction);
				if (neighbor != null
					&& !EntityUtils.ExistsIn(neighbor, cluster)
					&& world.hasComponent(neighbor, HexTile)
					&& HexGridUtils.CheckTileType(world, neighbor, world.getComponentData(hexTile, HexTile).Type)
				) {
					HexGridUtils.GetCluster(world, grid, neighbor, cluster);
				}
			}
			return cluster;
		}
	}
}