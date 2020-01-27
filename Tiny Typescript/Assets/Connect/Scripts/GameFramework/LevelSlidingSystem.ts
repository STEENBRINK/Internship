
namespace game {

	/** System to slide levels in and out of the picture */
	export class LevelSlidingSystem extends ut.ComponentSystem {
		
		private timerEntity:ut.Entity;

		OnUpdate(): void {
			this.world.forEach([ut.Entity, LevelSlider, TimeInterval], (entity, slider, transitionTime) => {
				//Do nothing when not marked for next level transition
				if (!(slider.GoToNextLevel || slider.GoToPreviousLevel)) { return; }

				//Initialisation (first frame of transition)
				if (!slider.IsInTransition) {
					if(transitionTime.CountUp) {
						transitionTime.Time = 0;
					}else{
						transitionTime.Time = transitionTime.Interval;						
					}
					if(slider.GoToNextLevel) {
						slider.LevelIndex++;

						//Enable the entities of the next scene
						let nextLevelFound = false;
						this.world.forEach([ut.Entity, Level, ut.Disabled], (entity, level) => {
							if (level.LevelIndex == slider.LevelIndex) {
								EntityUtils.SetActive(this.world, entity, true);
								nextLevelFound = true;
							}
						});
						
						//Warn and exit when no next level is found
						if (!nextLevelFound) {
							console.warn("[WARNING] Attempted to go to next level, but no next level was found.");
							slider.LevelIndex--;
							slider.GoToNextLevel = false;
							return;
						}
						
					}else if(slider.DisableType != SliderDisableTypes.RemoveAll){
						slider.LevelIndex--;

						//Enable the entities of the next scene
						let previousLevelFound = false;
						this.world.forEach([ut.Entity, Level, ut.Disabled], (entity, level) => {
							if (level.LevelIndex == slider.LevelIndex) {
								EntityUtils.SetActive(this.world, entity, true);
								previousLevelFound = true;
							}
						});

						//Warn and exit when no next level is found
						if (!previousLevelFound) {
							console.warn("[WARNING] Attempted to go to previous level, but no next level was found.");
                            slider.LevelIndex++;
							slider.GoToPreviousLevel = false;
							return;
						}
						
					}else{
						console.warn("[WARNING] Attempted to go to previous level, but it was removed (Check the DisableType)");
						slider.GoToNextLevel = false;
						return;
					}

					this.timerEntity = entity;
					
					slider.IsInTransition = true;
					return;
				}

				//Get transition progress time
				let progress = TimeUtils.GetProgress(this.world, transitionTime);

				//Get the root entities for the previous level and the next level
				let previousLevel = ut.NONE;
				let nextLevel = ut.NONE;
				this.world.forEach([ut.Entity, Level], (entity, level) => {
					if (nextLevel.isNone() && level.LevelIndex == slider.LevelIndex) { nextLevel = level.Root; }
					if (previousLevel.isNone() && level.LevelIndex != slider.LevelIndex) { previousLevel = level.Root; }
				});

				//Previous level transitions out of screen
				let fromValue = 0;
				let toValue;
				if(slider.GoToNextLevel) {
					toValue = fromValue - slider.LevelDistance;
				}else if(slider.GoToPreviousLevel){
					toValue = fromValue + slider.LevelDistance;
				}else throw "Error at LevelSlider transition";
				let newX = MathUtils.Lerp(fromValue, toValue, Math.min(progress, 1));
				let rootPos = this.world.getComponentData(previousLevel, ut.Core2D.TransformLocalPosition);
				rootPos.position = new Vector3(newX, slider.YLevel, rootPos.position.z);
				this.world.setComponentData(previousLevel, rootPos);

				//Next level transitions into screen
				if(slider.GoToNextLevel){
					fromValue = slider.LevelDistance;
					toValue = fromValue - slider.LevelDistance;
				}else if(slider.GoToPreviousLevel){
					fromValue = -slider.LevelDistance;
					toValue = fromValue + slider.LevelDistance;
				}else throw "Error at LevelSlider transition";
				
				newX = MathUtils.Lerp(fromValue, toValue, Math.min(progress, 1));
				rootPos = this.world.getComponentData(nextLevel, ut.Core2D.TransformLocalPosition);
				rootPos.position = new Vector3(newX, slider.YLevel, rootPos.position.z);
				this.world.setComponentData(nextLevel, rootPos);

				//Handling end of transition
				//• Resetting values of levelSlider
				//• Deleting previous level
				if (progress >= 1) {

					let oldLevelRoot;
					this.world.forEach([Level], (level) => {
						if (level.LevelIndex != slider.LevelIndex) {
							oldLevelRoot = level.Root;
						}
					});

					let children:Array<ut.Entity> = EntityUtils.GetAllChildren(this.world, oldLevelRoot);
					switch (slider.DisableType) {
						case SliderDisableTypes.DisableParentOnly:
							this.world.addComponent(oldLevelRoot, ut.Disabled);
							break;
						case SliderDisableTypes.DisableChildrenAndParent:
							this.world.addComponent(oldLevelRoot, ut.Disabled);
							for(let i = 0; i < children.length; i++){
								this.world.addComponent(children[i], ut.Disabled);
							}
							break;
						case SliderDisableTypes.RemoveAllChildren:
							for(let i = 0; i < children.length; i++) {
								EntityUtils.DestroyEntity(this.world, children[i], true);
							}
                            this.world.addComponent(oldLevelRoot, ut.Disabled);
							break;
						case SliderDisableTypes.RemoveChildrenWithDestroyOnLevelSlideComponent:
							let destroy: Array<ut.Entity> = new Array<ut.Entity>();
							this.world.forEach([ut.Entity, Level, DestroyOnLevelSlide], (e, level) => {
								if(level.LevelIndex != slider.LevelIndex){
									destroy.push(EntityUtils.CopyEntity(e));
								}
							});

                            for(let i = 0; i < children.length; i++){
                                this.world.addComponent(children[i], ut.Disabled);
                            }
                            
							for(let i = 1; i <= destroy.length; i++) {
								EntityUtils.DestroyEntity(this.world, destroy[i-1], true);
							}

                            this.world.addComponent(oldLevelRoot, ut.Disabled);
							break;
						case SliderDisableTypes.RemoveAll:
							
							EntityUtils.DestroyEntity(this.world, EntityUtils.CopyEntity(oldLevelRoot), true);
							break;

					}
					
					slider.IsInTransition = false;
					slider.GoToNextLevel = false;
					slider.GoToPreviousLevel = false;
				}
			});
		}
	}
}
