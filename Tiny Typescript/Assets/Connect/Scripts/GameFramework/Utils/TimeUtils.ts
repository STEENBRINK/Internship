namespace game {
	/** Utility class for various time related functions */
	export class TimeUtils {
		/** Resets TimeInterval component's time to 0
		 * @param entity the entity containing the TimeInterval component
		 */
		static ResetTime(world: ut.World, entity: ut.Entity) {
			if (!world.hasComponent(entity, TimeInterval)) {
				console.error("Provided entity does not contain the game.TimeInterval component.");
				return null;
			}

			let timer = world.getComponentData(entity, TimeInterval);
			timer.Time = 0;
			world.setComponentData(entity, timer);
		}

		/**Returns a formatted string from time in milliseconds
		 * @param rawTime the raw time data / the time in milliseconds
		 * @param format the timeFormat you want to produce
		 * @param paddResult when true, if a part in the format only has one digit, padd it with an extra zero
		 */
		static FormatTime(rawTime: number, format: TimeFormat, paddResult: boolean): string {
			let result: string;

			//TimeFormat.MinutesAndSecons
			if (format === TimeFormat.MinutesAndSeconds) {
				let minutes: string = Math.floor(rawTime / 60000).toString();
				if (paddResult && minutes.length == 1) { minutes = `0${minutes}`; }

				let seconds: string = Math.floor((rawTime % 60000) / 1000).toString();
				if (seconds.length == 1) { seconds = `0${seconds}`; }

				result = (minutes + ":" + seconds);
			}

			//TimeFormat.Secons
			if (format === TimeFormat.Seconds) {
				let seconds = Math.floor(rawTime / 1000).toString();
				if (paddResult && seconds.length == 1) { seconds = `0${seconds}`; }

				result = seconds;
			}

			return result;
		}
		
		static GetProgress(world:ut.World, timer:TimeInterval):number{
			if(timer.CountUp){
				return timer.Time/timer.Interval;
			}else{
				return Math.abs(timer.Time - timer.Interval)/timer.Interval;
			}
		}
	}

	export enum TimeFormat {
		MinutesAndSeconds,
		Seconds
	}
}