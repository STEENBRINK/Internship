
namespace game {

	/** System to visually update an amount of UI elements based on some value. */
	export class UIEntitiesSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([UIEntitiesHolder], (holder) => {
				for (let i = 0; i < holder.UIEntities.length; i++) {
					let entity = holder.UIEntities[i];
					if (this.world.exists(entity)) {
						EntityUtils.SetActive(this.world, entity, !(i <= holder.DestroyIndex));
					}
				}
			});
		}
	}
}