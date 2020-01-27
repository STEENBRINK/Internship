namespace game {
	/** Utility class for various collision related functions */
	export class CollisionUtils {
		/** Returns whether or not the entity is currently colliding */
		static IsColliding(world: ut.World, entity: ut.Entity): boolean {
			return world.hasComponent(entity, ut.HitBox2D.HitBoxOverlapResults);
		}

		/** Gets a list of entities colliding with the provided entity
		 * @returns An array of entities that collide
		 * @returns 'null' if the provided entity doesn't have a hitbox
		 */
		static GetCollidingEntities(world: ut.World, entity: ut.Entity): ut.Entity[] {
			if (!world.hasComponent(entity, ut.HitBox2D.Sprite2DRendererHitBox2D)
				&& !world.hasComponent(entity, ut.HitBox2D.RectHitBox2D)) {
				console.error("[CollisionUtils] Provided entity does not contain a RectHitBox2D or Sprite2DRendererHitBox2D component");
				return null;
			}

			let result = new Array<ut.Entity>();

			world.getComponentData(entity, ut.HitBox2D.HitBoxOverlapResults).overlaps.forEach(hitResult => {
				if (EntityUtils.IsValid(world, hitResult.otherEntity) && !EntityUtils.ExistsIn(hitResult.otherEntity, result)) {
					result.push(hitResult.otherEntity);
				}
			});

			return result;
		}
	}
}