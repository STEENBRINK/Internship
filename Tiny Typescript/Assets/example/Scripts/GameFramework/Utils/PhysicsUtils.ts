namespace game {
	/** Utility class for various physics related functions */
	export class PhysicsUtils {
		/** Changes the global setting for gravity.
		 * [WARNING: only has effect after a new entityGroup is instantiated]
		 *
		 * @param gravity the absolute gravity value (i.e. 9.81 instead of -9.81)
		 */
		static SetGravity(world: ut.World, gravity: number) {
			console.warn("This function only takes effect after a new entityGroup is instantiated.")
			let physicsConfig = world.getConfigData(ut.Physics2D.Physics2DConfig);
			physicsConfig.gravity = new Vector2(0, -1 * Math.abs(gravity));
			world.setConfigData(physicsConfig);
		}

		/**Applies force to an entity
		 *
		 * @param force the force to apply to the entity
		 */
		static ApplyForce(world: ut.World, entity: ut.Entity, force: Vector2): void {
			if (!world.hasComponent(entity, ut.Physics2D.Velocity2D)) {
				console.error("Provided entity does not contain the ut.Physics2D.Velocity2D component.");
				return null;
			}

			let velocity = world.getComponentData(entity, ut.Physics2D.Velocity2D);
			let data = world.getOrAddComponentData(entity, ut.Physics2D.SetVelocity2D);
			data.velocity.add(velocity.velocity);
			data.velocity.add(force);
			world.setComponentData(entity, data);
		}

		/**Hard-sets the velocity to the given velocity
		 * (Disregards any velocity the entity had)
		 *
		 * @param velocity the velocity to set on the entity
		 */
		static SetVelocty(world: ut.World, entity: ut.Entity, velocity: Vector2): void {
			if (!world.hasComponent(entity, ut.Physics2D.Velocity2D)) {
				console.error("Provided entity does not contain the ut.Physics2D.Velocity2D component.");
				return null;
			}

			let data = world.getOrAddComponentData(entity, ut.Physics2D.SetVelocity2D);
			data.velocity = velocity;
			world.setComponentData(entity, data);
		}

		/** Sets the bounciness of the rigidbody component of the provided entity to the desired number
		 * 
		 * @param bounciness [0...1...infinity] 
		 * A value of 0 means it doesn't bounce; 
		 * A value of 1 means it performs a perfect bounce with no loss of energy;
		 * A value higher than 1 means it gains bounce energy on each collision (not recommended);
		 */
		static SetBounciness(world: ut.World, entity: ut.Entity, bounciness: number): void {
			if (!world.hasComponent(entity, ut.Physics2D.RigidBody2D)) {
				console.error("Provided entity does not contain the ut.Physics2D.RigidBody2D component.");
				return null;
			}

			let rigidbody = world.getOrAddComponentData(entity, ut.Physics2D.RigidBody2D);
			rigidbody.restitution = bounciness;
			world.setComponentData(entity, rigidbody);
		}
	}
}