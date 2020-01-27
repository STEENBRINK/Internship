namespace game {
	/** System to handle button presses. Also keeps references to the buttons informed. */
	export class ButtonSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([ButtonData, ut.Core2D.Sprite2DRenderer, ut.UIControls.MouseInteraction], (button, spriteRenderer, mouseInteraction) => {
				if (!button.Interactable) {
					return;
				}

				//mouseInteraction.clicked doesn't seem to work on mobile devices
				if (!this.world.getConfigData(DeviceInformation).IsMobile) {
					if (mouseInteraction.clicked) { button.Clicked = true; }
				} else {
					if (mouseInteraction.down && !button.stillPressed) {
						button.Clicked = true;
						button.stillPressed = true;
					} else if (!mouseInteraction.down) { button.stillPressed = false; }
				}

				button.IsHovered = mouseInteraction.over;
				button.IsDown = mouseInteraction.down;
			});

			this.world.forEach([ButtonReference], reference => {
				if (reference.Button != null && !reference.Button.isNone() && this.world.hasComponent(reference.Button, ButtonData)) {
					let button = this.world.getComponentData(reference.Button, ButtonData);
					if (button.Clicked) {
						reference.IsClicked = true; //Must be set false in the script that handles what happens onClick
						button.Clicked = false;
						this.world.setComponentData(reference.Button, button);
					}
				}
			});
		}
	}
}
