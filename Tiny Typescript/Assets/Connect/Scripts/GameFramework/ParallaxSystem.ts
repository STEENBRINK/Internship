namespace game {
	/** System that controls the moving of parallax objects/backgrounds */
	export class ParallaxSystem extends ut.ComponentSystem {
		public static COPY_NAME_PREFIX = "ParallaxSystemCopy_";

		OnUpdate(): void {
			this.world.forEach([ut.Entity, ParallaxObject], (entity, parallaxObject) => {
				if (parallaxObject.Paused) {
					return;
				} //Pausecheck

				// Copying image
				// (For each image, a copy is needed for the parallax effect)
				if (parallaxObject.Copy.index == 0 || parallaxObject.Copy == null) {
					parallaxObject.Copy = this.world.instantiateEntity(entity);
					this.world.setEntityName(parallaxObject.Copy, "ParallaxSystemCopy_" + entity.index + entity.version);
					this.world.removeComponent(parallaxObject.Copy, ParallaxObject);
					return;
				}
				// Finding and setting the copy to this component
				// Finding is done by the name the copy got during generation
				if (parallaxObject.Copy.index <= 0) {
					parallaxObject.Copy = this.world.getEntityByName(ParallaxSystem.COPY_NAME_PREFIX + entity.index + entity.version);
					return;
				}

				//Get the parent's scale, to adjust the speed.
				let parentScale: Vector3 = new Vector3(1, 1, 1);
				if (this.world.hasComponent(entity, ut.Core2D.TransformNode)) {
					let parent = this.world.getComponentData(entity, ut.Core2D.TransformNode).parent;
					if (EntityUtils.IsValid(this.world, parent, [ut.Core2D.TransformLocalScale])) {
						parentScale = this.world.getComponentData(parent, ut.Core2D.TransformLocalScale).scale;
					}
				}

				// Moving the original image
				this.world.usingComponentData(entity, [ut.Core2D.TransformLocalPosition, ut.Core2D.TransformLocalScale], (position, scale) => {
					let xPos = (position.position.x - (this.scheduler.deltaTime() * parallaxObject.MoveSpeed) / parentScale.x) % scale.scale.x;
					position.position = new Vector3(xPos, position.position.y, position.position.z);
				});
				// Moving the copy image
				this.world.usingComponentData(parallaxObject.Copy, [ut.Core2D.TransformLocalPosition, ut.Core2D.TransformLocalScale], (position, scale) => {
					let xPos = this.world.getComponentData(entity, ut.Core2D.TransformLocalPosition).position.x + scale.scale.x;
					position.position = new Vector3(xPos, position.position.y, position.position.z);
				});
			});
		}
	}
}
