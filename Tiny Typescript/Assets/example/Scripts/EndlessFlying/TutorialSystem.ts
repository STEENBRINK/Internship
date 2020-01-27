namespace game {
	/** System to handle the tutorial */
	export class TutorialSystem extends ut.ComponentSystem {
		OnUpdate(): void {
			this.world.forEach([TutorialManager], tutorial => {
				if (!tutorial.Initialised) {
					let deviceInfo = this.world.getConfigData(DeviceInformation);
					deviceInfo.IsMobile = (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
					//alert(`IsMobile: ${deviceInfo.IsMobile}`);
					this.world.setConfigData(deviceInfo);

					//Desktop Browser
					if (!deviceInfo.IsMobile) {
						EntityUtils.SetActive(this.world, tutorial.MobileTutorial, false);
					}
					//Mobile
					else { EntityUtils.SetActive(this.world, tutorial.BrowserTutorial, false); }
					tutorial.Initialised = true;
					return;
				}

				if (ut.Core2D.Input.getMouseButtonDown(0)) {
					tutorial.ToEnable.forEach(entity => {
						EntityUtils.SetActive(this.world, entity, true);
					});
					EntityUtils.DestroyEntity(this.world, tutorial.BrowserTutorial, true);
					EntityUtils.DestroyEntity(this.world, tutorial.MobileTutorial, true);
					EntityUtils.DestroyEntity(this.world, tutorial.TutorialEntity, true);
				}
			});
		}
	}
}
