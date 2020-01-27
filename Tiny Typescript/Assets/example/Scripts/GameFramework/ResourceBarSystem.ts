
namespace game {
	/** System to take care for updating a resourcebar */
	export class ResourceBarSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([ut.Entity, ut.UILayout.RectTransform, ResourceBar, ut.Core2D.Sprite2DRenderer], (entity, transform, resourceBar, renderer) => {

				let percentage = resourceBar.Value / resourceBar.MaxValue;
				let progress = (1 - percentage);

				//transform.anchoredPosition = transform.anchoredPosition.setX(resourceBar.Width * (percentage * 0.5));
				transform.sizeDelta = transform.sizeDelta.setX(resourceBar.Width * percentage);

				let newColor = ColorUtils.Lerp(resourceBar.StartColor, resourceBar.EndColor, progress);
				renderer.color = newColor;

				if (!resourceBar.Text.isNone() && this.world.hasComponent(resourceBar.Text, ut.Text.Text2DRenderer)) {
					UIUtils.SetText(this.world, resourceBar.Text, (resourceBar.Value + " / " + resourceBar.MaxValue));
				}
			});
		}
	}
}
