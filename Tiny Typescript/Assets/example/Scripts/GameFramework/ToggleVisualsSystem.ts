
namespace game {
	/** System to update the visuals of a toggle / checkbox to match the state. */
	export class ToggleVisualsSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([ToggleVisuals, ut.Core2D.Sprite2DRenderer], (visuals, spriteRenderer) => {
				if (visuals.Toggle == null) { return; } //Empty check

				let toggle = this.world.getComponentData(visuals.Toggle, ToggleData);

				if (!visuals.Initialized) {
					//Initialization
					visuals.DefaultColor = this.world.getComponentData(visuals.Toggle, ut.Core2D.Sprite2DRenderer).color;
					visuals.Initialized = true;
				}

				spriteRenderer.sprite = toggle.Activated ? visuals.ActivatedImage : visuals.DeactivatedImage;

				if (!toggle.Interactable) {
					spriteRenderer.color = ColorUtils.AddColor(visuals.DefaultColor, visuals.DisabledColor);
					return;
				}

				if (!toggle.IsHovered && !toggle.IsDown) {
					spriteRenderer.color = visuals.DefaultColor;
					return;
				}
				if (toggle.IsHovered && !toggle.IsDown) {
					spriteRenderer.color = ColorUtils.AddColor(visuals.DefaultColor, visuals.HoveredColor);
					return;
				}
				if (toggle.IsDown) {
					spriteRenderer.color = ColorUtils.AddColor(visuals.DefaultColor, visuals.DownColor);
					return;
				}
			});
		}
	}
}
