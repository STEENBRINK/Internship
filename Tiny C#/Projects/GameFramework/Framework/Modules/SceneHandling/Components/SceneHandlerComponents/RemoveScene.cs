using Unity.Entities;

namespace Modules.SceneHandling
{
    public struct RemoveScene: IComponentData
    {
        public Entity sceneEntityToUnload;
        public int sceneNumberToUnload;
        public bool isInt;
    }
}