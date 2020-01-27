namespace game {
	/** Utility class for various health-related functions */
	export class HealthUtils {
		/** Gets the current HP (healht points) of the provided entity */
		static GetHealth(world: ut.World, entity: ut.Entity): number {
			if (!world.hasComponent(entity, Health)) {
				console.error("Provided entity does not contain the game.Health component.");
				return null;
			}
			return world.getComponentData(entity, Health).HealthPoints;
		}

		/** Determines whether the entity is dead (HP = 0) */
		static IsDead(world: ut.World, entity: ut.Entity): boolean {
			if (!world.hasComponent(entity, Health)) {
				console.error("Provided entity does not contain the game.Health component.");
				return null;
			}
			return (world.getComponentData(entity, Health).HealthPoints == 0);
		}

		/** Heals the specified amount of HP to the provided entity, capped at MaxHealthPoints */
		static Heal(world: ut.World, entity: ut.Entity, amount: number) {
			if (!world.hasComponent(entity, Health)) {
				console.error("Provided entity does not contain the game.Health component.");
				return null;
			}

			let health = world.getComponentData(entity, Health);
			health.HealthPoints = Math.min(health.HealthPoints + amount, health.MaxHealthPoints);
			world.setComponentData(entity, health);
		}

		/** Deals the specified amount of damage to the provided entity (if it has the Health component) */
		static Damage(world: ut.World, entity: ut.Entity, amount: number): void {
			if (!world.hasComponent(entity, Health)) {
				console.error("Provided entity does not contain the game.Health component.");
				return null;
			}

			let health = world.getComponentData(entity, Health);
			health.DamageToGive += amount;
			world.setComponentData(entity, health);
		}
	}
}