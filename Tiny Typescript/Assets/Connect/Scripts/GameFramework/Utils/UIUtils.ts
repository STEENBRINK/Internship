namespace game {
	/** Utility class for various UI Control functions */
	export class UIUtils {
		/** Sets the text of the provided UI Text.
		 * 
		 * @param entity the entity containing the Text2DRenderer component
		 */
		static SetText(world: ut.World, entity: ut.Entity, newText: string): void {
			if (!world.hasComponent(entity, ut.Text.Text2DRenderer)) {
				console.error("Provided entity does not contain the ut.Text.Text2DRenderer component.");
				return null;
			}

			let text = world.getComponentData(entity, ut.Text.Text2DRenderer);
			text.text = newText;
			world.setComponentData(entity, text);
		}

		/** Sets the text of the TextReference component, which automatically updates the UI Text entity.
		 * 
		 * @param entity the entity containing the TextReference component
		 */
		static SetTextViaReference(world: ut.World, entity: ut.Entity, text: string): void {
			if (!world.hasComponent(entity, TextReference)) {
				console.error("Provided entity does not contain the game.TextReference component.");
				return null;
			}

			let textRef = world.getComponentData(entity, TextReference);
			textRef.Value = text;
			world.setComponentData(entity, textRef);
		}

		/** Decreases the destroyIndex of a UIHolder by specified amount, capped by -1 value. */
		static AddUIEntities(world: ut.World, entity: ut.Entity, amount: number): void {
			if (!world.hasComponent(entity, UIEntitiesHolder)) {
				console.error("Provided entity does not contain the game.UIEntitiesHolder component.");
				return null;
			}

			let holder = world.getComponentData(entity, UIEntitiesHolder);
			holder.DestroyIndex = Math.max(holder.DestroyIndex - amount, -1);
			world.setComponentData(entity, holder);
		}

		/** Increases the destroyIndex of a UIHolder by specified amount, capped by array size. */
		static RemoveUIEntities(world: ut.World, entity: ut.Entity, amount: number): void {
			if (!world.hasComponent(entity, UIEntitiesHolder)) {
				console.error("Provided entity does not contain the game.UIEntitiesHolder component.");
				return null;
			}

			let holder = world.getComponentData(entity, UIEntitiesHolder);
			holder.DestroyIndex = Math.min(holder.DestroyIndex + amount, holder.UIEntities.length - 1);
			world.setComponentData(entity, holder);
		}

		/** Hard sets the destroyIndex of a UIHolder to a specified amount. Only use this when you know the destroyIndex precisely */
		static SetUIEntitiesDestroyIndex(world: ut.World, entity: ut.Entity, amount: number): void {
			if (!world.hasComponent(entity, UIEntitiesHolder)) {
				console.error("Provided entity does not contain the game.UIEntitiesHolder component.");
				return null;
			}

			let holder = world.getComponentData(entity, UIEntitiesHolder);
			holder.DestroyIndex = MathUtils.ClampValueMinMax(amount, new Vector2(0, holder.UIEntities.length - 1));
			world.setComponentData(entity, holder);
		}

		/** Sets the values for the provided ResourceBar, after which the bar will update itself visually.
		 * 
		 * @param entity the entity containing the ResourceBar component
		 */
		static SetResourceBar(world: ut.World, entity: ut.Entity, currentValue: number, maxValue: number): void {
			if (!world.hasComponent(entity, ResourceBar)) {
				console.error("Provided entity does not contain the game.ResourceBar component.");
				return null;
			}

			let bar = world.getComponentData(entity, ResourceBar);
			bar.Value = currentValue;
			bar.MaxValue = maxValue;
			world.setComponentData(entity, bar);
		}

		/**
		 * Recursively calculates scales of all parents of provided UI entity up to the Canvas.
		 */
		static GetRecursiveRectTransformScale(world: ut.World, entity: ut.Entity): Vector3 {
			let parent: ut.Entity = EntityUtils.GetParentEntity(world, entity);
			let finalSize = new Vector3(1, 1, 1);

			while (EntityUtils.IsValid(world, parent) && !world.hasComponent(parent, ut.UILayout.UICanvas)) {
				let parentScale = world.getComponentData(parent, ut.Core2D.TransformLocalScale).scale;
				finalSize.multiply(parentScale);
				parent = EntityUtils.GetParentEntity(world, parent);
			}

			return finalSize;
		}
	}
}