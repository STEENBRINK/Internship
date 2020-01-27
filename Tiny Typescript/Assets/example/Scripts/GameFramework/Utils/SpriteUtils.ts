namespace game {
	/** Utility class for various sprite-related functions */
	export class SpriteUtils {
		static GetOrGenerateSprites(world: ut.World, spritesheet: ut.Entity, rows: number, columns: number, recreateSprites = false): Array<ut.Entity> {
			//Stop if provided spritesheet entity is faulty
			if (!world.hasComponent(spritesheet, ut.Core2D.Sprite2DRenderer) && !world.hasComponent(spritesheet, ut.Core2D.Image2D)) {
				console.error("Provided entity does not contain the ut.Core2D.Sprite2DRenderer component.");
				return null;
			}

			// Check if sprites have already been loaded from this spritesheet once
			// So no unnecessary entities are created, unless recreating is required.
			if (world.hasComponent(spritesheet, Spritesheet)) {
				if (!recreateSprites) {
					return world.getComponentData(spritesheet, Spritesheet).Sprites;
				}
				let spritesheetComponent = world.getComponentData(spritesheet, Spritesheet);
				for (let i = 0; i < spritesheetComponent.Sprites.length; i++) {
					const frameEntity = spritesheetComponent.Sprites[i];
					EntityUtils.DestroyEntity(world, frameEntity, true);
				}
				world.removeComponent(spritesheet, Spritesheet);
			}

			// Get the true entity containing the spritesheet image
			//https://thumbs.gfycat.com/GlamorousBeneficialGrouper-size_restricted.gif
			let trueSource: ut.Entity = null;
			let pivot = new Vector2(0.5, 0.5);
			if (world.hasComponent(spritesheet, ut.Core2D.Sprite2DRenderer)) {
				let trueSourceSprite = world.getComponentData(world.getComponentData(spritesheet, ut.Core2D.Sprite2DRenderer).sprite, ut.Core2D.Sprite2D);
				trueSource = trueSourceSprite.image;
				pivot = trueSourceSprite.pivot;
			}
			if (world.hasComponent(spritesheet, ut.Core2D.Sprite2D)) {
				let trueSourceSprite = world.getComponentData(spritesheet, ut.Core2D.Sprite2D);
				trueSource = trueSourceSprite.image;
				pivot = trueSourceSprite.pivot;
			}
			if (world.hasComponent(spritesheet, ut.Core2D.Image2D)) {
				trueSource = spritesheet;
			}
			// Check if image has loaded
			if (world.getComponentData(trueSource, ut.Core2D.Image2D).status !== ut.Core2D.ImageStatus.Loaded) {
				return null;
			}

			// Calculating sizes
			let spritesheetSize = world.getComponentData(trueSource, ut.Core2D.Image2D).imagePixelSize;
			let frameSize = new Vector2(spritesheetSize.x / columns, spritesheetSize.y / rows);
			// Stop when sizes are not divisible into rounded numbers
			if (frameSize.x != Math.round(frameSize.x) || frameSize.y != Math.round(frameSize.y)) {
				console.error("Spritesheet is of faulty size. Make sure the sizes of the sheet are divisible into rounded numbers.");
				return new Array();
			}
			// Create resulting array of sprites
			let result = new Array<ut.Entity>();

			// Cut out sprites from the spritesheet and put them into the array
			for (let rowPointer = spritesheetSize.y - frameSize.y; rowPointer >= 0; rowPointer -= frameSize.y) {
				for (let columnPointer = 0; columnPointer < spritesheetSize.x; columnPointer += frameSize.x) {
					let newSpriteEntity = world.createEntity();
					let newSprite = new ut.Core2D.Sprite2D(
						trueSource,
						new ut.Math.Rect(columnPointer / spritesheetSize.x, rowPointer / spritesheetSize.y, frameSize.x / spritesheetSize.x, frameSize.y / spritesheetSize.y)
					);
					newSprite.pivot = pivot;
					world.setOrAddComponentData(newSpriteEntity, newSprite);

					result.push(newSpriteEntity);
				}
			}
			// Set the spritesheet component on this entity,
			// so no unnecessary new entities will be created
			// next time this function is called on this entity.
			let sheet = world.getOrAddComponentData(spritesheet, Spritesheet);
			sheet.Sprites = result;
			world.setComponentData(spritesheet, sheet);

			// Return the resulting array of sprites
			return result;
		}

		//TODO If you read this, remove this function.
		// static RegenerateSprites(world: ut.World, spritesheet: ut.Entity, rows: number, columns: number): Array<ut.Entity> {
		// 	if (world.hasComponent(spritesheet, Spritesheet)) {
		// 		let spritesheetComponent = world.getComponentData(spritesheet, Spritesheet);
		// 		for (let i = 0; i < spritesheetComponent.Sprites.length; i++) {
		// 			const frameEntity = spritesheetComponent.Sprites[i];
		// 			EntityUtils.DestroyEntity(world, frameEntity, true);
		// 		}
		// 		world.removeComponent(spritesheet, Spritesheet);
		// 	}
		// 	return this.GenerateSprites(world, spritesheet, rows, columns);
		// }
	}
}
