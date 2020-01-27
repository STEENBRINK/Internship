
namespace game {
	/** System to store all newly detected collisions */
	export class CollisionSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([ut.Physics2D.NewColliderContacts, CollisionQueue], (detector, collisions) => {
				if (collisions.Paused) { return; }

				detector.contacts.forEach((entity) => {
					if (!EntityUtils.ExistsIn(entity, collisions.Collisions)) {
						collisions.Collisions = this.addToArray(collisions.Collisions, entity);
					}
				});
			})
		}

		/** Copies immutable array, adds specified element to it and returns the new array */
		addToArray(original: ut.Entity[], newElement: ut.Entity): ut.Entity[] {
			let result: Array<ut.Entity> = original;
			result.push(newElement);
			return result;
		}
	}
}
