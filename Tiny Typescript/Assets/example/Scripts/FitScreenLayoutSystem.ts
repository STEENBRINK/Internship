
namespace game {

    /** 
     * [ADAPTED FROM UNITY'S "Tiny Arms Revenge" / "Match Three" GAME]
     * Adjust screen layout to fit any aspect ratio.
     */
	export class FitScreenLayoutSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			let displayInfo = this.world.getConfigData(ut.Core2D.DisplayInfo);
			let aspectRatio = displayInfo.frameHeight / displayInfo.frameWidth;
			let referenceRatio = Global.PORTRAIT_MODE ? 16 / 9 : 9 / 16;
			let isTallDisplay = aspectRatio > referenceRatio + 0.01;
			let matchWidthOrHeight = isTallDisplay ? 0 : 1;

			// If resolution is taller than 9/16, make UI canvas match the width.
			this.world.forEach([CanvasResolutionFitter, ut.UILayout.UICanvas], (resolutionFitter, canvas) => {
				let camera = this.world.getComponentData(canvas.camera, ut.Core2D.Camera2D);
				if (resolutionFitter.DefaultHalfVerticalSize == 0) {
					resolutionFitter.DefaultHalfVerticalSize = camera.halfVerticalSize;
				}

				canvas.matchWidthOrHeight = matchWidthOrHeight;

				let referenceHalfSize = resolutionFitter.DefaultHalfVerticalSize;
				let halfVerticalSize = isTallDisplay ? referenceHalfSize : referenceHalfSize;
				camera.halfVerticalSize = halfVerticalSize;
			});

			// If resolution is taller than 9/16, zoom out the camera.
			this.world.forEach([CameraResolutionFitter, ut.Core2D.Camera2D], (resolutionFitter, camera) => {
				if (resolutionFitter.DefaultHalfVerticalSize == 0) {
					resolutionFitter.DefaultHalfVerticalSize = camera.halfVerticalSize;
				}

				let referenceHalfSize = resolutionFitter.DefaultHalfVerticalSize;
				let halfVerticalSize = isTallDisplay ? aspectRatio * referenceHalfSize / referenceRatio : referenceHalfSize;
				camera.halfVerticalSize = halfVerticalSize;
			});
		}
	}
}
