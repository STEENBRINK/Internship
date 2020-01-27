
namespace game {
	/** System that manages health and damage */
	export class HealthSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([ut.Entity, Health], (entity, health) => {
				if (health.DamageToGive > 0) {
					health.HealthPoints = MathUtils.ClampValueMinMax(health.HealthPoints - health.DamageToGive, new Vector2(0, health.MaxHealthPoints));
				}

				if (health.VisualMode == HealthVisuals.LIFEPOINTS && !(health.Visuals.isNone()) && this.world.hasComponent(health.Visuals, UIEntitiesHolder)) {
					UIUtils.SetUIEntitiesDestroyIndex(this.world, health.Visuals, health.MaxHealthPoints - health.HealthPoints);
				}

				if (health.VisualMode == HealthVisuals.LIFEBAR && !(health.Visuals.isNone()) && this.world.hasComponent(health.Visuals, ResourceBar)) {
					UIUtils.SetResourceBar(this.world, health.Visuals, health.HealthPoints, health.MaxHealthPoints);
				}

				if (health.VisualMode == HealthVisuals.NONE) {
					//Nothing to do
				}

				//Reset applied damage
				health.DamageToGive = 0;

				// DestroyOnDeath
				if (health.DestroyOnDeath && health.HealthPoints <= 0) {
					EntityUtils.DestroyEntity(this.world, entity, true);
				}
			});
		}
	}
}
