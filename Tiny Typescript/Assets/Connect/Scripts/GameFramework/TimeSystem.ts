namespace game {
	/** System to keep track of time for each TimeInterval component */
	export class TimeSystem extends ut.ComponentSystem {
		OnUpdate(): void {
			this.world.forEach([TimeInterval], timer => {
				if(timer.CountUp) {
					timer.Time += this.scheduler.deltaTime();
				}else{
					timer.Time -= this.scheduler.deltaTime();
				}
			});
		}
	}
}
