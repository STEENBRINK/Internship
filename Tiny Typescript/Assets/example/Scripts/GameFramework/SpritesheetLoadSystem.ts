namespace game {
	/** System to load a spritesheet to a ut.Core2D.Sprite2DSequence */
	export class SpritesheetLoadSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([ut.Entity, ut.Core2D.Sprite2DSequence, SpritesheetLoader], (entity, animation, loader) => {
				// If the entityreference of the loader is not set, or set to itself, try to set the reference by name.
				if (loader.Spritesheet == undefined || loader.Spritesheet.isNone() || EntityUtils.Equals(entity, loader.Spritesheet)) {
					let entityByName = this.world.getEntityByName(loader.SpritesheetEntityName);
					// If still no entity is found, return.
					if (entityByName == undefined || entityByName.isNone()) {
						return;
					}
					loader.Spritesheet = entityByName;
				}

				// Get sprites (or exit loop when the source image has not loaded yet)
				let generatedSprites = SpriteUtils.GetOrGenerateSprites(this.world, loader.Spritesheet, loader.Rows, loader.Columns);
				if (generatedSprites === null) return;

				animation.sprites = generatedSprites;

				// Set framerate according to sprites
				AnimationUtils.CalculateFramerate(this.world, entity);

				// Remove loader component
				this.world.removeComponent(entity, SpritesheetLoader);
			});
		}
	}
}
