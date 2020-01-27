
namespace game {
	/** This system handles toggles / checkboxes. Also keeps references to it informed. */
	export class ToggleSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			//Checking state of toggle / checkbox
			this.world.forEach([ToggleData, ut.Core2D.Sprite2DRenderer, ut.UIControls.MouseInteraction], (toggle, spriteRenderer, mouseInteraction) => {
				if (!toggle.Interactable) {
					return;
				}

				//mouseInteraction.clicked doesn't seem to work on mobile devices
				if (!this.world.getConfigData(DeviceInformation).IsMobile) {
					if (mouseInteraction.clicked) { toggle.Activated = !toggle.Activated; }
				} else {
					if (mouseInteraction.down && !toggle.stillPressed) {
						toggle.Activated = !toggle.Activated;
						toggle.stillPressed = true;
					} else if (!mouseInteraction.down) { toggle.stillPressed = false; }
				}

				toggle.IsHovered = mouseInteraction.over;
				toggle.IsDown = mouseInteraction.down;
			});

			//Keeping references informed
			this.world.forEach([ToggleReference], reference => {
				if (reference.Toggle != null && this.world.hasComponent(reference.Toggle, ToggleData)) {
					let activated = this.world.getComponentData(reference.Toggle, ToggleData).Activated
					if ((!reference.HasChanged && !reference.IsActivated && activated) || (!reference.HasChanged && reference.IsActivated && !activated)) {
						reference.HasChanged = true;
					}

					reference.IsActivated = activated;
				}
			});
		}
	}
}