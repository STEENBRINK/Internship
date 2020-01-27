using Unity.Entities;
using Unity.Tiny.Scenes;

namespace Modules.SceneHandling
{
    public struct GoToScene: IComponentData
    {
        public SceneReference sceneToGoTo;
    }
}