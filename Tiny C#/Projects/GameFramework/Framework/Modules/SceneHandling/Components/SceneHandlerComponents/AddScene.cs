using Unity.Entities;
using Unity.Tiny.Scenes;

namespace Modules.SceneHandling
{
    public struct AddScene: IComponentData
    {
        public SceneReference sceneToLoad;
        public bool makeIndestructable;
    }
}