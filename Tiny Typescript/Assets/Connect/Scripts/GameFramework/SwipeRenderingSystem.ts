
namespace game {

	/** System that takes care for rendering visuals for a swipe */
	export class SwipeRenderingSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([ut.Entity, SwipeRenderer], (entity, renderer) => {
				if (!ClickingUtils.IsSwiping(this.world, renderer.Clicker) || renderer.Paused) {
					//Not swiping so no rendering steps required.
					//Tell previous visuals that it can start fading
					if (this.world.exists(renderer.SwipeVisuals)) {
						this.SetToFade(renderer.SwipeVisuals);
						renderer.SwipeVisuals = ut.NONE;
						this.world.setComponentData(entity, renderer);
					}
					return;
				}

				let clicker = this.world.getComponentData(renderer.Clicker, Clicker);
				let currentPos = clicker.Points[clicker.Points.length - 1];

				if (MathUtils.CalculateDistance(clicker.StartPoint, currentPos) < renderer.MinimumSwipeDistance) {
					//Not swiped enough to be considered a swipe
					return;
				}

				if (renderer.SwipeVisuals.isNone()) {
					//Swiping, but no visuals existing yet!
					//New visuals should be spawned at current pos and reference it
					let newEntity = this.SpawnVisuals(ArrayUtils.GetRandomElement<string>(renderer.SwipePrefabs),
						new Vector3(clicker.StartPoint.x, clicker.StartPoint.y, 0));
					renderer.SwipeVisuals = newEntity;
					this.world.setComponentData(entity, renderer);
				}
				let visuals = renderer.SwipeVisuals;
				let visualPos = this.world.getComponentData(visuals, ut.Core2D.TransformLocalPosition).position;
				if (visualPos.x != clicker.StartPoint.x && visualPos.y != clicker.StartPoint.y) {
					//Swiping, but it's not the same swipe anymore!
					//Tell previous visuals that it can start fading
					this.SetToFade(renderer.SwipeVisuals);
					//New visuals should be spawned at current pos and reference it
					renderer.SwipeVisuals = this.SpawnVisuals(ArrayUtils.GetRandomElement<string>(renderer.SwipePrefabs),
						new Vector3(clicker.StartPoint.x, clicker.StartPoint.y, 0));

				}

				//Rotate and scale visuals from startpoint to current point
				this.world.usingComponentData(
					renderer.SwipeVisuals,
					[ut.Core2D.TransformLocalRotation, ut.Core2D.TransformLocalScale],
					(visualRotation, visualScale) => {
						//let newRotation = new Euler(0,0, MathUtils.CalculateDegrees(clicker.StartPoint, currentPos));
						visualRotation.rotation.setFromAxisAngle(new Vector3(0, 0, 1), (MathUtils.CalculateDegrees(clicker.StartPoint, currentPos) / 180) * Math.PI);
						visualScale.scale = new Vector3(MathUtils.CalculateDistance(clicker.StartPoint, currentPos) + 1, visualScale.scale.y, visualScale.scale.z);
					});
			});
		}

        /** Adds FadeAway component to the child of the referenced anchor entity.
         * 
         * @param visualsEntity The anchor entity containing the visual entity. 
         * @param visualsEntity This entity should have the FadeAway component as blueprint.
         * @param visualsEntity Its child should already contain the TimeInterval component.
         */
		SetToFade(visualsEntity: ut.Entity): void {
			if (!this.world.hasComponent(visualsEntity, FadeAway)) {
				console.error("[SwipeRenderingSystem] Visual anchor entity does not contain the game.FadeAway component.");
				return;
			}

			let fader = this.world.getComponentData(visualsEntity, FadeAway);
			let child = ut.Core2D.TransformService.getChild(this.world, visualsEntity, 0);
			this.world.setOrAddComponentData(child, fader);

			if (!this.world.hasComponent(child, TimeInterval)) { console.warn("[SwipeRenderingSystem] Visual entity does not contain the game.TimeInterval component. Fading won't happen."); }
		}

		/** Spawns the visuals entity at given position and returns it. */
		SpawnVisuals(entityName: string, position: Vector3): ut.Entity {
			let newEntity = ut.EntityGroup.instantiate(this.world, entityName)[0];
			if (!this.world.hasComponent(newEntity, ut.Core2D.TransformLocalPosition)) {
				console.error("[SwipeRenderingSystem] Prefab does not contain the ut.Core2D.TransformLocalPosition component.");
				return null;
			}

			let newPos = this.world.getComponentData(newEntity, ut.Core2D.TransformLocalPosition);
			newPos.position = position;
			this.world.setComponentData(newEntity, newPos);
			return newEntity;
		}
	}
}