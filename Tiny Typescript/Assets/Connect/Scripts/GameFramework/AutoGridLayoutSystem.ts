
namespace game {

	/** System to automatically position and orient UI elements in a gridlike manner */
	export class AutoGridLayoutSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([AutoGridLayout, ut.UILayout.RectTransform], (autoLayout, rect) => {
				let currentLayout = new Array<ut.Entity>();

				autoLayout.Elements.forEach(entity => {
					if (this.world.exists(entity) && !this.world.hasComponent(entity, ut.Disabled)) {
						currentLayout.push(entity);
					}
				});

				for (let i = 0; i < currentLayout.length; i++) {
					const entity = currentLayout[i];

					let rectTransform = this.world.getComponentData(entity, ut.UILayout.RectTransform);
					let halfIndex = 0;
					let absDifference = 0;

					switch (autoLayout.Alignment) {
						case AutoGridAlignment.UP:
							rectTransform.anchoredPosition = new Vector2(0, -(rectTransform.sizeDelta.y / 2 + i * autoLayout.GapSize));
							break;
						case AutoGridAlignment.DOWN:
							rectTransform.anchoredPosition = new Vector2(0, (rectTransform.sizeDelta.y / 2 + i * autoLayout.GapSize));
							break;
						case AutoGridAlignment.LEFT:
							rectTransform.anchoredPosition = new Vector2((rectTransform.sizeDelta.y / 2 + i * autoLayout.GapSize), 0);
							break;
						case AutoGridAlignment.RIGHT:
							rectTransform.anchoredPosition = new Vector2(-(rectTransform.sizeDelta.y / 2 + i * autoLayout.GapSize), 0);
							break;
						case AutoGridAlignment.CENTERVERTICAL:
							halfIndex = (currentLayout.length - 1) / 2;
							absDifference = (Math.abs(i - halfIndex));
							if (i == halfIndex) {
								rectTransform.anchoredPosition = new Vector2(0, 0);
							} else if (i > halfIndex) {
								rectTransform.anchoredPosition = new Vector2(0, -(absDifference * autoLayout.GapSize));
							} else {
								rectTransform.anchoredPosition = new Vector2(0, (absDifference * autoLayout.GapSize));
							}
							break;
						case AutoGridAlignment.CENTERHORIZONTAL:
							halfIndex = (currentLayout.length - 1) / 2;
							absDifference = Math.abs(i - halfIndex);
							if (i == halfIndex) {
								rectTransform.anchoredPosition = new Vector2(0, 0);
							} else if (i > halfIndex) {
								rectTransform.anchoredPosition = new Vector2((absDifference * autoLayout.GapSize), 0);
							} else {
								rectTransform.anchoredPosition = new Vector2(-(absDifference * autoLayout.GapSize), 0);
							}
							break;
						default:
							console.error("[AutoGridLayoutSystem] Alignment was broken: aborting...");
							return;
					}

					this.world.setComponentData(entity, rectTransform);
				}
			});
		}
	}
}
