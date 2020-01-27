namespace game {
	@ut.executeBefore(ut.Core2D.SequencePlayerSystem)
	/** System to reload an image to activate pixelAccurate hitboxes */
	export class PixelAccurateHitboxLoadSystem extends ut.ComponentSystem {

		OnUpdate(): void {

			this.world.forEach([ut.Entity, ut.Core2D.Sprite2DRenderer, PixelAccurateHitBoxLoader, ut.HitBox2D.Sprite2DRendererHitBox2D],
				(entity, renderer, loader, hitBox) => {

					let trueSource = this.world.getComponentData(renderer.sprite, ut.Core2D.Sprite2D).image;
					let imgData = this.world.getComponentData(trueSource, ut.Core2D.Image2D);
					if (imgData.status !== ut.Core2D.ImageStatus.Loaded) {
						return;
					}
					if (!this.world.hasComponent(trueSource, ut.Core2D.Image2DAlphaMask)) {
						let loader = this.world.getOrAddComponentData(trueSource, ut.Core2D.Image2DLoadFromFile);
						loader.imageFile = UT_ASSETS[imgData.sourceName.substring(9)];
						this.world.setComponentData(trueSource, loader);

						let alphaMask = this.world.getOrAddComponentData(trueSource, ut.Core2D.Image2DAlphaMask);
						alphaMask.threshold = 0.5;
						this.world.setComponentData(trueSource, alphaMask);
					}

					this.world.removeComponent(entity, PixelAccurateHitBoxLoader);
				});
		}
	}
}