namespace game {
	/** System that takes care of the functionality of the Slider component */
	export class SliderSystem extends ut.ComponentSystem {

		OnUpdate(): void {

			this.world.forEach([ut.Entity, Slider, ButtonData, TextReference, ut.UILayout.RectTransform], (entity, slider, handle, text, transform) => {
				if (!EntityUtils.IsValid(this.world, slider.Camera)) {
					slider.Camera = this.world.getEntityByName("CanvasCamera");
				}

				//Get current mousePosition in canvas units
				let displayInfo = this.world.getConfigData(ut.Core2D.DisplayInfo);
				let displaySize = new Vector2(displayInfo.width, displayInfo.height);
				let inputPosition = ut.Runtime.Input.getInputPosition();
				let mousePos = ut.Core2D.TransformService.windowToWorld(this.world, slider.Camera, inputPosition, displaySize).x * (400 / 21);

				//••• ===== Slider behaviour when not being interacted with =====
				if (!handle.IsDown) {
					slider.LastMousePosition = mousePos;
					if (EntityUtils.IsValid(this.world, text.TextObject)) {
						EntityUtils.SetActive(this.world, text.TextObject, false);
					}
					slider.TooltipVisuals.forEach(visualEntity => {
						EntityUtils.SetActive(this.world, visualEntity, false);
					});
					return;
				}

				//••• ===== Slider behaviour when being interacted with =====
				// Calculate distance of mouse movement in this frame in canvas units
				let deltaPos = (mousePos - slider.LastMousePosition) / UIUtils.GetRecursiveRectTransformScale(this.world, entity).x;

				if ((transform.anchoredPosition.x <= 0 && deltaPos <= 0)
					|| (transform.anchoredPosition.x >= slider.MaxPosition && deltaPos >= 0)) {
					return; //Prevents the handle from going back when mouse has gone beyond maxposition and then goes back
				}

				//Set the position of the handle, clamped between the minimum and maximum position on the slider
				transform.anchoredPosition = new Vector2(
					MathUtils.ClampValueMinMax(transform.anchoredPosition.x + deltaPos, new Vector2(0, slider.MaxPosition)),
					transform.anchoredPosition.y
				);

				//Set the value in the componentData
				slider.Value = Math.round(slider.MinMaxValue.x + (transform.anchoredPosition.x / slider.MaxPosition) * (slider.MinMaxValue.y - slider.MinMaxValue.x));

				//Display value text, if it exists
				if (EntityUtils.IsValid(this.world, text.TextObject)) {
					EntityUtils.SetActive(this.world, text.TextObject, true);
					text.Value = slider.Value.toString();
				}

				//Show Tooltip visuals, if they exist
				slider.TooltipVisuals.forEach(visualEntity => {
					EntityUtils.SetActive(this.world, visualEntity, true);
				});

				slider.LastMousePosition = mousePos;
			});
		}
	}
}
