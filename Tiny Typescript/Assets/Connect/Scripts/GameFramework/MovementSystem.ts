namespace game {
	export class MovementSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([ut.Entity, ut.Core2D.TransformLocalPosition, ut.Core2D.TransformLocalRotation, Movement], (entity, position, rotation, movement) => {
				let moveDirection = new Vector3(
					movement.Direction.x * movement.Speed * this.scheduler.deltaTime(),
					movement.Direction.y * movement.Speed * this.scheduler.deltaTime(), 0);

				if (!(Math.round(rotation.rotation.z * 1000) == 0 && Math.round(rotation.rotation.w * 1000) == 1000)) {
					//The entity is rotated, Rodrigues formula is needed to calculate worldposition
					moveDirection = MathUtils.CalculateRodriguesFormula(moveDirection, rotation.rotation);
				}

				position.position = new Vector3(
					MathUtils.ClampValueMinMax(position.position.x + moveDirection.x, movement.MinMaxX),
					MathUtils.ClampValueMinMax(position.position.y + moveDirection.y, movement.MinMaxY),
					position.position.z
				)

			});
		}
	}
}