namespace game {
	/** Utility class for various clicking, pressing and swiping related functions */
	export class ClickingUtils {
		/** Gets the first click/fingerpress and removes it from the list. */
		static GetFirstClick(world: ut.World, entity: ut.Entity): Vector2 {
			if (!world.hasComponent(entity, Clicker)) {
				console.error("Provided entity does not contain the game.Clicker component.");
				return null;
			}

			let clicker = world.getComponentData(entity, Clicker);
			let click = (ArrayUtils.PullFirstElementFromArray<Vector2>(clicker.Presses));
			world.setComponentData(entity, clicker);
			return click;
		}

		/** Gets the latest (most recent) click/fingerpress and removes it from the list. */
		static GetLatestClick(world: ut.World, entity: ut.Entity): Vector2 {
			if (!world.hasComponent(entity, Clicker)) {
				console.error("Provided entity does not contain the game.Clicker component.");
				return null;
			}

			let clicker = world.getComponentData(entity, Clicker);
			let click = (ArrayUtils.PullLastElementFromArray<Vector2>(clicker.Presses));
			world.setComponentData(entity, clicker);
			return click;
		}

		/** Returns a boolean value indicating whether or not the provided clicker entity is currently swiping. */
		static IsSwiping(world: ut.World, entity: ut.Entity) {
			if (!world.hasComponent(entity, Clicker)) {
				console.error("Provided entity does not contain the game.Clicker component.");
				return null;
			}

			let clicker = world.getComponentData(entity, Clicker);
			if (clicker.EndPoint.x == Global.NOT_A_NUMBER && clicker.EndPoint.y == Global.NOT_A_NUMBER) {
				return true;
			}
			return false;
		}

		/** Returns the point of clicking in world space while considering frame size */
		static getPointerWorldPosition(world: ut.World, cameraEntity: ut.Entity): Vector3 {
			let displayInfo = world.getConfigData(ut.Core2D.DisplayInfo);
			let displaySize = new Vector2(displayInfo.width, displayInfo.height);
			let inputPosition = ut.Runtime.Input.getInputPosition();
			return ut.Core2D.TransformService.windowToWorld(world, cameraEntity, inputPosition, displaySize);
		}
	}
}