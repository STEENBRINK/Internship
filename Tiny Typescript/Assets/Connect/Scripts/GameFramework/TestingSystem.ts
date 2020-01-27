namespace game {
	/** New System */
	export class TestingSystem extends ut.ComponentSystem {
		OnUpdate(): void {
			this.world.forEach([ut.Entity, ut.Core2D.Sprite2DSequencePlayer, ToggleReference], (entity, animation, toggle) => {
				if (toggle.HasChanged) {
					toggle.HasChanged = false;
					animation.paused = !toggle.IsActivated;
					AudioUtils.PauseAllMusic(this.world, toggle.IsActivated);
				}
			});

			this.world.forEach([ut.Entity, ut.Core2D.TransformLocalPosition, CollisionQueue, ButtonReference, Spawner, UIEntitiesHolderReference, Health, ToggleReference], (entity, position, collision, buttonRef, spawner, holderRef, health, toggle) => {
				if (toggle.HasChanged) {
					toggle.HasChanged = false;
					AudioUtils.PauseAllAudio(this.world, toggle.IsActivated);
				}

				// collision.Collisions.forEach((collider) => {
				// 	if (!collider.isNone() && this.world.getEntityName(collider) == "FallingBlocky") {
				// 		console.log(collision.Collisions);
				// 		let index = EntityUtils.GetIndexIn(collider, collision.Collisions);
				// 		collision.Collisions.splice(index, 1);
				// 		EntityUtils.DestroyEntity(this.world, collider, true);
				// 		console.log("DELETO: ");
				// 		console.log(collision.Collisions);
				// 		return;
				// 	}
				// })

				if (buttonRef.IsClicked) {
					buttonRef.IsClicked = false;
					if (position.position.y < -10) {
						position.position = new Vector3(-10, 0, 0);
					}
					UIUtils.SetTextViaReference(this.world, entity, "Clicked!");

					// let holder = this.world.getComponentData(entity, AudioClipHolder);
					// let newClip = AudioUtils.GetRandomClip(holder);
					// AudioUtils.SetAudioSourceClip(this.world, entity, newClip);
					AudioUtils.StartAudio(this.world, entity, false);

					//UIUtils.RemoveUIEntities(this.world, holderRef.holderRef, 1);
					HealthUtils.Heal(this.world, entity, 1);
					//UIUtils.SetResourceBar(this.world, barRef.BarReference, Math.round(Math.random() * 10), 10);

					// let SPRITESHEET = this.world.getEntityByName("SPRITESHEET");
					// let sprites = SpriteUtils.GenerateSprites(this.world, SPRITESHEET, 3, 13);
					// let ANIMATION = this.world.getEntityByName("Animation");
					// let ani = this.world.getComponentData(ANIMATION, ut.Core2D.Sprite2DSequence);
					// ani.sprites = sprites;
					// this.world.setComponentData(ANIMATION, ani);
					// AnimationUtils.CalculateFramerate(this.world, ANIMATION);

					PlayerUtils.AddScore(this.world, 10);
					PhysicsUtils.ApplyForce(this.world, entity, new Vector2((Math.random() - 0.5) * 4, 10));
					MovementUtils.SetDirection(this.world, entity, new Vector2((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4));
					MovementUtils.SetSpeed(this.world, entity, 2);

					// let clicker = this.world.getEntityByName("Clicker");
					// ClickingUtils.GetFirstClick(this.world, clicker);

					let random = (Math.random() - 0.5) * 2;

					RotationUtils.SetRotationFromDegrees(this.world, entity, new Vector3(0, 0, 1), random * 180);
					// let fallingBlocky = this.world.getEntityByName("FallingBlocky");
					// if (this.world.exists(fallingBlocky)) {
					// 	PhysicsUtils.SetBounciness(this.world, fallingBlocky, 0);
					// }

					// let hexGrid = this.world.getEntityByName("HexGrid");
					// let origin = this.world.getEntityByName("WaterTileOrigin");
					// let cluster = HexGridUtils.GetCluster(this.world, hexGrid, origin, null);
					// console.log(cluster.length);

					// let grid = this.world.getEntityByName("Grid");
					// let origin2 = this.world.getEntityByName("Tile 0 2");
					// console.log(GridUtils.CheckAmountInARow(this.world, grid, origin2).length);

					spawner.CanSpawn = true;
					//this.world.setComponentData(entity, spawner);
					// let childCount = (EntityUtils.SetAllChildrenActive(this.world, this.world.getEntityByName("Obstacles"), false, -1));
					// console.log("CHILDREN COUNTED: " + childCount);
					// EntityUtils.SetAllChildrenActive(this.world, this.world.getEntityByName("Obstacles"), true, childCount)

					// let untity = EntityUtils.GetEntityByRaycast(this.world, this.world.getEntityByName("GameWorldCamera"), new Vector2(-0.5, 3));
					// console.log(untity == null ? "None found." : this.world.getEntityName(untity));

					let levelSliderEntity = this.world.getEntityByName("LevelSlider");
					let levelSlider = this.world.getComponentData(levelSliderEntity, LevelSlider);
					if (levelSlider.LevelIndex < 3) {
						levelSlider.GoToNextLevel = true;
					}
					this.world.setComponentData(levelSliderEntity, levelSlider);

					//position.position = new Vector3(position.position.x, position.position.y, position.position.z - 1);
				}
			});
		}
	}
}
