namespace game {
	/** System to store points from clicking/pressing and dragging/swiping */
	export class ClickerSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([ut.Entity, Clicker], (entity, clicker) => {
				if (clicker.Camera.isNone()) {
					clicker.Camera = this.world.getEntityByName("GameWorldCamera");
					if (clicker.Camera.isNone()) { return; }
				}

				if (clicker.Paused || !(ut.Core2D.Input.getMouseButton(0) || ut.Core2D.Input.getMouseButtonDown(0) || ut.Core2D.Input.getMouseButtonUp(0))) {
					return;
				}

				//Old way of doing it (before screen autoscale fitting system)
				//let mousePosRaw = ut.Core2D.Input.getWorldInputPosition(this.world);
				let mousePosRaw = ClickingUtils.getPointerWorldPosition(this.world, clicker.Camera);
				let mousePos = new Vector2(mousePosRaw.x, mousePosRaw.y);

				//On first mouse/finger down
				if (ut.Core2D.Input.getMouseButtonDown(0)) {
					let c = clicker;
					c.StartPoint = mousePos;
					c.Presses = ArrayUtils.AddToArray(c.Presses, mousePos);
					c.Points = new Array();
					c.Points = ArrayUtils.AddToArray(c.Points, mousePos);
					c.EndPoint = new Vector2(Global.NOT_A_NUMBER, Global.NOT_A_NUMBER);
					this.world.setComponentData(entity, c);
					return;
				}

				//On mouse/finger up
				if (ut.Core2D.Input.getMouseButtonUp(0)) {
					let c = clicker;
					c.Points = ArrayUtils.AddToArray(c.Points, mousePos);
					c.EndPoint = mousePos;
					this.world.setComponentData(entity, c);
					return;
				}

				//All mouse/finger down inbetween
				if (ut.Core2D.Input.getMouseButton(0)) {
					let c = clicker;
					c.Points = ArrayUtils.AddToArray(c.Points, mousePos);
					this.world.setComponentData(entity, c);
				}
			});
		}
	}
}
