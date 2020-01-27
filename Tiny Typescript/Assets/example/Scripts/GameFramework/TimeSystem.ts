namespace game {
	/** System to keep track of time for each TimeInterval component */
	export class TimeSystem extends ut.ComponentSystem {
		OnUpdate(): void {
			this.world.forEach([TimeInterval], timer => {
				timer.Time += this.scheduler.deltaTime();
			});
		}
	}
}
