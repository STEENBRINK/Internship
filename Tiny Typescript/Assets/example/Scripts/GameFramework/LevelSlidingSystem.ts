
namespace game {

	/** System to slide levels in and out of the picture */
	export class LevelSlidingSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([LevelSlider, TimeInterval], (slider, transitionTime) => {
				//Do nothing when not marked for next level transition
				if (!slider.GoToNextLevel) { return; }

				//Initialisation (first frame of transition)
				if (!slider.InTransition) {
					transitionTime.Time = 0;
					slider.LevelIndex++;

					//Enable the entities of the next scene
					let nextLevelFound = false;
					this.world.forEach([ut.Entity, Level, ut.Disabled], (entity, level, disabler) => {
						if (level.LevelIndex == slider.LevelIndex) {
							EntityUtils.SetActive(this.world, entity, true);
							nextLevelFound = true;
						}
					});
					//Warn and exit when no next level is found
					if (!nextLevelFound) {
						console.warn("[WARNING] Attempted to go to next level, but no next level was found.");
						slider.GoToNextLevel = false;
						return;
					}

					slider.InTransition = true;
					return;
				}

				//Get transition progress time
				let progress = transitionTime.Time / transitionTime.Interval;

				//Get the root entities for the previous level and the next level
				let previousLevel = ut.NONE;
				let nextLevel = ut.NONE;
				this.world.forEach([ut.Entity, Level], (entity, level) => {
					if (nextLevel.isNone() && level.LevelIndex == slider.LevelIndex) { nextLevel = level.Root; }
					if (previousLevel.isNone() && level.LevelIndex != slider.LevelIndex) { previousLevel = level.Root; }
				});

				//Previous level transitions out of screen
				let fromValue = 0;
				let toValue = fromValue - slider.LevelDistance;
				let newX = MathUtils.Lerp(fromValue, toValue, Math.min(progress, 1));
				let rootPos = this.world.getComponentData(previousLevel, ut.Core2D.TransformLocalPosition);
				rootPos.position = new Vector3(newX, 0, rootPos.position.z);
				this.world.setComponentData(previousLevel, rootPos);

				//Next level transitions into screen
				fromValue = slider.LevelDistance;
				toValue = fromValue - slider.LevelDistance;
				newX = MathUtils.Lerp(fromValue, toValue, Math.min(progress, 1));
				rootPos = this.world.getComponentData(nextLevel, ut.Core2D.TransformLocalPosition);
				rootPos.position = new Vector3(newX, 0, rootPos.position.z);
				this.world.setComponentData(nextLevel, rootPos);

				//Handling end of transition
				//• Resetting values of levelSlider
				//• Deleting previous level
				if (progress >= 1) {
					let garbage = ut.NONE;

					this.world.forEach([Level], (level) => {
						if (garbage.isNone() && level.LevelIndex != slider.LevelIndex) {
							garbage = EntityUtils.CopyEntity(level.Root);
						}
					});
					slider.InTransition = false;
					slider.GoToNextLevel = false;

					if (!garbage.isNone()) {
						EntityUtils.DestroyEntity(this.world, garbage, true);
					}
				}
			});
		}
	}
}
