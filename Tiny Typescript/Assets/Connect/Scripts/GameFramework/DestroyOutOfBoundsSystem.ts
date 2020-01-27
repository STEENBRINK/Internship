
namespace game {

	/** System that destroys an entity when it passes defined boundaries */
	export class DestroyOutOfBoundsSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([ut.Entity, ut.Core2D.TransformLocalPosition, DestroyOutOfBounds], (entity, position, bounds) => {
				if (!MathUtils.IsInMinMax(position.position.x, bounds.BoundsMinMaxX) || !MathUtils.IsInMinMax(position.position.y, bounds.BoundsMinMaxY)) {
					EntityUtils.DestroyEntity(this.world, entity, true);
				}
			});
		}
	}
}
