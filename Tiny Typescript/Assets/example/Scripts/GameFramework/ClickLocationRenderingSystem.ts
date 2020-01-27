
namespace game {
	/** System for rendering visuals on the click/mouse/finger position */
	export class ClickLocationRenderingSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([ut.Entity, ClickLocationRenderer], (entity, renderer) => {
				//Do nothing when paused
				if (renderer.Paused) { return; }
				//Initialization
				if (!renderer.Initialized) {
					if (renderer.VisualMode == ClickVisualMode.FADINGIMAGE) {
						renderer.InitialValue = this.world.getComponentData(renderer.Visuals, ut.Core2D.Sprite2DRenderer).color.a;
					} else if (renderer.VisualMode == ClickVisualMode.PARTICLES) {
						renderer.InitialValue = this.world.getComponentData(renderer.Visuals, ut.Particles.ParticleEmitter).emitRate;
					}
					renderer.Initialized = true;
				}

				//Data setup
				if (!this.world.hasComponent(renderer.Clicker, Clicker)) {
					console.error("[ClickLocationRenderingSystem] Referenced clicker entity does not contain the game.Clicker component.");
					return;
				}
				let clicker = this.world.getComponentData(renderer.Clicker, Clicker);
				let mousePos: Vector2;
				let isDown = ClickingUtils.IsSwiping(this.world, renderer.Clicker);
				if (!isDown) { renderer.IsPlaying = false; }

				//RenderingMode.ONCLICK
				if (renderer.RenderingMode == ClickRenderingMode.ONCLICK) {
					//VisualMode.FADINGIMAGE
					if (renderer.VisualMode == ClickVisualMode.FADINGIMAGE && !renderer.IsPlaying && isDown) {
						let image = this.world.getComponentData(renderer.Visuals, ut.Core2D.Sprite2DRenderer);
						image.color.a = renderer.InitialValue;
						this.world.setComponentData(renderer.Visuals, image);
						//VisualMode.ANIMATION
					} else if (renderer.VisualMode == ClickVisualMode.ANIMATION) {
						let animation = this.world.getComponentData(renderer.Visuals, ut.Core2D.Sprite2DSequencePlayer);
						if (!renderer.IsPlaying && isDown) {
							animation.time = 0;
							animation.paused = false;
							animation.loop = ut.Core2D.LoopMode.Once;
							this.world.setComponentData(renderer.Visuals, animation);
							EntityUtils.SetActive(this.world, renderer.Visuals, true);
						} else if (animation.time == 0 && animation.paused) {
							EntityUtils.SetActive(this.world, renderer.Visuals, false);
						}
						//VisualMode.PARTICLES
					} else if (renderer.VisualMode == ClickVisualMode.PARTICLES && isDown) {
						console.warn("[Not functional] The OnClick Particle clicker visuals are not functional, due to system editing being impossible.");
					}

					mousePos = clicker.Presses[clicker.Presses.length - 1];
				}
				//RenderingMode.CONTINUOUS
				else if (renderer.RenderingMode == ClickRenderingMode.CONTINUOUS) {
					//VisualMode.FADINGIMAGE
					if (renderer.VisualMode == ClickVisualMode.FADINGIMAGE && isDown) {
						let image = this.world.getComponentData(renderer.Visuals, ut.Core2D.Sprite2DRenderer);
						image.color.a = renderer.InitialValue;
						this.world.setComponentData(renderer.Visuals, image);
						//VisualMode.ANIMATION
					} else if (renderer.VisualMode == ClickVisualMode.ANIMATION) {
						let animation = this.world.getComponentData(renderer.Visuals, ut.Core2D.Sprite2DSequencePlayer);
						if (!renderer.IsPlaying && isDown) {
							animation.time = 0;
							animation.paused = false;
							animation.loop = ut.Core2D.LoopMode.Loop;
							this.world.setComponentData(renderer.Visuals, animation);
							EntityUtils.SetActive(this.world, renderer.Visuals, true);
						} else if (!isDown) {
							animation.loop = ut.Core2D.LoopMode.Once;
							animation.time = animation.time % 1;
							this.world.setComponentData(renderer.Visuals, animation);
							if (animation.paused) { EntityUtils.SetActive(this.world, renderer.Visuals, false); }
						}
						//VisualMode.PARTICLES
					} else if (renderer.VisualMode == ClickVisualMode.PARTICLES) {
						this.world.usingComponentData(renderer.Visuals, [ut.Entity, ut.Particles.ParticleEmitter], (en, ps) => {
							ps.emitRate = isDown ? renderer.InitialValue : 0;
						})
					}

					mousePos = clicker.Points[clicker.Points.length - 1];
				}

				//Setting position and data setup for next time
				if (isDown) {
					this.world.usingComponentData(renderer.Visuals, [ut.Core2D.TransformLocalPosition], (pos) => {
						pos.position = new Vector3(mousePos.x, mousePos.y, pos.position.z);
					});
					renderer.IsPlaying = true;
				}
			});
		}
	}
}