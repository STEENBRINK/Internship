namespace game {
	/** Utility class for various entity functions */
	export class EntityUtils {
		/** Makes a copy of the provided entity. */
		static CopyEntity(entity: ut.Entity): ut.Entity {
			if (entity.isNone()) {
				console.warn("Attempted to copy the isNone-entity.");
				return entity;
			}
			return new ut.Entity(entity.index, entity.version);
		}

		/** Sets the active state of an entity. */
		static SetActive(world: ut.World, entity: ut.Entity, active: boolean): void {
			if (!world.exists(entity)) {
				console.error("[EntityUtils] Setting active states on an invalid entity: aborting...");
				return;
			}

			if (active && world.hasComponent(entity, ut.Disabled)) {
				world.removeComponent(entity, ut.Disabled);
			} else if (!active && !world.hasComponent(entity, ut.Disabled)) {
				world.addComponent(entity, ut.Disabled);
			}
		}

		/** Sets the active state of an entity's children.
		 *
		 * [NOTE: activating after disabling children does not work when the children have multiple children themselves!]
		 *
		 * @param childCount the amount of children the entity has. If you don't know the amount, set to -1.
		 */
		static SetAllChildrenActive(world: ut.World, entity: ut.Entity, active: boolean, childCount: number): number {
			if (childCount == -1) {
				childCount = ut.Core2D.TransformService.countChildren(world, entity);
			}
			console.warn("Unstable function, proceed with caution.");

			for (let i = 0; i < childCount; i++) {
				let child = ut.Core2D.TransformService.getChild(world, entity, i);
				EntityUtils.SetAllChildrenActive(world, child, active, -1);
				EntityUtils.SetActive(world, child, active);
			}

			return childCount;
		}

		/** Destroys the entity
		 *
		 * @param destroyChildren if set to true, any children will be destroyed too
		 * @param destroyChildren if set to false, any children will be unlinked from the entity and will still exist
		 */
		static DestroyEntity(world: ut.World, entity: ut.Entity, destroyChildren: boolean) {
			if (!destroyChildren && ut.Core2D.TransformService.countChildren(world, entity) > 0) {
				ut.Core2D.TransformService.removeAllChildren(world, entity);
			}
			ut.Core2D.TransformService.destroyTree(world, entity, true);
		}

		/** Returns the parent of the entity, or null if the entity has no transformNode. */
		static GetParentEntity(world: ut.World, entity: ut.Entity): ut.Entity {
			if (!world.hasComponent(entity, ut.Core2D.TransformNode)) {
				console.error("Provided entity does not contain the ut.Core2D.TransformNode component.");
				console.warn("Attempted to get a parent from an entity without a transform.");
				return null;
			}
			return world.getComponentData(entity, ut.Core2D.TransformNode).parent;
		}

		/** Returns the children of provided parent entity */
		static GetAllChildren(world: ut.World, parent: ut.Entity): ut.Entity[] {
			if (!world.hasComponent(parent, ut.Core2D.TransformNode)) {
				console.error("Provided entity does not contain the ut.Core2D.TransformNode component.");
				console.warn("Attempted to get children from an entity without a transform.");
				return null;
			}

			let childCount = ut.Core2D.TransformService.countChildren(world, parent);
			let children = new Array<ut.Entity>();
			for (let i = 0; i < childCount; i++) {
				children.push(ut.Core2D.TransformService.getChild(world, parent, i));
			}
			return children;
		}

		/**Returns the entity found at a position by raycasting.
		 * 
		 * @param camera the ut.Entity with the Camera2D component
		 * @param rayPosition a Vector2 position of the position you want to raycast on
		 * @returns if an entity with a HitBox2D or Sprite2DRendererHitBox2D is found it returns this entity, otherwise null
		 */
		static GetEntityByRaycast(world: ut.World, camera: ut.Entity, rayPosition: Vector2): ut.Entity {
			let hit = ut.HitBox2D.HitBox2DService.hitTest(world, new Vector3(rayPosition.x, rayPosition.y, 0), camera);
			return !hit.entityHit.isNone() ? hit.entityHit : null;
		}

		/** Checks whether or not the entity exists within the provided array. */
		static ExistsIn(entity: ut.Entity, array: ut.Entity[]): boolean {
			let found = false;
			array.forEach((other) => {
				if (EntityUtils.Equals(entity, other)) {
					found = true;
				}
			});
			return found;
		}

		/** Gets the first index of an entity in an array of entities.
		 * 
		 * @returns the index of the entity in the array if found, otherwise -1
		 */
		static GetIndexIn(entity: ut.Entity, array: ut.Entity[]): number {
			for (let index = 0; index < array.length; index++) {
				if (EntityUtils.Equals(entity, array[index])) {
					return index;
				}
			}
			return -1;
		}

		/** Checks whether or not two entities are the same */
		static Equals(entity: ut.Entity, other: ut.Entity): boolean {
			return (entity.index == other.index && entity.version == other.version);
		}

		/** Checks whether or not an entity is valid.
		 * @description An entity is not valid if it
		 *  • is null or undefined
		 *  • doesn't exist
		 *  • doesn't contain the given components
		 * 
		 * @param ctypes an optional list of componentTypes to check the entity for
		 */
		static IsValid<T>(world: ut.World, entity: ut.Entity, ctypes?: ut.ComponentClass<T>[]): boolean {
			//Check lifetime and existence of entity
			if (null === entity || undefined === entity || !world.exists(entity) || entity.isNone()) {
				return false;
			}

			//If provided, check for components
			if (ctypes !== undefined) {
				for (let i = 0; i < ctypes.length; i++) {
					const component = ctypes[i];
					if (!world.hasComponent(entity, component)) {
						return false;
					}
				}
			}

			//All is good, entity is valid ✔
			return true;
		}
	}
}