using Unity.Entities;

namespace Modules.SceneHandling
{
    public struct ScenesToUnload: IBufferElementData
    {
        public Entity scene;
        public int sceneNumber;
        public bool doByNumber;
    }
}