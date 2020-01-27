namespace game {
	/** Utility class for various movement related functions */
	export class MovementUtils {
		static SetDirection(world: ut.World, entity: ut.Entity, direction: Vector2): void {
			if (!world.hasComponent(entity, Movement)) {
				console.error("Provided entity does not contain the game.Movement component.");
				return null;
			}

			let movement = world.getComponentData(entity, Movement);
			movement.Direction = direction;
			world.setComponentData(entity, movement);
		}

		static SetSpeed(world: ut.World, entity: ut.Entity, speed: number): void {
			if (!world.hasComponent(entity, Movement)) {
				console.error("Provided entity does not contain the game.Movement component.");
				return null;
			}

			let movement = world.getComponentData(entity, Movement);
			movement.Speed = speed;
			world.setComponentData(entity, movement);
		}
	}
}