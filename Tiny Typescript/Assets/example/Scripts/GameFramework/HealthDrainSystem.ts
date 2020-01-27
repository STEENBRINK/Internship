namespace game {

	/** A system to automatically deplete health from a Health component over time */
	export class HealthDrainSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([ut.Entity, Health, HealthDrain, TimeInterval], (entity, health, drainer, timer) => {
				if (timer.Time < timer.Interval) {
					return;
				}
				TimeUtils.ResetTime(this.world, entity);
				HealthUtils.Damage(this.world, entity, 1 * drainer.DrainSpeed);
			});
		}
	}
}
