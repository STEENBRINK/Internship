namespace game {
	/** System to update the visuals of a button to match the button state. */
	export class ButtonVisualsSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([ButtonVisuals, ut.Core2D.Sprite2DRenderer], (visuals, spriteRenderer) => {
				if (visuals.Button == null) {
					console.warn("Visual entity not set.");
					return;
				}

				let button = this.world.getComponentData(visuals.Button, ButtonData);

				if (!visuals.Initialized) {
					//Initialization
					visuals.DefaultColor = this.world.getComponentData(visuals.Button, ut.Core2D.Sprite2DRenderer).color;
					visuals.Initialized = true;
				}

				if (!button.Interactable) {
					spriteRenderer.color = ColorUtils.AddColor(visuals.DefaultColor, visuals.DisabledColor);
					return;
				}

				if (!button.IsHovered && !button.IsDown) {
					spriteRenderer.color = visuals.DefaultColor;
					return;
				}
				if (button.IsHovered && !button.IsDown) {
					spriteRenderer.color = ColorUtils.AddColor(visuals.DefaultColor, visuals.HoveredColor);
					return;
				}
				if (button.IsDown) {
					spriteRenderer.color = ColorUtils.AddColor(visuals.DefaultColor, visuals.DownColor);
					return;
				}
			});
		}
	}
}
