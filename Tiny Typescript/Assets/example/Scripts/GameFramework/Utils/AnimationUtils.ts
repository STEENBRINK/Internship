namespace game {
	/** Utility class for various animation-related functions */
	export class AnimationUtils {
		/** Starts or restarts the animation on the provided entity*/
		public static StartAnimation(world: ut.World, entity: ut.Entity) {
			if (!world.hasComponent(entity, ut.Core2D.Sprite2DSequencePlayer)) {
				console.error("Provided entity does not contain the ut.Core2D.Sprite2DSequencePlayer component.");
				return;
			}

			let animator = world.getComponentData(entity, ut.Core2D.Sprite2DSequencePlayer);
			animator.time = 0;
			animator.paused = false;
			world.setComponentData(entity, animator);
		}

		/** Pauses or resumes the animation on the provided entity */
		public static PauseAnimation(world: ut.World, entity: ut.Entity, paused: boolean) {
			if (!world.hasComponent(entity, ut.Core2D.Sprite2DSequencePlayer)) {
				console.error("Provided entity does not contain the ut.Core2D.Sprite2DSequencePlayer component.");
				return;
			}

			let animator = world.getComponentData(entity, ut.Core2D.Sprite2DSequencePlayer);
			animator.paused = paused;
			world.setComponentData(entity, animator);
		}

		/** Stops the animation on the provided entity */
		public static StopAnimation(world: ut.World, entity: ut.Entity) {
			if (!world.hasComponent(entity, ut.Core2D.Sprite2DSequencePlayer)) {
				console.error("Provided entity does not contain the ut.Core2D.Sprite2DSequencePlayer component.");
				return;
			}

			let animator = world.getComponentData(entity, ut.Core2D.Sprite2DSequencePlayer);
			animator.time = 0;
			animator.paused = true;
			world.setComponentData(entity, animator);
		}

		/** Sets the Animation Entity active and starts playing the animation */
		public static StartAnimationEntity(world: ut.World, animationEntity: ut.Entity) {
			EntityUtils.SetActive(world, animationEntity, true);
			AnimationUtils.StartAnimation(world, animationEntity);
		}

		/** Stops playing the animation and sets the Animation Entity inactive */
		public static StopAnimationEntity(world: ut.World, animationEntity: ut.Entity) {
			AnimationUtils.StopAnimation(world, animationEntity);
			EntityUtils.SetActive(world, animationEntity, false);
		}

		/** Calculates and sets the framerate on the entity so that all frames will play exactly in one second */
		public static CalculateFramerate(world: ut.World, entity: ut.Entity) {
			if (!world.hasComponent(entity, ut.Core2D.Sprite2DSequence)) {
				console.error("Provided entity does not contain the ut.Core2D.Sprite2DSequence component.");
				return;
			}

			let animation = world.getComponentData(entity, ut.Core2D.Sprite2DSequence);
			animation.frameRate = animation.sprites.length;
			world.setComponentData(entity, animation);
		}
	}
}