using Modules.Spawner;
using Unity.Entities;
using Unity.Mathematics;

namespace Modules.SceneHandling
{
    public struct IsNewScene: IComponentData
    {
        public float2 position;
        public float2 offset;
        public TranslationType translationType;
    }
}
