namespace game {
	/** Utility class for various levelsliding related functions */
	export class LevelSlideUtils {
		/** Returns whether or not the provided Level Slider entity is currently handling a level transition
		 *  
		 *  Useful for determining whether or not certain code is allowed to run.
		 */
		public static IsInTransition(world: ut.World, levelSlideEntity: ut.Entity): boolean {
			return (world.hasComponent(levelSlideEntity, LevelSlider) && world.getComponentData(levelSlideEntity, LevelSlider).InTransition);
		}

		/** Sets the transition time of switching levels of the provided Level Slider entity
		 * 
		 * @param levelSlideEntity the entity containing the LevelSlider and TimeInterval components
		 * @param transitionTime the new transition time in seconds
		 */
		public static SetTransitionTime(world: ut.World, levelSlideEntity: ut.Entity, transitionTime: number) {
			if (!world.hasComponent(levelSlideEntity, LevelSlider) || !world.hasComponent(levelSlideEntity, TimeInterval)) {
				console.error("Provided entity does not contain the necessary LevelSlide components (game.LevelSlider and game.TimeInterval)");
				return null;
			}

			let levelSliderTime = world.getComponentData(levelSlideEntity, TimeInterval);
			levelSliderTime.Interval = transitionTime;
			world.setComponentData(levelSlideEntity, levelSliderTime);
		}
	}
}