namespace game {
	/** sYSTEM TO CONTROL THE PLAYERMOVEMENT */
	export class PlayerMovementSystem extends ut.ComponentSystem {

		OnUpdate(): void {

			this.world.forEach([ut.Entity, PlayerInteraction, ut.Core2D.TransformLocalPosition, ut.Physics2D.Velocity2D], (entity, playerInteraction, transform, velocity) => {
				if (ut.Core2D.Input.getMouseButtonDown(0)) {
					PhysicsUtils.SetVelocty(this.world, entity, new Vector2(0, playerInteraction.Force));
				}
			});

			this.world.forEach([ut.Entity, FollowObject, ut.Core2D.TransformLocalPosition, ut.Physics2D.Velocity2D], (entity, followObject, transform, velocity) => {
				if (ut.Core2D.Input.getMouseButtonDown(0)) {
					//transform.position = new Vector3(transform.position.x, 11.5, transform.position.z);
					PhysicsUtils.SetVelocty(this.world, entity, new Vector2(0, 1000));
				}
				if (transform.position.y > followObject.UpperLimit) {
					PhysicsUtils.SetVelocty(this.world, entity, new Vector2(0, followObject.DownForce));
				}
			});

			this.world.forEach([ut.Entity, PlayerMovement, ut.Core2D.TransformObjectToWorld, PlayerCollider],
				(entity, playerMovement, transformPos, playerCollider) => {
					let degrees = 0;
					//Follow object
					let newPos: Vector3 = new Vector3();
					let newRot: Quaternion = new Quaternion();
					let newScl: Vector3 = new Vector3();
					transformPos.matrix.decompose(newPos, newRot, newScl);
					this.world.usingComponentData(playerMovement.FollowObject, [ut.Core2D.TransformLocalPosition], (otherPos) => {
						degrees = ((otherPos.position.y - newPos.y) / 11.5) * playerMovement.MaxRotation;
					});

					RotationUtils.SetRotationFromDegrees(this.world, entity, new Vector3(0, 0, 1), degrees);

					if (newPos.y <= playerMovement.BottomBound) {
						EntityUtils.DestroyEntity(this.world, playerCollider.Animation, true);
						EntityUtils.SetActive(this.world, playerCollider.DeathAnimation, true);
						this.world.removeComponent(entity, PlayerCollider);
						this.world.removeComponent(EntityUtils.GetParentEntity(this.world, entity), PlayerInteraction);

						//Activate GameOverManager and pass on the score
						EntityUtils.SetActive(this.world, playerCollider.GameOverManager, true);
						this.world.usingComponentData(playerCollider.GameOverManager, [GameOverManager], gameOver => {
							gameOver.FinalScore = this.world.getComponentData(entity, ScoreManager).Score;
						});
					}
				});
		}
	}
}
