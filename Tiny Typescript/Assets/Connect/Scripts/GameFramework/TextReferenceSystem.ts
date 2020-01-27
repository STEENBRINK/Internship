
namespace game {

	/** System to set the text of a UI Text entity. */
	export class TextReferenceSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([TextReference], (textRef) => {
				if (!this.world.hasComponent(textRef.TextObject, ut.Text.Text2DRenderer)) {
					console.error("[TextReferenceSystem] Text reference entity does not contain the ut.Text.Text2DRenderer component.");
					return;
				}

				if (!textRef.Initialized) {
					textRef.Value = this.world.getComponentData(textRef.TextObject, ut.Text.Text2DRenderer).text;
					textRef.Initialized = true;
					return;
				}

				let text = this.world.getComponentData(textRef.TextObject, ut.Text.Text2DRenderer);
				text.text = textRef.Value;
				this.world.setComponentData(textRef.TextObject, text);
			})
		}
	}
}
